'use client';

import { useEffect, useState } from 'react';
import { ordersAPI, vendorsAPI, aiAPI } from '../../../lib/api';
import { SkeletonTableRow } from '../../../components/SkeletonLoaders';
import { useSearchParams } from 'next/navigation';
import { SparklesIcon, PlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface Order {
  id: string;
  product_name: string;
  quantity: number;
  status: string;
  vendor_id: string;
  created_at: string;
  updated_at: string;
}

interface AIRecommendation {
  order_id: string;
  product: string;
  best_quote_id: string;
  analysis: string;
}

interface Vendor {
  id: string;
  name: string;
}

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const vendorParam = searchParams.get('vendor');

  const [orders, setOrders] = useState<Order[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(!!vendorParam);
  const [formData, setFormData] = useState({
    product_name: '',
    quantity: 1,
    vendor_id: vendorParam || '',
    description: '',
  });

  useEffect(() => {
    fetchOrders();
    fetchVendors();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await vendorsAPI.getAll();
      setVendors(response.data);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ordersAPI.create(formData);
      setFormData({ product_name: '', quantity: 1, vendor_id: '', description: '' });
      setShowForm(false);
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create order');
    }
  };

  const handleSendRFQ = async (orderId: string) => {
    try {
      await ordersAPI.sendRFQ(orderId);
      fetchOrders();
      alert('RFQ sent successfully!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send RFQ');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Delete this order?')) {
      try {
        await ordersAPI.delete(orderId);
        fetchOrders();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete order');
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? 'Cancel' : 'Create Order'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateOrder} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Create New Order</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              min="1"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={formData.vendor_id}
              onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
          >
            Create Order
          </button>
        </form>
      )}

      {/* AI Insights Section */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-6 h-6" />
            <h2 className="text-xl font-bold">AI Strategic Intelligence</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 2).map((rec, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-100 mb-1">
                  Order #{rec.order_id} • {rec.product}
                </p>
                <p className="text-sm font-medium leading-relaxed">
                  {rec.analysis}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Qty</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <SkeletonTableRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
          <p className="text-gray-500 text-lg">No orders found in the system.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Qty</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Created</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900 uppercase">{order.product_name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">ID: {order.id}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-600">{order.quantity} units</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 font-medium">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {order.status === 'draft' && (
                      <button
                        onClick={() => handleSendRFQ(order.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-tighter transition-colors"
                      >
                        Send RFQ
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="bg-white border border-gray-200 hover:border-red-500 hover:text-red-600 text-gray-400 py-1.5 px-3 rounded text-[10px] font-bold uppercase tracking-tighter transition-all"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
