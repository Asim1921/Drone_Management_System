'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import LightPillar from '../../../components/LightPillar';
import ParticleBackground from '../../../components/ParticleBackground';

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

  useEffect(() => {
    // Hide scrollbars on body and html
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore scrollbars when component unmounts
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
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
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black scrollbar-hide">
        <div className="relative z-30 max-w-md w-full space-y-8 p-8">
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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black scrollbar-hide">
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

      {/* Completely Black Overlay */}
      <div className="absolute inset-0 bg-black z-20"></div>

      {/* Main Content - Single Unified Card */}
      <div className="relative z-30 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Side - Branding Section */}
            <div className="relative p-8 sm:p-10 lg:p-12">
              <div className="relative z-10 text-center lg:text-left space-y-6">
                <div>
                  <h1 className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] via-[#2d5a8f] to-[#3b82f6] uppercase tracking-wider mb-4 drop-shadow-[0_0_30px_rgba(139,154,79,0.6)]">
                    DMS
                  </h1>
                  <div className="h-1 w-32 sm:w-40 bg-gradient-to-r from-[#3b82f6] to-transparent mx-auto lg:mx-0 mb-6"></div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 uppercase tracking-wider drop-shadow-lg">
                    Pakistan Drone
                  </h2>
                  <h3 className="text-2xl sm:text-3xl font-semibold text-[#3b82f6] uppercase tracking-wide drop-shadow-[0_0_15px_rgba(139,154,79,0.4)]">
                    Management System
                  </h3>
                </div>
                
                <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#3b82f6]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#3b82f6] shadow-lg shadow-[#3b82f6]/70 animate-pulse"></div>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#3b82f6]"></div>
                </div>
                
                <p className="text-gray-300 text-sm sm:text-base uppercase tracking-widest font-medium pt-4">
                  Secure • Reliable • Advanced
                </p>

                {/* Drone GIF */}
                <div className="pt-6 flex justify-center lg:justify-start">
                  <div className="relative">
                    <img 
                      src="/img/drone.gif" 
                      alt="Drone Animation" 
                      className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 object-contain"
                      style={{ mixBlendMode: 'screen' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Verification Form */}
            <div className="relative p-8 sm:p-10 lg:p-12">
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#3b82f6] uppercase tracking-wider mb-3">
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
                    <div className="bg-gradient-to-r from-red-900/70 to-red-800/70 border-2 border-red-700/50 text-red-200 px-5 py-4 rounded-xl font-medium backdrop-blur-sm shadow-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center space-x-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-14 h-16 text-center text-2xl font-bold bg-gray-800/50 border-2 border-gray-700/50 text-[#3b82f6] rounded focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#2d5a8f] transition-all"
                      />
                    ))}
                  </div>

                  <div>
                    <Button 
                      type="submit" 
                      className="w-full text-base py-4 font-bold shadow-lg shadow-[#1e3a5f]/40 hover:shadow-[#1e3a5f]/60 transition-all duration-300 uppercase tracking-wide" 
                      isLoading={isLoading}
                    >
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
        </div>
      </div>
    </div>
  );
}
