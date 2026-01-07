'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../lib/api';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { Button } from '../../../../components/ui/Button';
import TiltedCard from '../../../../components/TiltedCard';
import { format } from 'date-fns';
import Link from 'next/link';

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const vendorId = params.id as string;

  const { data: vendor, isLoading, error } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: async () => {
      const res = await api.get(`/vendors/${vendorId}`);
      return res.data.vendor;
    },
  });

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b82f6]"></div>
          <p className="mt-4 text-gray-400">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-gray-900 border-2 border-red-600/50 p-6 rounded-lg shadow-lg shadow-black/50 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Vendor Not Found</h2>
          <p className="text-gray-400 mb-4">The vendor you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link href="/vendors">
            <Button>Back to Vendors</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#3b82f6] uppercase tracking-wider">Vendor Details</h1>
          <div className="mt-2 h-1 w-32 bg-[#1e3a5f]"></div>
        </div>
        <Link href="/vendors">
          <Button variant="outline">Back to Vendors</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor Status Card */}
          <TiltedCard
            containerHeight="auto"
            containerWidth="100%"
            imageHeight="100%"
            imageWidth="100%"
            scaleOnHover={1.01}
            rotateAmplitude={5}
            showMobileWarning={false}
            showTooltip={false}
          >
            <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 sm:p-8 rounded-xl shadow-xl shadow-black/50">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide">Company Information</h2>
              <div className="flex gap-2">
                <StatusBadge status={vendor.isVerified ? 'Verified' : 'Pending'} />
                <span className="px-3 py-1 bg-[#1e3a5f] text-[#3b82f6] rounded-full text-sm uppercase tracking-wide">
                  {vendor.vendorType}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Company Name</p>
                <p className="text-lg text-gray-200 font-semibold">{vendor.companyInfo.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Registration Number</p>
                <p className="text-lg text-gray-200 font-mono">{vendor.companyInfo.registrationNumber}</p>
              </div>
              {vendor.companyInfo.taxId && (
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Tax ID</p>
                  <p className="text-lg text-gray-200 font-mono">{vendor.companyInfo.taxId}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Email</p>
                <p className="text-lg text-gray-200">{vendor.companyInfo.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                <p className="text-lg text-gray-200">{vendor.companyInfo.phone}</p>
              </div>
              {vendor.companyInfo.website && (
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Website</p>
                  <a
                    href={vendor.companyInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-[#3b82f6] hover:underline"
                  >
                    {vendor.companyInfo.website}
                  </a>
                </div>
              )}
              <div className="md:col-span-2">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Address</p>
                <p className="text-lg text-gray-200">
                  {vendor.companyInfo.address}, {vendor.companyInfo.city}, {vendor.companyInfo.country}
                </p>
              </div>
            </div>
            </div>
          </TiltedCard>

          {/* Compliance Status */}
          {vendor.complianceStatus && (
            <TiltedCard
              containerHeight="auto"
              containerWidth="100%"
              imageHeight="100%"
              imageWidth="100%"
              scaleOnHover={1.01}
              rotateAmplitude={5}
              showMobileWarning={false}
              showTooltip={false}
            >
              <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 sm:p-8 rounded-xl shadow-xl shadow-black/50">
              <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Compliance Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Compliance Status</p>
                  <StatusBadge status={vendor.complianceStatus.isCompliant ? 'Compliant' : 'Non-Compliant'} />
                </div>
                {vendor.complianceStatus.lastAuditDate && (
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Last Audit Date</p>
                    <p className="text-lg text-gray-200">
                      {format(new Date(vendor.complianceStatus.lastAuditDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                {vendor.complianceStatus.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-gray-300">{vendor.complianceStatus.notes}</p>
                  </div>
                )}
              </div>
              </div>
            </TiltedCard>
          )}

          {/* Verification Information */}
          {vendor.isVerified && (
            <TiltedCard
              containerHeight="auto"
              containerWidth="100%"
              imageHeight="100%"
              imageWidth="100%"
              scaleOnHover={1.01}
              rotateAmplitude={5}
              showMobileWarning={false}
              showTooltip={false}
            >
              <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 sm:p-8 rounded-xl shadow-xl shadow-black/50">
              <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Verification Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendor.verifiedAt && (
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Verified At</p>
                    <p className="text-lg text-gray-200">
                      {format(new Date(vendor.verifiedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {vendor.verifiedBy && (
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Verified By</p>
                    <p className="text-lg text-gray-200">
                      {typeof vendor.verifiedBy === 'object' && vendor.verifiedBy
                        ? `${vendor.verifiedBy.profile?.firstName || ''} ${vendor.verifiedBy.profile?.lastName || ''}`.trim() || vendor.verifiedBy.email
                        : 'N/A'}
                    </p>
                  </div>
                )}
              </div>
              </div>
            </TiltedCard>
          )}

          {/* Certifications */}
          {vendor.certifications && vendor.certifications.length > 0 && (
            <TiltedCard
              containerHeight="auto"
              containerWidth="100%"
              imageHeight="100%"
              imageWidth="100%"
              scaleOnHover={1.01}
              rotateAmplitude={5}
              showMobileWarning={false}
              showTooltip={false}
            >
              <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 sm:p-8 rounded-xl shadow-xl shadow-black/50">
              <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Certifications</h2>
              <div className="space-y-4">
                {vendor.certifications.map((cert: any, index: number) => (
                  <div key={index} className="border-l-4 border-[#3b82f6] pl-4 py-2">
                    <p className="text-lg text-gray-200 font-semibold">{cert.certificationType}</p>
                    <p className="text-sm text-gray-400">Issued by: {cert.issuedBy}</p>
                    <p className="text-sm text-gray-400">
                      Issue Date: {format(new Date(cert.issueDate), 'MMM dd, yyyy')}
                    </p>
                    {cert.expiryDate && (
                      <p className="text-sm text-gray-400">
                        Expiry Date: {format(new Date(cert.expiryDate), 'MMM dd, yyyy')}
                      </p>
                    )}
                    {cert.certificateNumber && (
                      <p className="text-sm text-gray-400 font-mono">Certificate #: {cert.certificateNumber}</p>
                    )}
                  </div>
                ))}
              </div>
              </div>
            </TiltedCard>
          )}

          {/* User Information */}
          {vendor.userId && (
            <TiltedCard
              containerHeight="auto"
              containerWidth="100%"
              imageHeight="100%"
              imageWidth="100%"
              scaleOnHover={1.01}
              rotateAmplitude={5}
              showMobileWarning={false}
              showTooltip={false}
            >
              <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 sm:p-8 rounded-xl shadow-xl shadow-black/50">
              <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Account Information</h2>
              {typeof vendor.userId === 'object' && vendor.userId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Name</p>
                    <p className="text-lg text-gray-200">
                      {vendor.userId.profile?.firstName || ''} {vendor.userId.profile?.lastName || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-lg text-gray-200">{vendor.userId.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">User information not available</p>
              )}
            </div>
          </TiltedCard>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <TiltedCard
            containerHeight="auto"
            containerWidth="100%"
            imageHeight="100%"
            imageWidth="100%"
            scaleOnHover={1.01}
            rotateAmplitude={5}
            showMobileWarning={false}
            showTooltip={false}
          >
            <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 sm:p-8 rounded-xl shadow-xl shadow-black/50">
            <h2 className="text-xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Actions</h2>
            <div className="space-y-3">
              {user?.role === 'vendor' && 
                (typeof vendor.userId === 'object' ? vendor.userId._id?.toString() : vendor.userId?.toString()) === user?._id?.toString() && (
                <Button className="w-full" onClick={() => router.push(`/vendors/${vendorId}/models`)}>
                  View Drone Models
                </Button>
              )}
            </div>
            </div>
          </TiltedCard>

          {/* Metadata */}
          <TiltedCard
            containerHeight="auto"
            containerWidth="100%"
            imageHeight="100%"
            imageWidth="100%"
            scaleOnHover={1.01}
            rotateAmplitude={5}
            showMobileWarning={false}
            showTooltip={false}
          >
            <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 sm:p-8 rounded-xl shadow-xl shadow-black/50">
            <h2 className="text-xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Metadata</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-400 uppercase tracking-wide">Created</p>
                <p className="text-gray-300">{format(new Date(vendor.createdAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase tracking-wide">Last Updated</p>
                <p className="text-gray-300">{format(new Date(vendor.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>
            </div>
          </TiltedCard>
        </div>
      </div>
    </div>
  );
}

