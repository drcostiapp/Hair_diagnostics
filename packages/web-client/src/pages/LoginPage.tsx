import { LoginForm } from '../components/auth/LoginForm'

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dr. Costi</h1>
          <p className="text-white/80">AR Medical Consultation</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
