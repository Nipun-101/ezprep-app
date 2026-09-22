import axios from 'axios';
import { getAuthToken, removeAuthToken } from '@/lib/auth';
import { buildLoginUrl } from '@/lib/safeRedirect';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      removeAuthToken();
      window.location.href = buildLoginUrl();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
