'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../../lib/api';
import { Button } from '../../../components/ui/Button';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/verify-email', {
        email,
        otp: otpString,
      });

      const { token, user } = response.data;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');

    try {
      await api.post('/auth/resend-otp', { email });
      setError('');
      alert('New OTP code has been sent to your email');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="max-w-md w-full space-y-8 p-8 bg-gray-900 border-2 border-[#1e3a5f] rounded-lg shadow-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#3b82f6] uppercase">Email Required</h2>
            <p className="mt-2 text-gray-400">Please register or login first.</p>
            <Button
              className="mt-4"
              onClick={() => router.push('/register')}
            >
              Go to Register
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-gray-900 border-2 border-[#1e3a5f] rounded-lg p-8 shadow-2xl shadow-black/50">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#3b82f6] uppercase tracking-wider mb-2">
              Verify Email
            </h2>
            <p className="text-sm text-gray-400 uppercase tracking-wide">
              Verification code sent to
            </p>
            <p className="mt-2 text-sm font-medium text-[#3b82f6]">
              {email}
            </p>
            <div className="mt-4 h-1 w-20 bg-[#1e3a5f] mx-auto"></div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/50 border-2 border-red-800 text-red-300 px-4 py-3 rounded font-medium">
                {error}
              </div>
            )}

            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-14 h-16 text-center text-2xl font-bold bg-gray-800 border-2 border-gray-700 text-[#3b82f6] rounded focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#2d5a8f] transition-all"
                />
              ))}
            </div>

            <div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Verify Email
              </Button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-400">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-sm text-[#3b82f6] hover:text-[#2d5a8f] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
