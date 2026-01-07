'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import LightPillar from '../../../components/LightPillar';
import ParticleBackground from '../../../components/ParticleBackground';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      const errorResponse = err.response?.data;
      
      // Check if email verification is required
      if (errorResponse?.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setError(errorResponse?.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black">
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

      {/* Main Content - Single Unified Card */}
      <div className="relative z-30 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-3xl border-2 border-[#3b82f6]/40 rounded-3xl shadow-2xl shadow-black/70 overflow-hidden">
          {/* Animated Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent"></div>
          
          {/* Glowing Corner Accents */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#3b82f6]/20 to-transparent rounded-br-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#3b82f6]/20 to-transparent rounded-tl-full blur-2xl"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Side - Branding Section */}
            <div className="relative bg-gradient-to-br from-black/60 via-gray-900/50 to-black/60 p-8 sm:p-10 lg:p-12 border-r-2 border-[#3b82f6]/20 lg:border-r lg:border-b-0 border-b-2 lg:border-b-0">
              {/* Decorative Pattern Overlay */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)',
                  backgroundSize: '40px 40px'
                }}></div>
              </div>

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
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#3b82f6] to-[#2d5a8f] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition duration-300"></div>
                    <div className="relative bg-black/40 rounded-xl p-3 backdrop-blur-sm border border-[#3b82f6]/30">
                      <img 
                        src="/img/drone.gif" 
                        alt="Drone Animation" 
                        className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 object-contain rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Feature Points */}
                <div className="pt-6 lg:pt-8 space-y-3">
                  <div className="flex items-center gap-3 text-gray-300 justify-center lg:justify-start">
                    <div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-sm shadow-[#3b82f6]/50"></div>
                    <span className="text-sm uppercase tracking-wide">Real-time Monitoring</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 justify-center lg:justify-start">
                    <div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-sm shadow-[#3b82f6]/50"></div>
                    <span className="text-sm uppercase tracking-wide">Secure Authentication</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 justify-center lg:justify-start">
                    <div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-sm shadow-[#3b82f6]/50"></div>
                    <span className="text-sm uppercase tracking-wide">Comprehensive Management</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="relative p-8 sm:p-10 lg:p-12 bg-gradient-to-br from-gray-900/80 to-black/60">
              {/* Subtle Pattern Overlay */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(45deg, #3b82f6 1px, transparent 1px), linear-gradient(-45deg, #3b82f6 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>
              </div>

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#3b82f6] uppercase tracking-wider mb-3">
                    Access Portal
                  </h2>
                  <p className="text-sm text-gray-400 uppercase tracking-wide">
                    Sign in to continue
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

                  <div className="space-y-5">
                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Input
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full text-base py-4 font-bold shadow-lg shadow-[#1e3a5f]/40 hover:shadow-[#1e3a5f]/60 transition-all duration-300 uppercase tracking-wide" 
                      isLoading={isLoading}
                    >
                      Authenticate
                    </Button>
                  </div>

                  <div className="text-center pt-4">
                    <Link 
                      href="/register" 
                      className="text-sm text-[#3b82f6] hover:text-[#2d5a8f] font-semibold transition-all duration-300 hover:underline underline-offset-4 inline-flex items-center gap-2"
                    >
                      <span>Don't have an account?</span>
                      <span className="text-white hover:text-[#3b82f6]">Register Now</span>
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
