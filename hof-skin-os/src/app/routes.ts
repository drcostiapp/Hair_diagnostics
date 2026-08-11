/**
 * Route manifest for the Part-4 screen set. Every entry is a stub until its task
 * lands; `task` is the playbook task id that fills it in, so a session can find
 * its screen without guessing. Nav order is the clinical pathway order (S1).
 */

export interface ScreenRoute {
  /** Path relative to the therapist shell. */
  path: string
  label: string
  /** Playbook task that implements this screen. */
  task: string
  /** One line describing what lands here. Rendered on the stub. */
  summary: string
  /** Which nav group it belongs to. */
  group: 'pathway' | 'admin'
  /** Minimum role that may see it — enforced for real in T03, advisory here. */
  minRole?: 'admin' | 'medical_director'
}

export const VISIT_PARAM = ':visitId'

export const SCREEN_ROUTES: readonly ScreenRoute[] = [
  {
    path: '',
    label: "Today's Facials",
    task: 'T04',
    summary: 'Day sheet, appointment cards, front-desk add, and check-in into the visit state machine.',
    group: 'pathway',
  },
  {
    path: 'patients',
    label: 'Patients',
    task: 'T05',
    summary: 'Registration, granular consent capture, and the patient profile timeline.',
    group: 'pathway',
  },
  {
    path: `visit/${VISIT_PARAM}/consultation`,
    label: 'Consultation',
    task: 'T06',
    summary: 'Adaptive question graph with conditional children, plus the returning-patient delta screen.',
    group: 'pathway',
  },
  {
    path: `visit/${VISIT_PARAM}/photography`,
    label: 'Photography',
    task: 'T09',
    summary: 'Guided three-pose capture with ghost overlay and deterministic on-device QC (S7).',
    group: 'pathway',
  },
  {
    path: `visit/${VISIT_PARAM}/observations`,
    label: 'Observations',
    task: 'T10',
    summary: 'QC-passed poses to the Worker, with the manual assessment form as the failure-safe path.',
    group: 'pathway',
  },
  {
    path: `visit/${VISIT_PARAM}/validation`,
    label: 'Validation',
    task: 'T11',
    summary: 'Therapist confirms, modifies, rejects or adds findings; merges to the single skin_assessment.',
    group: 'pathway',
  },
  {
    path: `visit/${VISIT_PARAM}/safety`,
    label: 'Safety Screen',
    task: 'T12',
    summary: 'Deterministic rule board — R1–R25 evaluated over intake, assessment, cards and devices.',
    group: 'pathway',
  },
  {
    path: `visit/${VISIT_PARAM}/protocol`,
    label: 'Protocol Review',
    task: 'T15',
    summary: 'Generated steps, intensity dial vs budget, Why-this-step, swaps, and the S16 approval gate.',
    group: 'pathway',
  },
  {
    path: `visit/${VISIT_PARAM}/treatment`,
    label: 'Treatment Mode',
    task: 'T17',
    summary: 'One step per screen, timers, and append-only session events written to Dexie first.',
    group: 'pathway',
  },
  {
    path: `visit/${VISIT_PARAM}/post`,
    label: 'Post-Assessment',
    task: 'T19',
    summary: 'After-photos, auto-drafted treatment note, signature, and the immutable signed record.',
    group: 'pathway',
  },
  {
    path: `visit/${VISIT_PARAM}/close`,
    label: 'Close-Out',
    task: 'T20',
    summary: 'Rule-derived homecare cards, next-visit recommendation, and one-tap rebooking.',
    group: 'pathway',
  },
  {
    path: 'admin/safety-cards',
    label: 'Safety Cards',
    task: 'T07',
    summary: 'Workbook importer with the S18 column contract and a per-row validation report.',
    group: 'admin',
    minRole: 'admin',
  },
  {
    path: 'admin/overrides',
    label: 'Overrides & Escalations',
    task: 'T22',
    summary: "Medical-director console: the week's overrides, escalations, and the audit trail.",
    group: 'admin',
    minRole: 'medical_director',
  },
  {
    path: 'admin/console',
    label: 'Admin Console',
    task: 'T28',
    summary: 'Today, clinical mix, inventory and team boards.',
    group: 'admin',
    minRole: 'admin',
  },
]
