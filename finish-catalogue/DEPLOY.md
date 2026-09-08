# Deploy — Finish Catalogue (public Lite build)

Repo: kleequsa/tools · branch: main · live: https://tools.kleeq.com/finish-catalogue/

Built from `KLEEQ Finish Catalogue Lite.dc.html`. Differences from the internal catalogue: no Collection row (ALL/Signature/Palette/Core or custom collections), no per-swatch collection buttons, no COLLECTION line in the drawer, no Measured filter chip.

## This build

- Series headers now lead with the cure schedule in bold (temperature and oven time), then mix ratio and catalyst, flush left after the finish count. Series titles use the gold accent.
- Cure schedules corrected against Cerakote data sheets: H-Series 121°C (250°F) / 2 h or 149°C (300°F) / 1 h after a 15 min flash; Elite 149°C (300°F) / 1 h (E-100 Blackout 2 h); V-Series 260°C (500°F) / 1 h oven, previously listed as air cure; C-Series tack free 45–60 min, ship at 24 h, full cure 5 days. Series with no published schedule read "per TDS" rather than a guessed number.
- Laser-optimized flags aligned to Cerakote's published laser colour list (36 codes) plus H-267 and E-100, whose own product pages state "Optimized for Laser Imaging". H-375 Black Gold was flagged in error and is now clear.

## Steps (Claude Code)
1. Copy this folder into the repo: `finish-catalogue/index.html`, `kleeq-finishes.json`, `kleeq-finish-render.js`, `kleeq-tokens.css`, `vendor/` (support.js, modernist.css, modernist-bundle.js — same files as root `vendor/`).
2. Commit:
   ```
   git add finish-catalogue
   git commit -m "finish-catalogue: cure schedules and laser flags" -m "- Series headers lead with bold cure schedule, then ratio and catalyst
   - Cure data corrected against Cerakote TDS (Elite, V-Series, C-Series, H-Series)
   - Laser-optimized flags matched to Cerakote's published laser colour list
   - Series titles in gold accent"
   git push origin main
   ```
3. Deploy: `npx wrangler deploy` from the repo root.
4. Smoke test: /finish-catalogue/ loads, back arrow goes to /, MIX IT opens the calculator with the code prefilled, theme switcher works, no Collection row visible, series headers show the bold cure schedule, ★ LASER count reads 38.
