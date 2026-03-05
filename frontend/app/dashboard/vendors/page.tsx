'use client';

import { useEffect, useState } from 'react';
import { vendorsAPI } from '@/lib/api';
import { SkeletonCard } from '@/components/SkeletonLoaders';
import Link from 'next/link';

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  category: string;
  is_verified: boolean;
  verification_status: string;
  rating: number;
  created_at: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ category: '', city: '', status: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    category: '',
  });

  useEffect(() => {
    fetchVendors();
  }, [filter]);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await vendorsAPI.getAll(filter);
      setVendors(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vendorsAPI.create(formData);
      setFormData({ name: '', email: '', phone: '', city: '', category: '' });
      setShowForm(false);
      fetchVendors();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create vendor');
    }
  };

  const handleVerifyVendor = async (vendorId: string) => {
    try {
      await vendorsAPI.verify(vendorId);
      fetchVendors();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to verify vendor');
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (window.confirm('Delete this vendor?')) {
      try {
        await vendorsAPI.delete(vendorId);
        fetchVendors();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete vendor');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? 'Cancel' : 'Add Vendor'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateVendor} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Add New Vendor</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
          >
            Create Vendor
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <input
          type="text"
          placeholder="Filter by city..."
          value={filter.city}
          onChange={(e) => setFilter({ ...filter, city: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 flex-1"
        />
        <input
          type="text"
          placeholder="Filter by category..."
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 flex-1"
        />
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No vendors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-lg shadow p-6 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                  <p className="text-sm text-gray-600">{vendor.category}</p>
                </div>
                {vendor.is_verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p>📧 {vendor.email}</p>
                <p>📱 {vendor.phone}</p>
                <p>📍 {vendor.city}</p>
                <p>⭐ Rating: {vendor.rating || 'N/A'}</p>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                {!vendor.is_verified && (
                  <button
                    onClick={() => handleVerifyVendor(vendor.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-sm"
                  >
                    Verify
                  </button>
                )}
                <Link
                  href={`/dashboard/orders?vendor=${vendor.id}`}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded text-sm text-center"
                >
                  Create Order
                </Link>
                <button
                  onClick={() => handleDeleteVendor(vendor.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
