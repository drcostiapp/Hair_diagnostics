import { Link } from 'react-router-dom'

/**
 * Patient-facing placeholder. The real dashboard is T16.
 *
 * Every string here is drawn from CLINICAL_SPEC S14 approved microcopy or written
 * to its pattern — describe the need, never the deficiency. Nothing numeric, no
 * clinical internals. The T16 banned-token test will run against this route, so
 * keep it clean as it grows.
 */
export function PatientDashboard() {
  return (
    <div className="max-w-2xl text-center">
      <h1 className="font-display text-4xl leading-snug text-brand-navy">Your Skin Today</h1>

      <p className="mt-8 text-lg leading-relaxed text-brand-bronze">
        Your skin assessment is complete. Today's facial will now be composed around what your skin needs right now.
      </p>

      <div className="mx-auto mt-12 h-px w-24 bg-brand-gold" aria-hidden="true" />

      <p className="mt-12 text-sm leading-relaxed text-brand-taupe">
        This treatment was designed for your skin as it is today — not from a menu.
      </p>

      <Link
        to="/"
        className="touch-target mt-14 inline-flex items-center rounded-full border border-brand-gold px-8 text-sm tracking-wide text-brand-navy transition-colors hover:bg-brand-gold/20"
      >
        Return to the studio view
      </Link>
    </div>
  )
}
