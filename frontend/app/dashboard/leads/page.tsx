"use client";

import { useEffect, useState } from "react";
import { fetchAuth } from "../../../lib/fetch";

export default function LeadsDashboard() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetchAuth("/api/v1/analytics/leads");
                setAnalytics(res);
            } catch (e) {
                console.error("Failed to load leads", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Leads & Deal Conversions</h1>
            {loading ? (
                <p>Loading analytics...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded shadow border">
                        <h3 className="text-gray-500 text-sm">Total Leads</h3>
                        <p className="text-3xl font-bold">{analytics?.total_leads || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow border">
                        <h3 className="text-gray-500 text-sm">New Leads</h3>
                        <p className="text-3xl font-bold text-blue-600">{analytics?.new_leads || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow border">
                        <h3 className="text-gray-500 text-sm">Converted</h3>
                        <p className="text-3xl font-bold text-green-600">{analytics?.converted_leads || 0}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
