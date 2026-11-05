import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  getAuthToken,
  refreshAccessToken,
  removeAuthToken,
} from '@/lib/auth';
import { buildLoginUrl } from '@/lib/safeRedirect';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/logout')
    ) {
      original._retry = true;

      // Shared single-flight lives inside refreshAccessToken (boot + 401).
      const nextToken = await refreshAccessToken();
      if (nextToken) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${nextToken}`;
        return apiClient(original);
      }

      removeAuthToken();
      window.location.href = buildLoginUrl();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
