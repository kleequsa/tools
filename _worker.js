// KLEEQ tools — edge gate.
// Everything is served from static assets except paths listed in PROTECTED,
// which require HTTP Basic Auth. Set the secret once:
//     npx wrangler secret put CAMO_PASSWORD
// Username is ignored unless CAMO_USER is also set.
const PROTECTED = [{ prefix: '/camo-studio', user: 'CAMO_USER', pass: 'CAMO_PASSWORD', realm: 'KLEEQ Camo Studio' }];

const deny = (realm) => new Response('Sign in to open this KLEEQ tool.', {
  status: 401,
  headers: { 'WWW-Authenticate': 'Basic realm="' + realm + '", charset="UTF-8"', 'Cache-Control': 'no-store' }
});

const same = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const rule = PROTECTED.find((r) => url.pathname === r.prefix || url.pathname.startsWith(r.prefix + '/'));
    if (rule) {
      const want = env[rule.pass];
      // no-store: otherwise a browser caches this and keeps showing it after
      // the secret is set.
      if (!want) return new Response('Password not configured: run wrangler secret put ' + rule.pass, { status: 503, headers: { 'Cache-Control': 'no-store' } });
      const hdr = request.headers.get('Authorization') || '';
      if (!hdr.startsWith('Basic ')) return deny(rule.realm);
      let user = '', pass = '';
      // atob yields one character per byte, so a UTF-8 password would arrive
      // as its raw bytes and never match the stored string. Decode it properly.
      try {
        const raw = atob(hdr.slice(6));
        const dec = new TextDecoder().decode(Uint8Array.from(raw, (c) => c.charCodeAt(0)));
        const i = dec.indexOf(':');
        user = dec.slice(0, i); pass = dec.slice(i + 1);
      } catch (e) { return deny(rule.realm); }
      if (!same(pass, want)) return deny(rule.realm);
      if (env[rule.user] && !same(user, env[rule.user])) return deny(rule.realm);
    }
    const res = await env.ASSETS.fetch(request);
    if (rule) { const r = new Response(res.body, res); r.headers.set('Cache-Control', 'private, no-store'); r.headers.set('X-Robots-Tag', 'noindex'); return r; }
    return res;
  }
};
