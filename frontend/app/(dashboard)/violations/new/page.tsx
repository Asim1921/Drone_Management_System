'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/api';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
import TiltedCard from '../../../../components/TiltedCard';
import Link from 'next/link';
import { format } from 'date-fns';

const VIOLATION_CATEGORIES = [
  { value: 'unauthorized_area', label: 'Unauthorized Area' },
  { value: 'no_permission', label: 'No Permission' },
  { value: 'altitude_violation', label: 'Altitude Violation' },
  { value: 'restricted_airspace', label: 'Restricted Airspace' },
  { value: 'missing_license', label: 'Missing License' },
  { value: 'expired_license', label: 'Expired License' },
  { value: 'safety_violation', label: 'Safety Violation' },
  { value: 'privacy_violation', label: 'Privacy Violation' },
  { value: 'other', label: 'Other' },
];

export default function NewViolationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    operatorId: '',
    licenseId: '',
    category: '',
    description: '',
    latitude: '',
    longitude: '',
    address: '',
    flightId: '',
    violationDate: new Date().toISOString().split('T')[0],
    fineAmount: '',
  });

  // Fetch operators
  const { data: operatorsData } = useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      const res = await api.get('/operators');
      return res.data;
    },
  });

  // Fetch licenses
  const { data: licensesData } = useQuery({
    queryKey: ['licenses'],
    queryFn: async () => {
      const res = await api.get('/licenses');
      return res.data;
    },
  });

  // Fetch flights
  const { data: flightsData } = useQuery({
    queryKey: ['flights'],
    queryFn: async () => {
      const res = await api.get('/flights');
      return res.data;
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If operator is being changed, also clear license selection
    if (name === 'operatorId') {
      setFormData({ ...formData, operatorId: value, licenseId: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.operatorId || !formData.licenseId || !formData.category || !formData.description) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      if (!formData.latitude || !formData.longitude) {
        setError('Please provide location coordinates');
        setIsLoading(false);
        return;
      }

      const violationData = {
        operatorId: formData.operatorId,
        licenseId: formData.licenseId,
        category: formData.category,
        description: formData.description,
        location: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          address: formData.address || undefined,
        },
        violationDate: new Date(formData.violationDate).toISOString(),
        fineAmount: formData.fineAmount ? parseFloat(formData.fineAmount) : 0,
        flightId: formData.flightId || undefined,
      };

      const response = await api.post('/violations', violationData);

      if (response.data.licenseSuspended) {
        alert('Violation recorded. License has been suspended due to 3rd violation.');
      }

      router.push('/violations');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create violation');
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected operator info
  const selectedOperator = operatorsData?.operators?.find((op: any) => {
    const operatorUserId = typeof op.userId === 'object' ? op.userId?._id : op.userId;
    return operatorUserId === formData.operatorId;
  });

  // Get operator's CNIC
  const operatorCNIC = selectedOperator?.identityInfo?.cnic || '';

  // Filter licenses by selected operator
  const filteredLicenses = licensesData?.licenses?.filter((license: any) => {
    if (!formData.operatorId) return false;
    
    const licenseOperatorId = typeof license.operatorId === 'object' ? license.operatorId?._id : license.operatorId;
    
    return licenseOperatorId === formData.operatorId;
  }) || [];

  // Auto-select license when operator is selected (if licenses exist)
  useEffect(() => {
    if (!formData.operatorId || !licensesData) {
      setFormData((prev) => ({ ...prev, licenseId: '' }));
      return;
    }

    const currentFilteredLicenses = licensesData.licenses?.filter((license: any) => {
      if (!formData.operatorId) return false;
      const licenseOperatorId = typeof license.operatorId === 'object' ? license.operatorId?._id : license.operatorId;
      return licenseOperatorId === formData.operatorId;
    }) || [];

    // Auto-select first license if available
    if (currentFilteredLicenses.length > 0 && !formData.licenseId) {
      setFormData((prev) => ({
        ...prev,
        licenseId: currentFilteredLicenses[0]._id,
      }));
    } else if (currentFilteredLicenses.length > 0) {
      // Check if current license belongs to selected operator
      const currentLicenseBelongsToOperator = currentFilteredLicenses.some(
        (license: any) => license._id === formData.licenseId
      );
      if (!currentLicenseBelongsToOperator) {
        setFormData((prev) => ({
          ...prev,
          licenseId: currentFilteredLicenses[0]._id,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        licenseId: '',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.operatorId, licensesData]);

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#3b82f6] uppercase tracking-wider mb-2">Report Violation</h1>
          <div className="h-1 w-32 bg-[#1e3a5f]"></div>
        </div>
        <Link href="/violations">
          <Button variant="outline">Back to Violations</Button>
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
                <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-2">Violation Report</h2>
                <p className="text-sm text-gray-400 uppercase tracking-wide">
                  Report a violation by filling in the details below
                </p>
                <div className="mt-4 h-1 w-24 bg-[#1e3a5f]"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Operator Selection */}
                <div>
                  <Select
                    label="Operator/Pilot *"
                    name="operatorId"
                    value={formData.operatorId}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select Operator' },
                      ...(operatorsData?.operators?.map((operator: any) => {
                        const userData = typeof operator.userId === 'object' ? operator.userId : null;
                        const name = userData?.profile?.firstName
                          ? `${userData.profile.firstName} ${userData.profile.lastName || ''}`.trim()
                          : userData?.email || 'N/A';
                        const operatorUserId = typeof operator.userId === 'object' ? operator.userId._id : operator.userId;
                        return { value: operatorUserId, label: name };
                      }) || []),
                    ]}
                    required
                  />
                </div>

                {/* CNIC Display (instead of License) */}
                <div>
                  <Input
                    label="Operator CNIC"
                    type="text"
                    name="cnicDisplay"
                    value={operatorCNIC || ''}
                    onChange={() => {}} // Read-only
                    placeholder={formData.operatorId ? 'No CNIC on record' : 'Select operator to view CNIC'}
                    disabled
                    className="bg-gray-800/30 cursor-not-allowed"
                  />
                  {/* Hidden license field - auto-selected in background */}
                  {filteredLicenses.length > 0 && (
                    <input
                      type="hidden"
                      name="licenseId"
                      value={formData.licenseId || filteredLicenses[0]?._id || ''}
                    />
                  )}
                  {formData.operatorId && !operatorCNIC && (
                    <p className="mt-2 text-xs text-yellow-400">
                      This operator has no CNIC on record.
                    </p>
                  )}
                  {formData.operatorId && filteredLicenses.length === 0 && (
                    <p className="mt-2 text-xs text-red-400">
                      Warning: This operator has no licenses. Cannot create violation without a license.
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <Select
                    label="Violation Category *"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    options={[{ value: '', label: 'Select Category' }, ...VIOLATION_CATEGORIES]}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => handleChange(e as any)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-[#3b82f6] focus:outline-none transition-all duration-300"
                    placeholder="Describe the violation in detail..."
                    required
                  />
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#1e3a5f] to-transparent my-6"></div>

                {/* Location Section */}
                <div>
                  <h3 className="text-xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Location</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input
                        label="Latitude *"
                        type="number"
                        step="any"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        placeholder="e.g., 31.5497"
                        required
                      />
                      <Input
                        label="Longitude *"
                        type="number"
                        step="any"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        placeholder="e.g., 74.3436"
                        required
                      />
                    </div>
                    <Input
                      label="Address (Optional)"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street address or location name"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#1e3a5f] to-transparent my-6"></div>

                {/* Additional Details */}
                <div>
                  <h3 className="text-xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Additional Details</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input
                        label="Violation Date *"
                        type="date"
                        name="violationDate"
                        value={formData.violationDate}
                        onChange={handleChange}
                        required
                      />
                      <Input
                        label="Fine Amount (PKR)"
                        type="number"
                        step="0.01"
                        name="fineAmount"
                        value={formData.fineAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                    </div>
                    <Select
                      label="Related Flight (Optional)"
                      name="flightId"
                      value={formData.flightId}
                      onChange={handleChange}
                      options={[
                        { value: '', label: 'None' },
                        ...(flightsData?.flights?.map((flight: any) => ({
                          value: flight._id,
                          label: `${flight.flightDetails?.purpose || 'Flight'} - ${flight.flightDetails?.scheduledDate ? format(new Date(flight.flightDetails.scheduledDate), 'MMM dd, yyyy') : 'N/A'}`,
                        })) || []),
                      ]}
                    />
                  </div>
                </div>

                {/* Warning Info */}
                <div className="bg-yellow-900/20 border-2 border-yellow-700/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-yellow-300 uppercase tracking-wide mb-1">
                        Warning System
                      </p>
                      <p className="text-xs text-yellow-200/80">
                        After 3 violations, the operator's license will be automatically suspended. This violation will
                        count towards the warning level.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button type="submit" isLoading={isLoading} className="flex-1">
                    Report Violation
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
              <h2 className="text-xl font-bold text-[#3b82f6] uppercase tracking-wide mb-6">Violation Categories</h2>
              <div className="space-y-3 text-sm">
                {VIOLATION_CATEGORIES.map((cat) => (
                  <div key={cat.value} className="flex items-start gap-2 text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-2 flex-shrink-0"></div>
                    <span>{cat.label}</span>
                  </div>
                ))}
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
              <h2 className="text-xl font-bold text-[#3b82f6] uppercase tracking-wide mb-6">Warning System</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-400 font-bold">1st</span>
                  <span className="text-gray-300">First Warning</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-orange-400 font-bold">2nd</span>
                  <span className="text-gray-300">Second Warning</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">3rd</span>
                  <span className="text-gray-300">License Suspended</span>
                </div>
                <div className="pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400">
                    Each violation counts as one warning. After 3 violations, the operator's license will be
                    automatically suspended.
                  </p>
                </div>
              </div>
            </div>
          </TiltedCard>
        </div>
      </div>
    </div>
  );
}


