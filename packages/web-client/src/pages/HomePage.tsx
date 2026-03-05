import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'

export function HomePage() {
  const navigate = useNavigate()
  const patient = useAuthStore((s) => s.patient)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome{patient?.firstName ? `, ${patient.firstName}` : ''}
          </h1>
          <p className="text-gray-500 mt-1">How can Dr. Costi help you today?</p>
        </div>
        <button
          onClick={() => navigate('/history')}
          className="p-2 text-gray-600 hover:text-gray-900"
          aria-label="View history"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Main CTA */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl text-white font-bold">DC</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Dr. Costi AR Avatar</h2>
          <p className="text-gray-500 mt-2">
            Place Dr. Costi in your space and ask about skin concerns,
            treatments, and product recommendations.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/ar-session')}
        >
          Start AR Consultation
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-white rounded-xl p-4 shadow text-left hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">💆</div>
          <div className="font-medium text-gray-900">Treatments</div>
          <div className="text-sm text-gray-500">Browse procedures</div>
        </button>
        <button className="bg-white rounded-xl p-4 shadow text-left hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">🧴</div>
          <div className="font-medium text-gray-900">Products</div>
          <div className="text-sm text-gray-500">Skincare shop</div>
        </button>
        <button className="bg-white rounded-xl p-4 shadow text-left hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">📅</div>
          <div className="font-medium text-gray-900">Book</div>
          <div className="text-sm text-gray-500">Schedule a visit</div>
        </button>
        <button className="bg-white rounded-xl p-4 shadow text-left hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">❓</div>
          <div className="font-medium text-gray-900">FAQ</div>
          <div className="text-sm text-gray-500">Common questions</div>
        </button>
      </div>
    </div>
  )
}
