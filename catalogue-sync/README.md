# kleeq-catalogue-sync

Cloudflare Worker that checks cerakote.com every Monday 09:00 UTC for new coating codes and publishes
`cerakote-live.json`. The Finish Catalogue fetches it and shows new codes with a NEW badge.

## Deploy (Claude Code)
1. `npx wrangler kv namespace create CATALOGUE` → paste the id into wrangler.jsonc.
2. `npx wrangler secret put RUN_KEY` (any long string; lets you trigger a run by hand).
3. `npx wrangler deploy`, then run once: `curl "https://kleeq-catalogue-sync.<acct>.workers.dev/run?key=<RUN_KEY>"`.
4. Check the response: `count` should be roughly 260+ and `source` should read `cerakote.com`. If `count` is 0, Cerakote has moved its product URLs — update PRODUCT_RE / SOURCES in src/index.js.
5. Route the worker at `tools.kleeq.com/api/catalogue/*` (or set LIVE_URL in the catalogue page to the workers.dev URL).

The page never writes to kleeq-finishes.json; new codes appear from the live feed until the studio measures them and adds them properly.
