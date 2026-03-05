import { useState, useEffect } from 'react'
import { Button } from './Button'

const DISCLAIMER_KEY = 'dr-costi-disclaimer-accepted'

export function MedicalDisclaimer() {
  const [accepted, setAccepted] = useState(true) // Default to true to prevent flash

  useEffect(() => {
    const stored = localStorage.getItem(DISCLAIMER_KEY)
    setAccepted(stored === 'true')
  }, [])

  const handleAccept = () => {
    localStorage.setItem(DISCLAIMER_KEY, 'true')
    setAccepted(true)
  }

  if (accepted) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Medical Disclaimer</h2>
        </div>

        <div className="text-sm text-gray-600 space-y-3 mb-6">
          <p>
            This AI-powered avatar provides general medical information for educational
            purposes only. It is <strong>not a substitute</strong> for professional medical
            advice, diagnosis, or treatment.
          </p>
          <p>
            Always consult with Dr. Costi or a qualified healthcare provider before
            making decisions about your health or aesthetic treatments.
          </p>
          <p>
            By continuing, you acknowledge that:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>This is an AI assistant, not a live doctor</li>
            <li>Responses are informational, not medical prescriptions</li>
            <li>You will seek in-person consultation for treatment decisions</li>
            <li>Your conversation data will be stored securely for medical records</li>
          </ul>
        </div>

        <Button variant="primary" fullWidth onClick={handleAccept}>
          I Understand & Accept
        </Button>
      </div>
    </div>
  )
}
