# BUILD_LOG

Append one entry per completed task: date · task id · what shipped · deviations · follow-ups.
Newest entries at the bottom.

---

## 2026-08-11 · S3 — Repo constitution and specs

Shipped `CLAUDE.md`, `docs/CLINICAL_SPEC.md`, `docs/DATA_MODEL.md` verbatim from the
playbook Part 3, plus empty `BUILD_LOG.md` / `BACKLOG.md`, `.env.example` and
`.gitignore` (`.env*` ignored).

**Deviations**
- The project lives in the `hof-skin-os/` subdirectory of the existing
  `drcostiapp/hair_diagnostics` repo, not a fresh `hof-skin-os` repo. GitHub access
  for this session is scoped to that one repo, and it already contains an unrelated
  product (the Next.js "Dr. Costi Experience Simulator"). A subdirectory leaves the
  simulator untouched and keeps the move reversible.
- `docs/ARCHITECTURE.md` is a **placeholder stub** — the real v1.2 file was not
  supplied. It lists the tasks blocked without it. See BACKLOG.

## 2026-08-11 · T01 — App scaffold with brand system and PWA shell

Vite + React 18 + TypeScript (strict) app with Tailwind carrying the S15 brand
tokens, vite-plugin-pwa, React Router, and a lazily-created Supabase client that
reads only `VITE_*` env.

- Folder layout per CLAUDE.md: `/src/{app,components,engines/{rules,scoring,workflow},modes/{therapist,patient},lib,offline}`, `/worker`, `/supabase`.
- THERAPIST shell: navy chrome, pathway + administration nav, stub route for every
  Part-4 screen (`src/app/routes.ts` is the manifest, each entry naming its task).
- PATIENT route `/patient` in the linen/gold editorial theme, copy drawn from S14
  approved microcopy only.
- `/unlock` staff placeholder (real auth is T03), `ErrorBoundary`, and shared
  loading/empty/error primitives for later screens to reuse.
- Scripts: `dev`, `build`, `test`, `lint`.

**Acceptance — verified**
- `npm run dev` renders the therapist shell; `/patient` renders the editorial theme.
  Confirmed in headless Chromium at 1194x834 and at the 1024x768 floor — no
  horizontal overflow, no failed requests, no page errors on any route.
- `npm run build` clean · `npm test` 3 passed · `npm run lint` 0 warnings ·
  TypeScript strict, no errors.

**Deviations**
- Vite 8 / Vitest 4 / vite-plugin-pwa 1.3 instead of the versions first installed.
  The originals carried a critical (vitest) and a high (vite) advisory fixable only
  by major bump. CLAUDE.md pins React 18 but not the tooling majors, so this stays
  in-spec. `npm audit` reports 0 vulnerabilities.
- Tailwind held at v3 deliberately: CLAUDE.md specifies "tokens in tailwind.config",
  which v4's CSS-first config would break.

**Follow-ups** (also in BACKLOG.md)
- Real ARCHITECTURE.md v1.2 needed before T04, T05, T06, T09, T15, T16, T17.
- PWA icons are flat navy placeholders — need real brand artwork before T24.
- Raleway is not yet self-hosted; body text falls back to the system stack.
- Nav role-gating is advisory metadata only until T03.
