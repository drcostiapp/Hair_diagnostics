import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/Button'

type AuthMode = 'email' | 'phone'

export function LoginForm() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()
  const [mode, setMode] = useState<AuthMode>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const credentials = mode === 'email'
      ? { email, password }
      : { phone, password }

    const success = await login(credentials)
    if (success) {
      navigate('/')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setMode('email')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'email' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setMode('phone')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'phone' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'
          }`}
        >
          Phone
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'email' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-500"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+961 XX XXX XXX"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        Don't have an account?{' '}
        <button className="text-primary-500 font-medium hover:underline">
          Register
        </button>
      </p>
    </div>
  )
}
