# /supabase

Migrations land in `migrations/` in **T02**, implementing every table, enum, FK and
append-only constraint in `docs/DATA_MODEL.md` with the RLS policies from
CLINICAL_SPEC S2.

Seed data arrives with its owning task:

| Seed | Task | Source |
|---|---|---|
| Rules R1–R25 | T12 | CLINICAL_SPEC S8 |
| scoring_config defaults | T13 | CLINICAL_SPEC S9, S10 |
| treatment_module M01–M30 | T14 | CLINICAL_SPEC S11 |
| photo_qc thresholds | T09 | CLINICAL_SPEC S7 |
| consultation_node graph | T06 | CLINICAL_SPEC S4 |

Two projects, EU region: `hof-staging` and `hof-prod`. Never point a dev machine at prod.
