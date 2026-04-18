import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type { ApiErrorBody } from './types/auth.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// Singleton instance
let _client: AxiosInstance | null = null;

// Called from SessionRefreshHandler to inject token getter
let _getAccessToken: (() => string | null) | null = null;
let _refreshTokenFn: (() => Promise<string | null>) | null = null;

export function configureApiClient(opts: {
  getAccessToken: () => string | null;
  refreshTokenFn: () => Promise<string | null>;
}) {
  _getAccessToken = opts.getAccessToken;
  _refreshTokenFn = opts.refreshTokenFn;
}

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15_000,
  });

  // Attach access token to every request
  client.interceptors.request.use((config) => {
    const token = _getAccessToken?.();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });

  // On 401 → try refresh once, then redirect to login
  let isRefreshing = false;
  let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

  const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
    failedQueue = [];
  };

  client.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` };
            return client(originalRequest);
          });
        }
        originalRequest._retry = true;
        isRefreshing = true;
        try {
          const newToken = await _refreshTokenFn?.();
          if (newToken) {
            processQueue(null, newToken);
            originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${newToken}` };
            return client(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
        } finally {
          isRefreshing = false;
        }
        // Redirect to login handled by SessionRefreshHandler
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );

  return client;
}

export function getApiClient(): AxiosInstance {
  if (!_client) _client = createClient();
  return _client;
}

export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    return body?.error?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Невідома помилка';
}
