type EventName =
  | 'session_started'
  | 'session_ended'
  | 'ar_entered'
  | 'ar_exited'
  | 'avatar_placed'
  | 'message_sent'
  | 'voice_input_used'
  | 'product_viewed'
  | 'product_clicked'
  | 'booking_started'
  | 'booking_completed'
  | 'disclaimer_accepted'
  | 'error_occurred'

interface AnalyticsEvent {
  name: EventName
  properties?: Record<string, unknown>
  timestamp: string
}

class AnalyticsService {
  private queue: AnalyticsEvent[] = []
  private flushInterval: ReturnType<typeof setInterval> | null = null

  constructor() {
    // Flush events every 30 seconds
    this.flushInterval = setInterval(() => this.flush(), 30000)

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush())
    }
  }

  track(name: EventName, properties?: Record<string, unknown>) {
    if (import.meta.env.VITE_ENABLE_ANALYTICS !== 'true') return

    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: new Date().toISOString()
    }

    this.queue.push(event)

    // Auto-flush if queue is getting large
    if (this.queue.length >= 10) {
      this.flush()
    }
  }

  private async flush() {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
        keepalive: true
      })
    } catch {
      // Put events back in queue on failure
      this.queue.unshift(...events)
    }
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flush()
  }
}

export const analytics = new AnalyticsService()
