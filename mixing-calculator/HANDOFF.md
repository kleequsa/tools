# Handoff: KLEEQ Mixing Calculator

## Changelog — 2026-09-06 (v2, "Lite")
- Four themes on `<html data-kleeq-theme>`: `glass` (default; iOS-style rounded translucent surfaces, system font stack, floating bottom bar and product bottom sheet on phones), `dark`, `light`, `modernist` (site design system: light ground, red accent, Archivo, 2px rules). Theme is not persisted.
- Real phones (< 640px) always get the phone layout regardless of the saved layout toggle; layout re-evaluates on resize.
- Removed the reverse ("from total") mode and its toggle. The mix always runs coating → catalyst + total.
- Removed the job sheet, log, name/notes fields and CSV export from this build. Remaining actions: COPY, SHARE (native share sheet → clipboard fallback; disabled until a mix exists), RESET, rounding 0.1 / 0.01 g.
- Sticky Add Catalyst / Total bar on phones when the mix scrolls out of view; stacks label over figure under 400px.
- Instructions / Notes / Source / About are four independent accordions (+ / −), collapsed by default on phones, always open in two columns elsewhere; titles and body in the muted label grey.
- Dropdown chevrons are 16px Lucide chevrons; Cerakote product link uses the Lucide external-link icon; thumbnails fill their rounded frames.
- Search: 16px on phones (no iOS zoom), placeholder "Code or colour name"; a name search no longer shows the "no match" error while suggestions exist.
- New KLEEQ logo (mark + wordmark + "Driven by Precision", viewBox 0 0 720 280) in `kleeq-logo.svg` and inline in the header, linked to https://www.kleeq.com.
- Resume / Recent chips restore the last mix and the last five coatings from localStorage (`kleeq-mix-last`, `kleeq-mix-recent`, `kleeq-mix-dp`, `kleeq-mix-docs`).

## Overview
A bench tool for Cerakote applicators. The user picks a coating from the full Cerakote catalogue, enters the weight of coating in the cup, chooses a mixing ratio, and reads back the catalyst to add and the total weight. Mixes can be named and filed to a job sheet (with totals and CSV export) and a longer-lived log.

## About the design files
`index.html` in this folder is a **design reference created in HTML** — a working prototype showing the intended look and behaviour. It runs as a static page today and can be deployed as-is. If it is rebuilt in the target codebase's framework (React, Vue, Svelte, etc.), recreate it from this document and the reference file using the codebase's established patterns.

## Fidelity
**High-fidelity.** Colours, type, spacing and interactions are final. Recreate pixel-for-pixel.

## Screens / Views
One page, single view, with a switchable layout width and a light/dark theme.

### Header
- Kicker `KLEEQ / MIXING CALCULATOR` — IBM Plex Mono 10px, letter-spacing 0.14em, gold-soft.
- Right: two segmented icon groups (1px line border, 34×28px buttons): theme (sun / moon) and layout (side-by-side / stacked / tablet / phone). Active button: `--k-field` background, gold-soft icon.
- H1 `Cerakote catalyst calculator` — Archivo 800, font-stretch 115%, `clamp(22px, 2.2vw, 30px)`, line-height 1.05.
- Page max-width: 1180px (split/stacked), 1024px (tablet), 430px (phone). Horizontal padding `clamp(14px, 2.4vw, 32px)`.

### Numbered steps
Every step heading: mono number (`01`…`07`, IBM Plex Mono 18px, letter-spacing 0.1em, label colour) + Archivo 800 stretch 112% 18px uppercase, letter-spacing 0.04em. Steps are separated by a 1px `--k-rule` top border with 16px padding-top. Vertical gap between steps 32px; between major blocks 24px.

**01 The coating**
- Search input (type-ahead) + product dropdown button side by side (44% / 56% in split; stacked in stacked view). Both `.s-in` style: `--k-field` bg, 1px `--k-line` border, mono 14px, min-height 51px, padding 8px 12px.
- Suggestions panel: absolute under the input, `--k-panel` bg, 1px `--k-label` border, max-height 240px, up to 8 rows. Row: mono 11px 600 gold-soft code, 12px name (ellipsis), 35px thumbnail right-aligned. Highlighted row bg `--k-field`. Arrow keys / Enter / Escape supported.
- Dropdown list: grouped by series prefix (H, E, F, FIR, HIR, C, V, S, SG, MC, FX, DFL, LR, P) with sticky group headers (`--k-sticky` bg, mono 10px gold-soft label, count right). Max-height 320px. Closes on outside click.
- Selected product panel: 112px thumbnail (click → zoom overlay), code (mono 11px 600 gold-soft), name (Archivo 800 21px), `STRAINER` + mesh label, link `CERAKOTE PRODUCT PAGE ↗` (mono 8px, underlined, opens new tab). Before a pick: `PICK A PRODUCT TO START` in gold-soft mono 11px.

