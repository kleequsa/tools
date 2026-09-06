// Weekly Cerakote catalogue check.
// Fetches every coating listed on cerakote.com, compares against
// mixing-calculator/kleeq-finishes.json → catalogue[], and appends anything new
// (stocked: false, no hex — the studio measures colour by hand). Exits 0 with
// "changed=true|false" on stdout so the workflow knows whether to open a PR.
// Node 20+, no dependencies.

import { readFile, writeFile } from 'node:fs/promises';

const FILE = new URL('../mixing-calculator/kleeq-finishes.json', import.meta.url);

// The shop listing pages render their products client-side — the served HTML
// carries no product links at all. The page's own bundle (/js/coatings.js)
// reads this JSON API, so that is what we read too. `limit` above the default
// 30 is rejected, so page through it.
const API = 'https://www.cerakote.com/api/proxify/domains/cerakote/shop/products';
const PER_PAGE = 30;
// A non-browser user-agent is answered with 403, and the API wants the same
// XHR header the site's own axios client sends.
const HEADERS = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  'x-requested-with': 'XMLHttpRequest',
  accept: 'application/json',
};
const PAUSE_MS = 400;   // be a polite neighbour; the API 504s under a fast loop

// A coating code: a series prefix, then digits only. Extend SERIES when
// Cerakote introduces one — the same list the calculator groups its list by.
const CODE = /^[A-Z]{1,4}-\d{2,5}$/;
const SERIES = new Set(['H', 'E', 'F', 'FIR', 'HIR', 'C', 'V', 'S', 'SG', 'MC', 'FX', 'DFL', 'LR', 'P']);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// One page, with a backoff — the API answers 504 if it is pushed too hard.
const getPage = async (page) => {
  let last;
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt) await sleep(2000 * attempt);
    const r = await fetch(`${API}?page=${page}&limit=${PER_PAGE}`, { headers: HEADERS });
    if (r.ok) return r.json();
    last = `${r.status} page ${page}`;
  }
  throw new Error(last);
};

const found = new Map();
let pageCount = 1;
for (let page = 1; page <= pageCount; page++) {
  let body;
  try { body = await getPage(page); } catch (e) { console.error('skip', e.message); continue; }
  pageCount = body.pagination?.page_count || pageCount;
  for (const row of body.data || []) {
    const code = String(row.sku || '').trim().toUpperCase();
    const path = String(row.url || '');
    if (!code || found.has(code) || !path.startsWith('/shop/cerakote-coating/')) continue;
    // /shop/cerakote-coating/ is not the dividing line — swatches (H-332S),
    // catalyst sizes (H-100-1O), laser fixtures (R-3DP-02-305), kits, apparel
    // (APP-104) and detailing supplies all sit under it. A coating is a known
    // series prefix followed by nothing but digits; every code already in the
    // catalogue fits that, and the prefixes are the ones the app groups by.
    if (!CODE.test(code) || !SERIES.has(code.split('-')[0])) continue;
    const name = String(row.name || '').trim();
    // H-100 is the H-Series catalyst itself, and wears a coating-shaped code.
    // It is what you add to a coating, never a coating to be mixed.
    if (/\bcatalyst\b/i.test(name)) continue;
    // Products without a photo are served a relative placeholder path; a bare
    // /img/... would render as a broken thumbnail in the calculator.
    const img = String(row.featured_image_url || '');
    const thumb = /^https:\/\//.test(img) && !/default-product-img/.test(img)
      ? img.split('?')[0] + '?size=200'
      : null;
    found.set(code, {
      code, name, series: code.split('-')[0], stocked: false,
      url: 'https://www.cerakote.com' + path,
      ...(thumb ? { thumb } : {}),
    });
  }
  if (page < pageCount) await sleep(PAUSE_MS);
}

if (found.size < 50) { console.error(`only ${found.size} products parsed — page structure changed?`); process.exit(2); }

const data = JSON.parse(await readFile(FILE, 'utf8'));
const have = new Set([...(data.catalogue || []), ...(data.finishes || [])].map((f) => f.code));
const added = [...found.values()].filter((f) => !have.has(f.code)).sort((a, b) => a.code.localeCompare(b.code));

if (added.length) {
  data.catalogue = [...added, ...(data.catalogue || [])];
  data.version = (data.version || 0) + 1;
  data.updated = new Date().toISOString().slice(0, 10);
  await writeFile(FILE, JSON.stringify(data, null, 2) + '\n');
  await writeFile(new URL('../.sync-summary.md', import.meta.url),
    `## ${added.length} new Cerakote finish${added.length === 1 ? '' : 'es'}\n\n` +
    added.map((f) => `- **${f.code}** ${f.name} — [product page](${f.url})`).join('\n') +
    '\n\nAdded to `catalogue[]` as `stocked: false` with no hex. Measure the chip and promote to `finishes[]` when the studio stocks it.\n');
}
console.log(`scanned=${found.size} added=${added.length}`);
console.log(`changed=${added.length > 0}`);
