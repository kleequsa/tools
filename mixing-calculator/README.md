# KLEEQ Mixing Calculator

Cerakote catalyst calculator for the bench: search the catalogue by code or colour name, enter the coating weight, pick a ratio, read the catalyst and total. Job sheet and log persist in the browser.

## Run it

Static files, no build step. Serve the folder over HTTP (the app fetches `kleeq-finishes.json`, so `file://` will not work):

```
npx serve .
# or
python3 -m http.server
```

Open `index.html`. Works as-is on GitHub Pages, Netlify, Cloudflare Pages or any static host.

## Files

| File | Role |
| --- | --- |
| `index.html` | The app — markup, styles and logic in one file |
| `kleeq-finishes.json` | Cerakote catalogue: codes, names, series, sheen, strainer overrides, product URLs, thumbnail URLs |
| `kleeq-finish-render.js` | Swatch renderer (loaded lazily, optional) |
| `kleeq-tokens.css` | KLEEQ brand tokens |
| `vendor/support.js` | Component runtime that renders `index.html` |
| `vendor/modernist.css`, `vendor/modernist-bundle.js` | Design system stylesheet and component bundle |

## About the code

`index.html` is a design prototype exported as a working app: the UI is declared in the `<x-dc>` block with `{{ }}` bindings, and the behaviour lives in the `Component` class at the bottom (`class Component extends DCLogic`). It runs fine in production as a static page. If it is later rebuilt in a framework, see `HANDOFF.md` for the full spec.

## Calculation

Cerakote's published ratios (12:1, 18:1, 24:1) are by volume. Scale weight is derived with a density factor of **1.321**, fitted to Cerakote's own calculator (100 g @ 18:1 → 4.21 g; 100 g @ 24:1 → 3.15 g; 10 g @ 12:1 → 0.63 g).

```
catalyst = coating / (ratio × 1.321)
total    = coating + catalyst
```

Rounding is user-selectable (0.1 g or 0.01 g) to match the scale in use.

## Storage keys (localStorage)

- `kleeq.mixing.jobs` — current job sheet
- `kleeq.mixing.log` — history, survives clearing the job sheet (capped at 300)
- `kleeq.mixing.onecol` — layout preference

## Disclaimer

KLEEQ is an applicator, not a manufacturer. Not affiliated with or endorsed by Cerakote or NIC Industries. Always check the current TDS on the bottle.
