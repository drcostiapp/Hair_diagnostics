import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { SCREEN_ROUTES, VISIT_PARAM } from '@/app/routes'

/**
 * THERAPIST mode chrome per CLAUDE.md UI system: Deep Teal-Navy #0E2A37, dense,
 * calm-clinical, large touch targets. Role gating of these nav items is T03.
 */

// Stub screens still need a concrete path to link to. Real visit ids arrive with T04.
const SAMPLE_VISIT = 'demo-visit'

function toHref(path: string): string {
  const resolved = path.replace(VISIT_PARAM, SAMPLE_VISIT)
  return resolved === '' ? '/' : `/${resolved}`
}

export function TherapistLayout() {
  const navigate = useNavigate()
  const pathway = SCREEN_ROUTES.filter((r) => r.group === 'pathway')
  const admin = SCREEN_ROUTES.filter((r) => r.group === 'admin')

  return (
    <div className="flex h-full bg-brand-navy text-white">
      <nav className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-black/20" aria-label="Main">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="font-display text-lg leading-tight">Dr. Costi</p>
          <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">House of Facials</p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavGroup title="Pathway">
            {pathway.map((route) => (
              <NavItem key={route.path} to={toHref(route.path)} label={route.label} task={route.task} />
            ))}
          </NavGroup>

          <NavGroup title="Administration">
            {admin.map((route) => (
              <NavItem key={route.path} to={toHref(route.path)} label={route.label} task={route.task} />
            ))}
          </NavGroup>
        </div>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => navigate('/patient')}
            className="touch-target w-full rounded-md border border-brand-gold/40 px-4 text-sm text-brand-gold hover:bg-brand-gold/10"
          >
            Hand iPad to guest
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

function NavGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="px-3 pb-2 text-[11px] uppercase tracking-[0.16em] text-white/35">{title}</p>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  )
}

function NavItem({ to, label, task }: { to: string; label: string; task: string }) {
  return (
    <li>
      <NavLink
        to={to}
        end={to === '/'}
        className={({ isActive }) =>
          [
            'touch-target flex items-center justify-between gap-2 rounded-md px-3 text-sm transition-colors',
            isActive ? 'bg-brand-gold/15 text-brand-gold' : 'text-white/70 hover:bg-white/5 hover:text-white',
          ].join(' ')
        }
      >
        <span>{label}</span>
        <span className="text-[10px] tabular-nums text-white/25">{task}</span>
      </NavLink>
    </li>
  )
}
