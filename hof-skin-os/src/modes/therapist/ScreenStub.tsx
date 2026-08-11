import { EmptyState, Panel } from '@/components/States'
import type { ScreenRoute } from '@/app/routes'

/**
 * Placeholder for a Part-4 screen not yet built. It names the task that fills it
 * in so a build session lands in the right file without hunting.
 */
export function ScreenStub({ route }: { route: ScreenRoute }) {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-brand-gold">Task {route.task}</p>
        <h1 className="mt-1 font-display text-3xl">{route.label}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">{route.summary}</p>
      </header>

      <Panel>
        <EmptyState
          title="Not built yet"
          hint={`This screen ships in ${route.task}. Run that task's prompt from the build playbook.`}
        />
      </Panel>
    </div>
  )
}
