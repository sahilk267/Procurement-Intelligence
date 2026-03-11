'use client';

import { useEffect, useState } from 'react';
import { quotesAPI, ordersAPI, aiAPI } from '../../../lib/api';
import { SkeletonCard } from '../../../components/SkeletonLoaders';
import { SparklesIcon, PlusIcon } from '@heroicons/react/24/outline';

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

interface AIPrediction {
  order_id: string;
  quote_id: string;
  vendor: string;
  success_probability: number;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    order_id: '',
    price: 0,
    delivery_days: 5,
    terms: 'Payment due upon receipt',
  });

  useEffect(() => {
    fetchQuotes();
    fetchOrders();
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await aiAPI.getPredictions();
      setPredictions(response.data);
    } catch (err) {
      console.warn('AI Predictions not available');
    }
  };

  const handleAutoNegotiate = async (orderId: string) => {
    try {
      setIsNegotiating(orderId);
      await quotesAPI.autoNegotiate(orderId);
      alert('AI Negotiation sequence started for this order.');
      fetchQuotes();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start AI negotiation');
    } finally {
      setIsNegotiating(null);
    }
  };

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
            <div key={orderId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs uppercase">
                    {order.product_name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">{order.product_name}</h2>
                    <p className="text-[10px] text-gray-400 font-mono">ORDER REF: {orderId}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAutoNegotiate(orderId)}
                  disabled={isNegotiating === orderId}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${isNegotiating === orderId
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100'
                    }`}
                >
                  <SparklesIcon className={`w-4 h-4 ${isNegotiating === orderId ? 'animate-spin' : ''}`} />
                  {isNegotiating === orderId ? 'Negotiating...' : 'AI Auto-Negotiate'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white border-b border-gray-50">
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vendor</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quote Price</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Success Prob</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orderQuotes.map((quote: Quote) => {
                      const prediction = predictions.find(p => p.quote_id === quote.id);
                      return (
                        <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-gray-900 uppercase">{quote.vendor_name || 'Vendor Profile'}</p>
                            <p className="text-[10px] text-gray-400">QUALIFIED PARTNER</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-lg font-bold text-indigo-600 tracking-tighter">${quote.price.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-600">{quote.delivery_days} Days</td>
                          <td className="px-6 py-4">
                            {prediction ? (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 max-w-[100px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${prediction.success_probability > 0.7 ? 'bg-emerald-500' : 'bg-amber-500'
                                      }`}
                                    style={{ width: `${prediction.success_probability * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-gray-700">{Math.round(prediction.success_probability * 100)}%</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-300 font-bold italic uppercase">Analyzing...</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(quote.status)}`}>
                              {quote.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {quote.status !== 'accepted' && (
                              <button
                                onClick={() => handleUpdateQuote(quote.id, 'accepted')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-tighter transition-colors"
                              >
                                Accept
                              </button>
                            )}
                            {quote.status !== 'rejected' && (
                              <button
                                onClick={() => handleUpdateQuote(quote.id, 'rejected')}
                                className="bg-white border border-gray-200 hover:border-red-500 hover:text-red-600 text-gray-400 py-1.5 px-3 rounded text-[10px] font-bold uppercase tracking-tighter transition-all"
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
