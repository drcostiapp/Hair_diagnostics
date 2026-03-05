/** Authentication and user types */

export interface Patient {
  id: string
  email?: string
  phone?: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  language: 'en' | 'ar'
  location?: PatientLocation
  createdAt: string
  updatedAt: string
  lastVisit?: string
  consentGiven: boolean
  consentDate?: string
}

export interface PatientLocation {
  city: string
  country: string
  clinic?: string
}

export interface AuthCredentials {
  email?: string
  phone?: string
  password?: string
  otp?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  patient: Patient
}

export interface JWTPayload {
  sub: string
  email?: string
  phone?: string
  iat: number
  exp: number
}

export interface AuthState {
  isAuthenticated: boolean
  patient: Patient | null
  accessToken: string | null
  isLoading: boolean
  error: string | null
}
