import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockQuery = vi.fn()
vi.mock('../../db/connection.js', () => ({
  db: { query: mockQuery }
}))

describe('NotificationService', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  async function loadService(apiKey = '') {
    vi.stubEnv('MANYCHAT_API_KEY', apiKey)
    vi.stubEnv('MANYCHAT_FLOW_NAMESPACE', 'booking_confirmation')
    const mod = await import('../../services/notification.service.js')
    return mod.notificationService
  }

  it('skips when ManyChat API key is not configured', async () => {
    const svc = await loadService('')
    const consoleSpy = vi.spyOn(console, 'log')

    await svc.sendBookingConfirmation('p1', {
      bookingId: 'b1',
      scheduledAt: '2025-03-01T10:00',
      location: 'Beirut Clinic'
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('ManyChat not configured')
    )
    expect(mockQuery).not.toHaveBeenCalled()
  })

  it('skips when patient has no phone number', async () => {
    const svc = await loadService('fake-key')
    mockQuery.mockResolvedValueOnce({ rows: [{ first_name: 'John', phone: null }], rowCount: 1 })
    const consoleSpy = vi.spyOn(console, 'log')

    await svc.sendBookingConfirmation('p1', {
      bookingId: 'b1',
      scheduledAt: '2025-03-01T10:00',
      location: 'Beirut Clinic'
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('no phone number')
    )
  })

  it('skips when patient not found in DB', async () => {
    const svc = await loadService('fake-key')
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 })
    const consoleSpy = vi.spyOn(console, 'log')

    await svc.sendBookingConfirmation('missing', {
      bookingId: 'b1',
      scheduledAt: '2025-03-01T10:00',
      location: 'Beirut Clinic'
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('no phone number')
    )
  })

  it('calls ManyChat API when properly configured', async () => {
    const svc = await loadService('test-api-key')
    mockQuery.mockResolvedValueOnce({
      rows: [{ first_name: 'Ahmad', phone: '+961123456' }],
      rowCount: 1
    })

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        json: async () => ({ status: 'success', data: [{ id: 'sub-123' }] })
      })
      .mockResolvedValueOnce({
        json: async () => ({ status: 'success' })
      })
    vi.stubGlobal('fetch', mockFetch)

    await svc.sendBookingConfirmation('p1', {
      bookingId: 'b1',
      scheduledAt: '2025-03-01T10:00:00',
      location: 'Beirut Clinic'
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)

    // First call: find subscriber
    const findCall = mockFetch.mock.calls[0]
    expect(findCall[0]).toContain('findBySystemField')
    expect(JSON.parse(findCall[1].body)).toEqual({
      field: 'whatsapp_phone',
      value: '+961123456'
    })

    // Second call: send message
    const sendCall = mockFetch.mock.calls[1]
    expect(sendCall[0]).toContain('sendContent')
    const sendBody = JSON.parse(sendCall[1].body)
    expect(sendBody.subscriber_id).toBe('sub-123')
    expect(sendBody.data.content.messages[0].text).toContain('Ahmad')
  })

  it('handles ManyChat subscriber not found gracefully', async () => {
    const svc = await loadService('test-api-key')
    mockQuery.mockResolvedValueOnce({
      rows: [{ first_name: 'John', phone: '+1234' }],
      rowCount: 1
    })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      json: async () => ({ status: 'success', data: [] })
    }))

    const consoleSpy = vi.spyOn(console, 'log')
    await svc.sendBookingConfirmation('p1', {
      bookingId: 'b1',
      scheduledAt: '2025-03-01T10:00',
      location: 'Clinic'
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Subscriber not found')
    )
  })

  it('handles fetch errors gracefully', async () => {
    const svc = await loadService('test-api-key')
    mockQuery.mockResolvedValueOnce({
      rows: [{ first_name: 'John', phone: '+1234' }],
      rowCount: 1
    })

    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('Network error')))

    const consoleSpy = vi.spyOn(console, 'error')
    await svc.sendBookingConfirmation('p1', {
      bookingId: 'b1',
      scheduledAt: '2025-03-01T10:00',
      location: 'Clinic'
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to send'),
      expect.any(Error)
    )
  })
})
