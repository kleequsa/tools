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

## Layout and type (2026-09-08)
- **AUTO layout** — the layout follows the window until the user picks one: phone under 640px, tablet 640–1023px, desktop/side-by-side at 1024px and up. Re-evaluated on resize and rotate.
- An explicit pick persists (localStorage) and overrides AUTO; the **AUTO** button in the layout pill hands control back and clears the saved pick.
- **Type scale** — `data-kleeq-view` on `<html>` carries the effective view (`mobile` | `tablet` | `split`/`desktop`). Tablet type runs ~25% larger than desktop, phone ~10%; display figures scale with it.
- Rules that override inline sizes (doc copy, summaries, fields) carry `!important` — inline styles otherwise win.

## Release 2026-09-08 — AUTO layout and bench type
- AUTO layout: the view follows the window (phone <640px, tablet 640–1023px, desktop 1024px+) and re-evaluates on resize/rotate. An explicit pick persists and overrides it; the AUTO button clears the saved pick.
- Tablet type ~+25% and phone ~+10%, display figures included — small captions, meta lines and body copy scale with the view instead of staying at 10–12px.
- Both calculators run one design layer: Modernist / Light / Dark / Glass themes, shared token set, glass popovers and pill controls.
- Instructions and Notes are collapsible in every view, closed by default off desktop; per-tool storage key.
- Catalogue data refreshed alongside the build.

## Release 2026-09-11 — strainer, gloss and series corrections
- STRAINER added to the detail drawer and the compare columns, per colour from the
  H-Series TDS (v12-14-23) and Elite TDS (v04/12/2022); same rule as the mixing
  calculator, so the two tools always agree.
- SHEEN now carries Cerakote's published gloss level. 45 finishes were wrong —
  H-297 Stormtrooper White read Matte and is High Gloss. Codes with no published
  level show none.
- V-Series was titled "Air cure" while its own cure text correctly says oven at 500°F.
- LISTED row removed from the drawer.
- Every coating now carries its TDS density.
