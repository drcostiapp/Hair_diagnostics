import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Patient, AuthCredentials } from 'shared-types'
import { api } from '../services/api.service'

interface AuthStore {
  isAuthenticated: boolean
  patient: Patient | null
  accessToken: string | null
  isLoading: boolean
  error: string | null
  login: (credentials: AuthCredentials) => Promise<boolean>
  logout: () => void
  loadProfile: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      patient: null,
      accessToken: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.login(credentials)
          if (data.success && data.data) {
            const { accessToken, refreshToken, patient } = data.data as any
            localStorage.setItem('access_token', accessToken)
            localStorage.setItem('refresh_token', refreshToken)
            set({
              isAuthenticated: true,
              patient,
              accessToken,
              isLoading: false
            })
            return true
          }
          set({ error: 'Login failed', isLoading: false })
          return false
        } catch (err: any) {
          set({
            error: err.response?.data?.error?.message || 'Login failed',
            isLoading: false
          })
          return false
        }
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({
          isAuthenticated: false,
          patient: null,
          accessToken: null
        })
      },

      loadProfile: async () => {
        if (!get().accessToken) return
        try {
          const { data } = await api.getProfile()
          if (data.success && data.data) {
            set({ patient: data.data as Patient })
          }
        } catch {
          // Token may be expired
          get().logout()
        }
      }
    }),
    {
      name: 'dr-costi-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        patient: state.patient,
        accessToken: state.accessToken
      })
    }
  )
)
