import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SCREEN_ROUTES } from '@/app/routes'
import { TherapistLayout } from '@/modes/therapist/TherapistLayout'
import { ScreenStub } from '@/modes/therapist/ScreenStub'
import { StaffUnlock } from '@/modes/therapist/StaffUnlock'
import { PatientLayout } from '@/modes/patient/PatientLayout'
import { PatientDashboard } from '@/modes/patient/PatientDashboard'

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/unlock" element={<StaffUnlock />} />

          {/* THERAPIST mode — navy chrome, clinical density. Role guards land in T03. */}
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

          {/* PATIENT mode — editorial linen/gold. CLAUDE.md law 7 applies to this subtree. */}
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<PatientDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
