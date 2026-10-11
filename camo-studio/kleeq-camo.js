// KLEEQ — camo set engine.
// Builds the colour pool (studio hex where the studio measured one, Cerakote
// thumbnail sample otherwise), scores 2–5 colour sets under four rules, fills
// empty slots, and renders blotch / digital / stripe patterns onto a panel or
// a part silhouette. Colour maths + SVG strings only: no DOM.

const rgb = (hex) => { const h = String(hex || '#000').replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0); };
export const hsl = (hex) => {
  const [r, g, b] = rgb(hex).map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  let h = 0;
  if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
  return { h: h, s: d ? d / (1 - Math.abs(2 * l - 1)) : 0, l: l };
};
const chan = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
export const lum = (hex) => { const [r, g, b] = rgb(hex); return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b); };
export const lrv = (hex) => Math.round(lum(hex) * 1000) / 10;
const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
export const seriesOf = (code) => String(code || '').split('-')[0].toUpperCase();

// ---- pool -------------------------------------------------------------
// data = kleeq-finishes.json, thumbHex = { code: '#rrggbb' } sampled from the
// Cerakote product thumbnails (centre median). Studio values win.
export const buildPool = (data, thumbHex) => {
  const studio = {};
  (data.finishes || []).forEach((f) => { studio[f.code] = f; });
  const seen = {};
  const out = [];
  const push = (c, f) => {
    if (seen[c.code]) return;
    const hex = f && f.hex ? f.hex : thumbHex && thumbHex[c.code];
    if (!hex) return;
    seen[c.code] = 1;
    out.push({
      code: c.code, name: (f && f.name) || c.name, hex: hex,
      hexSource: f && f.hex ? 'studio' : 'thumb',
      series: seriesOf(c.code), sheen: c.sheen || (f && f.sheen) || '',
      glossUnits: c.glossUnits != null ? c.glossUnits : (f && f.glossUnits),
      density: c.density != null ? c.density : (f && f.density),
      wall: f ? f.wall : 'core', stocked: !!c.stocked, url: c.url || (f && f.url),
      effect: c.effect || ''
    });
  };
  (data.catalogue || []).forEach((c) => push(c, studio[c.code]));
  (data.finishes || []).forEach((f) => push(f, f));
  // Clears and additives carry no colour of their own.
  return out.filter((f) => !/^(MC|DFL|SG|P|LR)$/.test(f.series) && !/CLEAR|LUBRICANT|GRIP/i.test(f.name));
};

// ---- moods ------------------------------------------------------------
export const MOODS = [
  { id: 'tactical', label: 'Tactical', test: (c) => c.s < 0.22 && c.l > 0.06 && c.l < 0.5 },
  { id: 'desert', label: 'Desert', test: (c) => c.h >= 22 && c.h <= 58 && c.s >= 0.12 && c.s <= 0.65 && c.l >= 0.32 && c.l <= 0.82 },
  { id: 'woodland', label: 'Woodland', test: (c) => (c.h >= 60 && c.h <= 150 && c.s >= 0.08 && c.l < 0.6) || (c.h >= 20 && c.h <= 50 && c.s >= 0.1 && c.l < 0.42) },
  { id: 'urban', label: 'Urban', test: (c) => c.s < 0.14 && c.l >= 0.18 },
  { id: 'bold', label: 'Bold', test: (c) => c.s > 0.42 && c.l > 0.2 && c.l < 0.75 }
];
export const inMood = (f, moodId) => {
  const m = MOODS.find((x) => x.id === moodId);
  return !m || m.test(hsl(f.hex));
};

// ---- rules ------------------------------------------------------------
export const RULES = [
  { id: 'value', label: 'Value steps', hint: 'Clear light-to-dark steps between every colour' },
  { id: 'hue', label: 'Hue family', hint: 'Colours close in hue, one accent allowed' },
  { id: 'series', label: 'One series', hint: 'All H, all C, all E or all F' },
  { id: 'gloss', label: 'One gloss', hint: 'Same published gloss level across the set' }
];

const sheenWord = (f) => String(f.sheen || '').trim();

