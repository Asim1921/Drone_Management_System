'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../lib/api';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { Button } from '../../../../components/ui/Button';
import TiltedCard from '../../../../components/TiltedCard';
import LicenseFlipCard from '../../../../components/LicenseFlipCard';
import { format } from 'date-fns';
import Link from 'next/link';

export default function LicenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const licenseId = params.id as string;

  const { data: license, isLoading, error } = useQuery({
    queryKey: ['license', licenseId],
    queryFn: async () => {
      const res = await api.get(`/licenses/${licenseId}`);
      return res.data.license;
    },
  });

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b82f6]"></div>
          <p className="mt-4 text-gray-400">Loading license details...</p>
        </div>
      </div>
    );
  }

  if (error || !license) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-gray-900 border-2 border-red-600/50 p-6 rounded-lg shadow-lg shadow-black/50 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">License Not Found</h2>
          <p className="text-gray-400 mb-4">The license you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link href="/licenses">
            <Button>Back to Licenses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canApprove = user?.role === 'caa_officer' || user?.role === 'admin';

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#3b82f6] uppercase tracking-wider">License Details</h1>
          <div className="mt-2 h-1 w-32 bg-[#1e3a5f]"></div>
        </div>
        <Link href="/licenses">
          <Button variant="outline">Back to Licenses</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information - Flip Card */}
        <div className="lg:col-span-2">
          <LicenseFlipCard license={license} />
        </div>

        {/* Sidebar Actions and Metadata */}
        <div className="flex flex-col gap-6">
          {/* Actions Card */}
          <div className="relative">
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
              <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 rounded-xl shadow-xl shadow-black/50">
                <h2 className="text-xl font-bold text-[#3b82f6] uppercase tracking-wide mb-6">Actions</h2>
                <div className="space-y-3">
                  {canApprove && license.status === 'pending' && (
                    <Button className="w-full" onClick={() => router.push(`/licenses?approve=${licenseId}`)}>
                      Approve License
                    </Button>
                  )}
                  {canApprove && license.status === 'approved' && (
                    <Button variant="danger" className="w-full" onClick={() => router.push(`/licenses?suspend=${licenseId}`)}>
                      Suspend License
                    </Button>
                  )}
                  {license.status === 'approved' && (
                    <Button variant="outline" className="w-full" onClick={() => router.push(`/licenses?renew=${licenseId}`)}>
                      Renew License
                    </Button>
                  )}
                </div>
              </div>
            </TiltedCard>
          </div>

          {/* Metadata Card */}
          <div className="relative">
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
              <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 rounded-xl shadow-xl shadow-black/50">
                <h2 className="text-xl font-bold text-[#3b82f6] uppercase tracking-wide mb-6">Metadata</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Created</p>
                    <p className="text-lg text-gray-100 font-semibold">{format(new Date(license.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Last Updated</p>
                    <p className="text-lg text-gray-100 font-semibold">{format(new Date(license.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                </div>
              </div>
            </TiltedCard>
          </div>
        </div>
      </div>
    </div>
  );
}
