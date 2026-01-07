import React from 'react';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children }) => {
  return (
    <div className="overflow-x-auto rounded-xl">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden rounded-xl border border-[#3b82f6]/20 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm shadow-2xl shadow-black/50">
          <table className="min-w-full divide-y divide-[#3b82f6]/10">
            <thead className="bg-gradient-to-r from-[#1e3a5f]/80 to-[#2d5a8f]/80 backdrop-blur-md">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-left text-xs font-bold text-[#3b82f6] uppercase tracking-wider border-b border-[#3b82f6]/20 group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="relative">
                        {header}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#3b82f6] transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-[#3b82f6]/10">
              {children}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
