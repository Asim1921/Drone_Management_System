'use client';

import { Navbar } from '../../components/layout/Navbar';
import { ProtectedRoute } from '../../components/layout/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950 dotted-bg">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24 pb-24">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
