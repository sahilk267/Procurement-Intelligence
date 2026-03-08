"use client";

import { useState } from "react";
import { fetchAuth } from "../../../lib/fetch";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const triggerDiscovery = async () => {
        setLoading(true);
        setStatus("Triggering global market scan...");
        try {
            await fetchAuth("/api/v1/discovery/trigger", { method: "POST" });
            setStatus("Global Market Discovery task enqueued to Celery. Vendors are being scraped in the background.");
        } catch (e) {
            console.error(e);
            setStatus("Failed to trigger background task.");
        }
        setLoading(false);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Platform Settings</h1>

            <div className="bg-white p-6 rounded shadow border max-w-2xl">
                <h2 className="text-lg font-bold mb-4 border-b pb-2">Automation Engines</h2>

                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="font-semibold text-gray-800">Manual Vendor Discovery Trigger</p>
                        <p className="text-xs text-gray-500">Force the scraping worker to explore IndiaMART/JustDial immediately.</p>
                    </div>
                    <button
                        onClick={triggerDiscovery}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow text-sm disabled:opacity-50"
                    >
                        {loading ? "Triggering..." : "Trigger Engine"}
                    </button>
                </div>

                {status && (
                    <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded border border-blue-200">
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}
