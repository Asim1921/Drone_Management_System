import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'relative font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 uppercase tracking-wide overflow-hidden group';
  
  const variants = {
    primary: 'bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] text-white hover:from-[#2d5a8f] hover:to-[#3b82f6] focus:ring-[#3b82f6] border border-[#3b82f6]/30 shadow-lg shadow-[#3b82f6]/20 hover:shadow-[#3b82f6]/40 hover:scale-105 active:scale-95',
    secondary: 'bg-gray-800/80 backdrop-blur-sm text-gray-200 hover:bg-gray-700/80 focus:ring-gray-600 border border-gray-700/50 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
    danger: 'bg-gradient-to-r from-red-900/90 to-red-800/90 backdrop-blur-sm text-white hover:from-red-800 hover:to-red-700 focus:ring-red-700 border border-red-800/50 shadow-lg shadow-red-900/20 hover:shadow-red-900/40 hover:scale-105 active:scale-95',
    outline: 'bg-transparent backdrop-blur-sm border-2 border-[#3b82f6]/60 text-[#3b82f6] hover:bg-[#3b82f6]/10 hover:border-[#3b82f6] focus:ring-[#3b82f6] shadow-lg shadow-[#3b82f6]/10 hover:shadow-[#3b82f6]/30 hover:scale-105 active:scale-95',
    glass: 'bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 hover:border-white/30 focus:ring-white/50 shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-105 active:scale-95',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Animated background shimmer effect */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
      
      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
};
