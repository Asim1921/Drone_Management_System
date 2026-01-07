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
import TiltedCard from '../../../../components/TiltedCard';
import Link from 'next/link';

const licenseSchema = z.object({
  licenseType: z.enum(['individual', 'commercial', 'government']),
  droneDetails: z.object({
    model: z.string().min(1, 'Model is required'),
    serialNumber: z.string().min(1, 'Serial number is required'),
    manufacturer: z.string().min(1, 'Manufacturer is required'),
    weight: z.number().min(0.1, 'Weight must be greater than 0'),
    maxAltitude: z.number().min(1, 'Max altitude must be at least 1 meter'),
  }),
  expiryDate: z.string().min(1, 'Expiry date is required'),
});

type LicenseFormData = z.infer<typeof licenseSchema>;

export default function NewLicensePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LicenseFormData>({
    resolver: zodResolver(licenseSchema),
  });

  const onSubmit = async (data: LicenseFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await api.post('/licenses', {
        ...data,
        expiryDate: new Date(data.expiryDate).toISOString(),
      });
      router.push('/licenses');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create license');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedLicenseType = watch('licenseType');

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#3b82f6] uppercase tracking-wider mb-2">Apply for License</h1>
          <div className="h-1 w-32 bg-[#1e3a5f]"></div>
        </div>
        <Link href="/licenses">
          <Button variant="outline">Back to Licenses</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Card */}
        <div className="lg:col-span-2">
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
            <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 sm:p-8 rounded-xl shadow-xl shadow-black/50">
              {error && (
                <div className="bg-gradient-to-r from-red-900/70 to-red-800/70 border-2 border-red-700/50 text-red-200 px-5 py-4 rounded-xl font-medium backdrop-blur-sm shadow-lg mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-2">License Application</h2>
                <p className="text-sm text-gray-400 uppercase tracking-wide">Complete the form below to apply for a drone license</p>
                <div className="mt-4 h-1 w-24 bg-[#1e3a5f]"></div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* License Type Section */}
                <div>
                  <Select
                    label="License Type"
                    {...register('licenseType')}
                    options={[
                      { value: 'individual', label: 'Individual' },
                      { value: 'commercial', label: 'Commercial' },
                      { value: 'government', label: 'Government' },
                    ]}
                    error={errors.licenseType?.message}
                  />
                  {selectedLicenseType && (
                    <div className="mt-3 p-3 bg-[#1e3a5f]/20 border border-[#3b82f6]/30 rounded-lg">
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">License Type Info</p>
                      <p className="text-sm text-gray-300">
                        {selectedLicenseType === 'individual' && 'For personal drone use and recreational activities.'}
                        {selectedLicenseType === 'commercial' && 'For business operations, aerial photography, surveying, and commercial services.'}
                        {selectedLicenseType === 'government' && 'For government agencies, defense forces, and authorized security operations.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#1e3a5f] to-transparent my-6"></div>

                {/* Drone Details Section */}
                <div>
                  <h3 className="text-xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Drone Details</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input
                        label="Model"
                        {...register('droneDetails.model')}
                        error={errors.droneDetails?.model?.message}
                        placeholder="e.g., DJI Mavic 3"
                      />
                      <Input
                        label="Manufacturer"
                        {...register('droneDetails.manufacturer')}
                        error={errors.droneDetails?.manufacturer?.message}
                        placeholder="e.g., DJI"
                      />
                    </div>
                    <Input
                      label="Serial Number"
                      {...register('droneDetails.serialNumber')}
                      error={errors.droneDetails?.serialNumber?.message}
                      placeholder="Enter unique serial number"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input
                        label="Weight (kg)"
                        type="number"
                        step="0.1"
                        {...register('droneDetails.weight', { valueAsNumber: true })}
                        error={errors.droneDetails?.weight?.message}
                        placeholder="0.0"
                      />
                      <Input
                        label="Max Altitude (meters)"
                        type="number"
                        {...register('droneDetails.maxAltitude', { valueAsNumber: true })}
                        error={errors.droneDetails?.maxAltitude?.message}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#1e3a5f] to-transparent my-6"></div>

                {/* Expiry Date */}
                <div>
                  <Input
                    label="License Expiry Date"
                    type="date"
                    {...register('expiryDate')}
                    error={errors.expiryDate?.message}
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Select the desired expiry date for your license. License duration depends on the license type.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button type="submit" isLoading={isLoading} className="flex-1">
                    Submit Application
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 sm:flex-initial"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </TiltedCard>
        </div>

        {/* Information Sidebar */}
        <div className="space-y-6">
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
              <h2 className="text-xl font-bold text-[#3b82f6] uppercase tracking-wide mb-6">Application Guide</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#3b82f6] mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-200 uppercase tracking-wide">License Type</p>
                      <p className="text-xs text-gray-400 mt-1">Select the appropriate license type based on your intended use.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#3b82f6] mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-200 uppercase tracking-wide">Drone Information</p>
                      <p className="text-xs text-gray-400 mt-1">Provide accurate drone specifications from your device documentation.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#3b82f6] mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-200 uppercase tracking-wide">Review Process</p>
                      <p className="text-xs text-gray-400 mt-1">Your application will be reviewed by CAA officers. You'll be notified once approved.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TiltedCard>

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
              <h2 className="text-xl font-bold text-[#3b82f6] uppercase tracking-wide mb-6">Requirements</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-4 h-4 text-[#3b82f6] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Valid operator registration</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-4 h-4 text-[#3b82f6] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Accurate drone specifications</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-4 h-4 text-[#3b82f6] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Complete documentation</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-4 h-4 text-[#3b82f6] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>CAA approval required</span>
                </div>
              </div>
            </div>
          </TiltedCard>
        </div>
      </div>
    </div>
  );
}
