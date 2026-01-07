'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { License } from '../../shared/types';
import { StatusBadge } from './ui/StatusBadge';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

interface LicenseFlipCardProps {
  license: License;
}

export default function LicenseFlipCard({ license }: LicenseFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Generate QR code data with license information
  const generateQRCodeData = () => {
    const qrData = {
      licenseId: license._id,
      serialNumber: license.droneDetails.serialNumber,
      licenseType: license.licenseType,
      status: license.status,
      issueDate: format(new Date(license.issueDate), 'yyyy-MM-dd'),
      expiryDate: format(new Date(license.expiryDate), 'yyyy-MM-dd'),
      model: license.droneDetails.model,
      manufacturer: license.droneDetails.manufacturer,
      weight: license.droneDetails.weight,
      maxAltitude: license.droneDetails.maxAltitude,
      operator: license.operatorId && typeof license.operatorId === 'object' && license.operatorId
        ? {
            name: `${license.operatorId.profile?.firstName || ''} ${license.operatorId.profile?.lastName || ''}`.trim(),
            email: license.operatorId.email,
          }
        : null,
      approvedBy: license.approvedBy && typeof license.approvedBy === 'object' && license.approvedBy
        ? {
            name: `${license.approvedBy.profile?.firstName || ''} ${license.approvedBy.profile?.lastName || ''}`.trim() || license.approvedBy.email,
          }
        : null,
      approvedAt: license.approvedAt ? format(new Date(license.approvedAt), 'yyyy-MM-dd HH:mm') : null,
    };
    return JSON.stringify(qrData);
  };

  // Generate a simple barcode pattern
  const generateBarcode = () => {
    const bars = [];
    for (let i = 0; i < 50; i++) {
      const width = Math.random() * 3 + 1;
      bars.push(
        <div
          key={i}
          className="bg-gray-100"
          style={{
            width: `${width}px`,
            height: '40px',
            display: 'inline-block',
            marginRight: '2px',
          }}
        />
      );
    }
    return bars;
  };

  return (
    <div className="w-full max-w-3xl mx-auto" style={{ perspective: '1000px' }}>
      <div
        className="relative w-full h-[480px] transition-transform duration-700 cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side - License Information */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl overflow-hidden border border-gray-700"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
          }}
        >
          <div className="bg-gradient-to-br from-gray-800/95 via-gray-700/90 to-gray-800/95 h-full flex flex-col relative">
            {/* Ministry of Defense Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
              <div className="text-6xl font-black text-gray-400/20 uppercase tracking-widest text-center leading-tight">
                <div>MINISTRY</div>
                <div>OF</div>
                <div>DEFENSE</div>
              </div>
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] px-8 py-4 flex justify-between items-center relative z-10">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">DRONE LICENSE</h2>
              <StatusBadge status={license.status} variant="license" />
            </div>

            {/* Main Content */}
            <div className="flex-1 px-8 py-4 relative z-10 flex gap-6 overflow-visible pb-6">
              {/* Left Side - User Profile Icon */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-40 bg-gradient-to-br from-[#1e3a5f]/50 to-[#2d5a8f]/50 border-2 border-[#3b82f6]/30 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  <Image
                    src="/img/user_profile.png"
                    alt="User Profile"
                    width={128}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">License Type</p>
                  <p className="text-sm font-bold text-gray-200 capitalize">{license.licenseType}</p>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">License Number</p>
                  <p className="text-xl font-black text-[#3b82f6] font-mono tracking-wider">
                    {license.droneDetails.serialNumber.slice(-8)}
                  </p>
                </div>
              </div>

              {/* Right Side - Details */}
              <div className="flex-1 flex flex-col">
                {/* Top Section - Address/Info Area */}
                <div className="mb-3 pb-3 border-b border-gray-600/30">
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    DRONE OPERATION LICENSE
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    This license authorizes the operation of unmanned aerial vehicles (UAVs) in accordance with
                    Civil Aviation Authority regulations and guidelines.
                  </p>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-2">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Serial Number</p>
                    <p className="text-sm font-bold text-gray-200 font-mono">{license.droneDetails.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
                    <p className="text-sm font-bold text-gray-200 capitalize">{license.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date of Issue</p>
                    <p className="text-sm font-bold text-gray-200">
                      {format(new Date(license.issueDate), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Valid Until</p>
                    <p className="text-sm font-bold text-gray-200">
                      {format(new Date(license.expiryDate), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  {license.approvedBy && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Approved By</p>
                      <p className="text-sm font-bold text-gray-200">
                        {typeof license.approvedBy === 'object' && license.approvedBy
                          ? `${license.approvedBy.profile?.firstName || ''} ${license.approvedBy.profile?.lastName || ''}`.trim() || license.approvedBy.email
                          : 'N/A'}
                      </p>
                    </div>
                  )}
                  {license.approvedAt && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Approved At</p>
                      <p className="text-sm font-bold text-gray-200">
                        {format(new Date(license.approvedAt), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  )}
                </div>

                {/* QR Code Area */}
                <div className="pt-2 border-t border-gray-600/30 flex justify-between items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Operator</p>
                    {license.operatorId && typeof license.operatorId === 'object' && license.operatorId ? (
                      <div>
                        <p className="text-sm font-bold text-gray-200">
                          {license.operatorId.profile?.firstName || ''} {license.operatorId.profile?.lastName || ''}
                        </p>
                        <p className="text-xs text-gray-400">{license.operatorId.email}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">N/A</p>
                    )}
                  </div>
                  <div className="w-40 h-40 bg-white p-2.5 border-2 border-gray-500/70 rounded-lg flex items-center justify-center shadow-xl flex-shrink-0">
                    <QRCodeSVG
                      value={generateQRCodeData()}
                      size={140}
                      level="H"
                      includeMargin={true}
                      marginSize={2}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Barcode Footer */}
            <div className="bg-gray-900/50 px-8 py-4 border-t border-gray-700/50 relative z-10">
              <div className="flex items-center justify-center gap-2">
                {generateBarcode()}
              </div>
              <p className="text-xs text-gray-500 text-center mt-2 uppercase tracking-widest">
                Click to view drone details
              </p>
            </div>
          </div>
        </div>

        {/* Back Side - Drone Details */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl overflow-hidden border border-gray-700"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="bg-gradient-to-br from-gray-800/95 via-gray-700/90 to-gray-800/95 h-full flex flex-col relative">
            {/* Ministry of Defense Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
              <div className="text-6xl font-black text-gray-400/20 uppercase tracking-widest text-center leading-tight">
                <div>MINISTRY</div>
                <div>OF</div>
                <div>DEFENSE</div>
              </div>
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] px-6 py-3 relative z-10">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">DRONE DETAILS</h2>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-8 py-6 relative z-10 flex gap-6 overflow-visible">
              {/* Left Side - User Profile Icon */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-40 bg-gradient-to-br from-[#1e3a5f]/50 to-[#2d5a8f]/50 border-2 border-[#3b82f6]/30 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  <Image
                    src="/img/user_profile.png"
                    alt="User Profile"
                    width={128}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Model</p>
                  <p className="text-sm font-bold text-gray-200">{license.droneDetails.model}</p>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Serial Number</p>
                  <p className="text-lg font-black text-[#3b82f6] font-mono tracking-wider">
                    {license.droneDetails.serialNumber.slice(-8)}
                  </p>
                </div>
              </div>

              {/* Right Side - Details */}
              <div className="flex-1 flex flex-col">
                {/* Top Section */}
                <div className="mb-4 pb-4 border-b border-gray-600/30">
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    TECHNICAL SPECIFICATIONS
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Detailed specifications and capabilities of the licensed unmanned aerial vehicle.
                  </p>
                </div>

                {/* Details Grid */}
                <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Manufacturer</p>
                    <p className="text-sm font-bold text-gray-200">{license.droneDetails.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Model</p>
                    <p className="text-sm font-bold text-gray-200">{license.droneDetails.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Weight</p>
                    <p className="text-sm font-bold text-gray-200">{license.droneDetails.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Max Altitude</p>
                    <p className="text-sm font-bold text-gray-200">{license.droneDetails.maxAltitude} m</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">License Type</p>
                    <p className="text-sm font-bold text-gray-200 capitalize">{license.licenseType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
                    <p className="text-sm font-bold text-gray-200 capitalize">{license.status}</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-gray-600/30">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Full Serial Number</p>
                  <p className="text-sm font-bold text-gray-200 font-mono">{license.droneDetails.serialNumber}</p>
                </div>
              </div>
            </div>

            {/* Barcode Footer */}
            <div className="bg-gray-900/50 px-8 py-4 border-t border-gray-700/50 relative z-10">
              <div className="flex items-center justify-center gap-2">
                {generateBarcode()}
              </div>
              <p className="text-xs text-gray-500 text-center mt-2 uppercase tracking-widest">
                Click to view license information
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
