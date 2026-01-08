'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { FloatingDock } from '../ui/floating-dock';
import {
  IconHome,
  IconFileText,
  IconUsers,
  IconBuildingStore,
  IconLogout,
  IconUser,
  IconPlane,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { usePathname } from 'next/navigation';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getNavItems = () => {
    if (!user) return [];

    const allItems: Array<{ href: string; label: string; icon: React.ReactNode; roles?: string[] }> = [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: <IconHome className="w-full h-full" />,
      },
      {
        href: '/licenses',
        label: 'Licenses',
        icon: <IconFileText className="w-full h-full" />,
        roles: ['admin', 'caa_officer', 'operator'],
      },
      {
        href: '/operators',
        label: 'Operators',
        icon: <IconUsers className="w-full h-full" />,
        roles: ['admin', 'caa_officer', 'enforcement'],
      },
      {
        href: '/vendors',
        label: 'Vendors',
        icon: <IconBuildingStore className="w-full h-full" />,
        roles: ['admin', 'caa_officer', 'vendor'],
      },
      {
        href: '/flights',
        label: 'Flights',
        icon: <IconPlane className="w-full h-full" />,
        roles: ['admin', 'caa_officer', 'operator'],
      },
      {
        href: '/violations',
        label: 'Fines/Violations',
        icon: <IconAlertTriangle className="w-full h-full" />,
        roles: ['admin', 'caa_officer', 'enforcement', 'operator'],
      },
    ];

    const filteredItems = allItems.filter((item) => !item.roles || item.roles.includes(user.role));

    return filteredItems.map((item) => ({
      title: item.label,
      icon: item.icon,
      href: item.href,
    }));
  };

  if (!user) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b-2 border-[#1e3a5f]/60 shadow-lg shadow-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="flex items-center">
                <span className="text-2xl font-black text-[#3b82f6] uppercase tracking-wider">DMS</span>
                <span className="ml-2 text-xs text-gray-500 uppercase tracking-wider">PDMS</span>
              </div>
            </Link>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-2">
                  <IconUser className="w-4 h-4 text-[#3b82f6]" />
                  <span className="text-gray-300 font-medium">
                    {user.profile?.firstName || user.email}
                  </span>
                  <span className="text-[#3b82f6] text-xs uppercase">({user.role?.replace('_', ' ')})</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-2 border-[#1e3a5f] text-[#3b82f6] hover:bg-[#1e3a5f] hover:text-white transition-all duration-300"
              >
                <IconLogout className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Dock Navigation */}
      <FloatingDock
        items={getNavItems()}
        desktopClassName="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        mobileClassName="fixed bottom-6 right-6 z-50"
      />
    </>
  );
};
