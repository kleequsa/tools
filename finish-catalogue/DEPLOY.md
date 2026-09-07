# Deploy — Finish Catalogue

Repo: kleequsa/tools · branch: main · live: https://tools.kleeq.com/finish-catalogue/

Static assets served by the root Worker (repo-root wrangler.jsonc, assets directory "./"). No per-folder wrangler needed.

## Steps (Claude Code)
1. Copy this folder to `finish-catalogue/` in the repo root. Also replace root `index.html` (hub, layout fix).
2. Commit:
   ```
   git add finish-catalogue index.html
   git commit -m "finish-catalogue: Cerakote finish catalogue at /finish-catalogue/" \
     -m "- Search, category/series/sort filters, Show Only chips (laser, measured, in stock, trending, new)
   - Finish detail with compare (3), find similar, copy hex, MIX IT → /mixing-calculator/?code=
   - NEW badges from the weekly catalogue-sync feed at /api/catalogue/cerakote-live.json
   - Hub: Coming Soon grid fix, Swatch Export preview art"
   git push origin main
   ```
3. Deploy: `npx wrangler deploy` from the repo root (or let the Cloudflare build run on push).
4. Live feed: deploy `catalogue-sync/` per its README and route it at `tools.kleeq.com/api/catalogue/*`. Until then the page silently skips the NEW badges (fetch fails quietly).
5. Smoke test on a phone: search "moss", open a finish, add two to compare, tap MIX IT, confirm the calculator opens with the code prefilled.

## Files
index.html · kleeq-finishes.json · kleeq-finish-render.js · kleeq-tokens.css · vendor/support.js · vendor/modernist.css · vendor/modernist-bundle.js