// Score a set 0–100 with a note per rule. active = { value: true, ... }
export const scoreSet = (set, active) => {
  const cs = set.filter(Boolean);
  const n = cs.length;
  const parts = [];
  if (n < 2) return { score: 0, parts: [] };
  const act = active || { value: true, hue: true, series: true, gloss: true };

  // value spread
  const L = cs.map((f) => lrv(f.hex)).sort((a, b) => a - b);
  let minStep = 100;
  for (let i = 1; i < L.length; i++) minStep = Math.min(minStep, L[i] - L[i - 1]);
  const range = L[L.length - 1] - L[0];
  const want = n === 2 ? 12 : n === 3 ? 8 : 6;
  const vScore = Math.min(1, minStep / want) * 0.7 + Math.min(1, range / 30) * 0.3;
  parts.push({ id: 'value', on: !!act.value, score: vScore,
    note: minStep >= want ? 'Every step is at least ' + Math.round(minStep) + ' LRV points; ' + Math.round(range) + ' points end to end.'
      : 'Closest pair sits ' + Math.round(minStep) + ' LRV points apart. Below ' + want + ' they merge at distance.' });

  // hue family
  const sat = cs.map((f) => hsl(f.hex)).filter((c) => c.s >= 0.14);
  let hScore = 1, hNote = 'Neutrals only. Hue is not doing the work here.';
  if (sat.length >= 2) {
    // mean hue via vectors
    let x = 0, y = 0; sat.forEach((c) => { x += Math.cos(c.h * Math.PI / 180); y += Math.sin(c.h * Math.PI / 180); });
    const mean = ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
    const gaps = sat.map((c) => hueGap(c.h, mean)).sort((a, b) => a - b);
    const core = gaps.slice(0, Math.max(1, gaps.length - 1));
    const worstCore = core[core.length - 1];
    const accent = gaps.length > 1 ? gaps[gaps.length - 1] : 0;
    hScore = Math.max(0, 1 - Math.max(0, worstCore - 35) / 60);
    hNote = worstCore <= 35
      ? (accent > 60 ? 'One hue family plus a single accent ' + Math.round(accent) + '° off it.' : 'All saturated colours within ' + Math.round(worstCore * 2) + '° of each other.')
      : 'Saturated hues spread ' + Math.round(worstCore * 2) + '° apart. More than one accent fights the base.';
  } else if (sat.length === 1) hNote = 'Neutrals with one accent.';
  parts.push({ id: 'hue', on: !!act.hue, score: hScore, note: hNote });

  // series
  const ser = Array.from(new Set(cs.map((f) => f.series)));
  parts.push({ id: 'series', on: !!act.series, score: ser.length === 1 ? 1 : 0,
    note: ser.length === 1 ? 'All ' + ser[0] + '-Series. One cure schedule, one prep.' : 'Mixed series (' + ser.join(', ') + '). Check the cure on each TDS before layering.' });

  // gloss
  const gl = cs.map(sheenWord);
  const missing = gl.filter((g) => !g).length;
  const words = Array.from(new Set(gl.filter(Boolean)));
  parts.push({ id: 'gloss', on: !!act.gloss, score: missing ? 0.5 : words.length === 1 ? 1 : 0,
    note: missing ? 'Gloss not published for ' + missing + ' colour' + (missing > 1 ? 's' : '') + '. Check the TDS.'
      : words.length === 1 ? 'All ' + words[0] + '.' : 'Mixed gloss: ' + words.join(' / ') + '. Sheen breaks will read as a third pattern.' });

  const on = parts.filter((p) => p.on);
  const score = on.length ? on.reduce((a, p) => a + p.score, 0) / on.length : 1;
  return { score: Math.round(score * 100), parts: parts };
};

// ---- filling slots ----------------------------------------------------
const hashOf = (s) => { let n = 0; for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 100003; return n; };

// Rank candidates for slot `idx` given the rest of the set.
export const candidatesFor = (set, idx, pool, active, mood, limit) => {
  const used = {};
  set.forEach((f, i) => { if (f && i !== idx) used[f.code] = 1; });
  const out = [];
  pool.forEach((c) => {
    if (used[c.code]) return;
    if (mood && !inMood(c, mood)) return;
    const trial = set.slice(); trial[idx] = c;
    const r = scoreSet(trial, active);
    // distinctness: punish near-duplicates of anything already placed
    let dup = 0;
    set.forEach((f, i) => { if (f && i !== idx) { const d = Math.abs(lrv(f.hex) - lrv(c.hex)); if (d < 3) dup += 30; } });
    out.push({ finish: c, score: r.score - dup, parts: r.parts });
  });
  out.sort((a, b) => b.score - a.score || a.finish.code.localeCompare(b.finish.code));
  return out.slice(0, limit || 24);
};

