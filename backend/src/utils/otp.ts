export const generateOTP = (): string => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const isOTPExpired = (otpExpiry: Date | undefined): boolean => {
  if (!otpExpiry) return true;
  return new Date() > new Date(otpExpiry);
};

