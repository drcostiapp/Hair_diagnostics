import { create } from 'zustand'

interface UIStore {
  isARMode: boolean
  isLoading: boolean
  showDisclaimer: boolean
  language: 'en' | 'ar'
  theme: 'light' | 'dark'

  setARMode: (active: boolean) => void
  setLoading: (loading: boolean) => void
  setLanguage: (lang: 'en' | 'ar') => void
  setTheme: (theme: 'light' | 'dark') => void
  dismissDisclaimer: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isARMode: false,
  isLoading: false,
  showDisclaimer: true,
  language: 'en',
  theme: 'light',

  setARMode: (active) => set({ isARMode: active }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLanguage: (lang) => set({ language: lang }),
  setTheme: (theme) => set({ theme }),
  dismissDisclaimer: () => set({ showDisclaimer: false })
}))
