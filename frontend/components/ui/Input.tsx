import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 bg-gray-900 border-2 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#2d5a8f] transition-all ${
          error ? 'border-red-800 focus:ring-red-700' : 'border-gray-700'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400 font-medium">{error}</p>}
    </div>
  );
};
