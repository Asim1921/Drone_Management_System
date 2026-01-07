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

export default function OperatorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const operatorId = params.id as string;

  const { data: operator, isLoading, error } = useQuery({
    queryKey: ['operator', operatorId],
    queryFn: async () => {
      const res = await api.get(`/operators/${operatorId}`);
      return res.data.operator;
    },
  });

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b82f6]"></div>
          <p className="mt-4 text-gray-400">Loading operator details...</p>
        </div>
      </div>
    );
  }

  if (error || !operator) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-gray-900 border-2 border-red-600/50 p-6 rounded-lg shadow-lg shadow-black/50 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Operator Not Found</h2>
          <p className="text-gray-400 mb-4">The operator you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link href="/operators">
            <Button>Back to Operators</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canBlacklist = user?.role === 'caa_officer' || user?.role === 'admin' || user?.role === 'enforcement';

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#3b82f6] uppercase tracking-wider">Operator Details</h1>
          <div className="mt-2 h-1 w-32 bg-[#1e3a5f]"></div>
        </div>
        <Link href="/operators">
          <Button variant="outline">Back to Operators</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Operator Status Card */}
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
              <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide">Operator Information</h2>
              {operator.blacklistStatus?.isBlacklisted && (
                <StatusBadge status="Blacklisted" variant="operator" />
              )}
            </div>
            {typeof operator.userId === 'object' && operator.userId ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Name</p>
                  <p className="text-lg text-gray-200 font-semibold">
                    {operator.userId.profile?.firstName || ''} {operator.userId.profile?.lastName || ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-lg text-gray-200">{operator.userId.email}</p>
                </div>
                {operator.userId.profile?.phone && (
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                    <p className="text-lg text-gray-200">{operator.userId.profile.phone}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">User information not available</p>
            )}
            </div>
          </TiltedCard>

          {/* Identity Information */}
          {operator.identityInfo && (
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
              <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Identity Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {operator.identityInfo.cnic && (
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">CNIC</p>
                    <p className="text-lg text-gray-200 font-mono">{operator.identityInfo.cnic}</p>
                  </div>
                )}
                {operator.identityInfo.passport && (
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Passport</p>
                    <p className="text-lg text-gray-200 font-mono">{operator.identityInfo.passport}</p>
                  </div>
                )}
                {operator.identityInfo.dateOfBirth && (
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Date of Birth</p>
                    <p className="text-lg text-gray-200">{format(new Date(operator.identityInfo.dateOfBirth), 'MMM dd, yyyy')}</p>
                  </div>
                )}
                {operator.identityInfo.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Address</p>
                    <p className="text-lg text-gray-200">
                      {operator.identityInfo.address}, {operator.identityInfo.city}, {operator.identityInfo.country}
                    </p>
                  </div>
                )}
              </div>
              </div>
            </TiltedCard>
          )}

          {/* Experience */}
          {operator.experience && (
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
              <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Experience</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Total Flights</p>
                  <p className="text-3xl text-[#3b82f6] font-bold">{operator.experience.totalFlights || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Flight Hours</p>
                  <p className="text-3xl text-[#3b82f6] font-bold">{operator.experience.totalFlightHours || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Years of Experience</p>
                  <p className="text-3xl text-[#3b82f6] font-bold">{operator.experience.yearsOfExperience || 0}</p>
                </div>
              </div>
              {operator.authorizedDroneTypes && operator.authorizedDroneTypes.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">Authorized Drone Types</p>
                  <div className="flex flex-wrap gap-2">
                    {operator.authorizedDroneTypes.map((type: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#1e3a5f] text-[#3b82f6] rounded-full text-sm uppercase tracking-wide"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </TiltedCard>
          )}

          {/* Certifications */}
          {operator.certifications && operator.certifications.length > 0 && (
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
                {operator.certifications.map((cert: any, index: number) => (
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

          {/* Training Records */}
          {operator.trainingRecords && operator.trainingRecords.length > 0 && (
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
              <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Training Records</h2>
              <div className="space-y-4">
                {operator.trainingRecords.map((training: any, index: number) => (
                  <div key={index} className="border-l-4 border-[#3b82f6] pl-4 py-2">
                    <p className="text-lg text-gray-200 font-semibold">{training.courseName}</p>
                    <p className="text-sm text-gray-400">Institution: {training.institution}</p>
                    <p className="text-sm text-gray-400">
                      Completion Date: {format(new Date(training.completionDate), 'MMM dd, yyyy')}
                    </p>
                    {training.certificateNumber && (
                      <p className="text-sm text-gray-400 font-mono">Certificate #: {training.certificateNumber}</p>
                    )}
                  </div>
                ))}
              </div>
              </div>
            </TiltedCard>
          )}

          {/* Flight History */}
          {operator.flightHistory && operator.flightHistory.length > 0 && (
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
              <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Recent Flight History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e3a5f]">
                      <th className="text-left py-2 px-4 text-sm text-gray-400 uppercase tracking-wide">Date</th>
                      <th className="text-left py-2 px-4 text-sm text-gray-400 uppercase tracking-wide">Drone Model</th>
                      <th className="text-left py-2 px-4 text-sm text-gray-400 uppercase tracking-wide">Location</th>
                      <th className="text-left py-2 px-4 text-sm text-gray-400 uppercase tracking-wide">Duration</th>
                      <th className="text-left py-2 px-4 text-sm text-gray-400 uppercase tracking-wide">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operator.flightHistory.map((flight: any, index: number) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="py-2 px-4 text-sm text-gray-300">
                          {format(new Date(flight.flightDate), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-300">{flight.droneModel}</td>
                        <td className="py-2 px-4 text-sm text-gray-300">{flight.location}</td>
                        <td className="py-2 px-4 text-sm text-gray-300">{flight.duration} min</td>
                        <td className="py-2 px-4 text-sm text-gray-300">{flight.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
            </TiltedCard>
          )}

          {/* Blacklist Status */}
          {operator.blacklistStatus?.isBlacklisted && (
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
              <div className="bg-gradient-to-br from-red-900/30 via-red-800/20 to-red-900/30 backdrop-blur-sm border-2 border-red-600/50 p-6 sm:p-8 rounded-xl shadow-xl shadow-black/50">
              <h2 className="text-2xl font-bold text-red-400 uppercase tracking-wide mb-4">Blacklist Status</h2>
              <div className="space-y-2">
                {operator.blacklistStatus.blacklistedAt && (
                  <p className="text-gray-300">
                    <span className="text-gray-400 uppercase tracking-wide">Blacklisted At:</span>{' '}
                    {format(new Date(operator.blacklistStatus.blacklistedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
                {operator.blacklistStatus.reason && (
                  <div>
                    <p className="text-gray-400 uppercase tracking-wide mb-1">Reason</p>
                    <p className="text-gray-300">{operator.blacklistStatus.reason}</p>
                  </div>
                )}
              </div>
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
              {canBlacklist && !operator.blacklistStatus?.isBlacklisted && (
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => {
                    const reason = prompt('Enter blacklist reason:');
                    if (reason) {
                      // Handle blacklist action
                      router.push(`/operators?blacklist=${operatorId}&reason=${encodeURIComponent(reason)}`);
                    }
                  }}
                >
                  Blacklist Operator
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
                <p className="text-gray-300">{format(new Date(operator.createdAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase tracking-wide">Last Updated</p>
                <p className="text-gray-300">{format(new Date(operator.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>
            </div>
          </TiltedCard>
        </div>
      </div>
    </div>
  );
}

