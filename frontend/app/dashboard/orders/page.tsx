'use client';

import { useEffect, useState } from 'react';
import { ordersAPI, vendorsAPI } from '@/lib/api';
import { SkeletonTableRow } from '@/components/SkeletonLoaders';
import { useSearchParams } from 'next/navigation';

interface Order {
  id: string;
  product_name: string;
  quantity: number;
  status: string;
  vendor_id: string;
  created_at: string;
  updated_at: string;
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

      {isLoading ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Qty</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
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
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {order.product_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.quantity}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {order.status === 'draft' && (
                      <button
                        onClick={() => handleSendRFQ(order.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Send RFQ
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
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
