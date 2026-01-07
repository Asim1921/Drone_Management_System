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

export default function LicensesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: '', licenseType: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['licenses', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.licenseType) params.append('licenseType', filters.licenseType);
      const res = await api.get(`/licenses?${params.toString()}`);
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.put(`/licenses/${id}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.put(`/licenses/${id}/suspend`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
    },
  });

  const canApprove = user?.role === 'caa_officer' || user?.role === 'admin';
  const canCreate = user?.role === 'operator';

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#3b82f6] uppercase tracking-wider">Licenses</h1>
          <div className="mt-2 h-1 w-32 bg-[#1e3a5f]"></div>
        </div>
        {canCreate && (
          <Link href="/licenses/new">
            <Button>Apply for License</Button>
          </Link>
        )}
      </div>

      <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-md border border-[#3b82f6]/20 p-6 rounded-xl shadow-xl shadow-black/50 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Filter by Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'expired', label: 'Expired' },
            ]}
          />
          <Select
            label="Filter by Type"
            value={filters.licenseType}
            onChange={(e) => setFilters({ ...filters, licenseType: e.target.value })}
            options={[
              { value: '', label: 'All Types' },
              { value: 'individual', label: 'Individual' },
              { value: 'commercial', label: 'Commercial' },
              { value: 'government', label: 'Government' },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3b82f6] border-t-transparent"></div>
          <p className="mt-4 text-gray-400 font-medium">Loading licenses...</p>
        </div>
      ) : (
        <div className="relative">
          <Table
            headers={['License Type', 'Serial Number', 'Status', 'Issue Date', 'Expiry Date', 'Actions']}
          >
            {data?.licenses?.map((license: any, index: number) => (
              <tr 
                key={license._id} 
                className="group relative bg-gradient-to-r from-transparent via-[#3b82f6]/0 to-transparent hover:via-[#3b82f6]/5 border-b border-[#3b82f6]/5 last:border-0"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-medium capitalize">
                  <span className="relative z-10">{license.licenseType}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                  <span className="relative z-10">{license.droneDetails.serialNumber}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="relative z-10">
                    <StatusBadge status={license.status} variant="license" />
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  <span className="relative z-10">{format(new Date(license.issueDate), 'MMM dd, yyyy')}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  <span className="relative z-10">{format(new Date(license.expiryDate), 'MMM dd, yyyy')}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2 relative z-10">
                    <Link href={`/licenses/${license._id}`}>
                      <Button variant="glass" size="sm" className="min-w-[70px]">View</Button>
                    </Link>
                    {canApprove && license.status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => approveMutation.mutate(license._id)}
                        isLoading={approveMutation.isPending}
                        className="min-w-[80px]"
                      >
                        Approve
                      </Button>
                    )}
                    {canApprove && license.status === 'approved' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          const reason = prompt('Enter suspension reason:');
                          if (reason) suspendMutation.mutate({ id: license._id, reason });
                        }}
                        isLoading={suspendMutation.isPending}
                        className="min-w-[80px]"
                      >
                        Suspend
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
