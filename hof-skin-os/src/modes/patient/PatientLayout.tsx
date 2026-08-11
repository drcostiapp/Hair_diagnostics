import { Outlet } from 'react-router-dom'

/**
 * PATIENT mode per CLAUDE.md UI system: editorial, Warm Linen field, Champagne
 * Gold accents, one idea per screen, generous whitespace.
 *
 * CLAUDE.md law 7 governs everything rendered below this layout. No numeric
 * scores, no confidence values, no risk or contraindication language, no cost,
 * no internal warnings, no mention of AI. Copy comes from CLINICAL_SPEC S14 only.
 * Public naming is "Dr. Costi" / "Dr. Costi House of Facials" — never the other one.
 */
export function PatientLayout() {
  return (
    <div className="flex h-full flex-col bg-brand-linen text-brand-bronze">
      <header className="px-12 pt-10">
        <p className="font-display text-2xl leading-tight text-brand-navy">Dr. Costi</p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-brand-taupe">House of Facials</p>
      </header>

      <main className="flex flex-1 items-center justify-center px-12 pb-16">
        <Outlet />
      </main>
    </div>
  )
}
