# Deploy KLEEQ Tools

Production is Cloudflare **Pages**, project `kleeq-tools`, at https://tools.kleeq.com.

Cloudflare's Git integration deploys `main` with these settings:

- Build command: `node scripts/build-pages.mjs`
- Build output: `dist`
- Root directory: repository root

The build copies the complete site and `_worker.js`, excluding repository tooling,
documentation, local secrets, and archives. Merge update bundles into the repository;
they do not contain every asset and must not replace the entire site directory.

For a manual deployment after authenticating Wrangler:

```sh
node scripts/build-pages.mjs
npx wrangler pages deploy dist --project-name kleeq-tools --branch main
```

Use `wrangler pages deploy` for this Pages project. `wrangler deploy` targets a
separate Workers service.

## Production secrets

Configure these as encrypted Pages secrets, then deploy again:

- `CAMO_PASSWORD`
- `MIXLAB_PASSWORD`
- `PATTERN_PASSWORD`
- `SPACE_PASSWORD`
- `RESEND_API_KEY`

For example:

```sh
npx wrangler pages secret put RESEND_API_KEY --project-name kleeq-tools
```

The worker preserves each tool's password form and 30-day session cookie.
Changing a tool password invalidates its existing sessions.

## License requests

`POST /api/license` sends through Resend from `KLEEQ Tools <tools@kleeq.com>`
to `connect@kleeq.com`, with the requester's email as Reply-To. The `kleeq.com`
domain must be verified in Resend and the key must allow sending for that domain.
The handler validates the request origin and email, and escapes HTML content.

After deployment, open a Premium pattern in Pattern Studio, choose **Request
license**, and send a clearly labeled test. Success displays **Thanks. Your
request has been sent to connect@kleeq.com**. Confirm the corresponding delivery
in Resend. A mail-client fallback message does not confirm server delivery.

Pattern exports are PNG only, and watermark defaults are off.
