import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-2.5 bg-gray-900 border-2 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#2d5a8f] transition-all ${
          error ? 'border-red-800 focus:ring-red-700' : 'border-gray-700'
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-900">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-400 font-medium">{error}</p>}
    </div>
  );
};
