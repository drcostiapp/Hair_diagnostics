export const APP_NAME = 'Dr. Costi AR Avatar'
export const APP_VERSION = '0.1.0'

// Avatar defaults
export const AVATAR_DEFAULT_HEIGHT = 1.5 // meters
export const AVATAR_PLANE_WIDTH = 0.5
export const AVATAR_PLANE_HEIGHT = 0.7

// Audio settings
export const AUDIO_SAMPLE_RATE = 44100
export const VOICE_DETECTION_THRESHOLD = 0.1
export const SILENCE_TIMEOUT_MS = 1500

// API
export const API_TIMEOUT_MS = 30000
export const MAX_MESSAGE_LENGTH = 2000

// Session limits
export const MAX_SESSION_DURATION_MS = 30 * 60 * 1000 // 30 minutes
export const MAX_MESSAGES_PER_SESSION = 100

// Supported languages
export const LANGUAGES = {
  en: 'English',
  ar: 'العربية'
} as const

// Medical disclaimer version (increment to force re-acceptance)
export const DISCLAIMER_VERSION = '1.0'
