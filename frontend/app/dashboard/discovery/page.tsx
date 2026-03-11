'use client';

import { useEffect, useState } from 'react';
import { pricesAPI } from '../../../lib/api';
import { SkeletonCard } from '../../../components/SkeletonLoaders';
import {
    RocketLaunchIcon,
    ArrowTrendingUpIcon,
    ArchiveBoxIcon,
    MapPinIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

interface Opportunity {
    id: string;
    product_name: string;
    brand: string;
    category: string;
    estimated_margin: number;
    inventory_size: number;
    source: string;
    location: string;
    score: number;
    signal_type: string;
    status: string;
    created_at: string;
}

export default function DiscoveryPage() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await pricesAPI.getOpportunities();
            setOpportunities(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load market opportunities');
        } finally {
            setIsLoading(false);
        }
    };

    const getSignalBadge = (type: string) => {
        const badges: Record<string, string> = {
            price_drop: 'bg-green-100 text-green-800',
            bulk_inventory: 'bg-blue-100 text-blue-800',
            demand_spike: 'bg-purple-100 text-purple-800',
        };
        return badges[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <SparklesIcon className="w-8 h-8 text-indigo-600" />
                        Market Discovery
                    </h1>
                    <p className="text-gray-600 mt-1">AI-detected procurement opportunities and supply signals</p>
                </div>
                <button
                    onClick={fetchOpportunities}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                    <ArrowTrendingUpIcon className="w-5 h-5" />
                    Refresh Signals
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : opportunities.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RocketLaunchIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">No active signals detected</h3>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                        The AI Brain is scanning the market. Check back later for price drops and bulk inventory alerts.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map((op) => (
                        <div key={op.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getSignalBadge(op.signal_type)}`}>
                                        {op.signal_type.replace('_', ' ')}
                                    </span>
                                    <div className="flex items-center gap-1 text-indigo-600 font-bold">
                                        <span className="text-lg">{Math.round(op.score)}</span>
                                        <span className="text-xs">SCORE</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-1">{op.product_name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{op.brand} • {op.category}</p>

                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-semibold">Margin Potential</p>
                                        <p className="text-lg font-bold text-green-600">+{op.estimated_margin}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-semibold">Inventory</p>
                                        <p className="text-lg font-bold text-gray-900">{op.inventory_size} units</p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                                        {op.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <ArchiveBoxIcon className="w-4 h-4 text-gray-400" />
                                        Source: {op.source.replace('_', ' ')}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100">
                                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                                    Action Signal
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
