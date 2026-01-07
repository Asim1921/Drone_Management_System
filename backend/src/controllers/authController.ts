import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import { generateOTP, isOTPExpired } from '../utils/otp';
import { sendOTPEmail } from '../utils/email';
import { sendOTPSMS, formatPakistaniPhone, isValidPakistaniPhone } from '../utils/sms';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, profile, twoFactorMethod = 'email' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Validate phone number if SMS is selected
    if (twoFactorMethod === 'sms') {
      if (!profile?.phone) {
        res.status(400).json({ message: 'Phone number is required for SMS verification' });
        return;
      }
      if (!isValidPakistaniPhone(profile.phone)) {
        res.status(400).json({ message: 'Invalid Pakistani phone number format. Please use format: +92XXXXXXXXXX or 03XXXXXXXXX' });
        return;
      }
      // Format phone number
      profile.phone = formatPakistaniPhone(profile.phone);
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP expires in 10 minutes

    // Create new user
    const user = new User({
      email,
      password,
      role: role || 'operator',
      profile,
      isEmailVerified: false,
      isPhoneVerified: false,
      twoFactorMethod: twoFactorMethod || 'email',
      otp: twoFactorMethod === 'email' ? otp : undefined,
      otpExpiry: twoFactorMethod === 'email' ? otpExpiry : undefined,
      smsOtp: twoFactorMethod === 'sms' ? otp : undefined,
      smsOtpExpiry: twoFactorMethod === 'sms' ? otpExpiry : undefined,
    });

    await user.save();

    // Send OTP based on method
    try {
      if (twoFactorMethod === 'sms' && profile?.phone) {
        await sendOTPSMS(profile.phone, otp);
        res.status(201).json({
          message: 'Registration successful. Please check your phone for verification code.',
          requiresVerification: true,
          verificationMethod: 'sms',
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            isEmailVerified: false,
            isPhoneVerified: false,
          },
        });
      } else {
        await sendOTPEmail(email, otp);
        res.status(201).json({
          message: 'Registration successful. Please check your email for verification code.',
          requiresVerification: true,
          verificationMethod: 'email',
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            isEmailVerified: false,
            isPhoneVerified: false,
          },
        });
      }
    } catch (error: any) {
      console.error(`Failed to send OTP via ${twoFactorMethod}:`, error);
      res.status(201).json({
        message: `Registration successful, but failed to send ${twoFactorMethod === 'sms' ? 'SMS' : 'email'}. Please request a new OTP.`,
        requiresVerification: true,
        verificationMethod: twoFactorMethod,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isEmailVerified: false,
          isPhoneVerified: false,
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({ message: 'Account is deactivated' });
      return;
    }

    // Check verification based on 2FA method
    const twoFactorMethod = user.twoFactorMethod || 'email';
    const isVerified = twoFactorMethod === 'email' ? user.isEmailVerified : user.isPhoneVerified;

    if (!isVerified) {
      res.status(403).json({ 
        message: `${twoFactorMethod === 'sms' ? 'Phone' : 'Email'} not verified. Please verify your ${twoFactorMethod === 'sms' ? 'phone' : 'email'} to login.`,
        requiresVerification: true,
        verificationMethod: twoFactorMethod,
        userId: user._id.toString(),
      });
      return;
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        twoFactorMethod: user.twoFactorMethod,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if already verified
    if (user.isEmailVerified) {
      res.status(400).json({ message: 'Email already verified' });
      return;
    }

    // Check if OTP exists and matches
    if (!user.otp || user.otp !== otp) {
      res.status(400).json({ message: 'Invalid OTP code' });
      return;
    }

    // Check if OTP is expired
    if (isOTPExpired(user.otpExpiry)) {
      res.status(400).json({ message: 'OTP code has expired. Please request a new one.' });
      return;
    }

    // Verify email
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isEmailVerified: true,
        isPhoneVerified: user.isPhoneVerified,
        twoFactorMethod: user.twoFactorMethod,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Email verification failed' });
  }
};

export const verifyPhone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if already verified
    if (user.isPhoneVerified) {
      res.status(400).json({ message: 'Phone already verified' });
      return;
    }

    // Check if phone number exists
    if (!user.profile?.phone) {
      res.status(400).json({ message: 'Phone number not found' });
      return;
    }

    // Check if OTP exists and matches
    if (!user.smsOtp || user.smsOtp !== otp) {
      res.status(400).json({ message: 'Invalid OTP code' });
      return;
    }

    // Check if OTP is expired
    if (isOTPExpired(user.smsOtpExpiry)) {
      res.status(400).json({ message: 'OTP code has expired. Please request a new one.' });
      return;
    }

    // Verify phone
    user.isPhoneVerified = true;
    user.smsOtp = undefined;
    user.smsOtpExpiry = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Phone verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: true,
        twoFactorMethod: user.twoFactorMethod,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Phone verification failed' });
  }
};

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, method = 'email' } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    if (method === 'sms') {
      // Check if phone is already verified
      if (user.isPhoneVerified) {
        res.status(400).json({ message: 'Phone already verified' });
        return;
      }

      if (!user.profile?.phone) {
        res.status(400).json({ message: 'Phone number not found' });
        return;
      }

      user.smsOtp = otp;
      user.smsOtpExpiry = otpExpiry;
      await user.save();

      try {
        await sendOTPSMS(user.profile.phone, otp);
        res.json({ message: 'OTP code sent to your phone' });
      } catch (smsError) {
        console.error('Failed to send SMS OTP:', smsError);
        res.status(500).json({ message: 'Failed to send SMS. Please try again later.' });
      }
    } else {
      // Check if email is already verified
      if (user.isEmailVerified) {
        res.status(400).json({ message: 'Email already verified' });
        return;
      }

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      try {
        await sendOTPEmail(email, otp);
        res.json({ message: 'OTP code sent to your email' });
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        res.status(500).json({ message: 'Failed to send OTP email. Please try again later.' });
      }
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to resend OTP' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        twoFactorMethod: user.twoFactorMethod,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to get user' });
  }
};
