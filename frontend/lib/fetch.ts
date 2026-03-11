import apiClient from './api';

export const fetchAuth = async (url: string, options: any = {}) => {
    const method = options.method || 'GET';
    const data = options.body ? JSON.parse(options.body) : options.data;

    try {
        const response = await apiClient({
            url,
            method,
            data,
            ...options,
        });
        return response.data;
    } catch (error) {
        console.error(`API Error (${url}):`, error);
        throw error;
    }
};
