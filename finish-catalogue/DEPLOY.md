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

## Release 2026-09-11 (rev 3) — strainer re-sourced from the live Cerakote site

Replaces the TDS-derived strainer values with a SKU-by-SKU read of the "Strainer
Size (mesh)" field on each product's live Cerakote page (website audit snapshot,
10 September 2026, all 266 catalogue SKUs).

- 96 SKUs gained a published value they never had — the whole C, V, F, MC, HIR,
  FIR, LR, S, DFL and P ranges, which previously read "check the bottle".
- E-250 Titanium was wrong: 150 mesh, not 325.
- All series fallbacks removed. The audit shows C-Series spans 100, 150 and 325,
  and V-Series spans 100 and 150, so no series rule can be right — every value is
  now per SKU or explicitly absent.
- SG-100 and SG-200 read NO STRAINER: Cerakote publishes "None" for Super Grip.
- C-299, P-202 and the twelve FX additives read NOT PUBLISHED — those pages carry
  no strainer field, and nothing is inferred.
- Fifteen older or specialty pages list a mesh but no SE part number; those show
  the mesh with "part not shown" rather than a part number we can't source.

## Release 2026-09-11 (rev 4) — Product Technical Data audit, all six fields

Source: live cerakote.com Product Technical Data block, SKU by SKU, read 10 September
2026 across all 266 catalogue SKUs. Replaces TDS-derived values wherever the two
disagree — the website is the source of truth for this project.

### Density — now the site's value, per SKU (feeds the catalyst math)
- 100 SKUs gained a published density: all of C, V, F, MC, HIR, FIR, LR, S, DFL and P.
  None of these compute on the assumed 1.42 any more.
- 22 of our TDS densities were wrong. Largest: H-189 Noveske Bazooka Green 1.33 → 1.46
  (catalyst was 8.9% heavy), H-244 Bazooka Pink 1.52 → 1.42 (7.0% light), H-151 Satin
  Aluminum 1.37 → 1.42, H-170 M17 Coyote Tan 1.42 → 1.47.
- The clears sit far below the H-Series band and shift the most: MC-5100 at 0.88 and
  P-202 at 0.83 need roughly 7 g of catalyst per 100 g at 18:1, against 4.21 g for
  H-146. On the old assumed 1.42 they were reading about 40% light.
- 12 SKUs publish no density (the twelve FX additives).

### Gloss — site wording, per SKU
- 238 SKUs carry the site's gloss level and gloss units (measured at 60°).
- 28 publish no usable level and now show no gloss line: the twelve FX additives,
  P-202, the six MC clears (which publish two levels, blasted and un-blasted steel),
  V-166 and V-169 (their gloss field carries a thickness range), and eight H codes
  whose pages label the level itself NOT PUBLISHED — H-227, H-259, H-294, H-318,
  H-331, H-332, H-360 among them.

### Mix ratio and catalyst part — not published anywhere
- No audited page publishes either field. Our per-series ratios and catalyst parts stay
  TDS-sourced and are now marked as such in the data; a per-SKU exception cannot be
  ruled in or out from the website.

### Cure schedule and film thickness — stored, not yet shown
- Cure verbatim for 254 SKUs, film thickness for 254. No UI yet.
- Seven pages publish two different thicknesses. Both values are kept and the row is
  flagged: H-224, H-242, H-297, H-300, H-301, H-317, H-353.

### The nine added SKUs do not exist
- H-308, H-313, H-325, H-333, H-356, H-20180, E-220, E-260 and E-320 all 404 on
  cerakote.com. They are not missing from our catalogue; they are discontinued.

## Release 2026-09-17 (rev 5) — step 01 merged, card re-laid

- Search and browse are one field: type to filter, or tap the chevron on the right
  to open the full grouped list. The clear × sits beside it when there's text.
- Typing no longer moves the cursor to the weight field mid-entry. Enter or a list
  pick resolves the code and moves on; Enter with nothing highlighted still accepts
  a fully typed code or name.
- Coating card: code and name on one large line, the strainer size and micron on
  its own semibold line beneath, then gloss · Cerakote link.
- Catalogue card names are all caps.

## Release 2026-09-17 (rev 6) — TOOLS link
- Header back link now reads TOOLS with a grid icon, bordered like the pills, and
  points to https://tools.kleeq.com.
- Strainer line on the coating card shows mesh only (micron removed).
