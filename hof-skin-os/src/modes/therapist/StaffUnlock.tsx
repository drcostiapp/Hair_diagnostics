import { useNavigate } from 'react-router-dom'
import { isSupabaseConfigured } from '@/lib/supabase'

/**
 * Placeholder unlock screen. Real Supabase auth, the staff role lookup, the
 * 45-second inactivity blur and the PIN relock all land in T03 — this only
 * proves the shell routes through an unlock surface first.
 */
export function StaffUnlock() {
  const navigate = useNavigate()

  return (
    <div className="flex h-full items-center justify-center bg-brand-navy px-6 text-white">
      <div className="w-full max-w-sm text-center">
        <p className="font-display text-3xl leading-tight">Dr. Costi</p>
        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-brand-gold">House of Facials</p>

        <div className="mt-10 rounded-lg border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm text-white/60">Staff sign-in arrives in T03.</p>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="touch-target mt-5 w-full rounded-md bg-brand-gold px-5 font-medium text-brand-navy hover:bg-brand-gold/90"
          >
            Continue to today's facials
          </button>
        </div>

        {!isSupabaseConfigured ? (
          <p className="mt-6 text-xs leading-relaxed text-white/40">
            Supabase is not configured. Copy <code className="text-white/60">.env.example</code> to{' '}
            <code className="text-white/60">.env.local</code> and add your project URL and anon key.
          </p>
        ) : null}
      </div>
    </div>
  )
}
