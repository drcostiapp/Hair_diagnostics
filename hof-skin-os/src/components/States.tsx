import type { ReactNode } from 'react'

/**
 * The three states every screen owes per CLAUDE.md definition of done.
 * Therapist chrome by default; patient mode passes its own tone via className.
 */

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 p-8 text-sm text-white/60" role="status" aria-live="polite">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-brand-gold"
        aria-hidden="true"
      />
      {label}
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 p-8 text-center">
      <p className="font-display text-lg text-white/80">{title}</p>
      {hint ? <p className="mt-2 text-sm text-white/50">{hint}</p> : null}
    </div>
  )
}

export function ErrorState({ title, detail, onRetry }: { title: string; detail?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-red-400/40 bg-red-950/30 p-6" role="alert">
      <p className="font-display text-lg text-red-200">{title}</p>
      {detail ? <p className="mt-2 text-sm text-red-200/70">{detail}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="touch-target mt-4 rounded-md border border-red-300/40 px-4 text-sm text-red-100 hover:bg-red-900/40"
        >
          Try again
        </button>
      ) : null}
    </div>
  )
}

export function Panel({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">{children}</div>
}
