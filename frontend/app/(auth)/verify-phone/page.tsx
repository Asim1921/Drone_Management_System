'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import LightPillar from '../../../components/LightPillar';
import ParticleBackground from '../../../components/ParticleBackground';
import Link from 'next/link';
import api from '../../../lib/api';

export default function VerifyPhonePage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      router.push('/register');
    }
  }, [searchParams, router]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      document.getElementById('otp-5')?.focus();
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
      const response = await api.post('/auth/verify-phone', {
        email,
        otp: otpString,
      });

      // Store token and redirect
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');

    try {
      await api.post('/auth/resend-otp', {
        email,
        method: 'sms',
      });
      setOtp(['', '', '', '', '', '']);
      alert('New OTP code sent to your phone');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Full Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/img/DMS_logo.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      ></div>

      {/* Particle Background */}
      <div className="absolute inset-0 z-[5]">
        <ParticleBackground />
      </div>

      {/* Light Pillar Effect Overlay */}
      <div className="absolute inset-0 z-10">
        <LightPillar
          topColor="#3b82f6"
          bottomColor="#0f1f35"
          intensity={1.5}
          rotationSpeed={0.3}
          interactive={true}
          glowAmount={0.004}
          pillarWidth={3.0}
          pillarHeight={0.4}
          noiseIntensity={0.4}
          mixBlendMode="screen"
        />
      </div>

      {/* Dark Overlay with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/75 to-black/85 z-20"></div>

      {/* Main Content */}
      <div className="relative z-30 w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-3xl border-2 border-[#3b82f6]/40 rounded-3xl shadow-2xl shadow-black/70 overflow-hidden">
          {/* Animated Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent"></div>
          
          {/* Glowing Corner Accents */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#3b82f6]/20 to-transparent rounded-br-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#3b82f6]/20 to-transparent rounded-tl-full blur-2xl"></div>

          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#3b82f6]/20 mb-4">
                <svg className="w-8 h-8 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-[#3b82f6] uppercase tracking-wider mb-2">
                Verify Phone Number
              </h2>
              <p className="mt-2 text-sm font-medium text-[#3b82f6]">
                Enter the 6-digit code sent to your phone
              </p>
              <div className="mt-4 h-1 w-20 bg-[#1e3a5f] mx-auto"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-gradient-to-r from-red-900/70 to-red-800/70 border-2 border-red-700/50 text-red-200 px-4 py-3 rounded-xl font-medium backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3 text-center uppercase tracking-wide">
                  Enter Verification Code
                </label>
                <div className="flex justify-center gap-3" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-14 h-16 text-center text-2xl font-bold bg-gray-800 border-2 border-gray-700 text-[#3b82f6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#2d5a8f] transition-all"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full text-base py-4 font-bold shadow-lg shadow-[#1e3a5f]/40 hover:shadow-[#1e3a5f]/60 transition-all duration-300 uppercase tracking-wide"
                  isLoading={isLoading}
                >
                  Verify Phone
                </Button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-sm text-[#3b82f6] hover:text-[#2d5a8f] font-semibold transition-all duration-300 hover:underline underline-offset-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? 'Sending...' : "Didn't receive code? Resend"}
                </button>
              </div>

              <div className="text-center pt-4">
                <Link
                  href="/login"
                  className="text-sm text-gray-400 hover:text-[#3b82f6] font-medium transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

