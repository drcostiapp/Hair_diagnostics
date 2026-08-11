# BACKLOG

Out-of-scope ideas and follow-ups surfaced during build sessions. Nothing here gets
built without going through the architecture document first.

## Deliberately deferred per Architecture §20
- Smart rooms
- VR
- AI rule-learning
- Patient-owned app
- Multi-location

## Open follow-ups

- **[blocker] Real `docs/ARCHITECTURE.md` v1.2.** Currently a stub. Blocks T04, T05,
  T06, T09, T15, T16, T17, T26, T28, T32, T35 — every task citing a section number.
- **Brand PWA icons.** `public/icon-192.png` / `icon-512.png` are flat navy
  placeholders. Real artwork needed before T24 production deploy.
- **Self-host Raleway.** Body font falls back to the system stack. Self-hosting (not
  a Google Fonts CDN call) matters for the offline-first requirement in law 10.
- **Optima licensing.** Ships on Apple devices, so the iPad target is fine, but any
  non-Apple surface falls back. Confirm before non-iPad use.
- **Nav role-gating.** `minRole` in `src/app/routes.ts` is advisory metadata; T03
  must enforce it, and law 8 means the DB must too.
