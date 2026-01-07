'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../../lib/api';
import { Button } from '../../../../../components/ui/Button';
import { StatusBadge } from '../../../../../components/ui/StatusBadge';
import TiltedCard from '../../../../../components/TiltedCard';
import Link from 'next/link';
import { format } from 'date-fns';
import { Flight } from '../../../../../../shared/types';
import { loadGoogleMaps } from '../../../../../lib/googleMaps';

export default function ApproveFlightPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const flightId = params.id as string;
  const [rejectionReason, setRejectionReason] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['flight', flightId],
    queryFn: async () => {
      const res = await api.get(`/flights/${flightId}`);
      return res.data;
    },
  });

  const flight: Flight = data?.flight;

  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put(`/flights/${flightId}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flights'] });
      queryClient.invalidateQueries({ queryKey: ['flight', flightId] });
      router.push('/flights');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      const res = await api.put(`/flights/${flightId}/reject`, { rejectionReason: reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flights'] });
      queryClient.invalidateQueries({ queryKey: ['flight', flightId] });
      router.push('/flights');
    },
  });

  // Load Google Maps using shared loader
  useEffect(() => {
    loadGoogleMaps(() => {
      setMapLoaded(true);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !window.google || !flight) return;

    const mapElement = document.getElementById('flight-map');
    if (!mapElement) return;

    const center = flight.flightDetails.flightArea.center;
    const newMap = new window.google.maps.Map(mapElement, {
      center: { lat: center.latitude, lng: center.longitude },
      zoom: 14,
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

    const marker = new window.google.maps.Marker({
      position: { lat: center.latitude, lng: center.longitude },
      map: newMap,
      title: flight.flightDetails.purpose,
    });

    const circle = new window.google.maps.Circle({
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      map: newMap,
      center: { lat: center.latitude, lng: center.longitude },
      radius: flight.flightDetails.flightArea.radius,
    });

    setMap(newMap);
  }, [mapLoaded, flight]);

  const handleApprove = () => {
    if (confirm('Are you sure you want to approve this flight?')) {
      approveMutation.mutate();
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    if (confirm('Are you sure you want to reject this flight?')) {
      rejectMutation.mutate(rejectionReason);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3b82f6] border-t-transparent"></div>
          <p className="mt-4 text-gray-400 font-medium">Loading flight details...</p>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-900/50 border-2 border-red-800 text-red-300 px-4 py-3 rounded font-medium">
          Flight not found.
        </div>
      </div>
    );
  }

  if (flight.status !== 'pending') {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-yellow-900/50 border-2 border-yellow-800 text-yellow-300 px-4 py-3 rounded font-medium mb-4">
          This flight has already been {flight.status}.
        </div>
        <Link href="/flights">
          <Button>Back to Flights</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#3b82f6] uppercase tracking-wider mb-2">Review Flight</h1>
          <div className="h-1 w-32 bg-[#1e3a5f]"></div>
        </div>
        <Link href="/flights">
          <Button variant="outline">Back to Flights</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flight Details */}
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
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-2">
                    {flight.flightDetails.purpose}
                  </h2>
                  <StatusBadge status={flight.status} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Scheduled Date</label>
                    <p className="text-lg text-gray-200 mt-1">
                      {format(new Date(flight.flightDetails.scheduledDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Time</label>
                    <p className="text-lg text-gray-200 mt-1">
                      {flight.flightDetails.scheduledStartTime} - {flight.flightDetails.scheduledEndTime}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Estimated Duration</label>
                    <p className="text-lg text-gray-200 mt-1">{flight.flightDetails.estimatedDuration} minutes</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Max Altitude</label>
                    <p className="text-lg text-gray-200 mt-1">{flight.flightDetails.maxAltitude} meters</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Flight Area</label>
                  <p className="text-lg text-gray-200 mt-1">
                    {flight.flightDetails.flightArea.address || 'No address provided'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Coordinates: {flight.flightDetails.flightArea.center.latitude.toFixed(6)},{' '}
                    {flight.flightDetails.flightArea.center.longitude.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Radius: {flight.flightDetails.flightArea.radius} meters</p>
                </div>

                {flight.flightDetails.weatherConditions && (
                  <div>
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Weather Conditions</label>
                    <p className="text-lg text-gray-200 mt-1">{flight.flightDetails.weatherConditions}</p>
                  </div>
                )}

                {flight.flightDetails.notes && (
                  <div>
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Notes</label>
                    <p className="text-lg text-gray-200 mt-1">{flight.flightDetails.notes}</p>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Actions</h3>
                  <div className="space-y-4">
                    <Button
                      onClick={handleApprove}
                      isLoading={approveMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Approve Flight
                    </Button>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                        Rejection Reason (Required for rejection)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#2d5a8f] transition-all mb-2"
                        placeholder="Enter reason for rejection..."
                      />
                      <Button
                        onClick={handleReject}
                        isLoading={rejectMutation.isPending}
                        variant="outline"
                        className="w-full border-red-600 text-red-400 hover:bg-red-900/20"
                      >
                        Reject Flight
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TiltedCard>
        </div>

        {/* Map */}
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
              <div id="flight-map" className="w-full h-[600px] rounded-lg overflow-hidden" />
            </div>
          </TiltedCard>
        </div>
      </div>
    </div>
  );
}

