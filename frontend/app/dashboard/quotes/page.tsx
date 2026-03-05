'use client';

import { useEffect, useState } from 'react';
import { quotesAPI, ordersAPI } from '@/lib/api';
import { SkeletonCard } from '@/components/SkeletonLoaders';

interface Quote {
  id: string;
  order_id: string;
  vendor_id: string;
  price: number;
  delivery_days: number;
  terms: string;
  status: string;
  created_at: string;
  vendor_name?: string;
}

interface Order {
  id: string;
  product_name: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [formData, setFormData] = useState({
    order_id: '',
    price: 0,
    delivery_days: 5,
    terms: 'Payment due upon receipt',
  });

  useEffect(() => {
    fetchQuotes();
    fetchOrders();
  }, []);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await quotesAPI.getAll();
      setQuotes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load quotes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await quotesAPI.create(formData);
      setFormData({ order_id: '', price: 0, delivery_days: 5, terms: 'Payment due upon receipt' });
      setShowForm(false);
      fetchQuotes();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create quote');
    }
  };

  const handleUpdateQuote = async (quoteId: string, newStatus: string) => {
    try {
      await quotesAPI.update(quoteId, { status: newStatus });
      fetchQuotes();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update quote');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const groupedQuotes = orders.reduce((acc, order) => {
    const orderQuotes = quotes.filter((q) => q.order_id === order.id);
    if (orderQuotes.length > 0) {
      acc[order.id] = { order, quotes: orderQuotes };
    }
    return acc;
  }, {} as Record<string, { order: Order; quotes: Quote[] }>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? 'Cancel' : 'Submit Quote'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateQuote} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Submit New Quote</h2>
          <div className="space-y-4">
            <select
              value={formData.order_id}
              onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Order</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.product_name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              step="0.01"
              min="0"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Delivery Days"
              value={formData.delivery_days}
              onChange={(e) => setFormData({ ...formData, delivery_days: parseInt(e.target.value) })}
              min="1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Terms & Conditions"
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
          >
            Submit Quote
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : Object.keys(groupedQuotes).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No quotes found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedQuotes).map(([orderId, { order, quotes: orderQuotes }]) => (
            <div key={orderId} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{order.product_name}</h2>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Vendor
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Price
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Delivery (days)
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orderQuotes.map((quote) => (
                      <tr key={quote.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">{quote.vendor_name || 'Unknown Vendor'}</td>
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          ${quote.price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">{quote.delivery_days}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}
                          >
                            {quote.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 space-x-2">
                          {quote.status !== 'accepted' && (
                            <button
                              onClick={() => handleUpdateQuote(quote.id, 'accepted')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                            >
                              Accept
                            </button>
                          )}
                          {quote.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateQuote(quote.id, 'rejected')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                            >
                              Reject
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
