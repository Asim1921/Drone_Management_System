'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../../../lib/api';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';

const operatorSchema = z.object({
  identityInfo: z.object({
    cnic: z.string().optional(),
    passport: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().default('Pakistan'),
  }),
});

type OperatorFormData = z.infer<typeof operatorSchema>;

export default function RegisterOperatorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OperatorFormData>({
    resolver: zodResolver(operatorSchema),
    defaultValues: {
      identityInfo: {
        country: 'Pakistan',
      },
    },
  });

  const onSubmit = async (data: OperatorFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await api.post('/operators', data);
      router.push('/operators');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register operator');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#3b82f6] uppercase tracking-wider mb-2">Register as Operator/Pilot</h1>
        <div className="h-1 w-32 bg-[#1e3a5f]"></div>
      </div>

      <div className="bg-gray-900 border-2 border-[#1e3a5f] p-6 rounded-lg shadow-lg shadow-black/50 max-w-2xl">
        {error && (
          <div className="bg-red-900/50 border-2 border-red-800 text-red-300 px-4 py-3 rounded mb-4 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="border-t-2 border-[#1e3a5f] pt-4">
            <h3 className="text-lg font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Identity Information</h3>
            <div className="space-y-4">
              <Input
                label="CNIC"
                {...register('identityInfo.cnic')}
                error={errors.identityInfo?.cnic?.message}
              />
              <Input
                label="Passport Number"
                {...register('identityInfo.passport')}
                error={errors.identityInfo?.passport?.message}
              />
              <Input
                label="Date of Birth"
                type="date"
                {...register('identityInfo.dateOfBirth')}
                error={errors.identityInfo?.dateOfBirth?.message}
              />
              <Input
                label="Address"
                {...register('identityInfo.address')}
                error={errors.identityInfo?.address?.message}
              />
              <Input
                label="City"
                {...register('identityInfo.city')}
                error={errors.identityInfo?.city?.message}
              />
              <Input
                label="Country"
                {...register('identityInfo.country')}
                error={errors.identityInfo?.country?.message}
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