**02 Coating weight · G** (gated until a product is matched: opacity 0.35, `inert`, controls disabled)
- Rounding control in the heading row: scale icon + `0.1` / `0.01` buttons (24px high). Active same as segments.
- Weight input `.s-big`: Archivo 800 stretch 112% 38px, padding 12px 16px, `type=number`, wheel disabled (blurs on wheel). Until a weight > 0 is entered the border is gold with `inset 0 0 0 1px` gold shadow.
- Quick weights `30 G / 60 G / 100 G / 240 G` + `✕` clear, in one bordered grid, 26px min-height.

**03 The ratio** (gated)
- Three preset buttons in a row (`12:1 HIGHER GLOSS`, `18:1 RECOMMENDED`, `24:1 LOWER GLOSS`), each two-line: Archivo 800 17px ratio + 9px mono gloss label, centred. Adjacent borders overlap by 1px. Fourth cell: custom number input (min 4, max 40, step 0.5) `:1` + `CUSTOM`.
- Below: `18:1 BY VOLUME = 23.78:1 ON THE SCALE` (mono 10px, label colour).
- Catalyst note line: `USE THE H-SERIES CATALYST` (mono 10px gold-soft) — `never the Elite catalyst.` (11px label). Text varies by series (see Logic).
- If the product is single-component (C, V, MC, FX) or unverified, steps 03–04 are replaced by a bordered notice: `NO CATALYST` / `Single component` / body copy, or `CHECK THE TDS` / `Not verified` with gold border.

**04 The mix** (gated; opacity 0.4 until weight > 0)
- Row 1: `CATALYST TO ADD` (mono 11px 0.14em gold-soft) … value (Archivo 800 `clamp(34px, 3.8vw, 50px)`, gold-soft), padding-bottom 16px.
- Row 2: solid gold block, `--k-on-gold` text, padding 16px: `TOTAL IN THE CUP` … value.

**05 Name it and file it** (gated)
- Job name input (flex 0 1 190px), Notes input (flex 1 1 240px), buttons `ADD TO JOB SHEET`, `COPY THE LINE` (→ `COPIED` for 1.6 s), `RESET`. Buttons `.s-seg`: 35px, padding 0 14px, mono 12px 0.08em, 1px line border, no fill.

**06 The job sheet · N mixes** (`<details>`, hidden when empty)
- Summary row with `OPEN` hint. Description + `EXPORT CSV` / `CLEAR` buttons.
- Table (min-width 700px, horizontal scroll): columns `104px | 2fr | 66px | 1fr 1fr 1fr | 34px` — WHEN (dd/mm hh:mm), FINISH (title, job name, note), RATIO, COATING, CATALYST, TOTAL, ×. Header and footer rows on `--k-panel`; footer is JOB TOTAL.

**07 The log · N entries** (`<details>`, hidden when empty)
- Same pattern, columns `118px | 2fr | 60px | 1fr 1fr`; WHEN is `yyyy-mm-dd hh:mm`. `EXPORT CSV` / `CLEAR LOG`.

**Instructions / Notes** — two-column auto-fit grid (min 300px), 18px Archivo headings, 12px lists with 8px gaps. Copy verbatim in the reference file.

**Source** and **Built by KLEEQ** — 12px paragraphs, max-width 78ch.

**Zoom overlay** — fixed, `rgba(12,11,10,0.92)`, image max 76vh, code · name + `TAP ANYWHERE TO CLOSE`. Any click closes.

## Interactions & behaviour
- Product match: exact code, then code prefix, over the catalogue. Typing updates suggestions live; picking a product resets ratio to 18:1.
- Search matches code (with or without hyphen) or name; prefix matches sort first; max 8.
- Gating: regions with `data-gate` get `inert` and disabled controls until a product is matched.
- Theme: `data-kleeq-theme="light"` on `<html>` swaps the token set. Default dark.
- Layout preference persists to localStorage `kleeq.mixing.onecol` (values `split|stack|tablet|mobile`); absent means AUTO — the view follows the window (<640 phone, <1024 tablet, else split).
- Focus rings: 2px gold outline, offset 1–4px. Hover on segments: ink text, label border. No transitions.
- CSV export: columns `Logged at, Job, Notes, Code, Name, Ratio, Coating (g), Catalyst (g), Total (g)`; job sheet appends a `JOB TOTAL` row. Filename `kleeq-job-sheet-YYYY-MM-DD.csv` / `kleeq-mix-log-YYYY-MM-DD.csv`.
- Copy the line: `H-146 Graphite Black — 23.78:1 — coating 100.00 g, catalyst 4.21 g, total 104.21 g`.
- Reset clears code, weight, ratio → 18:1.

