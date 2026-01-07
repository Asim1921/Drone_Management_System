import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'license' | 'operator';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'default' }) => {
  const getStatusColor = () => {
    if (variant === 'license') {
      switch (status.toLowerCase()) {
        case 'approved':
        case 'renewed':
          return 'bg-green-500/20 backdrop-blur-sm text-green-300 border border-green-500/50 shadow-lg shadow-green-500/20';
        case 'pending':
          return 'bg-yellow-500/20 backdrop-blur-sm text-yellow-300 border border-yellow-500/50 shadow-lg shadow-yellow-500/20';
        case 'suspended':
        case 'rejected':
        case 'expired':
          return 'bg-red-500/20 backdrop-blur-sm text-red-300 border border-red-500/50 shadow-lg shadow-red-500/20';
        default:
          return 'bg-gray-500/20 backdrop-blur-sm text-gray-300 border border-gray-500/50 shadow-lg shadow-gray-500/20';
      }
    }

    if (variant === 'operator') {
      switch (status.toLowerCase()) {
        case 'active':
          return 'bg-green-500/20 backdrop-blur-sm text-green-300 border border-green-500/50 shadow-lg shadow-green-500/20';
        case 'blacklisted':
          return 'bg-red-500/20 backdrop-blur-sm text-red-300 border border-red-500/50 shadow-lg shadow-red-500/20';
        default:
          return 'bg-gray-500/20 backdrop-blur-sm text-gray-300 border border-gray-500/50 shadow-lg shadow-gray-500/20';
      }
    }

    switch (status.toLowerCase()) {
      case 'verified':
        return 'bg-green-500/20 backdrop-blur-sm text-green-300 border border-green-500/50 shadow-lg shadow-green-500/20';
      case 'pending':
        return 'bg-yellow-500/20 backdrop-blur-sm text-yellow-300 border border-yellow-500/50 shadow-lg shadow-yellow-500/20';
      default:
        return 'bg-gray-500/20 backdrop-blur-sm text-gray-300 border border-gray-500/50 shadow-lg shadow-gray-500/20';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105 ${getStatusColor()}`}>
      {status}
    </span>
  );
};
