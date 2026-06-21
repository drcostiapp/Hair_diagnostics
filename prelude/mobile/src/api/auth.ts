import { apiClient } from './client';
import type { User } from '../types';

export interface AuthResponse {
  token?: string;
  user?: User;
}

// Register a new account. In the MVP this is a phone + otp flow; any code works.
export async function register(phone: string, otp: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', { phone, otp });
  return data ?? {};
}

// Log in (phone + otp). Any code works in the MVP backend.
export async function login(phone: string, otp: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { phone, otp });
  return data ?? {};
}

// Fetch the currently authenticated user.
export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<{ user?: User } | User>('/auth/me');
  // Backend may return { user } or the user directly.
  const maybe = data as { user?: User };
  return (maybe?.user ?? (data as User)) ?? ({ id: 'me' } as User);
}
