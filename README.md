# KLEEQ Tools

The complete site for https://tools.kleeq.com includes the Mixing Calculator,
Finish Catalog, Camo Studio, Mix Lab, Pattern Studio, and KLEEQ Space.

Cloudflare Pages serves the site through `_worker.js`, which preserves password
gates for private tools and sends Pattern Studio license requests through Resend.
Pattern exports are PNG only, with watermark defaults off.

Run `node scripts/build-pages.mjs` to prepare the deployable `dist/` directory.
Cloudflare's Git integration builds and deploys `main`. See [DEPLOY.md](DEPLOY.md)
for the Pages deployment command, encrypted secrets, and verification steps.