// Fill every empty slot, base first. variant shifts the pick down the ranking
// so repeated calls deal different sets.
export const fillSet = (set, pool, active, mood, variant) => {
  const out = set.slice();
  const v = variant || 0;
  for (let i = 0; i < out.length; i++) {
    if (out[i]) continue;
    const cands = candidatesFor(out, i, pool, active, mood, 12);
    if (!cands.length) continue;
    const salt = (hashOf(out.map((f) => (f ? f.code : '_')).join('|')) + v * 7 + i * 3) % Math.min(cands.length, 4 + v);
    out[i] = cands[salt].finish;
  }
  return out;
};

// ---- shares -----------------------------------------------------------
export const defaultShares = (n, even) => {
  if (even) { const e = Math.floor(100 / n); const a = Array(n).fill(e); a[0] += 100 - e * n; return a; }
  return { 2: [60, 40], 3: [50, 30, 20], 4: [40, 30, 20, 10], 5: [35, 25, 20, 12, 8] }[n] || [100];
};

// ---- patterns ---------------------------------------------------------
const mkRnd = (seed) => { let s = (seed * 9301 + 49297) % 233280 || 1; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
const F = (v) => Math.round(v * 10) / 10;

// Organic blotch: the base fills; every other colour lays clusters of soft
// ellipses whose total area tracks its share. Later colours sit on top, so
// the smallest share (the accent) always stays visible.
export const blotch = (colors, shares, W, H, seed, scale) => {
  const rnd = mkRnd(seed);
  const sc = scale || 1;
  let s = '<rect width="' + W + '" height="' + H + '" fill="' + colors[0] + '"/>';
  for (let i = 1; i < colors.length; i++) {
    const area = W * H * (shares[i] / 100) * 1.45; // overlap allowance
    const r0 = Math.sqrt(W * H) * 0.085 * sc;
    const nClusters = Math.max(2, Math.round(area / (Math.PI * r0 * r0 * 3.2)));
    let g = '<g fill="' + colors[i] + '">';
    for (let k = 0; k < nClusters; k++) {
      const cx = rnd() * W, cy = rnd() * H;
      const lobes = 3 + Math.floor(rnd() * 4);
      let px = cx, py = cy;
      for (let l = 0; l < lobes; l++) {
        const rx = r0 * (0.55 + rnd() * 0.9), ry = r0 * (0.45 + rnd() * 0.7);
        const rot = rnd() * 180;
        // draw at px,py and wrapped copies so edges tile
        [[0, 0], [W, 0], [-W, 0], [0, H], [0, -H]].forEach((o) => {
          const x = px + o[0], y = py + o[1];
          if (x < -r0 * 2 || x > W + r0 * 2 || y < -r0 * 2 || y > H + r0 * 2) return;
          g += '<ellipse cx="' + F(x) + '" cy="' + F(y) + '" rx="' + F(rx) + '" ry="' + F(ry) + '" transform="rotate(' + F(rot) + ' ' + F(x) + ' ' + F(y) + ')"/>';
        });
        const a = rnd() * 6.283, d = r0 * (0.6 + rnd() * 0.6);
        px += Math.cos(a) * d; py += Math.sin(a) * d;
      }
    }
    s += g + '</g>';
  }
  return s;
};

// Digital: a coarse block grid; a layered sine field is quantised so each
// colour owns a band of the field equal to its share. Blocks merge into
// stepped 90° patches.
export const digital = (colors, shares, W, H, seed, scale) => {
  const rnd = mkRnd(seed);
  const cell = Math.max(4, Math.sqrt(W * H) * 0.028 * (scale || 1));
  const nx = Math.ceil(W / cell), ny = Math.ceil(H / cell);
  const ph = [rnd() * 6.283, rnd() * 6.283, rnd() * 6.283, rnd() * 6.283];
  const k = [2 + rnd() * 2, 2 + rnd() * 2, 3 + rnd() * 3, 3 + rnd() * 3];
  const vals = new Float32Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    // quantise the sample position to 2×2 macro cells for a blockier read
    const a = (Math.floor(i / 2) * 2 / nx) * 6.283, b = (Math.floor(j / 2) * 2 / ny) * 6.283;
    let v = Math.sin(a * k[0] + ph[0]) + Math.sin(b * k[1] + ph[1]) + 0.8 * Math.sin(a * k[2] + b * 0.7 + ph[2]) + 0.6 * Math.sin(a * 0.5 - b * k[3] + ph[3]);
    v += (rnd() - 0.5) * 0.9; // grain
    vals[j * nx + i] = v;
  }
  // thresholds by quantile so shares hold
  const sorted = Array.from(vals).sort((a, b) => a - b);
  const cuts = []; let acc = 0;
  for (let i = 0; i < colors.length - 1; i++) { acc += shares[i]; cuts.push(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * acc / 100))]); }
  const idxOf = (v) => { let i = 0; while (i < cuts.length && v > cuts[i]) i++; return i; };
  let s = '<rect width="' + W + '" height="' + H + '" fill="' + colors[0] + '"/>';
  const groups = colors.map(() => '');
  for (let j = 0; j < ny; j++) {
    let i = 0;
    while (i < nx) {
      const ci = idxOf(vals[j * nx + i]);
      let run = 1;
      while (i + run < nx && idxOf(vals[j * nx + i + run]) === ci) run++;
      if (ci !== 0) groups[ci] += '<rect x="' + F(i * cell) + '" y="' + F(j * cell) + '" width="' + F(run * cell + 0.3) + '" height="' + F(cell + 0.3) + '"/>';
      i += run;
    }
  }
  for (let c = 1; c < colors.length; c++) s += '<g fill="' + colors[c] + '">' + groups[c] + '</g>';
  return s;
};

