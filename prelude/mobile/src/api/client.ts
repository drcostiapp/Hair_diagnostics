import axios from 'axios';
import { useUserStore } from '../store/useUserStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT from the user store as a Bearer token on every request.
apiClient.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

export { API_URL };
