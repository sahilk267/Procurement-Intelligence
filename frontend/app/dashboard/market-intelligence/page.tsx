"use client";

import { useEffect, useState } from "react";
import { fetchAuth } from '../../../lib/fetch';

export default function MarketIntelligence() {
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetchAuth("/api/v1/analytics/opportunities");
                setOpportunities(res || []);
            } catch (e) {
                console.error("Failed to load opportunities", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">Market Intelligence</h1>
            <p className="text-gray-600 mb-6">Real-time alerts for price drops and bulk inventory overstock.</p>

            {loading ? (
                <p>Scanning markets...</p>
            ) : opportunities.length === 0 ? (
                <p className="text-gray-500">No active market opportunities detected today.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {opportunities.map((op, idx) => (
                        <div key={idx} className="bg-white p-4 rounded shadow border-l-4 border-green-500 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">{op.product_name}</h3>
                                <p className="text-sm text-gray-600">{op.details}</p>
                                <div className="mt-2 text-xs bg-gray-100 uppercase tracking-wide inline-block px-2 py-1 rounded">
                                    {op.opportunity_type}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-green-600">{op.score}</p>
                                <span className="text-xs text-gray-500">Opportunity Score</span>
                                <button className="mt-2 block w-full bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
                                    Act Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
