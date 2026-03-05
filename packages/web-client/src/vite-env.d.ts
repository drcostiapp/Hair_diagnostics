/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_HEYGEN_API_KEY: string
  readonly VITE_HEYGEN_AVATAR_ID: string
  readonly VITE_HEYGEN_VOICE_ID: string
  readonly VITE_ENABLE_AR: string
  readonly VITE_ENABLE_ARABIC: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
