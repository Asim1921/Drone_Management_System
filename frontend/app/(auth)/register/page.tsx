'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import LightPillar from '../../../components/LightPillar';
import ParticleBackground from '../../../components/ParticleBackground';
import Link from 'next/link';
import api from '../../../lib/api';

export default function RegisterPage() {
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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'operator',
    firstName: '',
    lastName: '',
    phone: '',
    twoFactorMethod: 'email' as 'email' | 'sms',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const roleOptions = [
    { value: 'operator', label: 'Operator / Pilot' },
    { value: 'vendor', label: 'Vendor / Manufacturer' },
    { value: 'caa_officer', label: 'CAA Officer' },
    { value: 'enforcement', label: 'Enforcement Agency' },
    { value: 'audit_officer', label: 'Audit Officer' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    // Validate phone if SMS is selected
    if (formData.twoFactorMethod === 'sms' && !formData.phone) {
      setError('Phone number is required for SMS verification');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        twoFactorMethod: formData.twoFactorMethod,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
        },
      });

      // Check if verification is required
      if (response.data.requiresVerification) {
        const method = response.data.verificationMethod || 'email';
        if (method === 'sms') {
          router.push(`/verify-phone?email=${encodeURIComponent(formData.email)}`);
        } else {
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        }
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="relative z-30 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

                {/* Feature Points */}
                <div className="pt-6 lg:pt-8 space-y-3">
                  <div className="flex items-center gap-3 text-gray-300 justify-center lg:justify-start">
                    <div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-sm shadow-[#3b82f6]/50"></div>
                    <span className="text-sm uppercase tracking-wide">Complete Registration</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 justify-center lg:justify-start">
                    <div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-sm shadow-[#3b82f6]/50"></div>
                    <span className="text-sm uppercase tracking-wide">Email Verification</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 justify-center lg:justify-start">
                    <div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-sm shadow-[#3b82f6]/50"></div>
                    <span className="text-sm uppercase tracking-wide">Role-Based Access</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="relative p-8 sm:p-10 lg:p-12 max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#3b82f6] uppercase tracking-wider mb-3">
                    New Registration
                  </h2>
                  <p className="text-sm text-gray-400 uppercase tracking-wide">
                    Join DMS - PDMS
                  </p>
                  <div className="mt-4 h-1 w-20 bg-[#1e3a5f] mx-auto"></div>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
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

                  <div className="space-y-4">
                    <Select
                      label="Role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      options={roleOptions}
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                      <Input
                        label="Last Name"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                    
                    {/* 2FA Method Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                        Two-Factor Authentication Method
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, twoFactorMethod: 'email' })}
                          className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                            formData.twoFactorMethod === 'email'
                              ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]'
                              : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-semibold">Email</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, twoFactorMethod: 'sms' })}
                          className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                            formData.twoFactorMethod === 'sms'
                              ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]'
                              : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-semibold">SMS</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <Input
                      label={`Phone Number ${formData.twoFactorMethod === 'sms' ? '(Required)' : '(Optional)'}`}
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+92XXXXXXXXXX or 03XXXXXXXXX"
                      required={formData.twoFactorMethod === 'sms'}
                    />
                    <Input
                      label="Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Confirm Password"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full text-base py-4 font-bold shadow-lg shadow-[#1e3a5f]/40 hover:shadow-[#1e3a5f]/60 transition-all duration-300 uppercase tracking-wide" 
                      isLoading={isLoading}
                    >
                      Register
                    </Button>
                  </div>

                  <div className="text-center pt-4">
                    <Link 
                      href="/login" 
                      className="text-sm text-[#3b82f6] hover:text-[#2d5a8f] font-semibold transition-all duration-300 hover:underline underline-offset-4 inline-flex items-center gap-2"
                    >
                      <span>Already have an account?</span>
                      <span className="text-white hover:text-[#3b82f6]">Sign In</span>
                    </Link>
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
