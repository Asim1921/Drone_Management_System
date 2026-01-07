'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../../../lib/api';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';

const vendorSchema = z.object({
  companyInfo: z.object({
    companyName: z.string().min(1, 'Company name is required'),
    registrationNumber: z.string().min(1, 'Registration number is required'),
    taxId: z.string().optional(),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email('Invalid email'),
    website: z.string().optional(),
  }),
  vendorType: z.enum(['local', 'foreign']),
});

type VendorFormData = z.infer<typeof vendorSchema>;

export default function RegisterVendorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  });

  const onSubmit = async (data: VendorFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await api.post('/vendors', data);
      router.push('/vendors');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register vendor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#3b82f6] uppercase tracking-wider mb-2">Register as Vendor/Manufacturer</h1>
        <div className="h-1 w-32 bg-[#1e3a5f]"></div>
      </div>

      <div className="bg-gray-900 border-2 border-[#1e3a5f] p-6 rounded-lg shadow-lg shadow-black/50 max-w-2xl">
        {error && (
          <div className="bg-red-900/50 border-2 border-red-800 text-red-300 px-4 py-3 rounded mb-4 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Select
            label="Vendor Type"
            {...register('vendorType')}
            options={[
              { value: 'local', label: 'Local' },
              { value: 'foreign', label: 'Foreign' },
            ]}
            error={errors.vendorType?.message}
          />

          <div className="border-t-2 border-[#1e3a5f] pt-4">
            <h3 className="text-lg font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Company Information</h3>
            <div className="space-y-4">
              <Input
                label="Company Name"
                {...register('companyInfo.companyName')}
                error={errors.companyInfo?.companyName?.message}
              />
              <Input
                label="Registration Number"
                {...register('companyInfo.registrationNumber')}
                error={errors.companyInfo?.registrationNumber?.message}
              />
              <Input
                label="Tax ID"
                {...register('companyInfo.taxId')}
                error={errors.companyInfo?.taxId?.message}
              />
              <Input
                label="Address"
                {...register('companyInfo.address')}
                error={errors.companyInfo?.address?.message}
              />
              <Input
                label="City"
                {...register('companyInfo.city')}
                error={errors.companyInfo?.city?.message}
              />
              <Input
                label="Country"
                {...register('companyInfo.country')}
                error={errors.companyInfo?.country?.message}
              />
              <Input
                label="Phone"
                type="tel"
                {...register('companyInfo.phone')}
                error={errors.companyInfo?.phone?.message}
              />
              <Input
                label="Email"
                type="email"
                {...register('companyInfo.email')}
                error={errors.companyInfo?.email?.message}
              />
              <Input
                label="Website"
                type="url"
                {...register('companyInfo.website')}
                error={errors.companyInfo?.website?.message}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <Button type="submit" isLoading={isLoading}>
              Register
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
