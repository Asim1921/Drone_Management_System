'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';
import { Table } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import Link from 'next/link';

export default function OperatorsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      const res = await api.get('/operators');
      return res.data;
    },
  });

  const blacklistMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.put(`/operators/${id}/blacklist`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
    },
  });

  const canBlacklist = user?.role === 'caa_officer' || user?.role === 'admin' || user?.role === 'enforcement';
  const canView = user?.role === 'admin' || user?.role === 'caa_officer' || user?.role === 'enforcement' || user?.role === 'operator';

  if (!canView) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-900/50 border-2 border-red-800 text-red-300 px-4 py-3 rounded font-medium">
          You don't have permission to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#3b82f6] uppercase tracking-wider">Operators / Pilots</h1>
          <div className="mt-2 h-1 w-32 bg-[#1e3a5f]"></div>
        </div>
        {user?.role === 'operator' && (
          <Link href="/operators/register">
            <Button>Register as Operator</Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3b82f6] border-t-transparent"></div>
          <p className="mt-4 text-gray-400 font-medium">Loading operators...</p>
        </div>
      ) : (
        <div className="relative">
          <Table
            headers={['Name', 'Email', 'Total Flights', 'Experience (Years)', 'Status', 'Actions']}
          >
            {data?.operators?.map((operator: any, index: number) => {
              const userData = typeof operator.userId === 'object' ? operator.userId : null;
              const name = userData?.profile?.firstName
                ? `${userData.profile.firstName} ${userData.profile.lastName || ''}`.trim()
                : userData?.email || 'N/A';

              return (
                <tr 
                  key={operator._id} 
                  className="group relative bg-gradient-to-r from-transparent via-[#3b82f6]/0 to-transparent hover:via-[#3b82f6]/5 border-b border-[#3b82f6]/5 last:border-0"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-medium">
                    <span className="relative z-10">{name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="relative z-10">{userData?.email || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="relative z-10">{operator.experience?.totalFlights || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="relative z-10">{operator.experience?.yearsOfExperience || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="relative z-10">
                      <StatusBadge
                        status={operator.blacklistStatus?.isBlacklisted ? 'Blacklisted' : 'Active'}
                        variant="operator"
                      />
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2 relative z-10">
                      <Link href={`/operators/${operator._id}`}>
                        <Button variant="glass" size="sm" className="min-w-[70px]">View</Button>
                      </Link>
                      {canBlacklist && !operator.blacklistStatus?.isBlacklisted && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            const reason = prompt('Enter blacklist reason:');
                            if (reason) blacklistMutation.mutate({ id: operator._id, reason });
                          }}
                          isLoading={blacklistMutation.isPending}
                          className="min-w-[90px]"
                        >
                          Blacklist
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        </div>
      )}
    </div>
  );
}
