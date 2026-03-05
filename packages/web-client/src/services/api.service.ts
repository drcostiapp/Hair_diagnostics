import axios from 'axios'
import type { ApiResponse } from 'shared-types'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor: attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
            { refreshToken }
          )
          localStorage.setItem('access_token', data.data.accessToken)
          error.config.headers.Authorization = `Bearer ${data.data.accessToken}`
          return apiClient.request(error.config)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// API methods
export const api = {
  // Auth
  login: (credentials: { email?: string; phone?: string; password?: string }) =>
    apiClient.post<ApiResponse>('/auth/login', credentials),

  register: (data: { email?: string; phone?: string; password: string; firstName: string; lastName: string }) =>
    apiClient.post<ApiResponse>('/auth/register', data),

  // Avatar sessions
  createAvatarSession: (params?: { language?: string; quality?: string }) =>
    apiClient.post<ApiResponse>('/avatar/session', params),

  endAvatarSession: (sessionId: string) =>
    apiClient.post<ApiResponse>(`/avatar/session/${sessionId}/end`),

  // Conversations
  getConversations: (page?: number) =>
    apiClient.get<ApiResponse>('/conversations', { params: { page } }),

  getConversation: (id: string) =>
    apiClient.get<ApiResponse>(`/conversations/${id}`),

  // Patients
  getProfile: () =>
    apiClient.get<ApiResponse>('/patients/me'),

  updateProfile: (data: Record<string, unknown>) =>
    apiClient.patch<ApiResponse>('/patients/me', data),

  // Products
  getProducts: (category?: string) =>
    apiClient.get<ApiResponse>('/products', { params: { category } }),

  getProductRecommendations: (conversationId: string) =>
    apiClient.get<ApiResponse>(`/products/recommendations/${conversationId}`),

  // Bookings
  createBooking: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse>('/bookings', data),

  getBookings: () =>
    apiClient.get<ApiResponse>('/bookings'),

  // Knowledge base
  searchKnowledge: (query: string) =>
    apiClient.get<ApiResponse>('/knowledge/search', { params: { q: query } })
}

export default apiClient
