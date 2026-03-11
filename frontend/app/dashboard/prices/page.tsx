'use client';

import { useEffect, useState } from 'react';
import { pricesAPI } from '../../../lib/api';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import {
    ChartBarSquareIcon,
    MagnifyingGlassIcon,
    PresentationChartLineIcon,
    TagIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface PricePoint {
    recorded_at: string;
    price: number;
    product_name: string;
}

interface CategoryAverage {
    category: string;
    avg_price: number;
    min_price: number;
    max_price: number;
    data_points: number;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function PriceIntelligencePage() {
    const [history, setHistory] = useState<PricePoint[]>([]);
    const [averages, setAverages] = useState<CategoryAverage[]>([]);
    const [searchTerm, setSearchTerm] = useState('Core i7 Processor');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [avgRes, historyRes] = await Promise.all([
                pricesAPI.getAverage(),
                pricesAPI.getHistory(searchTerm)
            ]);
            setAverages(avgRes.data);
            setHistory(historyRes.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load price intelligence data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        try {
            setIsLoading(true);
            const res = await pricesAPI.getHistory(searchTerm);
            setHistory(res.data);
        } catch (err) {
            setError('Failed to search price history');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <ChartBarSquareIcon className="w-8 h-8 text-indigo-600" />
                        Price Intelligence
                    </h1>
                    <p className="text-gray-600 mt-1">Cross-platform price tracking and category benchmarks</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search product price history (e.g. Core i7)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                        Track Trend
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trend Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <PresentationChartLineIcon className="w-6 h-6 text-indigo-500" />
                            Price Movement: {searchTerm}
                        </h2>
                    </div>
                    <div className="h-[400px]">
                        {history.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[...history].reverse()}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="recorded_at"
                                        tickFormatter={(val) => new Date(val).toLocaleDateString()}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        labelFormatter={(val) => new Date(val).toLocaleString()}
                                        formatter={(val) => [`$${val}`, 'Price']}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#4F46E5"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#4F46E5' }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                                <CalendarDaysIcon className="w-12 h-12 mb-2" />
                                <p>No pricing data available for this search</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Benchmarks */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TagIcon className="w-6 h-6 text-emerald-500" />
                        Category Benchmarks
                    </h2>
                    <div className="space-y-6">
                        {averages.map((avg, idx) => (
                            <div key={avg.category} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="font-semibold text-gray-700">{avg.category}</span>
                                    <span className="text-2xl font-bold text-gray-900">${avg.avg_price}</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${(avg.avg_price / avg.max_price) * 100}%`,
                                            backgroundColor: COLORS[idx % COLORS.length]
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Min: ${avg.min_price}</span>
                                    <span>{avg.data_points} signals</span>
                                    <span>Max: ${avg.max_price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Market Coverage Analysis</h2>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={averages}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip formatter={(val) => [`$${val}`, 'Average Price']} />
                            <Bar dataKey="avg_price" radius={[4, 4, 0, 0]}>
                                {averages.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
