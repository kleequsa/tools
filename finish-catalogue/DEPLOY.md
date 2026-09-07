# Deploy — Finish Catalogue (public Lite build)

Repo: kleequsa/tools · branch: main · live: https://tools.kleeq.com/finish-catalogue/

Built from `KLEEQ Finish Catalogue Lite.dc.html`. Differences from the internal catalogue: no Collection row (ALL/Signature/Palette/Core or custom collections), no per-swatch collection buttons, no COLLECTION line in the drawer, no Measured filter chip.

## Steps (Claude Code)
1. Copy this folder into the repo: `finish-catalogue/index.html`, `kleeq-finishes.json`, `kleeq-finish-render.js`, `kleeq-tokens.css`, `vendor/` (support.js, modernist.css, modernist-bundle.js — same files as root `vendor/`).
2. Commit:
   ```
   git add finish-catalogue
   git commit -m "finish-catalogue: public Lite build" -m "- Collections and Measured filter removed for public release
   - Data refreshed (S-140 High Temp White, NEW 2026)
   - MIX IT -> ../mixing-calculator/?code=, live feed at /api/catalogue/cerakote-live.json"
   git push origin main
   ```
3. Deploy: `npx wrangler deploy` from the repo root.
4. Smoke test: /finish-catalogue/ loads, back arrow goes to /, MIX IT opens the calculator with the code prefilled, theme switcher works, no Collection row visible.
