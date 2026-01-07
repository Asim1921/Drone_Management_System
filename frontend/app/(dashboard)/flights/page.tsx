'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import Link from 'next/link';
import { format } from 'date-fns';
import { Flight } from '../../../../shared/types';
import { loadGoogleMaps } from '../../../lib/googleMaps';

export default function FlightsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const animationIntervalsRef = useRef<NodeJS.Timeout[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['flights'],
    queryFn: async () => {
      const res = await api.get('/flights');
      return res.data;
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
    if (!mapLoaded || !window.google || !data?.flights) return;

    const mapElement = document.getElementById('flights-map');
    if (!mapElement) return;

    // Clear previous animations
    animationIntervalsRef.current.forEach((interval) => clearInterval(interval));
    animationIntervalsRef.current = [];

    // Clear previous markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const newMap = new window.google.maps.Map(mapElement, {
      center: { lat: 24.8607, lng: 67.0011 }, // Default to Karachi
      zoom: 10,
      mapTypeId: mapType,
      styles: mapType === 'roadmap' ? [
        { elementType: 'geometry', stylers: [{ color: '#1d2d3d' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#1d2d3d' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#3b82f6' }] },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#0f1f35' }],
        },
      ] : undefined,
    });

    const circles: google.maps.Circle[] = [];
    const infoWindows: google.maps.InfoWindow[] = [];

    data.flights.forEach((flight: Flight) => {
      const center = flight.flightDetails.flightArea.center;
      const position = { lat: center.latitude, lng: center.longitude };

      // Determine marker color based on status
      let markerColor = '#9ca3af'; // gray for pending
      if (flight.status === 'approved') markerColor = '#3b82f6'; // blue
      if (flight.status === 'in_progress') markerColor = '#f59e0b'; // orange
      if (flight.status === 'completed') markerColor = '#10b981'; // green
      if (flight.status === 'rejected') markerColor = '#ef4444'; // red

      // Create custom drone marker with flashing animation
      const droneIcon = {
        url: '/img/drone_marker.png',
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20),
      };

      const marker = new window.google.maps.Marker({
        position,
        map: newMap,
        title: flight.flightDetails.purpose,
        icon: droneIcon,
        animation: window.google.maps.Animation.DROP,
      });

      // Add flashing animation
      let opacity = 1;
      let increasing = false;
      const flashInterval = setInterval(() => {
        opacity = increasing ? opacity + 0.1 : opacity - 0.1;
        if (opacity >= 1) increasing = false;
        if (opacity <= 0.3) increasing = true;
        
        // Update marker opacity by creating a new icon with opacity
        const iconElement = document.createElement('img');
        iconElement.src = '/img/drone_marker.png';
        iconElement.style.opacity = opacity.toString();
        iconElement.style.width = '40px';
        iconElement.style.height = '40px';
        
        marker.setIcon({
          url: '/img/drone_marker.png',
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        } as google.maps.Icon);
        
        // Set opacity using setOpacity method if available
        if (marker.setOpacity) {
          marker.setOpacity(opacity);
        }
      }, 100);

      animationIntervalsRef.current.push(flashInterval);

      const circle = new window.google.maps.Circle({
        strokeColor: markerColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: markerColor,
        fillOpacity: 0.15,
        map: newMap,
        center: position,
        radius: flight.flightDetails.flightArea.radius,
      });

      // Create InfoWindow content with explicit black text
      const infoContent = document.createElement('div');
      infoContent.style.cssText = 'background-color: #ffffff; color: #000000; font-family: "Segoe UI", sans-serif; padding: 12px; min-width: 250px;';
      infoContent.innerHTML = `
        <h3 style="color: #3b82f6; margin: 0 0 12px 0; font-size: 18px; font-weight: bold; background-color: #ffffff;">${flight.flightDetails.purpose}</h3>
        <p style="margin: 6px 0; font-size: 14px; color: #000000; background-color: #ffffff;"><strong style="color: #000000; background-color: #ffffff;">Status:</strong> <span style="color: #000000; background-color: #ffffff;">${flight.status}</span></p>
        <p style="margin: 6px 0; font-size: 14px; color: #000000; background-color: #ffffff;"><strong style="color: #000000; background-color: #ffffff;">Date:</strong> <span style="color: #000000; background-color: #ffffff;">${format(new Date(flight.flightDetails.scheduledDate), 'MMM dd, yyyy')}</span></p>
        <p style="margin: 6px 0; font-size: 14px; color: #000000; background-color: #ffffff;"><strong style="color: #000000; background-color: #ffffff;">Time:</strong> <span style="color: #000000; background-color: #ffffff;">${flight.flightDetails.scheduledStartTime} - ${flight.flightDetails.scheduledEndTime}</span></p>
        <p style="margin: 6px 0; font-size: 14px; color: #000000; background-color: #ffffff;"><strong style="color: #000000; background-color: #ffffff;">Altitude:</strong> <span style="color: #000000; background-color: #ffffff;">${flight.flightDetails.maxAltitude}m</span></p>
        <p style="margin: 6px 0; font-size: 14px; color: #000000; background-color: #ffffff;"><strong style="color: #000000; background-color: #ffffff;">Duration:</strong> <span style="color: #000000; background-color: #ffffff;">${flight.flightDetails.estimatedDuration} min</span></p>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener('click', () => {
        infoWindows.forEach((iw) => iw.close());
        infoWindow.open(newMap, marker);
        setSelectedFlight(flight);
        
        // Ensure text is black after InfoWindow opens
        setTimeout(() => {
          const infoWindowElement = document.querySelector('.gm-style-iw-d');
          if (infoWindowElement) {
            (infoWindowElement as HTMLElement).style.color = '#000000';
            (infoWindowElement as HTMLElement).style.backgroundColor = '#ffffff';
            const allText = infoWindowElement.querySelectorAll('*');
            allText.forEach((el) => {
              const htmlEl = el as HTMLElement;
              if (htmlEl.tagName !== 'H3') {
                htmlEl.style.color = '#000000';
                htmlEl.style.backgroundColor = '#ffffff';
              }
            });
          }
        }, 100);
      });

      markersRef.current.push(marker);
      circles.push(circle);
      infoWindows.push(infoWindow);
    });

    setMap(newMap);

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      circles.forEach((c) => c.setMap(null));
      animationIntervalsRef.current.forEach((interval) => clearInterval(interval));
      animationIntervalsRef.current = [];
    };
  }, [mapLoaded, data, mapType]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Update map type when it changes
  useEffect(() => {
    if (map) {
      map.setMapTypeId(mapType);
    }
  }, [map, mapType]);

  const canSchedule = user?.role === 'operator';
  const canApprove = user?.role === 'admin' || user?.role === 'caa_officer';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'approved':
        return 'blue';
      case 'rejected':
        return 'red';
      case 'in_progress':
        return 'orange';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  if (!['admin', 'caa_officer', 'operator'].includes(user?.role || '')) {
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
          <h1 className="text-4xl font-bold text-[#3b82f6] uppercase tracking-wider mb-2">Flight Management</h1>
          <div className="h-1 w-32 bg-[#1e3a5f]"></div>
        </div>
        {canSchedule && (
          <Link href="/flights/new">
            <Button>Schedule New Flight</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map - Left Side, Takes Most of Screen */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-4 rounded-xl shadow-xl shadow-black/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#3b82f6] uppercase tracking-wide">Flight Map</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMapType('roadmap')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      mapType === 'roadmap'
                        ? 'bg-white text-gray-900'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    Map
                  </button>
                  <button
                    onClick={() => setMapType('satellite')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      mapType === 'satellite'
                        ? 'bg-white text-gray-900'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    Satellite
                  </button>
                  <button
                    onClick={() => {
                      const mapElement = mapContainerRef.current;
                      if (!mapElement) return;
                      
                      if (!isFullscreen) {
                        if (mapElement.requestFullscreen) {
                          mapElement.requestFullscreen();
                        } else if ((mapElement as any).webkitRequestFullscreen) {
                          (mapElement as any).webkitRequestFullscreen();
                        } else if ((mapElement as any).msRequestFullscreen) {
                          (mapElement as any).msRequestFullscreen();
                        }
                      } else {
                        if (document.exitFullscreen) {
                          document.exitFullscreen();
                        } else if ((document as any).webkitExitFullscreen) {
                          (document as any).webkitExitFullscreen();
                        } else if ((document as any).msExitFullscreen) {
                          (document as any).msExitFullscreen();
                        }
                      }
                    }}
                    className="p-2 bg-gray-800/50 text-gray-300 rounded hover:bg-gray-700/50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>
              <div
                ref={mapContainerRef}
                id="flights-map"
                className="w-full h-[calc(100vh-280px)] min-h-[600px] rounded-lg overflow-hidden"
              />
              {selectedFlight && (
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <h4 className="text-lg font-bold text-[#3b82f6] mb-2">{selectedFlight.flightDetails.purpose}</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>
                      <span className="text-gray-500">Status:</span> {selectedFlight.status}
                    </p>
                    <p>
                      <span className="text-gray-500">Date:</span>{' '}
                      {format(new Date(selectedFlight.flightDetails.scheduledDate), 'MMM dd, yyyy')}
                    </p>
                    <p>
                      <span className="text-gray-500">Location:</span> {selectedFlight.flightDetails.flightArea.center.latitude.toFixed(4)}, {selectedFlight.flightDetails.flightArea.center.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Flights List - Right Side */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm border-2 border-[#1e3a5f]/60 p-6 rounded-xl shadow-xl shadow-black/50">
              <h2 className="text-2xl font-bold text-[#3b82f6] uppercase tracking-wide mb-4">Scheduled Flights</h2>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3b82f6] border-t-transparent"></div>
                  <p className="mt-4 text-gray-400 font-medium">Loading flights...</p>
                </div>
              ) : data?.flights?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 font-medium">No flights scheduled yet.</p>
                  {canSchedule && (
                    <Link href="/flights/new">
                      <Button className="mt-4">Schedule Your First Flight</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide">
                  {data?.flights?.map((flight: Flight) => (
                    <div
                      key={flight._id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedFlight?._id === flight._id
                          ? 'border-[#3b82f6] bg-[#3b82f6]/10'
                          : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedFlight(flight)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-base font-bold text-[#3b82f6] uppercase">{flight.flightDetails.purpose}</h3>
                          <p className="text-xs text-gray-400 mt-1">
                            {format(new Date(flight.flightDetails.scheduledDate), 'MMM dd, yyyy')} •{' '}
                            {flight.flightDetails.scheduledStartTime} - {flight.flightDetails.scheduledEndTime}
                          </p>
                        </div>
                        <StatusBadge status={flight.status} />
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-xs text-gray-300 mt-3">
                        <div>
                          <span className="text-gray-500">Altitude:</span> {flight.flightDetails.maxAltitude}m
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span> {flight.flightDetails.estimatedDuration} min
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>{' '}
                          {flight.flightDetails.flightArea.address || 'See map'}
                        </div>
                        <div>
                          <span className="text-gray-500">Radius:</span> {flight.flightDetails.flightArea.radius}m
                        </div>
                      </div>
                      {canApprove && flight.status === 'pending' && (
                        <div className="flex gap-2 mt-4">
                          <Link href={`/flights/${flight._id}/approve`}>
                            <Button size="sm" variant="outline" className="text-xs">
                              Review
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

