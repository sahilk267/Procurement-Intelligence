'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { NotificationBell } from './NotificationBell';
import {
    HomeIcon,
    UsersIcon,
    ShoppingCartIcon,
    DocumentDuplicateIcon,
    GlobeAltIcon,
    ChartBarSquareIcon,
    UserGroupIcon,
    PresentationChartLineIcon,
    BellIcon
} from '@heroicons/react/24/outline';

export function DashboardNav() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: HomeIcon },
        { name: 'Vendors', href: '/dashboard/vendors', icon: UsersIcon },
        { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCartIcon },
        { name: 'Quotes', href: '/dashboard/quotes', icon: DocumentDuplicateIcon },
        { name: 'Discovery', href: '/dashboard/discovery', icon: GlobeAltIcon },
        { name: 'Prices', href: '/dashboard/prices', icon: ChartBarSquareIcon },
        { name: 'Leads', href: '/dashboard/leads', icon: UserGroupIcon },
        { name: 'Analytics', href: '/dashboard/analytics', icon: PresentationChartLineIcon },
        { name: 'Notifications', href: '/dashboard/notifications', icon: BellIcon },
    ];

    return (
        <div className="bg-white border-b border-gray-200">
            {/* Top Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">PI</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">Procurement Intelligence</h1>
                </div>

                <div className="flex items-center gap-4">
                    <NotificationBell />
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</span>
                        <span className="text-xs text-gray-500">{user?.email}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex gap-1 overflow-x-auto no-scrollbar py-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                  ${isActive
                                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                                        : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }
                `}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
