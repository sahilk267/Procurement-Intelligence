// API Client for Backend Communication
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth-related API calls
export const authAPI = {
  register: (data: { email: string; password: string; full_name: string }) =>
    apiClient.post('/auth/register', data),
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  getProfile: () => apiClient.get('/auth/profile'),
  logout: () => apiClient.post('/auth/logout'),
};

// Vendors API
export const vendorsAPI = {
  getAll: (params?: any) => apiClient.get('/vendors', { params }),
  getById: (id: string) => apiClient.get(`/vendors/${id}`),
  create: (data: any) => apiClient.post('/vendors', data),
  update: (id: string, data: any) => apiClient.put(`/vendors/${id}`, data),
  delete: (id: string) => apiClient.delete(`/vendors/${id}`),
  verify: (id: string) => apiClient.post(`/vendors/${id}/verify`),
  flag: (id: string) => apiClient.post(`/vendors/${id}/flag`),
};

// Orders API
export const ordersAPI = {
  getAll: (params?: any) => apiClient.get('/orders', { params }),
  getById: (id: string) => apiClient.get(`/orders/${id}`),
  create: (data: any) => apiClient.post('/orders', data),
  update: (id: string, data: any) => apiClient.put(`/orders/${id}`, data),
  delete: (id: string) => apiClient.delete(`/orders/${id}`),
  sendRFQ: (id: string) => apiClient.post(`/orders/${id}/send-rfq`),
};

// Quotes API
export const quotesAPI = {
  getAll: (params?: any) => apiClient.get('/quotes', { params }),
  create: (data: any) => apiClient.post('/quotes', data),
  update: (id: string, data: any) => apiClient.put(`/quotes/${id}`, data),
};

// Leads API
export const leadsAPI = {
  getAll: (params?: any) => apiClient.get('/leads', { params }),
  create: (data: any) => apiClient.post('/leads', data),
  update: (id: string, data: any) => apiClient.put(`/leads/${id}`, data),
};

// Analytics API
export const analyticsAPI = {
  getVendors: () => apiClient.get('/analytics/vendors'),
  getDeals: () => apiClient.get('/analytics/deals'),
  getPrices: () => apiClient.get('/analytics/prices'),
  getLeads: () => apiClient.get('/analytics/leads'),
  getVendorRankings: () => apiClient.get('/analytics/vendor-rankings'),
  getAdvisorInsights: () => apiClient.get('/analytics/advisor-insights'),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => apiClient.get('/notifications'),
  markAsRead: (notificationIds: string[]) =>
    apiClient.post('/notifications/mark-read', { notification_ids: notificationIds }),
};

export default apiClient;
