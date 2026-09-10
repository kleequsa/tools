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

## Release 2026-09-09 — bench workflow
- Selecting a colour focuses the weight field in the same task as the tap (raises the keyboard on iOS) and scrolls it under the header on phone and tablet.
- Clear (×) inside the search field; larger clear on the weight field.
- START OVER in step 01 replaces the old RESET in the action row — one reset, not two.
- Mobile vertical spacing trimmed a further 10%; accordion chevrons 30% larger.
- Theme and layout pills exposed in the header again (the settings menu is gone).

## Release 2026-09-09b — entry handoff
- Typing in the search field completes on a unique match (full code, full colour name, or a unique prefix) and hands the cursor to the weight field; ambiguous entries keep the suggestion list open.
- Weight field uses a numeric keypad on phone and tablet (text + inputMode=decimal, so iPadOS shows the keypad); desktop keeps the number spinner.
- Weight clear (×) is hidden when the field is empty.

## Release 2026-09-09c — keypad on pick
- Every pick path (browse list, recent chips, suggestion rows, phone dropdown, Enter on a suggestion) focuses the weight field inside the tap, so iOS and iPadOS raise the numeric keypad.
- Suggestion rows commit on pointerdown rather than mousedown.
