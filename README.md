# KLEEQ tools — publish bundle

Upload this whole folder as one site. Both tools ship together and share the
favicons, tokens and vendor scripts at the root.

    /                       landing page (index.html)
    /mixing-calculator/     Cerakote catalyst calculator
    /finish-catalogue/      266-colour finish reference
    /camo-studio/           2–5 colour camo set builder (password gated)
    /vendor/                support.js + Modernist css/bundle
    wrangler.jsonc          Cloudflare Pages/Workers config

Static hosting only — no build step. Drag the folder into Cloudflare Pages,
Netlify or Vercel, or run `npx wrangler deploy` from inside it.

Dev-only material (.github, catalogue-sync, scripts) is deliberately excluded.

## Password on Camo Studio

`_worker.js` runs in front of the assets and asks for HTTP Basic Auth on
`/camo-studio/`. Set the password once per deployment:

    npx wrangler secret put CAMO_PASSWORD
    npx wrangler secret put CAMO_USER      # optional; any username passes if unset

Deploy with `npx wrangler deploy`. On the Cloudflare dashboard the same values go
under Settings → Variables and Secrets. To gate another tool, add a row to
`PROTECTED` in `_worker.js` and the path to `run_worker_first` in `wrangler.jsonc`.
