# Deploy — Mixing Calculator v2 (Lite)

Repo: kleequsa/tools · branch: main · live: https://tools.kleeq.com/mixing-calculator/

## Steps (Claude Code)
1. Copy this folder over `mixing-calculator/` in the repo (replace all files; keep `wrangler.jsonc` and `.assetsignore`).
2. Commit:
   ```
   git add mixing-calculator
   git commit -m "mixing-calculator: v2 Lite — Glass default theme, phone-first fixes, new KLEEQ logo" \
     -m "- Four themes: glass (default), dark, light, modernist
   - Phones always get the phone layout; sticky catalyst/total bar; product bottom sheet
   - Removed reverse mode, job sheet, log and CSV; actions are Copy / Share / Reset + rounding
   - Independent +/- accordions for Instructions, Notes, Source, About
   - Lucide chevrons and external-link icon; thumbnails fill rounded frames
   - New KLEEQ logo (kleeq-logo.svg) linked to kleeq.com
   - Vendored support.js and Modernist css/bundle under vendor/"
   git push origin main
   ```
3. Deploy: `npx wrangler deploy` from `mixing-calculator/` (or let the connected Cloudflare Workers build run on push).
4. Smoke test on a phone: search "moss", pick a finish, enter 100 g, confirm sticky bar, Share sheet, and theme switcher.

## Files in this update
index.html · kleeq-finishes.json · kleeq-finish-render.js · kleeq-tokens.css · kleeq-logo.svg · vendor/support.js · vendor/modernist.css · vendor/modernist-bundle.js · HANDOFF.md (changelog) · README.md

## Release 2026-09-08 — AUTO layout and bench type
- AUTO layout: the view follows the window (phone <640px, tablet 640–1023px, desktop 1024px+) and re-evaluates on resize/rotate. An explicit pick persists and overrides it; the AUTO button clears the saved pick.
- Tablet type ~+25% and phone ~+10%, display figures included — small captions, meta lines and body copy scale with the view instead of staying at 10–12px.
- Both calculators run one design layer: Modernist / Light / Dark / Glass themes, shared token set, glass popovers and pill controls.
- Instructions and Notes are collapsible in every view, closed by default off desktop; per-tool storage key.
- Catalogue data refreshed alongside the build.
