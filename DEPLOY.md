# Deploy — KLEEQ Tools hub (site root)

Repo: kleequsa/tools · branch: main · live: https://tools.kleeq.com/

## Steps (Claude Code)
1. Copy these root files into the repo root: index.html · kleeq-tokens.css · kleeq-star-camo.svg · vendor/ (support.js, modernist.css, modernist-bundle.js) · wrangler.jsonc · .assetsignore
2. Commit:
   ```
   git add index.html kleeq-tokens.css kleeq-star-camo.svg vendor wrangler.jsonc .assetsignore
   git commit -m "root: KLEEQ Tools hub landing" -m "- Tools hub at / with Glass default theme + Dark/Light/Modernist
   - Star camo pattern over the header gradient at 5%
   - Links to /mixing-calculator/; finish-catalogue/ reserved (not yet deployed)
   - Vendored support.js and Modernist css/bundle under vendor/"
   git push origin main
   ```
3. Deploy: `npx wrangler deploy` from the repo root (one Worker serves / and /mixing-calculator/; retire the separate kleeq-mixing-calculator Worker or keep it and route only the root here).
4. Smoke test: / loads the hub, theme switcher works, "Open the calculator" goes to /mixing-calculator/.
