'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';
import { Table } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import Link from 'next/link';

export default function VendorsPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await api.get('/vendors');
      return res.data;
    },
  });

  const canView = user?.role === 'admin' || user?.role === 'caa_officer' || user?.role === 'vendor';

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
          <h1 className="text-4xl font-bold text-[#3b82f6] uppercase tracking-wider">Vendors / Manufacturers</h1>
          <div className="mt-2 h-1 w-32 bg-[#1e3a5f]"></div>
        </div>
        {user?.role === 'vendor' && (
          <Link href="/vendors/register">
            <Button>Register as Vendor</Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3b82f6] border-t-transparent"></div>
          <p className="mt-4 text-gray-400 font-medium">Loading vendors...</p>
        </div>
      ) : (
        <div className="relative">
          <Table
            headers={['Company Name', 'Registration Number', 'Type', 'Location', 'Verification Status', 'Actions']}
          >
            {data?.vendors?.map((vendor: any, index: number) => (
              <tr 
                key={vendor._id} 
                className="group relative bg-gradient-to-r from-transparent via-[#3b82f6]/0 to-transparent hover:via-[#3b82f6]/5 border-b border-[#3b82f6]/5 last:border-0"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-medium">
                  <span className="relative z-10">{vendor.companyInfo.companyName}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                  <span className="relative z-10">{vendor.companyInfo.registrationNumber}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 uppercase">
                  <span className="relative z-10">{vendor.vendorType}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  <span className="relative z-10">{vendor.companyInfo.city}, {vendor.companyInfo.country}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="relative z-10">
                    <StatusBadge status={vendor.isVerified ? 'Verified' : 'Pending'} />
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="relative z-10">
                    <Link href={`/vendors/${vendor._id}`}>
                      <Button variant="glass" size="sm" className="min-w-[70px]">View</Button>
                    </Link>
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
