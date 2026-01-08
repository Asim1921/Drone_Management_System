'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../../contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { Button } from '../../../../components/ui/Button';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { format } from 'date-fns';
import Link from 'next/link';

const VIOLATION_CATEGORIES = {
  unauthorized_area: 'Unauthorized Area',
  no_permission: 'No Permission',
  altitude_violation: 'Altitude Violation',
  restricted_airspace: 'Restricted Airspace',
  missing_license: 'Missing License',
  expired_license: 'Expired License',
  safety_violation: 'Safety Violation',
  privacy_violation: 'Privacy Violation',
  other: 'Other',
};

export default function ViolationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['violation', id],
    queryFn: async () => {
      const res = await api.get(`/violations/${id}`);
      return res.data;
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ notes }: { notes?: string }) => {
      const res = await api.put(`/violations/${id}/resolve`, { notes });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['violation', id] });
      queryClient.invalidateQueries({ queryKey: ['violations'] });
      queryClient.invalidateQueries({ queryKey: ['violationStats'] });
    },
  });

  const canResolve = user?.role === 'caa_officer' || user?.role === 'admin' || user?.role === 'enforcement';

  const violation = data?.violation;

  const getWarningBadgeColor = (level: number) => {
    if (level === 0) return 'bg-gray-700 text-gray-300';
    if (level === 1) return 'bg-yellow-900/50 text-yellow-300 border-yellow-600';
    if (level === 2) return 'bg-orange-900/50 text-orange-300 border-orange-600';
    if (level >= 3) return 'bg-red-900/50 text-red-300 border-red-600';
    return 'bg-gray-700 text-gray-300';
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3b82f6] border-t-transparent"></div>
          <p className="mt-4 text-gray-400 font-medium">Loading violation details...</p>
        </div>
      </div>
    );
  }

  if (!violation) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-md border border-red-600/20 p-12 rounded-xl shadow-xl shadow-black/50 text-center">
          <p className="text-red-400 text-lg font-medium">Violation not found</p>
          <Link href="/violations">
            <Button className="mt-4">Back to Violations</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link href="/violations">
            <Button variant="outline" size="sm" className="mb-4">
              ← Back to Violations
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-[#3b82f6] uppercase tracking-wider mb-2">Violation Details</h1>
          <div className="h-1 w-32 bg-[#1e3a5f]"></div>
        </div>
        {canResolve && violation.status === 'pending' && (
          <Button
            variant="primary"
            onClick={() => {
              const notes = prompt('Enter resolution notes (optional):');
              if (notes !== null) {
                resolveMutation.mutate({ notes: notes || undefined });
              }
            }}
            isLoading={resolveMutation.isPending}
          >
            Resolve Violation
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Violation Details */}
        <div className="space-y-6">
          {/* Violation Information */}
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-md border border-[#3b82f6]/20 p-6 rounded-xl shadow-xl shadow-black/50">
            <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Violation Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Category</p>
                <p className="text-lg font-semibold text-white">
                  {VIOLATION_CATEGORIES[violation.category as keyof typeof VIOLATION_CATEGORIES] || violation.category}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Description</p>
                <p className="text-base text-gray-300">{violation.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Status</p>
                  <StatusBadge status={violation.status} variant="violation" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Warning Level</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getWarningBadgeColor(
                      violation.warningLevel
                    )}`}
                  >
                    {violation.warningLevel === 0
                      ? 'No Warning'
                      : violation.warningLevel === 3
                      ? 'License Suspended'
                      : `Warning ${violation.warningLevel}/3`}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Fine Amount</p>
                <p className="text-2xl font-bold text-red-400">PKR {violation.fineAmount?.toLocaleString() || 0}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Violation Date</p>
                  <p className="text-base text-gray-300">
                    {format(new Date(violation.violationDate), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Reported At</p>
                  <p className="text-base text-gray-300">
                    {format(new Date(violation.reportedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              {violation.resolvedAt && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Resolved At</p>
                    <p className="text-base text-gray-300">
                      {format(new Date(violation.resolvedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Resolved By</p>
                    <p className="text-base text-gray-300">
                      {violation.resolvedBy?.profile?.firstName || 'N/A'}{' '}
                      {violation.resolvedBy?.profile?.lastName || ''}
                    </p>
                  </div>
                </div>
              )}
              {violation.notes && (
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-base text-gray-300">{violation.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-md border border-[#3b82f6]/20 p-6 rounded-xl shadow-xl shadow-black/50">
            <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Location</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Latitude</p>
                  <p className="text-base text-gray-300">{violation.location?.latitude}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Longitude</p>
                  <p className="text-base text-gray-300">{violation.location?.longitude}</p>
                </div>
              </div>
              {violation.location?.address && (
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Address</p>
                  <p className="text-base text-gray-300">{violation.location.address}</p>
                </div>
              )}
              {violation.location?.latitude && violation.location?.longitude && (
                <div className="pt-4">
                  <a
                    href={`https://www.google.com/maps?q=${violation.location.latitude},${violation.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3b82f6] hover:text-[#2d5a8f] underline"
                  >
                    View on Google Maps →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Operator, License, and Drone Details */}
        <div className="space-y-6">
          {/* Operator Information */}
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-md border border-[#3b82f6]/20 p-6 rounded-xl shadow-xl shadow-black/50">
            <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Operator Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Name</p>
                <p className="text-lg font-semibold text-white">
                  {violation.operatorId?.profile?.firstName || 'N/A'}{' '}
                  {violation.operatorId?.profile?.lastName || ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Email</p>
                <p className="text-base text-gray-300">{violation.operatorId?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Role</p>
                <p className="text-base text-gray-300 capitalize">{violation.operatorId?.role?.replace('_', ' ') || 'N/A'}</p>
              </div>
              {violation.operatorId?._id && (
                <div className="pt-4 border-t border-gray-700">
                  <Link href={`/operators/${violation.operatorId._id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Operator Profile
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* License Information */}
          {violation.licenseId && (
            <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-md border border-[#3b82f6]/20 p-6 rounded-xl shadow-xl shadow-black/50">
              <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">License Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">License Type</p>
                  <p className="text-lg font-semibold text-white capitalize">
                    {violation.licenseId?.licenseType || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Serial Number</p>
                  <p className="text-base text-gray-300 font-mono">
                    {violation.licenseId?.droneDetails?.serialNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Status</p>
                  <StatusBadge status={violation.licenseId?.status} variant="license" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Issue Date</p>
                    <p className="text-base text-gray-300">
                      {violation.licenseId?.issueDate
                        ? format(new Date(violation.licenseId.issueDate), 'MMM dd, yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Expiry Date</p>
                    <p className="text-base text-gray-300">
                      {violation.licenseId?.expiryDate
                        ? format(new Date(violation.licenseId.expiryDate), 'MMM dd, yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                {violation.licenseId?.suspensionStatus?.isSuspended && (
                  <div className="pt-4 border-t border-red-600/50">
                    <p className="text-sm text-red-400 uppercase tracking-wide mb-1">Suspended</p>
                    <p className="text-base text-gray-300">{violation.licenseId.suspensionStatus.reason || 'N/A'}</p>
                    {violation.licenseId.suspensionStatus.suspendedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Suspended on:{' '}
                        {format(new Date(violation.licenseId.suspensionStatus.suspendedAt), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                )}
                {violation.licenseId?._id && (
                  <div className="pt-4 border-t border-gray-700">
                    <Link href={`/licenses/${violation.licenseId._id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View License Details
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Drone Details */}
          {violation.licenseId?.droneDetails && (
            <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-md border border-[#3b82f6]/20 p-6 rounded-xl shadow-xl shadow-black/50">
              <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Drone Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Model</p>
                  <p className="text-lg font-semibold text-white">
                    {violation.licenseId.droneDetails.model || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Manufacturer</p>
                  <p className="text-base text-gray-300">{violation.licenseId.droneDetails.manufacturer || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Serial Number</p>
                  <p className="text-base text-gray-300 font-mono">
                    {violation.licenseId.droneDetails.serialNumber || 'N/A'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Weight</p>
                    <p className="text-base text-gray-300">
                      {violation.licenseId.droneDetails.weight ? `${violation.licenseId.droneDetails.weight} kg` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Max Altitude</p>
                    <p className="text-base text-gray-300">
                      {violation.licenseId.droneDetails.maxAltitude
                        ? `${violation.licenseId.droneDetails.maxAltitude} m`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Flight Information */}
          {violation.flightId && (
            <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-md border border-[#3b82f6]/20 p-6 rounded-xl shadow-xl shadow-black/50">
              <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Flight Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Flight Purpose</p>
                  <p className="text-base text-gray-300">{violation.flightId?.flightDetails?.purpose || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Scheduled Date</p>
                  <p className="text-base text-gray-300">
                    {violation.flightId?.flightDetails?.scheduledDate
                      ? format(new Date(violation.flightId.flightDetails.scheduledDate), 'MMM dd, yyyy')
                      : 'N/A'}
                  </p>
                </div>
                {violation.flightId?._id && (
                  <div className="pt-4 border-t border-gray-700">
                    <Link href={`/flights/${violation.flightId._id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Flight Details
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

