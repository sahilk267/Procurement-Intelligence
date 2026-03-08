"use client";

import { useEffect, useState } from "react";
import { fetchAuth } from "../../../lib/fetch";

export default function AIBrainDashboard() {
    const [insights, setInsights] = useState("");
    const [rankings, setRankings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [resInsights, resRankings] = await Promise.all([
                    fetchAuth("/api/v1/analytics/advisor-insights"),
                    fetchAuth("/api/v1/analytics/vendor-rankings")
                ]);

                setInsights(resInsights?.strategic_insights || "No insights generated.");
                setRankings(resRankings || []);
            } catch (e) {
                console.error("Failed to load AI Brain data", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">Procurement AI Brain</h1>
            <p className="text-gray-600 mb-6">Strategic analytics and neural predictions.</p>

            {loading ? (
                <p>Crunching neural pathways...</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white p-6 rounded-xl shadow-xl">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <span className="mr-2">🧠</span> Executive Advisor
                        </h2>
                        <div className="whitespace-pre-line text-blue-50 leading-relaxed font-light">
                            {insights}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-4">Live Vendor Rankings</h2>
                        <div className="bg-white rounded shadow border overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rankings.map((v, i) => (
                                        <tr key={v.vendor_id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{i + 1}. {v.name}</div>
                                                <div className="text-xs text-gray-500">{v.category}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xl">
                                                {"⭐️".repeat(v.stars)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
