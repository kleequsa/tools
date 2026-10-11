// KLEEQ tools — edge gate.
// Everything is served from static assets except paths listed in PROTECTED,
// which ask for a password. Set the secret once:
//     npx wrangler secret put CAMO_PASSWORD
// A correct password sets a signed, HttpOnly session cookie that lasts TTL_H
// hours, so the password is asked for once per browser rather than per request.
const PROTECTED = [{ prefix: '/camo-studio', pass: 'CAMO_PASSWORD', cookie: 'kleeq_camo', title: 'KLEEQ Camo Studio' }];
const TTL_H = 12;

const enc = new TextEncoder();

// Constant-time compare, so a wrong password cannot be narrowed by timing.
const same = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
};

const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// The cookie is <expiry>.<hmac of expiry>, signed with the password itself —
// so changing the password invalidates every outstanding session.
async function sign(value, secret) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(value)));
}

async function mintToken(secret) {
  const exp = String(Date.now() + TTL_H * 3600 * 1000);
  return exp + '.' + await sign(exp, secret);
}

async function tokenValid(token, secret) {
  if (typeof token !== 'string') return false;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return false;
  const exp = token.slice(0, dot);
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return same(token.slice(dot + 1), await sign(exp, secret));
}

const readCookie = (header, name) => {
  for (const part of (header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
};

const page = (title, wrong) => `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="robots" content="noindex">
<style>
  :root{color-scheme:dark;--bg:#1a1918;--panel:#141312;--field:#2a2724;--line:#3d3934;
        --label:#b3aca1;--ink:#f2efe9;--gold:#c9992f;--gold-soft:#e2bd6d;--on-gold:#17150f;--warn:#ff6b60}
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:var(--bg);color:var(--ink);
       font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',system-ui,sans-serif}
  form{width:100%;max-width:360px;display:grid;gap:18px;background:var(--panel);border:1px solid var(--line);
       border-radius:20px;padding:28px}
  h1{margin:0;font-size:19px;font-weight:700;letter-spacing:-0.01em}
  .lab{font-family:ui-monospace,'SF Mono',Menlo,'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.14em;color:var(--label)}
  input{width:100%;min-height:48px;padding:0 14px;border-radius:12px;border:1px solid var(--line);
        background:var(--field);color:var(--ink);font-size:17px}
  input:focus{outline:2px solid var(--gold);outline-offset:1px}
  button{min-height:48px;border:none;border-radius:12px;background:var(--gold);color:var(--on-gold);
         font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:12px;letter-spacing:0.14em;cursor:pointer}
  button:hover{background:var(--gold-soft)}
  .err{display:${wrong ? 'block' : 'none'};font-size:13px;color:var(--warn)}
  a{color:var(--gold-soft);font-size:12px;text-decoration:none}
</style></head><body>
<form method="POST" autocomplete="on">
  <div style="display:grid;gap:6px">
    <span class="lab">KLEEQ</span>
    <h1>${title}</h1>
  </div>
  <div style="display:grid;gap:8px">
    <label class="lab" for="p">PASSWORD</label>
    <input id="p" name="password" type="password" autocomplete="current-password" autofocus required>
    <span class="err">That password was not accepted.</span>
  </div>
  <button type="submit">OPEN</button>
  <a href="/">← KLEEQ Tools</a>
</form></body></html>`;

const loginResponse = (rule, wrong) => new Response(page(rule.title, wrong), {
  status: wrong ? 401 : 200,
  headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const rule = PROTECTED.find((r) => url.pathname === r.prefix || url.pathname.startsWith(r.prefix + '/'));

    if (rule) {
      const want = env[rule.pass];
      if (!want) {
        return new Response('Password not configured: run wrangler secret put ' + rule.pass,
          { status: 503, headers: { 'Cache-Control': 'no-store' } });
      }

      // A submitted password mints the session cookie and reloads the page.
      if (request.method === 'POST') {
        let given = '';
        try { given = String((await request.formData()).get('password') || ''); } catch (e) {}
        if (!same(given, want)) return loginResponse(rule, true);
        const token = await mintToken(want);
        return new Response(null, {
          status: 303,
          headers: {
            Location: url.pathname,
            'Cache-Control': 'no-store',
            'Set-Cookie': `${rule.cookie}=${token}; Path=${rule.prefix}; Max-Age=${TTL_H * 3600}; HttpOnly; Secure; SameSite=Lax`
          }
        });
      }

      const ok = await tokenValid(readCookie(request.headers.get('Cookie'), rule.cookie), want);
      if (!ok) {
        // Only documents get the form; a sub-resource asking without a session
        // gets a plain 401 rather than a page of HTML where JSON was expected.
        const wantsHtml = (request.headers.get('Accept') || '').includes('text/html');
        if (!wantsHtml) return new Response('Not authorised.', { status: 401, headers: { 'Cache-Control': 'no-store' } });
        return loginResponse(rule, false);
      }
    }

    const res = await env.ASSETS.fetch(request);
    if (rule) {
      const r = new Response(res.body, res);
      r.headers.set('Cache-Control', 'private, no-store');
      r.headers.set('X-Robots-Tag', 'noindex');
      return r;
    }
    return res;
  }
};
