import axios from 'axios';
import { useAuthStore } from './stores/auth.store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add access token
api.interceptors.request.use((config) => {
  // Request interceptor: attach access token from the Zustand auth store (sessionStorage persistence)
const token = typeof window !== 'undefined' ? useAuthStore.getState().accessToken : null;
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
return config;
});

// Interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = typeof window !== 'undefined' ? useAuthStore.getState().refreshToken : null;

      // Response interceptor: handle 401 by attempting token refresh via backend endpoint.
if (refreshToken) {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    // Update tokens in the auth store (sessionStorage persisted)
    useAuthStore.getState().setTokens(data.access_token, data.refresh_token);

    // Retry original request with new access token
    originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
    return api(originalRequest);
  } catch (refreshError) {
    // Refresh failed – clear auth and redirect to login
    useAuthStore.getState().clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
} else {
  // No refresh token available – clear auth and redirect
  useAuthStore.getState().clearAuth();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
    }

    return Promise.reject(error);
  }
);
