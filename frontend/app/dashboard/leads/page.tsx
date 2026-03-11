'use client';

import { useEffect, useState } from 'react';
import { leadsAPI } from '../../../lib/api';
import { SkeletonCard } from '../../../components/SkeletonLoaders';
import {
    UserGroupIcon,
    PlusIcon,
    EnvelopeIcon,
    PhoneIcon,
    BuildingOfficeIcon,
    CursorArrowRaysIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Lead {
    id: string;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    interest_category: string;
    source: string;
    status: string;
    created_at: string;
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        interest_category: '',
        source: 'manual',
    });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await leadsAPI.getAll();
            setLeads(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load leads');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await leadsAPI.create(formData);
            setFormData({
                company_name: '',
                contact_person: '',
                email: '',
                phone: '',
                interest_category: '',
                source: 'manual'
            });
            setShowForm(false);
            fetchLeads();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to create lead');
        }
    };

    const handleUpdateStatus = async (leadId: string, status: string) => {
        try {
            await leadsAPI.update(leadId, { status });
            fetchLeads();
        } catch (err: any) {
            setError('Failed to update lead status');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            new: 'bg-blue-100 text-blue-800',
            qualified: 'bg-indigo-100 text-indigo-800',
            converted: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <UserGroupIcon className="w-8 h-8 text-indigo-600" />
                        Lead Management
                    </h1>
                    <p className="text-gray-600 mt-1">Track and qualify potential procurement partners</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                    {showForm ? 'Cancel' : <><PlusIcon className="w-5 h-5" /> Add Lead</>}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <form onSubmit={handleCreateLead} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                <input
                                    type="text"
                                    value={formData.contact_person}
                                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interest Category</label>
                                <input
                                    type="text"
                                    value={formData.interest_category}
                                    onChange={(e) => setFormData({ ...formData, interest_category: e.target.value })}
                                    placeholder="e.g. Hardware, Logistics"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                                <select
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="manual">Manual Entry</option>
                                    <option value="website">Website Inquiry</option>
                                    <option value="referral">Referral</option>
                                    <option value="social">Social Media</option>
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors"
                            >
                                Save New Lead
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : leads.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
                    <p className="text-gray-500">No leads active. Start by adding a prospect or wait for incoming inquiries.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {leads.map((lead) => (
                        <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            {lead.status === 'converted' && (
                                <div className="absolute top-0 right-0 p-2">
                                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                                </div>
                            )}

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusBadge(lead.status)}`}>
                                        {lead.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                        <BuildingOfficeIcon className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{lead.company_name}</h3>
                                        <p className="text-sm text-gray-500 font-medium">{lead.contact_person || 'No contact specified'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 py-4 border-y border-gray-50 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                                        {lead.email}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                                        {lead.phone || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CursorArrowRaysIcon className="w-4 h-4 text-gray-400" />
                                        Interested in: <span className="font-semibold text-gray-900">{lead.interest_category}</span>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    {lead.status === 'new' && (
                                        <button
                                            onClick={() => handleUpdateStatus(lead.id, 'qualified')}
                                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                                        >
                                            Qualify Lead
                                        </button>
                                    )}
                                    {lead.status === 'qualified' && (
                                        <button
                                            onClick={() => handleUpdateStatus(lead.id, 'converted')}
                                            className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                                        >
                                            Convert to Vendor
                                        </button>
                                    )}
                                    <button className="px-3 py-1.5 text-gray-400 hover:text-red-600 rounded-lg text-xs font-bold transition-colors">
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
