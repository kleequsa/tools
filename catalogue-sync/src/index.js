// Weekly Cerakote catalogue watcher.
// Every Monday 09:00 UTC it reads Cerakote's public product URLs, diffs them against the codes
// already known, and publishes cerakote-live.json. The Finish Catalogue page fetches that file
// and shows anything new with a NEW badge until the studio measures it and adds it to kleeq-finishes.json.

const PRODUCT_RE = /https?:\/\/www\.cerakote\.com\/shop\/cerakote-coating\/([A-Z]{1,4}-\d{2,4}[A-Z]?)\/([a-z0-9-]+)/g;
const SOURCES = [
  'https://www.cerakote.com/sitemap.xml',
  'https://www.cerakote.com/shop/cerakote-coating'
];
const UA = 'KLEEQ catalogue watcher (+https://tools.kleeq.com)';

async function text(url) {
  const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,application/xml,application/json' } });
  if (!r.ok) throw new Error(url + ' -> ' + r.status);
  return r.text();
}

// Sitemap indexes point at child sitemaps; follow one level.
async function collectUrls() {
  const found = new Map();
  for (const src of SOURCES) {
    try {
      const body = await text(src);
      const children = [...body.matchAll(/<loc>\s*(https?:[^<\s]+sitemap[^<\s]*)\s*<\/loc>/gi)].map((m) => m[1]).slice(0, 20);
      const bodies = [body].concat(await Promise.all(children.map((u) => text(u).catch(() => ''))));
      for (const b of bodies) for (const m of b.matchAll(PRODUCT_RE)) found.set(m[1].toUpperCase(), { code: m[1].toUpperCase(), slug: m[2], url: m[0] });
      if (found.size) break;
    } catch (e) { console.log('source failed', src, String(e)); }
  }
  return found;
}

const nameFromSlug = (s) => s.split('-').map((w) => (w.length <= 2 && w !== 'od') ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace(/\bOd\b/, 'O.D.').replace(/\bIi\b/, 'II');

async function sync(env) {
  const now = new Date().toISOString();
  const found = await collectUrls();
  const prev = JSON.parse((await env.CATALOGUE.get('live')) || '{"items":[]}');
  const known = new Map(prev.items.map((i) => [i.code, i]));
  const items = [];
  for (const [code, f] of found) {
    const old = known.get(code);
    items.push(old ? Object.assign({}, old, { url: f.url, lastSeen: now }) : { code, name: nameFromSlug(f.slug), series: code.split('-')[0], url: f.url, firstSeen: now, lastSeen: now });
  }
  // Keep entries that dropped off the shop for one more cycle, flagged, so the page can show "discontinued?".
  for (const [code, old] of known) if (!found.has(code) && !old.missingSince) items.push(Object.assign({}, old, { missingSince: now }));
  const out = { updated: now, source: found.size ? 'cerakote.com' : 'unchanged (fetch failed)', count: items.length, newSinceLastRun: items.filter((i) => i.firstSeen === now).map((i) => i.code), items: found.size ? items : prev.items };
  await env.CATALOGUE.put('live', JSON.stringify(out));
  return out;
}

export default {
  async scheduled(event, env, ctx) { ctx.waitUntil(sync(env)); },
  async fetch(req, env) {
    const url = new URL(req.url);
    const cors = { 'access-control-allow-origin': env.ALLOW_ORIGIN || '*', 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=3600' };
    if (url.pathname === '/run' && url.searchParams.get('key') === env.RUN_KEY) return new Response(JSON.stringify(await sync(env), null, 2), { headers: cors });
    if (url.pathname === '/cerakote-live.json' || url.pathname === '/') return new Response((await env.CATALOGUE.get('live')) || '{"items":[]}', { headers: cors });
    return new Response('not found', { status: 404 });
  }
};
