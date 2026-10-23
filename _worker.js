// KLEEQ tools — edge gate.
// Everything is served from static assets except paths listed in PROTECTED,
// which show a password-only sign-in page. A correct password sets a cookie
// scoped to that tool for 30 days. Set each password once:
//     npx wrangler pages secret put CAMO_PASSWORD --project-name kleeq-tools
//     npx wrangler pages secret put MIXLAB_PASSWORD --project-name kleeq-tools
//     npx wrangler pages secret put SPACE_PASSWORD --project-name kleeq-tools
//     npx wrangler pages secret put PATTERN_PASSWORD --project-name kleeq-tools
// Changing a password signs everyone out of that tool.
//
// POST /api/license  — license requests and export-gate emails from Pattern Studio.
// Sent to INBOX via Resend (https://resend.com). Set once:
//     npx wrangler pages secret put RESEND_API_KEY --project-name kleeq-tools
// FROM must be on a domain verified in Resend (e.g. tools@kleeq.com).
// Only same-site requests are accepted; until the key is set the page falls back to mailto:.
const INBOX = 'connect@kleeq.com';
const FROM = 'KLEEQ Tools <tools@kleeq.com>';
const PROTECTED = [
  { prefix: '/camo-studio', pass: 'CAMO_PASSWORD', cookie: 'kq_camo', name: 'Camo Studio' },
  { prefix: '/mix-lab', pass: 'MIXLAB_PASSWORD', cookie: 'kq_mixlab', name: 'Mix Lab' },
  { prefix: '/space', pass: 'SPACE_PASSWORD', cookie: 'kq_space', name: 'KLEEQ Space' },
  { prefix: '/pattern-studio', pass: 'PATTERN_PASSWORD', cookie: 'kq_pattern', name: 'Pattern Studio' }
];
// Files inside a protected tool that stay public, e.g. the photo on the hub's Space card.
const PUBLIC = ['/space/photos/DE61C6D6-88D0-4763-A605-501CBD2090A2_1_201_a.jpeg'];
const MAX_AGE = 60 * 60 * 24 * 30;

const same = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
};

const token = async (rule, pass) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rule.prefix + ':' + pass));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

const readCookie = (request, name) => {
  const m = (request.headers.get('Cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return m ? m[1] : '';
};

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const oneLine = (s, n) => String(s ?? '').replace(/[\r\n]+/g, ' ').slice(0, n);
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

async function handleLicense(request, env, url) {
  if (request.method !== 'POST') return json({ error: 'POST only' }, 405);
  // Browsers always send Origin on a POST fetch; anything else is not our page.
  if (request.headers.get('Origin') !== url.origin) return json({ error: 'forbidden' }, 403);
  if (!env.RESEND_API_KEY) return json({ error: 'RESEND_API_KEY not configured' }, 503);
  let b; try { b = await request.json(); } catch (e) { return json({ error: 'bad json' }, 400); }
  const email = String(b.email || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return json({ error: 'bad email' }, 400);
  const gate = b.kind === 'gate';
  const subject = gate ? 'Pattern Studio export: ' + email : 'KLEEQ Premium license — ' + oneLine(b.pattern, 120);
  const rows = gate
    ? [['Email', email], ['Page', b.page]]
    : [['Pattern', b.pattern], ['Name', b.name], ['Company', b.company], ['Email', email], ['Intended use', b.use], ['Note', b.note], ['Page', b.page]];
  const text = rows.map(([k, v]) => k + ': ' + String(v ?? '').slice(0, 2000)).join('\n');
  const html = '<table style="font:14px/1.5 sans-serif">' + rows.map(([k, v]) => '<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">' + k + '</td><td style="padding:4px 0;white-space:pre-wrap">' + esc(String(v ?? '').slice(0, 2000)) + '</td></tr>').join('') + '</table>';
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [INBOX], reply_to: email, subject, text, html })
  });
  if (!r.ok) { console.error('Resend', r.status, (await r.text()).slice(0, 300)); return json({ error: 'mail failed' }, 502); }
  return json({ ok: true });
}

const page = (rule, wrong) => new Response(`<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${rule.name.startsWith('KLEEQ') ? rule.name : 'KLEEQ ' + rule.name}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#1a1918;color:#f2efe9;font:15px/1.55 Archivo,system-ui,sans-serif}
  form{width:100%;max-width:340px;display:grid;gap:14px;padding:36px 28px;background:#2a2724;border:1px solid #302d29;border-radius:10px}
  .lab{font:500 11px 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#8d867c}
  h1{margin:0 0 8px;font-weight:800;font-stretch:115%;font-size:26px;line-height:1}
  input{width:100%;padding:12px 14px;font:inherit;color:#f2efe9;background:#1a1918;border:1px solid #3d3934;border-radius:6px}
  input:focus{outline:2px solid #c9992f;outline-offset:1px;border-color:#c9992f}
  button{padding:12px 14px;font:inherit;font-weight:700;color:#141312;background:#c9992f;border:0;border-radius:6px;cursor:pointer}
  button:hover{background:#e2bd6d}
  .err{margin:0;color:#e2bd6d;font-size:13px}
</style></head><body>
<form method="post">
  <span class="lab">KLEEQ · Private</span>
  <h1>${rule.name}</h1>
  <label class="lab" for="pw">Password</label>
  <input id="pw" name="password" type="password" autocomplete="current-password" autofocus required>
  ${wrong ? '<p class="err" role="alert">That password didn’t work. Try again.</p>' : ''}
  <button type="submit">Open ${rule.name}</button>
</form>
</body></html>`, {
  status: 401,
  headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/license') return handleLicense(request, env, url);
    const rule = !PUBLIC.includes(url.pathname) && PROTECTED.find((r) => url.pathname === r.prefix || url.pathname.startsWith(r.prefix + '/'));
    if (rule) {
      const want = env[rule.pass];
      if (!want) return new Response('Password not configured: run wrangler pages secret put ' + rule.pass, { status: 503 });
      const good = await token(rule, want);
      if (request.method === 'POST') {
        let pass = '';
        try { pass = String((await request.formData()).get('password') || ''); } catch (e) {}
        if (!same(pass, want)) return page(rule, true);
        return new Response(null, {
          status: 303,
          headers: {
            'Location': url.pathname + url.search,
            'Set-Cookie': `${rule.cookie}=${good}; Path=${rule.prefix}; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
            'Cache-Control': 'no-store'
          }
        });
      }
      if (!same(readCookie(request, rule.cookie), good)) return page(rule, false);
    }
    const res = await env.ASSETS.fetch(request);
    if (rule) { const r = new Response(res.body, res); r.headers.set('Cache-Control', 'private, no-store'); r.headers.set('X-Robots-Tag', 'noindex'); return r; }
    return res;
  }
};
