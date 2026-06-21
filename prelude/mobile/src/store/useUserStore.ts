import { create } from 'zustand';
import type { User } from '../types';

interface UserState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  setAuth: (token: string, user: User | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  token: null,
  user: null,
  hydrated: true,
  setAuth: (token, user) => set({ token, user }),
  setUser: (user) => set({ user }),
  logout: () => set({ token: null, user: null }),
}));