// Proportional stripes: vertical bands, widths = shares.
export const stripes = (colors, shares, W, H) => {
  let s = '', x = 0;
  colors.forEach((c, i) => { const w = W * shares[i] / 100; s += '<rect x="' + F(x) + '" y="0" width="' + F(w + 0.5) + '" height="' + H + '" fill="' + c + '"/>'; x += w; });
  return s;
};

export const render = (kind, colors, shares, W, H, seed, scale) =>
  kind === 'digital' ? digital(colors, shares, W, H, seed, scale) : kind === 'stripes' ? stripes(colors, shares, W, H) : blotch(colors, shares, W, H, seed, scale);

// ---- surfaces ---------------------------------------------------------
// Generic part silhouettes: clip = union of the shapes; lines = ink detail
// drawn over the pattern so the part reads as a part, not a blob.
export const SURFACES = {
  panel: { label: 'Panel', W: 800, H: 400, clip: null, lines: '' },
  handgun: {
    label: 'Handgun', W: 3600, H: 2160, sw: 14,
    // 1911 line art supplied by the studio (uploads/Artboard 1.svg), mirrored so
    // the muzzle points right like the other surfaces.
    tx: 'translate(-60,-200) matrix(-1 0 0 1 4000 0)',
    clip: "<path fill-rule=\"nonzero\" d=\"M1121.54,664.87v221.92h568.46c92.75,0,161.8,93.01,161.8,162.02,0,29.5-5.07,95.21,18.2,148.2,31.17,70.96,98.7,127.83,158.82,127.83h403.44c111.15,0,188.91,71.71,221.03,167.87,32.12,96.16,234.71,797.52,234.71,797.52l47.92,30.71s731.08-49.06,788.81-63.01c29.92-7.23,29.06-34.67,25.9-41.58,0,0-402.88-914.05-420.09-963.24-21-60-22.5-209.99,109.49-310.48,22.5-3,39.12-3.48,56.63-4.86,36.89-40.58,129.95-72.35,129.95-72.35,0,0-6.33-18.05-20.09-33.79-35.51-40.61-57.79-29.41-121.51-51.61-66-23-107-68-110.03-107.27-1.79-23.2-9.97-287.73-129.97-392.73H379.27c-8.37,0-10.95,5.26-10.95,12.73s-.64,107.27-.64,107.27v170s15,35,15,70v140c0,45,17.08,65,25,65h713.87\"/><path d=\"M2609,781c-25.5,12.87-50.7,40.65-33.74,93.92,74.19,233.19,411.51,1270.61,430.06,1321.2,20.8,56.71,60.43,86.63,141.93,82.75,65.91-3.14,309.15-18.5,387.99-27.31,85.52-9.56,106.87-87.18,75.01-165.02-20.63-50.39-521.35-1226.06-545.25-1275.54s-121.76-67.18-264-68c-88.06-.51-150.27,16.95-192,38Z\"/>",
    lines: "<g fill=\"none\" stroke=\"#141312\" stroke-width=\"14\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2609,781c-25.5,12.87-50.7,40.65-33.74,93.92,74.19,233.19,411.51,1270.61,430.06,1321.2,20.8,56.71,60.43,86.63,141.93,82.75,65.91-3.14,309.15-18.5,387.99-27.31,85.52-9.56,106.87-87.18,75.01-165.02-20.63-50.39-521.35-1226.06-545.25-1275.54s-121.76-67.18-264-68c-88.06-.51-150.27,16.95-192,38Z\"/><circle cx=\"3274.27\" cy=\"2023.01\" r=\"84\"/><path d=\"M423.16,280c10.57-9.54,33.7-29.86,44.52-35,15.98-7.59,35-10,53.67,0,12.92,6.92,47.56,24.7,67.66,34.99\"/><path d=\"M368.23,321.64h-16.98c-11.03,0-16.5,6.45-16.5,19.5v332.98c0,4.53,8.85,8.25,13.56,8.25q-.6,0,34.36,0\"/><path d=\"M352.91,682.36v98.31c0,6.1,3.81,9.15,9.53,9.15h20.58\"/><path d=\"M3724.72,2257.91c93.53-16.62,64.8-179.93,39.28-237.02-128.39-285.85-270.33-527.63-354.19-581.85\"/><path d=\"M367.68,569.99h353.14c89.22,0,216.29,59.13,250.17,94.89h2403.51\"/><path d=\"M1121.57,781.17h556.85c63.59,0,119.59,33.83,145.2,70.58h569.44c229.55,0,181.49,139.58,121.33,287.67-33.49,77.5-6.9,126.45,37.61,137.58,112,28,161,106,195,216,30.67,99.22,224.4,698.75,264.69,822.75\"/><path d=\"M2270.56,851.75c181.28,15.9,277.17,147.92,243.83,287.67\"/><path d=\"M1766.28,909h525.7c34.5,0,163.1,48.6,163.1,188.1s-158.3,190.49-158.3,190.49h-251.18s-161.99-27-161.99-178.49c0-140.15,138.64-192.97,159.4-200.1\"/><line x1=\"1823.62\" y1=\"851.75\" x2=\"1766.28\" y2=\"909\"/><path d=\"M2286.68,909c-3.88,4.21-3.51,11.86,2.15,17.86,8.25,8.75,80.75,78.75,80.75,177.74s-87.27,162.53-90,164.99c-2.17,1.97-6.96,12.43-.29,18\"/><path d=\"M2438.36,1171c-30.36,74.67,18.31,150.05,64.89,164.54\"/><circle cx=\"2588.47\" cy=\"1191.83\" r=\"58.06\"/><path d=\"M1121.54,664.87v221.92h568.46c92.75,0,161.8,93.01,161.8,162.02,0,29.5-5.07,95.21,18.2,148.2,31.17,70.96,98.7,127.83,158.82,127.83h403.44c111.15,0,188.91,71.71,221.03,167.87,32.12,96.16,234.71,797.52,234.71,797.52l47.92,30.71s731.08-49.06,788.81-63.01c29.92-7.23,29.06-34.67,25.9-41.58,0,0-402.88-914.05-420.09-963.24-21-60-22.5-209.99,109.49-310.48,22.5-3,39.12-3.48,56.63-4.86,36.89-40.58,129.95-72.35,129.95-72.35,0,0-6.33-18.05-20.09-33.79-35.51-40.61-57.79-29.41-121.51-51.61-66-23-107-68-110.03-107.27-1.79-23.2-9.97-287.73-129.97-392.73H379.27c-8.37,0-10.95,5.26-10.95,12.73s-.64,107.27-.64,107.27v170s15,35,15,70v140c0,45,17.08,65,25,65h713.87\"/><path d=\"M3550.1,797.27c64.9,5.73,110.47,15.48,140.33,26.51,34.72,12.82,16.58,64.92-15.63,64.09-54.43-1.4-102.65,17.85-158.65,61.85-75,22-154.15,149.28-127.12,256.87,16.02,57.59,109,218.91,109,218.91l-22.5,7.5-67.35,2.29\"/><path d=\"M3608.02,833.43c-119.28,25.9-213.11,112.29-240.06,140.36-85.43,103.81-82.43,243.3-64.43,289.8,18,46.5,410.16,973.77,410.16,973.77,7.11,16.18-10.2,24.69-27.95,27.42\"/><path d=\"M2533,695.57c-12.67-.57-513.41-12.4-513.41-12.4v.02c-.93-.04-1.85-.07-2.79-.07-39.76,0-72,32.23-72,72s32.23,72,72,72c1.44,0,2.87-.05,4.29-.14h0s500.02-24.97,511.3-25.81c11.28-.83,19.41-10.84,19.68-22.17.19-7.79.12-44.09.05-66-.03-9.96-6.45-16.86-19.12-17.43Z\"/><line x1=\"2286.07\" y1=\"689.5\" x2=\"2286.07\" y2=\"813.68\"/><path d=\"M2286.1,689.5c4.97,22.61,23.97,42.75,32.97,51.5,7.56,7.35,13.54,12.48,14,22.67.67,14.67-27.25,44.96-47,50.01\"/><line x1=\"2333.07\" y1=\"763.67\" x2=\"2552.08\" y2=\"756.33\"/><path d=\"M3118.23,753.5c-2.36-45.01,36.37-71.46,64.78-60.66,80.1,30.43,271.94,102.7,295.28,111.37,23.33,8.67,35,29,.53,44.73-29.26,13.36-127.86,77.93-175.2,165.93-6.07,11.29-17.68,18.58-25.33,15.33-7.65-3.25-56.47-22.4-83.47-37.4-27-15-39-36-43.5-61.5-4.5-25.5-32.39-164.61-33.08-177.81Z\"/><polyline points=\"2887.99 2290.22 2841.01 2300.77 2841.06 2324.53 2935.91 2320.93\"/><path d=\"M3362.45,551.1c3.23-22.2,28.14-80.79,54.22-98.66,33.66-23.06,90.71-60.27,140.18-75.58,6.38-2.12,10.51-5.74,9.33-11.74-.91-4.63-2.56-10.14-4.79-15.97-1.25-3.35-4.59-5.43-10.37-4.8-27.64,3.02-82.02,27.46-106.84,40.35-27.41,14.23-73.59,36.53-124.09,8.03\"/><path d=\"M2956.77,280c16.32-4.76,43.82-23.5,46.54-38.46h23.85c0,15.13,26.67,38.46,41.33,38.46\"/><circle cx=\"2897.18\" cy=\"1019.39\" r=\"84\"/><line x1=\"367.7\" y1=\"404.04\" x2=\"3324.62\" y2=\"404.04\"/><line x1=\"2429.79\" y1=\"1204.2\" x2=\"2499.33\" y2=\"1204.2\"/></g><g fill=\"#141312\"><path d=\"M2945.91,991.83c15.22,26.36,6.19,60.07-20.17,75.28-26.36,15.22-60.07,6.19-75.28-20.17-15.22-26.36-6.19-60.07,20.17-75.29,26.36-15.22,60.07-6.19,75.29,20.17Z\"/><path d=\"M2870.63,971.66c-3.42,1.97-6.53,4.26-9.35,6.79l53.9,93.36c3.61-1.17,7.14-2.73,10.56-4.7,3.41-1.97,6.53-4.26,9.35-6.79l-53.9-93.36c-3.6,1.17-7.14,2.73-10.56,4.7Z\"/><path d=\"M3225.54,1995.46c-15.22,26.36-6.19,60.07,20.17,75.29,26.36,15.22,60.07,6.19,75.28-20.17,15.22-26.36,6.19-60.07-20.17-75.29-26.36-15.22-60.07-6.19-75.29,20.17Z\"/><path d=\"M3300.83,1975.29c3.42,1.97,6.53,4.26,9.35,6.79l-53.9,93.36c-3.61-1.17-7.14-2.73-10.56-4.7s-6.53-4.26-9.35-6.79l53.9-93.36c3.6,1.17,7.14,2.73,10.56,4.7Z\"/></g>"
  },
  rifle: {
    label: 'Rifle', W: 1100, H: 360,
    // AR-15 profile, muzzle right: collapsible stock on a buffer tube, flat-top
    // upper, lower with mag well, forward-curving 30-round magazine, raked A2
    // grip, free-float handguard, A2 front sight base, birdcage muzzle.
    clip: '<path d="M22,122 L116,122 L128,140 L128,196 Q128,206 118,208 L46,222 Q22,224 22,200 Z"/>'
      + '<rect x="116" y="140" width="176" height="28"/><rect x="268" y="134" width="26" height="40"/>'
      + '<rect x="256" y="100" width="30" height="12"/>'
      + '<path d="M282,96 L562,96 L562,152 L302,152 Q282,152 282,132 Z"/>'
      + '<path d="M298,152 L534,152 L528,210 L438,210 L436,178 L300,178 Q294,178 294,170 Z"/>'
      + '<path d="M446,208 L526,208 C528,258 540,300 548,330 L470,336 C458,300 450,254 446,208 Z"/>'
      + '<path d="M322,178 L388,178 L372,214 C358,236 354,250 348,272 L294,272 C300,250 306,228 314,210 Z"/>'
      + '<rect x="516" y="70" width="44" height="26"/>'
      + '<path d="M562,100 L850,100 Q858,100 858,108 L858,148 Q858,156 850,156 L562,156 Z"/>'
      + '<rect x="850" y="118" width="160" height="18"/>'
      + '<path d="M886,118 L898,76 L924,76 L936,118 Z"/>'
      + '<path d="M1006,110 L1070,110 Q1078,110 1078,118 L1078,136 Q1078,144 1070,144 L1006,144 Z"/>',
    lines: '<path d="M388,178 L388,214 Q388,226 402,226 L436,226 L436,178" fill="none" stroke="#141312" stroke-width="7" stroke-linejoin="round"/>'
      + '<path d="M404,184 L400,216" stroke="#141312" stroke-width="6" stroke-linecap="round"/>'
      + '<g stroke="#141312" stroke-width="3" stroke-opacity="0.6" fill="none">'
      + '<path d="M300,152 L534,152 M562,96 L562,156 M858,118 L858,136 M438,160 L528,160"/>'
      + '<rect x="470" y="108" width="80" height="34"/>'
      + '<path d="M590,114 L640,114 M660,114 L710,114 M730,114 L780,114 M800,114 L836,114 M590,142 L640,142 M660,142 L710,142 M730,142 L780,142 M800,142 L836,142"/>'
      + '<path d="M128,160 L268,160 M40,142 L40,206 M60,142 L60,206"/>'
      + '<path d="M1018,116 L1018,138 M1034,116 L1034,138 M1050,116 L1050,138 M1066,116 L1066,138"/>'
      + '<path d="M454,214 L518,214 C520,262 530,298 538,326"/>'
      + '</g>'
      + '<g fill="#141312" fill-opacity="0.75">'
      + '<path d="M300,96 L556,96 L556,90 L300,90 Z" fill-opacity="0.35"/>'
      + '<path d="M304,90 h6 v6 h-6 z M318,90 h6 v6 h-6 z M332,90 h6 v6 h-6 z M346,90 h6 v6 h-6 z M360,90 h6 v6 h-6 z M374,90 h6 v6 h-6 z M388,90 h6 v6 h-6 z M402,90 h6 v6 h-6 z M416,90 h6 v6 h-6 z M430,90 h6 v6 h-6 z M444,90 h6 v6 h-6 z M458,90 h6 v6 h-6 z M472,90 h6 v6 h-6 z M486,90 h6 v6 h-6 z M500,90 h6 v6 h-6 z"/>'
      + '<circle cx="552" cy="124" r="9"/><circle cx="446" cy="168" r="6"/><circle cx="326" cy="162" r="5"/><rect x="312" y="160" width="36" height="5"/><path d="M546,104 L558,104 L552,116 Z"/>'
      + '</g>'
  },
  knife: {
    label: 'Knife', W: 1000, H: 300,
    clip: '<path d="M20 170 C140 70 360 48 560 90 L580 110 L580 190 L40 190 Z"/>'
      + '<polygon points="572,96 960,112 980,150 960,196 572,204"/>',
    lines: '<g stroke="#141312" stroke-width="3" stroke-opacity="0.55" fill="none"><path d="M40 170 C160 110 340 92 550 120"/><path d="M576 100 L576 200"/><path d="M620 126 L930 136 M620 178 L930 170"/></g>'
      + '<g fill="#141312" fill-opacity="0.5"><circle cx="680" cy="152" r="7"/><circle cx="800" cy="154" r="7"/><circle cx="920" cy="156" r="7"/></g>'
  }
};

