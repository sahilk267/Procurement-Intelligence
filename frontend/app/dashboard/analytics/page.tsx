'use client';

import { useEffect, useState } from 'react';
import { analyticsAPI } from '@/lib/api';
import { SkeletonMetricCard } from '@/components/SkeletonLoaders';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface VendorAnalytics {
  total_vendors: number;
  verified_vendors: number;
  active_orders: number;
  total_orders: number;
  avg_deal_time: number;
  avg_price: number;
}

interface DealAnalytics {
  total_deals: number;
  active_deals: number;
  closed_deals: number;
  avg_deal_value: number;
  deal_status: { status: string; count: number }[];
}

interface PriceAnalytics {
  avg_price: number;
  min_price: number;
  max_price: number;
  price_by_category: { category: string; avg_price: number; count: number }[];
}

interface LeadAnalytics {
  total_leads: number;
  qualified_leads: number;
  conversion_rate: number;
  lead_status: { status: string; count: number }[];
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function AnalyticsDashboard() {
  const [vendorData, setVendorData] = useState<VendorAnalytics | null>(null);
  const [dealData, setDealData] = useState<DealAnalytics | null>(null);
  const [priceData, setPriceData] = useState<PriceAnalytics | null>(null);
  const [leadData, setLeadData] = useState<LeadAnalytics | null>(null);
  const [advisorInsights, setAdvisorInsights] = useState<string[]>([]);
  const [vendorRankings, setVendorRankings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [vendors, deals, prices, leads, insights, rankings] = await Promise.all([
        analyticsAPI.getVendors(),
        analyticsAPI.getDeals(),
        analyticsAPI.getPrices(),
        analyticsAPI.getLeads(),
        analyticsAPI.getAdvisorInsights(),
        analyticsAPI.getVendorRankings(),
      ]);

      setVendorData(vendors.data);
      setDealData(deals.data);
      setPriceData(prices.data);
      setLeadData(leads.data);
      setAdvisorInsights(insights.data?.strategic_insights || []);
      setVendorRankings(rankings.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load analytics');
      console.error('Analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonMetricCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <button
          onClick={fetchAnalytics}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          Refresh Data
        </button>
      </div>

      {/* AI Advisor Insights */}
      {advisorInsights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-semibold text-gray-900">🤖 AI Advisor</h2>
            <span className="px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">Phase 5 Engine</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advisorInsights.map((insight, idx) => (
              <div key={idx} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow p-5 border border-indigo-100">
                <p className="text-gray-800 font-medium">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vendor Rankings */}
      {vendorRankings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-semibold text-gray-900">🏆 Top Vendors</h2>
            <span className="px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">Dynamic Ranking</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vendorRankings.slice(0, 5).map((vendor, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.category || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-bold">{vendor.stars} ⭐</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{vendor.metrics.success_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vendor Analytics */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Vendor Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Vendors</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {vendorData?.total_vendors || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {vendorData?.verified_vendors || 0} verified
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Verification Rate</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {vendorData?.total_vendors
                ? Math.round((vendorData.verified_vendors / vendorData.total_vendors) * 100)
                : 0}
              %
            </p>
            <p className="text-xs text-gray-500 mt-2">of vendors verified</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Avg Deal Time</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {vendorData?.avg_deal_time ? Math.round(vendorData.avg_deal_time) : 0}h
            </p>
            <p className="text-xs text-gray-500 mt-2">hours to close</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Avg Price</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              ${vendorData?.avg_price ? vendorData.avg_price.toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-2">average quote</p>
          </div>
        </div>
      </div>

      {/* Deal Analytics */}
      {dealData && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Deal Metrics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Status Distribution</h3>
              {dealData.deal_status && dealData.deal_status.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dealData.deal_status}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {dealData.deal_status.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No deal status data available
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Deals</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {dealData.total_deals || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Deals</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {dealData.active_deals || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Closed Deals</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {dealData.closed_deals || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Avg Deal Value</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">
                    ${dealData.avg_deal_value ? dealData.avg_deal_value.toFixed(0) : '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Analytics */}
      {priceData && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Price Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price by Category</h3>
              {priceData.price_by_category && priceData.price_by_category.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceData.price_by_category}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avg_price" fill="#8B5CF6" name="Avg Price" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No price data available
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Average Price</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${priceData.avg_price ? priceData.avg_price.toFixed(2) : '0.00'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Price Range</p>
                <p className="text-gray-900 text-sm mt-2">
                  <span className="font-semibold">Min:</span> ${priceData.min_price ? priceData.min_price.toFixed(2) : '0.00'}
                </p>
                <p className="text-gray-900 text-sm">
                  <span className="font-semibold">Max:</span> ${priceData.max_price ? priceData.max_price.toFixed(2) : '0.00'}
                </p>
              </div>
              {priceData.price_by_category && priceData.price_by_category.length > 0 && (
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Categories</p>
                  <div className="space-y-2">
                    {priceData.price_by_category.slice(0, 4).map((cat) => (
                      <div key={cat.category} className="flex justify-between text-sm">
                        <span className="text-gray-700">{cat.category}</span>
                        <span className="font-semibold text-gray-900">
                          ${cat.avg_price.toFixed(2)} ({cat.count})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lead Analytics */}
      {leadData && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Lead Metrics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Leads</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {leadData.total_leads || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Qualified Leads</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {leadData.qualified_leads || 0}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t">
                <p className="text-gray-600 text-sm font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold text-indigo-600 mt-2">
                  {leadData.conversion_rate ? (leadData.conversion_rate * 100).toFixed(1) : '0'}%
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status</h3>
              {leadData.lead_status && leadData.lead_status.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={leadData.lead_status}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 150 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="status" type="category" width={140} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No lead data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders & Quotes Summary */}
      {vendorData && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Activity Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Orders</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Active Orders:</span>
                  <span className="font-bold text-blue-900">{vendorData.active_orders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Orders:</span>
                  <span className="font-bold text-blue-900">{vendorData.total_orders || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Vendors</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">Total Vendors:</span>
                  <span className="font-bold text-green-900">
                    {vendorData.total_vendors || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Verified Vendors:</span>
                  <span className="font-bold text-green-900">
                    {vendorData.verified_vendors || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
