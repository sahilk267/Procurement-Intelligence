'use client';

import { useEffect, useState } from 'react';
import { notificationsAPI } from '../../../lib/api';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await notificationsAPI.getAll();
      // Sort by date, newest first
      const sorted = (response.data || []).sort(
        (a: Notification, b: Notification) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setNotifications(sorted);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead([notificationId]);
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark notification as read');
    }
  };

  const handleMarkMultipleAsRead = async (ids: string[]) => {
    try {
      await notificationsAPI.markAsRead(ids);
      setNotifications(
        notifications.map((n) =>
          ids.includes(n.id) ? { ...n, is_read: true } : n
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark notifications as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      await handleMarkMultipleAsRead(unreadIds);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (selectedFilter === 'unread') return !n.is_read;
    if (selectedFilter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      order: '📋',
      quote: '💰',
      vendor: '🏢',
      rfq: '📤',
      status: '✅',
      alert: '⚠️',
      info: 'ℹ️',
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      order: 'border-l-blue-500 bg-blue-50',
      quote: 'border-l-green-500 bg-green-50',
      vendor: 'border-l-purple-500 bg-purple-50',
      rfq: 'border-l-orange-500 bg-orange-50',
      status: 'border-l-indigo-500 bg-indigo-50',
      alert: 'border-l-red-500 bg-red-50',
      info: 'border-l-gray-500 bg-gray-50',
    };
    return colors[type] || 'border-l-gray-500 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              You have <span className="font-semibold text-red-600">{unreadCount}</span> unread notification
              {unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b border-gray-200">
          {(['all', 'unread', 'read'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${selectedFilter === filter
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter === 'unread' && unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">
            {selectedFilter === 'unread' && 'No unread notifications'}
            {selectedFilter === 'read' && 'No read notifications'}
            {selectedFilter === 'all' && 'No notifications'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-l-4 rounded-lg shadow-sm p-4 transition-all ${getNotificationColor(notification.type)} ${!notification.is_read ? 'border-l-4' : 'opacity-75'
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl mt-1">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="inline-flex h-2 w-2 rounded-full bg-red-600"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {!notification.is_read ? (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="ml-4 inline-flex items-center justify-center h-8 w-8 rounded-lg bg-white text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Mark as read"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                ) : (
                  <div className="ml-4 text-xs text-gray-500 whitespace-nowrap">Read</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
