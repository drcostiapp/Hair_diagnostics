# /worker — Cloudflare Worker

Built in **T08**. Two jobs:

1. `POST /analyze` — AI proxy to the Anthropic Messages API, returning exactly the
   CLINICAL_SPEC S6 JSON shape.
2. PDF rendering for signed treatment notes (**T19**).

## Secrets — never committed

Per CLAUDE.md law 9 these exist *only* here, set via wrangler:

```bash
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_KEY
```

The browser bundle must never contain any of them. T08's acceptance check greps
`dist/` to prove it.
