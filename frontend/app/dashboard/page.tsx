'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { analyticsAPI } from '@/lib/api';
import { NotificationBell } from '@/components/NotificationBell';
import { SkeletonMetricCard } from '@/components/SkeletonLoaders';
import Link from 'next/link';

interface Analytics {
  total_vendors: number;
  verified_vendors: number;
  active_orders: number;
  total_orders: number;
  avg_deal_time: number;
  avg_price: number;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await analyticsAPI.getVendors();
        setAnalytics(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load analytics');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Procurement Intelligence</h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <span className="text-gray-700">Welcome, {user?.full_name || 'User'}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
          <Link
            href="/dashboard"
            className="px-4 py-2 border-b-2 border-indigo-600 font-medium text-indigo-600 whitespace-nowrap"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/vendors"
            className="px-4 py-2 border-b-2 border-transparent font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap"
          >
            Vendors
          </Link>
          <Link
            href="/dashboard/orders"
            className="px-4 py-2 border-b-2 border-transparent font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap"
          >
            Orders
          </Link>
          <Link
            href="/dashboard/quotes"
            className="px-4 py-2 border-b-2 border-transparent font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap"
          >
            Quotes
          </Link>
          <Link
            href="/dashboard/analytics"
            className="px-4 py-2 border-b-2 border-transparent font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap"
          >
            Analytics
          </Link>
          <Link
            href="/dashboard/notifications"
            className="px-4 py-2 border-b-2 border-transparent font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap"
          >
            Notifications
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonMetricCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metrics Cards */}
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total Vendors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics?.total_vendors || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Verified Vendors</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {analytics?.verified_vendors || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Active Orders</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {analytics?.active_orders || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics?.total_orders || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Avg Deal Time</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {analytics?.avg_deal_time ? `${Math.round(analytics.avg_deal_time)}h` : 'N/A'}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Avg Price</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${analytics?.avg_price ? analytics.avg_price.toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/vendors"
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white hover:shadow-lg transition"
          >
            <h3 className="text-xl font-bold mb-2">Manage Vendors</h3>
            <p className="text-blue-100">Browse and manage vendor information</p>
          </Link>

          <Link
            href="/dashboard/orders"
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white hover:shadow-lg transition"
          >
            <h3 className="text-xl font-bold mb-2">Create Order</h3>
            <p className="text-green-100">Send RFQ to multiple vendors</p>
          </Link>

          <Link
            href="/dashboard/quotes"
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white hover:shadow-lg transition"
          >
            <h3 className="text-xl font-bold mb-2">Compare Quotes</h3>
            <p className="text-purple-100">View vendor quotes side-by-side</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
