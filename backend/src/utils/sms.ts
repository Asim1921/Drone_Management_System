import twilio from 'twilio';

// Initialize Twilio client (only if credentials are provided)
const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

// Only create client if credentials are available
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Format Pakistani phone number to E.164 format (+92XXXXXXXXXX)
 */
export const formatPakistaniPhone = (phone: string): string => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 92, add +
  if (cleaned.startsWith('92')) {
    return `+${cleaned}`;
  }
  
  // If starts with 0, replace with +92
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
    return `+92${cleaned}`;
  }
  
  // If starts with 3 (common for Pakistani mobile), add +92
  if (cleaned.startsWith('3') && cleaned.length === 10) {
    return `+92${cleaned}`;
  }
  
  // If already has country code but no +
  if (cleaned.length === 12 && cleaned.startsWith('92')) {
    return `+${cleaned}`;
  }
  
  // Default: assume it's a 10-digit number starting with 3
  if (cleaned.length === 10) {
    return `+92${cleaned}`;
  }
  
  return phone; // Return as-is if can't format
};

/**
 * Validate Pakistani phone number
 */
export const isValidPakistaniPhone = (phone: string): boolean => {
  const formatted = formatPakistaniPhone(phone);
  // Pakistani mobile numbers: +92 followed by 3, then 9 more digits
  const pakistaniMobileRegex = /^\+923\d{9}$/;
  return pakistaniMobileRegex.test(formatted);
};

/**
 * Send OTP via SMS using Twilio
 */
export const sendOTPSMS = async (phone: string, otp: string): Promise<void> => {
  if (!accountSid || !authToken || !fromNumber || !client) {
    console.warn('Twilio credentials not configured. SMS will not be sent.');
    // In development, log the OTP instead
    const formattedPhone = formatPakistaniPhone(phone);
    console.log(`[DEV MODE] SMS OTP for ${formattedPhone}: ${otp}`);
    console.log(`[DEV MODE] To enable SMS, configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env`);
    return;
  }

  try {
    const formattedPhone = formatPakistaniPhone(phone);
    
    if (!isValidPakistaniPhone(formattedPhone)) {
      throw new Error('Invalid Pakistani phone number format. Please use format: +92XXXXXXXXXX or 03XXXXXXXXX');
    }

    const message = await client.messages.create({
      body: `Your DMS verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`,
      from: fromNumber,
      to: formattedPhone,
    });

    console.log(`SMS OTP sent to ${formattedPhone}. Message SID: ${message.sid}`);
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    // In development, still log the OTP
    if (process.env.NODE_ENV === 'development') {
      const formattedPhone = formatPakistaniPhone(phone);
      console.log(`[DEV MODE] SMS OTP for ${formattedPhone}: ${otp}`);
    }
    throw new Error('Failed to send SMS. Please try again or use email verification.');
  }
};
