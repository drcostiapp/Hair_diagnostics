class NotificationService {
  private manychatApiKey: string
  private manychatFlowNamespace: string

  constructor() {
    this.manychatApiKey = process.env.MANYCHAT_API_KEY || ''
    this.manychatFlowNamespace = process.env.MANYCHAT_FLOW_NAMESPACE || 'booking_confirmation'
  }

  async sendBookingConfirmation(
    patientId: string,
    booking: { bookingId: string; scheduledAt: string; location: string }
  ) {
    if (!this.manychatApiKey) {
      console.log('[notification] ManyChat not configured, skipping notification')
      return
    }

    // Fetch patient phone from DB
    const { db } = await import('../db/connection.js')
    const result = await db.query(
      'SELECT phone, first_name FROM patients WHERE id = $1',
      [patientId]
    )

    if (result.rows.length === 0 || !result.rows[0].phone) {
      console.log('[notification] Patient has no phone number, skipping')
      return
    }

    const patient = result.rows[0]
    const appointmentDate = new Date(booking.scheduledAt).toLocaleString()

    try {
      // Find or create subscriber by phone number
      const subscriberRes = await fetch(
        'https://api.manychat.com/fb/subscriber/findBySystemField',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.manychatApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            field: 'whatsapp_phone',
            value: patient.phone
          })
        }
      )

      const subscriberData = await subscriberRes.json() as {
        status: string
        data: { id: string }[]
      }

      if (subscriberData.status !== 'success' || !subscriberData.data?.length) {
        console.log('[notification] Subscriber not found in ManyChat, skipping')
        return
      }

      const subscriberId = subscriberData.data[0].id

      // Send dynamic message via ManyChat
      await fetch(
        'https://api.manychat.com/fb/sending/sendContent',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.manychatApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subscriber_id: subscriberId,
            data: {
              version: 'v2',
              content: {
                type: 'whatsapp',
                messages: [
                  {
                    type: 'text',
                    text: `Hello ${patient.first_name}! Your appointment with Dr. Costi has been requested for ${appointmentDate} at ${booking.location}. We will confirm shortly.`
                  }
                ]
              }
            }
          })
        }
      )

      console.log(`[notification] Booking confirmation sent via ManyChat to ${patient.phone}`)
    } catch (err) {
      console.error('[notification] Failed to send via ManyChat:', err)
    }
  }
}

export const notificationService = new NotificationService()