## State
`data` (catalogue JSON), `code`, `ratio`, `preset` (`r12|r18|r24|custom`), `weight`, `dp` (1|2), `sugOpen`, `sugAt`, `listOpen`, `zoom`, `view`, `theme`, `jobName`, `jobNote`, `jobs[]`, `log[]`, `copied`.

Job record: `{ id, code, name, hex, ratio, coating, catalyst, total, jobName, note, at }`.

## Logic
- **Density constant** `SG = 1.321`. Effective ratio `r = ratio × SG`. `catalyst = weight / r`; `total = weight + catalyst`. Format with `dp` decimals + ` g`.
- **Series** = code prefix before `-`. Catalyst class: needs (`H E F FIR HIR DFL SG`), none (`C V MC FX`), otherwise check.
- **Catalyst copy** by series: E → `USE THE ELITE CATALYST / the H-Series catalyst will not cure it.`; H → `USE THE H-SERIES CATALYST / never the Elite catalyst.`; FIR → `CHECK THE FIR-SERIES TDS / its own code, its own TDS.`; F → `USE THE F-SERIES CATALYST / two-part, oven cure, its own catalyst only.`; HIR → H-Series catalyst; DFL → `USE THE F-100 CATALYST`; SG → F-Series catalyst; else `CHECK THE CATALYST`.
- **Strainer mesh**: read per code from `finishes[].mesh`, lifted verbatim from the Cerakote H-Series TDS (v 12-14-23) — it is a published per-colour value, not a sheen rule. E-Series values come from the Elite TDS (v 04/12/2022) — 325 for every code except E-240 Carbon Grey (150). Fallback for codes with no published per-colour value: C-Series and V-Series → 100 (series application guides); untinted H metallics → 100; everything else (F, FIR, HIR, DFL, SG, MC, FX, LR, P, S) → `CHECK THE BOTTLE`, since Cerakote publishes those per colour. Labels: coarse `100 MESH`, fine `150 MESH`, finest `325 MESH`.
- Data: `kleeq-finishes.json` → `catalogue[]` (`code, name, url, thumb`) merged with `finishes[]` (`code, name, sheen, hex, wall, mesh`) where `wall` is `signature` or `palette`.

## Design tokens
Dark (default):
`--k-bg #1a1918 · --k-panel #141312 · --k-sticky #1f1e1c · --k-field #2a2724 · --k-line #3d3934 · --k-rule #57534d · --k-label #8d867c · --k-copy #c9c3b9 · --k-ink #ddd8d0 · --k-gold #c9992f · --k-gold-soft #e2bd6d · --k-on-gold #17150f · --k-warn #c9272e`

Light:
`--k-bg #f3f2f2 · --k-panel #ffffff · --k-sticky #e7e4e0 · --k-field #ffffff · --k-line #9c948a · --k-rule #4a453f · --k-label #5a544c · --k-copy #2b2825 · --k-ink #141312 · --k-gold #8a6612 · --k-gold-soft #6b5010 · --k-on-gold #ffffff · --k-warn #9e1b24`

Type: Archivo (variable, wdth 62–125, wght 400–900) for headings/values, 800 weight, stretch 112–115%; IBM Plex Mono 400/500/600 for labels, codes, numerics. Google Fonts.
Spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48 px. Radius: 0 everywhere. Borders 1px. No shadows except the gold inset on the empty weight field.

## Assets
- Product thumbnails: remote, from `images.nicindustries.com` URLs in `kleeq-finishes.json`.
- Icons: inline SVG (Lucide-style, 2px stroke): sun, moon, columns, rows, tablet, smartphone, scale.
- No local images.

## Files
- `index.html` — the reference app
- `kleeq-finishes.json` — data
- `kleeq-finish-render.js`, `kleeq-tokens.css` — support
- `vendor/` — runtime and design-system files the reference needs to run

## Layout and type (2026-09-08)
- **AUTO layout** — the layout follows the window until the user picks one: phone under 640px, tablet 640–1023px, desktop/side-by-side at 1024px and up. Re-evaluated on resize and rotate.
- An explicit pick persists (localStorage) and overrides AUTO; the **AUTO** button in the layout pill hands control back and clears the saved pick.
- **Type scale** — `data-kleeq-view` on `<html>` carries the effective view (`mobile` | `tablet` | `split`/`desktop`). Tablet type runs ~25% larger than desktop, phone ~10%; display figures scale with it.
- Rules that override inline sizes (doc copy, summaries, fields) carry `!important` — inline styles otherwise win.
