'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';
import { Table } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
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

export default function ViolationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: '', category: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['violations', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      const res = await api.get(`/violations?${params.toString()}`);
      return res.data;
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['violationStats'],
    queryFn: async () => {
      const res = await api.get('/violations/stats');
      return res.data;
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const res = await api.put(`/violations/${id}/resolve`, { notes });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['violations'] });
      queryClient.invalidateQueries({ queryKey: ['violationStats'] });
    },
  });

  const canCreate = user?.role === 'caa_officer' || user?.role === 'admin' || user?.role === 'enforcement';
  const canResolve = user?.role === 'caa_officer' || user?.role === 'admin' || user?.role === 'enforcement';

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
          <p className="mt-4 text-gray-400 font-medium">Loading violations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#3b82f6] uppercase tracking-wider mb-2">Fines/Violations</h1>
          <div className="h-1 w-32 bg-[#1e3a5f]"></div>
        </div>
        {canCreate && (
          <Link href="/violations/new">
            <Button>Report Violation</Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-md border border-[#3b82f6]/20 p-6 rounded-xl shadow-xl shadow-black/50">
            <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Total Violations</p>
            <p className="text-3xl font-bold text-[#3b82f6]">{statsData.stats?.total || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-md border border-yellow-600/20 p-6 rounded-xl shadow-xl shadow-black/50">
            <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{statsData.stats?.pending || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-md border border-green-600/20 p-6 rounded-xl shadow-xl shadow-black/50">
            <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Resolved</p>
            <p className="text-3xl font-bold text-green-400">{statsData.stats?.resolved || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-md border border-red-600/20 p-6 rounded-xl shadow-xl shadow-black/50">
            <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Total Fines</p>
            <p className="text-3xl font-bold text-red-400">PKR {statsData.stats?.totalFines?.toLocaleString() || 0}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-md border border-[#3b82f6]/20 p-6 rounded-xl shadow-xl shadow-black/50 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Filter by Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'appealed', label: 'Appealed' },
            ]}
          />
          <Select
            label="Filter by Category"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            options={[
              { value: '', label: 'All Categories' },
              ...Object.entries(VIOLATION_CATEGORIES).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
        </div>
      </div>

      {/* Violations Table */}
      {!data?.violations || data.violations.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-md border border-[#3b82f6]/20 p-12 rounded-xl shadow-xl shadow-black/50 text-center">
          <p className="text-gray-400 text-lg font-medium">No violations found</p>
        </div>
      ) : (
        <div className="relative">
          <Table
            headers={[
              'Category',
              'Operator',
              'Warning Level',
              'Fine Amount',
              'Violation Date',
              'Status',
              'Actions',
            ]}
          >
            {data?.violations?.map((violation: any, index: number) => (
              <tr
                key={violation._id}
                className="group relative bg-gradient-to-r from-transparent via-[#3b82f6]/0 to-transparent hover:via-[#3b82f6]/5 border-b border-[#3b82f6]/5 last:border-0"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-medium">
                  <span className="relative z-10">
                    {VIOLATION_CATEGORIES[violation.category as keyof typeof VIOLATION_CATEGORIES] || violation.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <span className="relative z-10">
                    {violation.operatorId?.profile?.firstName || 'N/A'}{' '}
                    {violation.operatorId?.profile?.lastName || ''}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="relative z-10">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getWarningBadgeColor(
                        violation.warningLevel
                      )}`}
                    >
                      {violation.warningLevel === 0
                        ? 'No Warning'
                        : violation.warningLevel === 3
                        ? 'License Suspended'
                        : `Warning ${violation.warningLevel}/3`}
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-semibold">
                  <span className="relative z-10">PKR {violation.fineAmount?.toLocaleString() || 0}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  <span className="relative z-10">
                    {format(new Date(violation.violationDate), 'MMM dd, yyyy HH:mm')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="relative z-10">
                    <StatusBadge status={violation.status} variant="violation" />
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2 relative z-10">
                    <Link href={`/violations/${violation._id}`}>
                      <Button variant="glass" size="sm" className="min-w-[70px]">
                        View
                      </Button>
                    </Link>
                    {canResolve && violation.status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          const notes = prompt('Enter resolution notes (optional):');
                          resolveMutation.mutate({ id: violation._id, notes: notes || undefined });
                        }}
                        isLoading={resolveMutation.isPending}
                        className="min-w-[80px]"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}