export const renderSurface = (surfaceId, kind, colors, shares, seed, scale, ink) => {
  const S = SURFACES[surfaceId] || SURFACES.panel;
  const pat = render(kind, colors, shares, S.W, S.H, seed, scale);
  const stroke = ink || '#141312';
  if (!S.clip) return { W: S.W, H: S.H, inner: pat };
  const id = 'clip-' + surfaceId;
  const lines = S.lines.split('#141312').join(stroke);
  const open = S.tx ? '<g transform="' + S.tx + '">' : '<g>';
  return { W: S.W, H: S.H, inner:
    '<defs><clipPath id="' + id + '"' + (S.tx ? ' transform="' + S.tx + '"' : '') + '>' + S.clip + '</clipPath></defs>'
    + '<g clip-path="url(#' + id + ')">' + pat + '</g>' + open + lines
    + '<g fill="none" stroke="' + stroke + '" stroke-width="' + (S.sw || 3) + '" stroke-linejoin="round">' + S.clip + '</g></g>' };
};

// ---- ideas ------------------------------------------------------------
// Field sets built from the Core catalogue. Codes must exist in the pool;
// loadIdeas() drops any that do not and merges the Signature sets from the
// catalogue (data.signatureSets) ahead of them.
export const FIELD_IDEAS = [
  { name: 'Classic FDE', codes: ['H-146', 'H-265', 'H-235'], note: 'Graphite black, flat dark earth, coyote tan. The default three.' },
  { name: 'Woodland', codes: ['H-236', 'H-264', 'H-226', 'H-199'], note: 'O.D. green, mil-spec green, patriot brown, desert sand.' },
  { name: 'MultiCam', codes: ['H-342', 'H-344', 'H-341', 'H-340', 'H-339'], note: 'Five of the seven licensed MultiCam colours, dark to pale.' },
  { name: 'Urban', codes: ['H-190', 'H-234', 'H-237', 'H-297'], note: 'Armor black, sniper grey, tungsten, Stormtrooper white.' },
  { name: 'Desert', codes: ['H-225', 'H-199', 'H-143'], note: 'Mud brown, desert sand, Benelli sand.' },
  { name: 'Arctic', codes: ['H-214', 'H-262', 'H-136'], note: 'Bull shark grey, stone grey, snow white.' },
  { name: 'Night', codes: ['H-146', 'H-238', 'H-210'], note: 'Graphite black, midnight blue, Sig dark grey.' },
  { name: 'Transition', codes: ['H-258', 'H-267', 'H-247', 'H-142'], note: 'Chocolate brown, Magpul FDE, desert sage, light sand. Scrub to sand.' },
  { name: 'Blaze', codes: ['H-146', 'H-234', 'H-128'], note: 'Black and grey with hunter orange as the one hit.' },
  { name: 'Marine', codes: ['H-127', 'H-245', 'H-213'], note: 'Kel-Tec navy, SOCOM blue, battleship grey.' }
];
export const loadIdeas = (data, pool) => {
  const has = {}; pool.forEach((f) => { has[f.code] = 1; });
  const sig = (data.signatureSets || []).map((s) => ({ group: 'SIGNATURE', name: s.name, codes: s.codes, note: s.note }));
  const field = FIELD_IDEAS.map((s) => ({ group: 'FIELD', name: s.name, codes: s.codes, note: s.note }));
  return sig.concat(field).map((s) => ({ group: s.group, name: s.name, note: s.note, codes: s.codes.filter((c) => has[c]) })).filter((s) => s.codes.length >= 2);
};
