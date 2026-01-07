import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'caa_officer' | 'operator' | 'vendor' | 'enforcement' | 'audit_officer';

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  profile: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    organization?: string;
  };
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorMethod?: 'email' | 'sms';
  otp?: string;
  otpExpiry?: Date;
  smsOtp?: string;
  smsOtpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'caa_officer', 'operator', 'vendor', 'enforcement', 'audit_officer'],
      required: true,
    },
    profile: {
      firstName: String,
      lastName: String,
      phone: String,
      organization: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    twoFactorMethod: {
      type: String,
      enum: ['email', 'sms'],
      default: 'email',
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    smsOtp: {
      type: String,
    },
    smsOtpExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);

