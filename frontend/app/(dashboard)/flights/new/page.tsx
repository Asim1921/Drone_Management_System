'use client';

import React, { useState, useEffect } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { loadGoogleMaps } from '../../../../lib/googleMaps';

const flightSchema = z.object({
  licenseId: z.string().min(1, 'License is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  scheduledStartTime: z.string().min(1, 'Start time is required'),
  scheduledEndTime: z.string().min(1, 'End time is required'),
  estimatedDuration: z.number().min(1, 'Duration must be at least 1 minute'),
  maxAltitude: z.number().min(1, 'Max altitude must be at least 1 meter'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(10, 'Radius must be at least 10 meters'),
  address: z.string().optional(),
  weatherConditions: z.string().optional(),
  notes: z.string().optional(),
});

type FlightFormData = z.infer<typeof flightSchema>;

export default function NewFlightPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [circle, setCircle] = useState<google.maps.Circle | null>(null);

  const { data: licensesData } = useQuery({
    queryKey: ['licenses'],
    queryFn: async () => {
      const res = await api.get('/licenses?status=approved');
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FlightFormData>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      latitude: 24.8607,
      longitude: 67.0011,
      radius: 100,
    },
  });

  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const radius = watch('radius');

  // Load Google Maps using shared loader
  useEffect(() => {
    loadGoogleMaps(() => {
      setMapLoaded(true);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !window.google) return;

    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    const newMap = new window.google.maps.Map(mapElement, {
      center: { lat: latitude, lng: longitude },
      zoom: 13,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1d2d3d' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#1d2d3d' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#3b82f6' }] },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#0f1f35' }],
        },
      ],
    });

    const newMarker = new window.google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: newMap,
      draggable: true,
      title: 'Flight Location',
    });

    const newCircle = new window.google.maps.Circle({
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      map: newMap,
      center: { lat: latitude, lng: longitude },
      radius: radius,
    });

    newMarker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        setValue('latitude', e.latLng.lat());
        setValue('longitude', e.latLng.lng());
        newCircle.setCenter(e.latLng);
      }
    });

    // Add search box
    const input = document.getElementById('pac-input') as HTMLInputElement;
    if (input) {
      const searchBox = new window.google.maps.places.SearchBox(input);
      newMap.controls[window.google.maps.ControlPosition.TOP_LEFT].push(input);

      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places && places.length > 0) {
          const place = places[0];
          if (place.geometry?.location) {
            const loc = place.geometry.location;
            newMap.setCenter(loc);
            newMarker.setPosition(loc);
            newCircle.setCenter(loc);
            setValue('latitude', loc.lat());
            setValue('longitude', loc.lng());
            if (place.formatted_address) {
              setValue('address', place.formatted_address);
            }
          }
        }
      });
    }

    setMap(newMap);
    setMarker(newMarker);
    setCircle(newCircle);

    return () => {
      if (marker) marker.setMap(null);
      if (circle) circle.setMap(null);
    };
  }, [mapLoaded]);

  // Update circle radius
  useEffect(() => {
    if (circle && radius) {
      circle.setRadius(radius);
    }
  }, [radius, circle]);

  const onSubmit = async (data: FlightFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await api.post('/flights', {
        licenseId: data.licenseId,
        flightDetails: {
          purpose: data.purpose,
          scheduledDate: new Date(data.scheduledDate).toISOString(),
          scheduledStartTime: data.scheduledStartTime,
          scheduledEndTime: data.scheduledEndTime,
          estimatedDuration: data.estimatedDuration,
          maxAltitude: data.maxAltitude,
          flightArea: {
            center: {
              latitude: data.latitude,
              longitude: data.longitude,
            },
            radius: data.radius,
            address: data.address,
          },
          weatherConditions: data.weatherConditions,
          notes: data.notes,
        },
      });
      router.push('/flights');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule flight');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = () => {
    const startTime = watch('scheduledStartTime');
    const endTime = watch('scheduledEndTime');
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const diff = (end.getTime() - start.getTime()) / 60000;
      if (diff > 0) {
        setValue('estimatedDuration', Math.round(diff));
      }
    }
  };

  useEffect(() => {
    calculateDuration();
  }, [watch('scheduledStartTime'), watch('scheduledEndTime')]);

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#3b82f6] uppercase tracking-wider mb-2">Schedule Flight</h1>
          <div className="h-1 w-32 bg-[#1e3a5f]"></div>
        </div>
        <Link href="/flights">
          <Button variant="outline">Back to Flights</Button>
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

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Select
                  label="License"
                  {...register('licenseId')}
                  error={errors.licenseId?.message}
                  options={
                    licensesData?.licenses?.map((license: any) => ({
                      value: license._id,
                      label: `${license.droneDetails.model} - ${license.droneDetails.serialNumber}`,
                    })) || []
                  }
                  required
                />

                <Input
                  label="Purpose"
                  {...register('purpose')}
                  error={errors.purpose?.message}
                  placeholder="e.g., Aerial Photography, Surveying, Inspection"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Scheduled Date"
                    type="date"
                    {...register('scheduledDate')}
                    error={errors.scheduledDate?.message}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Start Time"
                      type="time"
                      {...register('scheduledStartTime')}
                      error={errors.scheduledStartTime?.message}
                      required
                    />
                    <Input
                      label="End Time"
                      type="time"
                      {...register('scheduledEndTime')}
                      error={errors.scheduledEndTime?.message}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Estimated Duration (minutes)"
                    type="number"
                    {...register('estimatedDuration', { valueAsNumber: true })}
                    error={errors.estimatedDuration?.message}
                    required
                  />
                  <Input
                    label="Max Altitude (meters)"
                    type="number"
                    {...register('maxAltitude', { valueAsNumber: true })}
                    error={errors.maxAltitude?.message}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Latitude"
                    type="number"
                    step="any"
                    {...register('latitude', { valueAsNumber: true })}
                    error={errors.latitude?.message}
                    required
                  />
                  <Input
                    label="Longitude"
                    type="number"
                    step="any"
                    {...register('longitude', { valueAsNumber: true })}
                    error={errors.longitude?.message}
                    required
                  />
                  <Input
                    label="Radius (meters)"
                    type="number"
                    {...register('radius', { valueAsNumber: true })}
                    error={errors.radius?.message}
                    required
                  />
                </div>

                <Input
                  label="Address (Optional)"
                  {...register('address')}
                  error={errors.address?.message}
                  placeholder="Flight location address"
                />

                <Input
                  label="Weather Conditions (Optional)"
                  {...register('weatherConditions')}
                  error={errors.weatherConditions?.message}
                  placeholder="e.g., Clear, Partly Cloudy"
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                    Notes (Optional)
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#2d5a8f] transition-all"
                    placeholder="Additional flight information..."
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" isLoading={isLoading}>
                    Schedule Flight
                  </Button>
                </div>
              </form>
            </div>
          </TiltedCard>
        </div>

        {/* Map Card */}
        <div className="lg:col-span-1">
          <TiltedCard
            containerHeight="auto"
            containerWidth="100%"
            imageHeight="600px"
            imageWidth="100%"
            scaleOnHover={1.01}
            rotateAmplitude={5}
            showMobileWarning={false}
            showTooltip={false}
          >
            <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-4 rounded-xl shadow-xl shadow-black/50">
              <h3 className="text-xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Flight Location</h3>
              <input
                id="pac-input"
                type="text"
                placeholder="Search location..."
                className="w-full px-4 py-2 mb-4 bg-gray-800/50 border-2 border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#2d5a8f]"
              />
              <div id="map" className="w-full h-[500px] rounded-lg overflow-hidden" />
            </div>
          </TiltedCard>
        </div>
      </div>
    </div>
  );
}

