class NotificationService {
  private twilioSid: string
  private twilioToken: string
  private whatsappFrom: string

  constructor() {
    this.twilioSid = process.env.TWILIO_ACCOUNT_SID || ''
    this.twilioToken = process.env.TWILIO_AUTH_TOKEN || ''
    this.whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || ''
  }

  async sendBookingConfirmation(
    patientId: string,
    booking: { bookingId: string; scheduledAt: string; location: string }
  ) {
    if (!this.twilioSid || !this.twilioToken) {
      console.log('[notification] Twilio not configured, skipping notification')
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
    const message = `Hello ${patient.first_name}! Your appointment with Dr. Costi has been requested for ${new Date(booking.scheduledAt).toLocaleString()} at ${booking.location}. We will confirm shortly.`

    try {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioSid}/Messages.json`
      const auth = Buffer.from(`${this.twilioSid}:${this.twilioToken}`).toString('base64')

      await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: this.whatsappFrom,
          To: `whatsapp:${patient.phone}`,
          Body: message
        })
      })

      console.log(`[notification] Booking confirmation sent to ${patient.phone}`)
    } catch (err) {
      console.error('[notification] Failed to send:', err)
    }
  }
}

export const notificationService = new NotificationService()
