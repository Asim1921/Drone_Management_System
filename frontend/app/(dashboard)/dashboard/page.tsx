'use client';

import React, { useRef, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import Link from 'next/link';
import { Button } from '../../../components/ui/Button';
import TiltedCard from '../../../components/TiltedCard';
import { format } from 'date-fns';

// Operator Drone GIF Component
const OperatorDroneView = () => {
  return (
    <div className="relative flex-shrink-0 w-full lg:w-auto flex justify-center">
      <div className="relative bg-black">
        <div className="relative z-10">
          <img
            src="/img/Op_Drone.gif"
            alt="Operator Drone"
            className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] object-contain"
            draggable="false"
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

// 3D Drone GIF Component
const Drone3DView = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * -20;
    const rotateYValue = ((x - centerX) / centerX) * 20;
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative transform-gpu transition-transform duration-300 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Main Container */}
        <div className="relative bg-black">
          {/* GIF Container */}
          <div className="relative z-10">
            <img
              src="/img/gif.gif"
              alt="Drone 3D Animation"
              className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] object-contain"
              draggable="false"
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: licensesData } = useQuery({
    queryKey: ['licenses'],
    queryFn: async () => {
      const res = await api.get('/licenses');
      return res.data;
    },
    enabled: !!user,
  });

  const { data: operatorsData } = useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      const res = await api.get('/operators');
      return res.data;
    },
    enabled: !!user && (user.role === 'admin' || user.role === 'caa_officer' || user.role === 'enforcement'),
  });

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await api.get('/vendors');
      return res.data;
    },
    enabled: !!user && (user.role === 'admin' || user.role === 'caa_officer' || user.role === 'vendor'),
  });

  const getRoleDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        const totalLicenses = licensesData?.licenses?.length || 0;
        const totalOperators = operatorsData?.operators?.length || 0;
        const totalVendors = vendorsData?.vendors?.length || 0;
        const pendingLicenses = licensesData?.licenses?.filter((l: any) => l.status === 'pending')?.length || 0;
        const approvedLicenses = licensesData?.licenses?.filter((l: any) => l.status === 'approved')?.length || 0;
        const suspendedLicenses = licensesData?.licenses?.filter((l: any) => l.status === 'suspended')?.length || 0;

        return (
          <>
            {/* Hero Section */}
            <div className="relative mb-12 overflow-hidden rounded-2xl bg-black">
              <div className="relative z-10 p-8 sm:p-12 lg:p-16">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                  <div className="max-w-2xl flex-1 text-center lg:text-left">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
                      DMS ECOSYSTEM
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-300 mb-6 max-w-2xl mx-auto lg:mx-0">
                      Providing regulatory compliance with minimal admin allowing for more, safer flying.
                    </p>
                    <p className="text-base text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0">
                      Streamline your drone operations with our all-in-one software ecosystem, ensuring regulatory compliance and operational efficiency for public safety agencies.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                      <Link href="/licenses/new">
                        <Button className="border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300">
                          Get Started with Ecosystem Access
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  {/* 3D Drone GIF */}
                  <div className="relative flex-shrink-0 w-full lg:w-auto flex justify-center">
                    <Drone3DView />
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <TiltedCard
                containerHeight="auto"
                containerWidth="100%"
                imageHeight="auto"
                imageWidth="100%"
                scaleOnHover={1.02}
                rotateAmplitude={5}
                showMobileWarning={false}
                showTooltip={false}
              >
                <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 rounded-xl shadow-xl shadow-black/50 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Licenses</h3>
                    <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-5xl font-black text-[#3b82f6] mb-2">{totalLicenses}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Active Licenses</p>
                </div>
              </TiltedCard>

              <TiltedCard
                containerHeight="auto"
                containerWidth="100%"
                imageHeight="auto"
                imageWidth="100%"
                scaleOnHover={1.02}
                rotateAmplitude={5}
                showMobileWarning={false}
                showTooltip={false}
              >
                <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 rounded-xl shadow-xl shadow-black/50 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Operators</h3>
                    <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-5xl font-black text-[#3b82f6] mb-2">{totalOperators}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Registered Operators</p>
                </div>
              </TiltedCard>

              <TiltedCard
                containerHeight="auto"
                containerWidth="100%"
                imageHeight="auto"
                imageWidth="100%"
                scaleOnHover={1.02}
                rotateAmplitude={5}
                showMobileWarning={false}
                showTooltip={false}
              >
                <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 rounded-xl shadow-xl shadow-black/50 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Vendors</h3>
                    <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-5xl font-black text-[#3b82f6] mb-2">{totalVendors}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Verified Vendors</p>
                </div>
              </TiltedCard>
            </div>

            {/* License Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <TiltedCard
                containerHeight="auto"
                containerWidth="100%"
                imageHeight="auto"
                imageWidth="100%"
                scaleOnHover={1.02}
                rotateAmplitude={5}
                showMobileWarning={false}
                showTooltip={false}
              >
                <div className="bg-gradient-to-br from-yellow-900/30 via-yellow-800/20 to-yellow-900/30 backdrop-blur-sm border-2 border-yellow-600/50 p-6 rounded-xl shadow-xl shadow-yellow-900/20 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-yellow-300 uppercase tracking-wider">Pending</h3>
                    <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-yellow-400 mb-2">{pendingLicenses}</p>
                  <Link href="/licenses?status=pending">
                    <Button variant="outline" size="sm" className="mt-2 border-yellow-600/50 text-yellow-300 hover:bg-yellow-600/20">
                      Review
                    </Button>
                  </Link>
                </div>
              </TiltedCard>

              <TiltedCard
                containerHeight="auto"
                containerWidth="100%"
                imageHeight="auto"
                imageWidth="100%"
                scaleOnHover={1.02}
                rotateAmplitude={5}
                showMobileWarning={false}
                showTooltip={false}
              >
                <div className="bg-gradient-to-br from-green-900/30 via-green-800/20 to-green-900/30 backdrop-blur-sm border-2 border-green-600/50 p-6 rounded-xl shadow-xl shadow-green-900/20 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-green-300 uppercase tracking-wider">Approved</h3>
                    <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-green-400 mb-2">{approvedLicenses}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Active Licenses</p>
                </div>
              </TiltedCard>

              <TiltedCard
                containerHeight="auto"
                containerWidth="100%"
                imageHeight="auto"
                imageWidth="100%"
                scaleOnHover={1.02}
                rotateAmplitude={5}
                showMobileWarning={false}
                showTooltip={false}
              >
                <div className="bg-gradient-to-br from-red-900/30 via-red-800/20 to-red-900/30 backdrop-blur-sm border-2 border-red-600/50 p-6 rounded-xl shadow-xl shadow-red-900/20 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-red-300 uppercase tracking-wider">Suspended</h3>
                    <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-red-400 mb-2">{suspendedLicenses}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Requires Attention</p>
                </div>
              </TiltedCard>
            </div>
          </>
        );

      case 'operator':
        const myLicenses = licensesData?.licenses?.length || 0;
        const pendingMyLicenses = licensesData?.licenses?.filter((l: any) => l.status === 'pending')?.length || 0;
        const approvedMyLicenses = licensesData?.licenses?.filter((l: any) => l.status === 'approved')?.length || 0;

        return (
          <>
            {/* Hero Section */}
            <div className="relative mb-12 overflow-hidden rounded-2xl bg-black">
              <div className="relative z-10 p-8 sm:p-12 lg:p-16">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                  <div className="max-w-2xl flex-1 text-center lg:text-left">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
                      OPERATOR DASHBOARD
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-300 mb-6 max-w-2xl mx-auto lg:mx-0">
                      Manage your drone licenses and flight operations with regulatory compliance.
                    </p>
                    <p className="text-base text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0">
                      Streamline your drone operations with our all-in-one software ecosystem, ensuring regulatory compliance and operational efficiency.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                      <Link href="/licenses/new">
                        <Button className="border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300">
                          Apply for New License
                        </Button>
                      </Link>
                      <Link href="/licenses">
                        <Button variant="outline" className="border-2 border-[#8b9a4f] text-[#3b82f6] hover:bg-[#3b82f6] hover:text-black transition-all duration-300">
                          View All Licenses
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Operator Drone GIF */}
                  <OperatorDroneView />
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <TiltedCard
                containerHeight="auto"
                containerWidth="100%"
                imageHeight="auto"
                imageWidth="100%"
                scaleOnHover={1.02}
                rotateAmplitude={5}
                showMobileWarning={false}
                showTooltip={false}
              >
                <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 rounded-xl shadow-xl shadow-black/50 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">My Licenses</h3>
                    <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-5xl font-black text-[#3b82f6] mb-2">{myLicenses}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Licenses</p>
                </div>
              </TiltedCard>

              <TiltedCard
                containerHeight="auto"
                containerWidth="100%"
                imageHeight="auto"
                imageWidth="100%"
                scaleOnHover={1.02}
                rotateAmplitude={5}
                showMobileWarning={false}
                showTooltip={false}
              >
                <div className="bg-gradient-to-br from-yellow-900/30 via-yellow-800/20 to-yellow-900/30 backdrop-blur-sm border-2 border-yellow-600/50 p-6 rounded-xl shadow-xl shadow-yellow-900/20 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-yellow-300 uppercase tracking-wider">Pending</h3>
                    <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-yellow-400 mb-2">{pendingMyLicenses}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Awaiting Approval</p>
                </div>
              </TiltedCard>

              <TiltedCard
                containerHeight="auto"
                containerWidth="100%"
                imageHeight="auto"
                imageWidth="100%"
                scaleOnHover={1.02}
                rotateAmplitude={5}
                showMobileWarning={false}
                showTooltip={false}
              >
                <div className="bg-gradient-to-br from-green-900/30 via-green-800/20 to-green-900/30 backdrop-blur-sm border-2 border-green-600/50 p-6 rounded-xl shadow-xl shadow-green-900/20 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-green-300 uppercase tracking-wider">Approved</h3>
                    <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-green-400 mb-2">{approvedMyLicenses}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Active Licenses</p>
                </div>
              </TiltedCard>
            </div>
          </>
        );

      case 'caa_officer':
        const pendingApprovals = licensesData?.licenses?.filter((l: any) => l.status === 'pending')?.length || 0;
        const totalLicensesCAA = licensesData?.licenses?.length || 0;
        const approvedLicensesCAA = licensesData?.licenses?.filter((l: any) => l.status === 'approved')?.length || 0;

        return (
          <>
            {/* Hero Section */}
            <div className="relative mb-12 overflow-hidden rounded-2xl bg-black">
              <div className="relative z-10 p-8 sm:p-12 lg:p-16">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                  <div className="max-w-2xl flex-1 text-center lg:text-left">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
                      CAA OFFICER PORTAL
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-300 mb-6 max-w-2xl mx-auto lg:mx-0">
                      Review and approve license applications with regulatory compliance oversight.
                    </p>
                    <p className="text-base text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0">
                      Manage license approvals, monitor compliance, and ensure safe drone operations across Pakistan.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                      <Link href="/licenses?status=pending">
                        <Button className="border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300">
                          Review Pending Applications
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Operator Drone GIF */}
                  <OperatorDroneView />
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <TiltedCard
                containerHeight="auto"
                containerWidth="100%"
                imageHeight="auto"
                imageWidth="100%"
                scaleOnHover={1.02}
                rotateAmplitude={5}
                showMobileWarning={false}
                showTooltip={false}
              >
                <div className="bg-gradient-to-br from-yellow-900/30 via-yellow-800/20 to-yellow-900/30 backdrop-blur-sm border-2 border-yellow-600/50 p-6 rounded-xl shadow-xl shadow-yellow-900/20 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-yellow-300 uppercase tracking-wider">Pending Approvals</h3>
                    <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-5xl font-black text-yellow-400 mb-2">{pendingApprovals}</p>
                  <Link href="/licenses?status=pending">
                    <Button variant="outline" size="sm" className="mt-2 border-yellow-600/50 text-yellow-300 hover:bg-yellow-600/20 w-full">
                      Review Applications
                    </Button>
                  </Link>
                </div>
              </TiltedCard>

              <TiltedCard
                containerHeight="auto"
                containerWidth="100%"
                imageHeight="auto"
                imageWidth="100%"
                scaleOnHover={1.02}
                rotateAmplitude={5}
                showMobileWarning={false}
                showTooltip={false}
              >
                <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 rounded-xl shadow-xl shadow-black/50 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Licenses</h3>
                    <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-5xl font-black text-[#3b82f6] mb-2">{totalLicensesCAA}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">All Licenses</p>
                </div>
              </TiltedCard>

              <TiltedCard
                containerHeight="auto"
                containerWidth="100%"
                imageHeight="auto"
                imageWidth="100%"
                scaleOnHover={1.02}
                rotateAmplitude={5}
                showMobileWarning={false}
                showTooltip={false}
              >
                <div className="bg-gradient-to-br from-green-900/30 via-green-800/20 to-green-900/30 backdrop-blur-sm border-2 border-green-600/50 p-6 rounded-xl shadow-xl shadow-green-900/20 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-green-300 uppercase tracking-wider">Approved</h3>
                    <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-5xl font-black text-green-400 mb-2">{approvedLicensesCAA}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Active Licenses</p>
                </div>
              </TiltedCard>
            </div>
          </>
        );

      default:
        return (
          <>
            {/* Hero Section */}
            <div className="relative mb-12 overflow-hidden rounded-2xl bg-black">
              <div className="relative z-10 p-8 sm:p-12 lg:p-16">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                  <div className="max-w-2xl flex-1 text-center lg:text-left">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
                      DMS ECOSYSTEM
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-300 mb-6 max-w-2xl mx-auto lg:mx-0">
                      Welcome to the Pakistan Drone Management System.
                    </p>
                    <p className="text-base text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0">
                      Use the navigation menu to access features available for your role.
                    </p>
                  </div>
                  
                  {/* Operator Drone GIF */}
                  <OperatorDroneView />
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Welcome Back</p>
            <h2 className="text-2xl font-bold text-white">
              {user?.profile?.firstName || 'User'} {user?.profile?.lastName || ''}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Role</p>
            <p className="text-sm font-semibold text-[#3b82f6] uppercase">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {getRoleDashboard()}

      {/* Quick Actions */}
      <TiltedCard
        containerHeight="auto"
        containerWidth="100%"
        imageHeight="auto"
        imageWidth="100%"
        scaleOnHover={1.01}
        rotateAmplitude={5}
        showMobileWarning={false}
        showTooltip={false}
      >
        <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 sm:p-8 rounded-xl shadow-xl shadow-black/50">
          <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user?.role === 'operator' && (
              <Link href="/licenses/new">
                <Button className="w-full border-2 border-[#8b9a4f] text-[#3b82f6] hover:bg-[#3b82f6] hover:text-black transition-all duration-300">
                  Apply for License
                </Button>
              </Link>
            )}
            {user?.role === 'vendor' && (
              <Link href="/vendors/register">
                <Button className="w-full border-2 border-[#8b9a4f] text-[#3b82f6] hover:bg-[#3b82f6] hover:text-black transition-all duration-300">
                  Register Vendor
                </Button>
              </Link>
            )}
            <Link href="/licenses">
              <Button variant="outline" className="w-full border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-300">
                View Licenses
              </Button>
            </Link>
            {user?.role === 'operator' && (
              <Link href="/operators/register">
                <Button variant="outline" className="w-full border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-300">
                  Register as Operator
                </Button>
              </Link>
            )}
          </div>
        </div>
      </TiltedCard>
    </div>
  );
}
