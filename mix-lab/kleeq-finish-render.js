// Single source for how a KLEEQ finish is drawn on screen.
// Every page that shows a chip imports this — Colour, Swatch Export, Finish
// Catalogue, Homepage — so a change to the lighting model lands everywhere.

// The reference sheet's shadow/highlight pairs sit at a uniform ~30 L* offset
// around the base, which is a synthetic figure rather than a measurement of the
// coating. Sheen therefore decides how much of that range is actually used:
// a flat matte chip should barely move, a metallic should swing.
export const SHEEN = {
  matte: { range: 0.44, angle: 174, spec: 0, mid: 42 },
  flat: { range: 0.38, angle: 174, spec: 0, mid: 42 },
  satin: { range: 0.60, angle: 168, spec: 0.04, mid: 36 },
  gloss: { range: 0.92, angle: 164, spec: 0.12, mid: 26 },
  metallic: { range: 1.00, angle: 148, spec: 0.14, mid: 24 }
};

export const sheenOf = (f) => SHEEN[String((f && f.sheen) || 'matte').toLowerCase()] || SHEEN.matte;

const rgbOf = (hex) => {
  let x = String(hex || '#000000').replace('#', '');
  if (x.length === 3) x = x[0] + x[0] + x[1] + x[1] + x[2] + x[2];
  const n = parseInt(x, 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (v) => '#' + v.map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
const mixHex = (a, b, t) => {
  const A = rgbOf(a), B = rgbOf(b);
  return toHex([0, 1, 2].map((i) => A[i] + (B[i] - A[i]) * t));
};
const lum = (hex) => {
  const [r, g, b] = rgbOf(hex).map((c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Ink that stays legible on a given finish.
export const onColor = (hex) => (lum(hex) > 0.34 ? '#17150f' : '#f2efe9');

// Where a finish was sampled off a real chip the stops ARE the measurement, so
// they render at full width; only synthetic offsets get scaled by sheen.
const rangeOf = (f) => (f && f.measured ? 1 : sheenOf(f).range);

// Ordered by measured luminance rather than by field name — a peak-chroma base
// like Lemon Zest is brighter than its own highlight.
const ends = (f) => {
  const s = sheenOf(f);
  const rawHi = f.highlight || mixHex(f.hex, '#ffffff', s.range * 0.25);
  const rawLo = f.shadow || mixHex(f.hex, '#000000', s.range * 0.25);
  const flip = lum(rawHi) < lum(rawLo);
  return { hi: flip ? rawLo : rawHi, lo: flip ? rawHi : rawLo };
};

export const liteOf = (f) => mixHex(f.hex, ends(f).hi, rangeOf(f));
export const shadeOf = (f) => mixHex(f.hex, ends(f).lo, rangeOf(f));

// A single chip: highlight → base → shadow along the sheen's axis.
export const gradFor = (f) => {
  if (!f || !f.hex) return 'none';
  const s = sheenOf(f);
  const spec = s.spec
    ? 'linear-gradient(' + s.angle + 'deg, rgba(255,255,255,' + s.spec + ') 0%, rgba(255,255,255,0) 30%), '
    : '';
  return spec + 'linear-gradient(' + s.angle + 'deg, ' + liteOf(f) + ' 0%, ' + f.hex + ' ' + s.mid + '%, '
    + f.hex + ' ' + (s.mid + 14) + '%, ' + shadeOf(f) + ' 100%)';
};

// A split tile: each band carries its own ramp across its own slice.
export const splitFor = (colors, angle) => {
  const n = colors.length;
  const stops = [];
  colors.forEach((c, i) => {
    const s0 = i / n * 100, span = 100 / n, s1 = s0 + span, m = sheenOf(c);
    stops.push(liteOf(c) + ' ' + s0.toFixed(3) + '%');
    stops.push(c.hex + ' ' + (s0 + span * m.mid / 100).toFixed(3) + '%');
    stops.push(c.hex + ' ' + (s0 + span * (m.mid + 14) / 100).toFixed(3) + '%');
    stops.push(shadeOf(c) + ' ' + s1.toFixed(3) + '%');
  });
  return 'linear-gradient(' + angle + 'deg, ' + stops.join(', ') + ')';
};
