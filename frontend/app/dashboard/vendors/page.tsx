'use client';

import { useEffect, useState } from 'react';
import { vendorsAPI } from '../../../lib/api';
import { SkeletonCard } from '../../../components/SkeletonLoaders';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  PlusIcon,
  TagIcon,
  GlobeAltIcon,
  DocumentCheckIcon,
  CheckBadgeIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  category: string;
  is_verified: boolean;
  verification_status: boolean; // standardized to boolean from backend
  brands: string[];
  product_condition: string;
  website: string;
  gst_number: string;
  years_in_business: number;
  employee_count: number;
  rating: number;
  fraud_score: number;
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
    website: '',
    gst_number: '',
    product_condition: 'both',
    brands: '', // user enters as comma-separated string
    years_in_business: 0,
    employee_count: 0,
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
      // Process brands into array
      const brandsArray = formData.brands.split(',').map(b => b.trim()).filter(b => b !== '');
      const submitData = {
        ...formData,
        brands: brandsArray,
        years_in_business: Number(formData.years_in_business),
        employee_count: Number(formData.employee_count)
      };
      await vendorsAPI.create(submitData);
      setFormData({
        name: '', email: '', phone: '', city: '', category: '',
        website: '', gst_number: '', product_condition: 'both',
        brands: '', years_in_business: 0, employee_count: 0
      });
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          {showForm ? 'Cancel' : <><PlusIcon className="w-5 h-5" /> Add Vendor</>}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateVendor} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BuildingOfficeIcon className="w-6 h-6 text-indigo-600" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <h2 className="text-xl font-bold flex items-center gap-2 pt-4 border-t border-gray-50">
            <ClipboardDocumentCheckIcon className="w-6 h-6 text-emerald-600" />
            Compliance & Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              <input
                type="text"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brands (comma separated)</label>
              <input
                type="text"
                value={formData.brands}
                onChange={(e) => setFormData({ ...formData, brands: e.target.value })}
                placeholder="Apple, Samsung, Intel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Condition</label>
              <select
                value={formData.product_condition}
                onChange={(e) => setFormData({ ...formData, product_condition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="new">New Only</option>
                <option value="used">Used Only</option>
                <option value="both">Both New & Used</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years in Business</label>
              <input
                type="number"
                value={formData.years_in_business}
                onChange={(e) => setFormData({ ...formData, years_in_business: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Count</label>
              <input
                type="number"
                value={formData.employee_count}
                onChange={(e) => setFormData({ ...formData, employee_count: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold transition-colors"
            >
              Verify & Add Vendor
            </button>
          </div>
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
            <div key={vendor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col group relative overflow-hidden">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    <BuildingOfficeIcon className="w-7 h-7" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {vendor.verification_status ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-tighter">
                        <CheckBadgeIcon className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-tighter">
                        Pending
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      ID: {vendor.id.toString().padStart(4, '0')}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                  {vendor.name}
                </h3>
                <p className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-1">
                  <TagIcon className="w-3.5 h-3.5" />
                  {vendor.category}
                </p>

                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    {vendor.city}
                  </div>
                  {vendor.website && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <GlobeAltIcon className="w-4 h-4 text-gray-400 shrink-0" />
                      <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 truncate">
                        {vendor.website.replace('https://', '')}
                      </a>
                    </div>
                  )}
                  {vendor.gst_number && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <DocumentCheckIcon className="w-4 h-4 text-gray-400 shrink-0" />
                      GST: <span className="font-semibold text-gray-900">{vendor.gst_number}</span>
                    </div>
                  )}
                </div>

                {vendor.brands && vendor.brands.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {vendor.brands.map((brand, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px] font-bold uppercase border border-gray-100">
                        {brand}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Risk Footer */}
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter">Reliability</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-1 rounded-sm ${i < (vendor.rating || 3) ? 'bg-indigo-500' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter">Fraud Risk</span>
                  <span className={`font-bold ${Number(vendor.fraud_score) > 20 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {vendor.fraud_score || '0.0'}%
                  </span>
                </div>
              </div>

              <div className="p-4 grid grid-cols-3 gap-2 border-t border-gray-100">
                {!vendor.verification_status && (
                  <button
                    onClick={() => handleVerifyVendor(vendor.id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-bold transition-colors"
                  >
                    Verify
                  </button>
                )}
                <Link
                  href={`/dashboard/orders?vendor=${vendor.id}`}
                  className="bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 text-gray-600 py-2 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center"
                >
                  Order
                </Link>
                <button
                  onClick={() => handleDeleteVendor(vendor.id)}
                  className="bg-white border border-gray-200 hover:border-red-500 hover:text-red-600 text-gray-600 py-2 rounded-lg text-xs font-bold transition-all"
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
