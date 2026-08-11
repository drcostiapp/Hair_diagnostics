import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SCREEN_ROUTES } from '@/app/routes'
import { TherapistLayout } from '@/modes/therapist/TherapistLayout'
import { ScreenStub } from '@/modes/therapist/ScreenStub'
import { PatientLayout } from '@/modes/patient/PatientLayout'
import { PatientDashboard } from '@/modes/patient/PatientDashboard'

function renderTherapistAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<TherapistLayout />}>
          {SCREEN_ROUTES.map((route) => (
            <Route
              key={route.path}
              index={route.path === ''}
              {...(route.path === '' ? {} : { path: route.path })}
              element={<ScreenStub route={route} />}
            />
          ))}
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('therapist shell', () => {
  it('renders the day sheet at the root', () => {
    renderTherapistAt('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Today's Facials")
  })

  it('has a nav entry for every Part-4 screen', () => {
    renderTherapistAt('/')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    for (const route of SCREEN_ROUTES) {
      expect(nav).toHaveTextContent(route.label)
    }
  })
})

/**
 * CLAUDE.md law 7. T16 builds the full version of this guard against the real
 * dashboard; this locks the rule in from the scaffold so the route can never
 * drift clean-to-dirty unnoticed.
 */
describe('patient mode language guard', () => {
  const BANNED = [
    /\d/, //                      numeric scores, percentages, confidence values
    /anti-?aging/i, //            use "skin longevity"
    /\bAI\b/, //                  never surface the analysis method
    /contraindicat/i,
    /\brisk\b/i,
    /\bwarning\b/i,
    /\bdramatic\b/i,
    /\bmiracle\b/i,
    /House of Beauty/i, //        CLINICAL_SPEC S15 naming lock
    /\$|€|USD|LBP/, //            cost
  ]

  it('renders no banned tokens', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/patient']}>
        <Routes>
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<PatientDashboard />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const text = container.textContent ?? ''
    expect(text.length).toBeGreaterThan(0)
    for (const pattern of BANNED) {
      expect(text, `banned token ${pattern} rendered in patient mode`).not.toMatch(pattern)
    }
  })
})
