# HoF Skin Intelligence OS — Claude Code Constitution

## What this is
A standalone, iPad-first clinical operating system for a luxury facial studio in Beirut:
consultation → standardized photography → AI-assisted skin observation → therapist
validation → deterministic safety screening → scored protocol generation → guided
treatment execution → documentation. Full rationale: docs/ARCHITECTURE.md.
Implementation numbers (rules, weights, seeds, fixtures): docs/CLINICAL_SPEC.md.
Schema: docs/DATA_MODEL.md. Those three files are the source of truth; when code and
spec disagree, the spec wins.

## Stack (fixed — do not substitute)
- React 18 + TypeScript (strict) + Vite + vite-plugin-pwa + Tailwind CSS + React Router
- Supabase (Postgres, Auth, Storage, RLS) via @supabase/supabase-js v2; migrations via supabase CLI in /supabase/migrations
- Dexie (IndexedDB) for offline cache + outbound event queue
- Cloudflare Worker in /worker (wrangler): AI proxy to Anthropic API, PDF generation. The Anthropic key lives ONLY here.
- Tests: Vitest. Engine packages must ship unit tests against CLINICAL_SPEC fixtures.

## Architecture laws (non-negotiable)
1. Four engines, four modules: /src/engines/{rules,scoring,workflow} + /worker (AI). Data flows Rules → Scoring → AI → Workflow. AI never expands the eligible set; it ranks and explains within it.
2. Hard rules are deterministic data (rule_version rows, JSON-logic). No safety logic hardcoded in UI. Effects: EXCLUDE / RESTRICT / REQUIRE_MD / ESCALATE.
3. Excluded (RED) items are never scored, never displayed as selectable.
4. treatment session events, inventory movements, and audit are APPEND-ONLY. No UPDATE/DELETE paths in app code; enforce with RLS + triggers.
5. Clinical content is versioned and immutable: product_safety_card, rule, treatment_module, protocol get *_version rows; sessions reference the exact version ids used.
6. All engine weights/thresholds load from scoring_config rows — never literals in code. Defaults per CLINICAL_SPEC.
7. Patient Mode routes (/patient/*) may never render: numeric scores, confidence values, contraindication or risk language, cost, or internal warnings. Bands map to phrases via CLINICAL_SPEC S14 only.
8. RLS on every table, policies per CLINICAL_SPEC S2. UI hiding is not security.
9. Secrets: browser gets only VITE_SUPABASE_URL + anon key. Anthropic + service keys exist only in the Worker.
10. Offline-first for treatment execution: active visit bundle, safety cards, and rules snapshot cached in Dexie; session events queue locally and sync idempotently (client-generated UUIDs).

## UI system
Two visual modes. THERAPIST: dense, calm-clinical, Deep Teal-Navy #0E2A37 chrome, high information hierarchy, large touch targets, minimal typing (chips/defaults/previous answers). PATIENT: editorial, Warm Linen #DBCCBB field, Champagne Gold #D3B57C accents, Warm Taupe #B7A188 / Deep Bronze #84735F supports, one idea per screen, generous whitespace. Fonts: Optima for headlines (fallback: 'Optima','Segoe UI',serif-adjacent stack), Raleway (Google Fonts) for body. Tokens in tailwind.config as brand.* colors. iPad landscape 1194×834 is the design target; must remain usable at 1024×768.

## Definition of done — every task
- Acceptance check for the task passes and you have demonstrated it.
- `npm run build` clean, `npm test` green, TypeScript strict no errors.
- Loading, empty, and error states exist for any new screen.
- BUILD_LOG.md gets an appended entry: date, task id, what shipped, deviations, follow-ups (follow-ups also into BACKLOG.md).
- Propose a single conventional commit message.

## Session protocol
At session start: read the tail of BUILD_LOG.md, restate the named task in one line,
list the files you expect to touch, then build. Only the named task. If genuinely
blocked on a missing decision, stop and ask the operator — never guess on clinical
values, and never invent rules, products, device settings, or medical language.
