import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../services/api.service', () => ({
  api: {
    login: vi.fn(),
    getProfile: vi.fn()
  }
}))

import { useAuthStore } from '../../stores/authStore'
import { api } from '../../services/api.service'

const mockLogin = vi.mocked(api.login)
const mockGetProfile = vi.mocked(api.getProfile)

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useAuthStore.setState({
      isAuthenticated: false,
      patient: null,
      accessToken: null,
      isLoading: false,
      error: null
    })
  })

  it('starts unauthenticated', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.patient).toBeNull()
    expect(state.accessToken).toBeNull()
  })

  it('login success sets authenticated state', async () => {
    mockLogin.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          accessToken: 'tok-123',
          refreshToken: 'ref-456',
          patient: { id: 'p1', email: 'test@test.com', firstName: 'John' }
        }
      }
    } as any)

    const result = await useAuthStore.getState().login({ email: 'test@test.com', password: 'pass' })

    expect(result).toBe(true)
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.accessToken).toBe('tok-123')
    expect(state.patient?.id).toBe('p1')
    expect(localStorage.getItem('access_token')).toBe('tok-123')
    expect(localStorage.getItem('refresh_token')).toBe('ref-456')
  })

  it('login failure sets error', async () => {
    mockLogin.mockResolvedValueOnce({
      data: { success: false }
    } as any)

    const result = await useAuthStore.getState().login({ email: 'bad@test.com', password: 'wrong' })

    expect(result).toBe(false)
    expect(useAuthStore.getState().error).toBe('Login failed')
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('login network error sets error from response', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { error: { message: 'Invalid credentials' } } }
    })

    const result = await useAuthStore.getState().login({ email: 'a@b.com', password: 'x' })

    expect(result).toBe(false)
    expect(useAuthStore.getState().error).toBe('Invalid credentials')
  })

  it('logout clears state and tokens', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      patient: { id: 'p1' } as any,
      accessToken: 'tok'
    })
    localStorage.setItem('access_token', 'tok')
    localStorage.setItem('refresh_token', 'ref')

    useAuthStore.getState().logout()

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().patient).toBeNull()
    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })

  it('loadProfile updates patient data', async () => {
    useAuthStore.setState({ accessToken: 'tok-123' })
    mockGetProfile.mockResolvedValueOnce({
      data: {
        success: true,
        data: { id: 'p1', email: 'test@test.com', firstName: 'John', lastName: 'Doe' }
      }
    } as any)

    await useAuthStore.getState().loadProfile()

    expect(useAuthStore.getState().patient?.email).toBe('test@test.com')
  })

  it('loadProfile does nothing without accessToken', async () => {
    useAuthStore.setState({ accessToken: null })

    await useAuthStore.getState().loadProfile()

    expect(mockGetProfile).not.toHaveBeenCalled()
  })

  it('loadProfile calls logout on error', async () => {
    useAuthStore.setState({ accessToken: 'expired', isAuthenticated: true })
    mockGetProfile.mockRejectedValueOnce(new Error('401'))

    await useAuthStore.getState().loadProfile()

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
})
