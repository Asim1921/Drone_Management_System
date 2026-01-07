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
        {/* Main Information - Combined License and Drone Details */}
        <div className="lg:col-span-2">
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
              {/* License Information Section */}
              <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide">License Information</h2>
                  <StatusBadge status={license.status} variant="license" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">License Type</p>
                    <p className="text-lg text-gray-100 font-semibold capitalize">{license.licenseType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Serial Number</p>
                    <p className="text-lg text-gray-100 font-mono font-semibold">{license.droneDetails.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Issue Date</p>
                    <p className="text-lg text-gray-100 font-semibold">{format(new Date(license.issueDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Expiry Date</p>
                    <p className="text-lg text-gray-100 font-semibold">{format(new Date(license.expiryDate), 'MMM dd, yyyy')}</p>
                  </div>
                  {license.approvedBy && (
                    <>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Approved By</p>
                        <p className="text-lg text-gray-100 font-semibold">
                          {typeof license.approvedBy === 'object' && license.approvedBy
                            ? `${license.approvedBy.profile?.firstName || ''} ${license.approvedBy.profile?.lastName || ''}`.trim() || license.approvedBy.email
                            : 'N/A'}
                        </p>
                      </div>
                      {license.approvedAt && (
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Approved At</p>
                          <p className="text-lg text-gray-100 font-semibold">{format(new Date(license.approvedAt), 'MMM dd, yyyy HH:mm')}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#1e3a5f] to-transparent my-8"></div>

              {/* Drone Details Section */}
              <div>
                <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-6">Drone Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Model</p>
                    <p className="text-lg text-gray-100 font-semibold">{license.droneDetails.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Manufacturer</p>
                    <p className="text-lg text-gray-100 font-semibold">{license.droneDetails.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Weight</p>
                    <p className="text-lg text-gray-100 font-semibold">{license.droneDetails.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Max Altitude</p>
                    <p className="text-lg text-gray-100 font-semibold">{license.droneDetails.maxAltitude} m</p>
                  </div>
                </div>
              </div>

              {/* Operator Information */}
              {license.operatorId && (
                <>
                  <div className="h-px bg-gradient-to-r from-transparent via-[#1e3a5f] to-transparent my-8"></div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-6">Operator Information</h2>
                    {typeof license.operatorId === 'object' && license.operatorId ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Name</p>
                          <p className="text-lg text-gray-100 font-semibold">
                            {license.operatorId.profile?.firstName || ''} {license.operatorId.profile?.lastName || ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Email</p>
                          <p className="text-lg text-gray-100 font-semibold">{license.operatorId.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">Operator information not available</p>
                    )}
                  </div>
                </>
              )}

              {/* Suspension Status */}
              {license.suspensionStatus?.isSuspended && (
                <>
                  <div className="h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent my-8"></div>
                  <div>
                    <h2 className="text-2xl font-bold text-red-400 uppercase tracking-wide mb-6">Suspension Status</h2>
                    <div className="space-y-4">
                      {license.suspensionStatus.suspendedAt && (
                        <div>
                          <p className="text-xs text-red-300 uppercase tracking-wider font-semibold mb-2">Suspended At</p>
                          <p className="text-lg text-gray-100 font-semibold">
                            {format(new Date(license.suspensionStatus.suspendedAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      )}
                      {license.suspensionStatus.reason && (
                        <div>
                          <p className="text-xs text-red-300 uppercase tracking-wider font-semibold mb-2">Reason</p>
                          <p className="text-lg text-gray-200">{license.suspensionStatus.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Renewal History */}
              {license.renewalHistory && license.renewalHistory.length > 0 && (
                <>
                  <div className="h-px bg-gradient-to-r from-transparent via-[#1e3a5f] to-transparent my-8"></div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-6">Renewal History</h2>
                    <div className="space-y-4">
                      {license.renewalHistory.map((renewal: any, index: number) => (
                        <div key={index} className="border-l-4 border-[#3b82f6] pl-4 py-3 bg-gray-800/30 rounded-r-lg">
                          <div className="space-y-2">
                            <p className="text-gray-300">
                              <span className="text-gray-400 uppercase tracking-wide text-xs font-semibold">Renewal Date: </span>
                              <span className="font-semibold">{format(new Date(renewal.renewalDate), 'MMM dd, yyyy')}</span>
                            </p>
                            <p className="text-gray-300">
                              <span className="text-gray-400 uppercase tracking-wide text-xs font-semibold">Previous Expiry: </span>
                              <span className="font-semibold">{format(new Date(renewal.previousExpiry), 'MMM dd, yyyy')}</span>
                            </p>
                            <p className="text-gray-300">
                              <span className="text-gray-400 uppercase tracking-wide text-xs font-semibold">New Expiry: </span>
                              <span className="font-semibold">{format(new Date(renewal.newExpiry), 'MMM dd, yyyy')}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </TiltedCard>
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
