/* Kleeq glyph fields — the glyph-camo generators from Kleeq Star Camo Maps, lifted out
   as a standalone module so other surfaces can use them.

   ADDITIVE ONLY. Star Camo Maps is untouched and keeps its own copy; this file carries
   the parts that are independent of geography — the glyph shapes, the terrain field and
   the four field styles — with every reference to REGIONS, coverage masks, captions and
   DOM state removed. What is left generates a rectangular field of any size, which is
   what a wrap, a panel or a block face needs.

   Exposes window.KLEEQ_GLYPH_FIELDS = { GLYPHS, STYLES, build(opts) }.  */
(function () {
  'use strict';

  var GLYPHS = [
    ['star', 'Star'], ['hex', 'Hexagon'], ['circle', 'Circle'], ['ring', 'Ring'],
    ['cross', 'Plus'], ['crosshair', 'Crosshair'], ['triangle', 'Triangle'],
    ['halftri', 'Half-square'], ['shard', 'Shard'], ['diamond', 'Diamond'],
    ['square', 'Square'], ['bracket', 'Bracket'], ['kleeqmark', 'Kleeq mark'],
    ['blade', 'Blade'], ['teardrop', 'Teardrop'], ['slot', 'Slot'],
    ['crescent', 'Crescent'], ['chevron', 'Chevron']
  ];

  var STYLES = [
    ['camo', 'Camo'], ['topo', 'Topo camo'], ['lines', 'Topo lines'], ['flow', 'Flow']
  ];

  function rng(s) {
    var t = s >>> 0 || 1;
    return function () { t ^= t << 13; t ^= t >>> 17; t ^= t << 5; t >>>= 0; return t / 4294967296; };
  }

  /* verbatim from the source — pure geometry, no state */
  function glyphPath(g, cx2, cy2, R) {
    var F = function (v) { return v.toFixed(1); };
    if (g === 'star') {
      var r = R * 0.42, d2 = '';
      for (var k = 0; k < 10; k++) {
        var ang = -Math.PI / 2 + k * Math.PI / 5, rad = (k % 2 === 0) ? R : r;
        d2 += (k === 0 ? 'M' : 'L') + F(cx2 + Math.cos(ang) * rad) + ' ' + F(cy2 + Math.sin(ang) * rad);
      }
      return d2 + 'Z';
    }
    if (g === 'hex') {
      var dh = '';
      for (var h = 0; h < 6; h++) {
        var ah = -Math.PI / 2 + h * Math.PI / 3;
        dh += (h === 0 ? 'M' : 'L') + F(cx2 + Math.cos(ah) * R) + ' ' + F(cy2 + Math.sin(ah) * R);
      }
      return dh + 'Z';
    }
    if (g === 'circle') return 'M' + F(cx2 - R) + ' ' + F(cy2) + 'a' + F(R) + ' ' + F(R) + ' 0 1 0 ' + F(2 * R) + ' 0a' + F(R) + ' ' + F(R) + ' 0 1 0 ' + F(-2 * R) + ' 0Z';
    if (g === 'cross') {
      var tc = R * 0.36;
      return 'M' + F(cx2 - tc) + ' ' + F(cy2 - R) + 'H' + F(cx2 + tc) + 'V' + F(cy2 - tc) + 'H' + F(cx2 + R) + 'V' + F(cy2 + tc) + 'H' + F(cx2 + tc) + 'V' + F(cy2 + R) + 'H' + F(cx2 - tc) + 'V' + F(cy2 + tc) + 'H' + F(cx2 - R) + 'V' + F(cy2 - tc) + 'H' + F(cx2 - tc) + 'Z';
    }
    if (g === 'triangle') return 'M' + F(cx2) + ' ' + F(cy2 - R) + 'L' + F(cx2 + R * 0.866) + ' ' + F(cy2 + R * 0.5) + 'L' + F(cx2 - R * 0.866) + ' ' + F(cy2 + R * 0.5) + 'Z';
    if (g === 'diamond') return 'M' + F(cx2) + ' ' + F(cy2 - R) + 'L' + F(cx2 + R * 0.95) + ' ' + F(cy2) + 'L' + F(cx2) + ' ' + F(cy2 + R) + 'L' + F(cx2 - R * 0.95) + ' ' + F(cy2) + 'Z';
    if (g === 'ring') {
      var r2 = R * 0.55;
      return 'M' + F(cx2 - R) + ' ' + F(cy2) + 'a' + F(R) + ' ' + F(R) + ' 0 1 0 ' + F(2 * R) + ' 0a' + F(R) + ' ' + F(R) + ' 0 1 0 ' + F(-2 * R) + ' 0Z' +
             'M' + F(cx2 - r2) + ' ' + F(cy2) + 'a' + F(r2) + ' ' + F(r2) + ' 0 1 0 ' + F(2 * r2) + ' 0a' + F(r2) + ' ' + F(r2) + ' 0 1 0 ' + F(-2 * r2) + ' 0Z';
    }
    if (g === 'crosshair') {
      var ra = R * 0.62, rb = R * 0.34, tt = R * 0.16;
      var dx = 'M' + F(cx2 - ra) + ' ' + F(cy2) + 'a' + F(ra) + ' ' + F(ra) + ' 0 1 0 ' + F(2 * ra) + ' 0a' + F(ra) + ' ' + F(ra) + ' 0 1 0 ' + F(-2 * ra) + ' 0Z' +
               'M' + F(cx2 - rb) + ' ' + F(cy2) + 'a' + F(rb) + ' ' + F(rb) + ' 0 1 0 ' + F(2 * rb) + ' 0a' + F(rb) + ' ' + F(rb) + ' 0 1 0 ' + F(-2 * rb) + ' 0Z';
      dx += 'M' + F(cx2 - tt / 2) + ' ' + F(cy2 - R) + 'h' + F(tt) + 'v' + F(R - ra) + 'h-' + F(tt) + 'Z';
      dx += 'M' + F(cx2 - tt / 2) + ' ' + F(cy2 + ra) + 'h' + F(tt) + 'v' + F(R - ra) + 'h-' + F(tt) + 'Z';
      dx += 'M' + F(cx2 - R) + ' ' + F(cy2 - tt / 2) + 'v' + F(tt) + 'h' + F(R - ra) + 'v-' + F(tt) + 'Z';
      dx += 'M' + F(cx2 + ra) + ' ' + F(cy2 - tt / 2) + 'v' + F(tt) + 'h' + F(R - ra) + 'v-' + F(tt) + 'Z';
      return dx;
    }
    if (g === 'halftri') {
      var s2 = R * 0.9;
      return 'M' + F(cx2 - s2) + ' ' + F(cy2 - s2) + 'L' + F(cx2 + s2) + ' ' + F(cy2 - s2) + 'L' + F(cx2 - s2) + ' ' + F(cy2 + s2) + 'Z';
    }
    if (g === 'shard') return 'M' + F(cx2 - R * 0.9) + ' ' + F(cy2 + R * 0.7) + 'L' + F(cx2 + R) + ' ' + F(cy2 - R * 0.2) + 'L' + F(cx2 - R * 0.2) + ' ' + F(cy2 - R * 0.9) + 'Z';
    if (g === 'square') {
      var sq = R * 0.78;
      return 'M' + F(cx2 - sq) + ' ' + F(cy2 - sq) + 'h' + F(2 * sq) + 'v' + F(2 * sq) + 'h-' + F(2 * sq) + 'Z';
    }
    if (g === 'bracket') {
      var L2 = R * 1.7, tb = R * 0.5, x0 = cx2 - R * 0.85, y0 = cy2 - R * 0.85;
      return 'M' + F(x0) + ' ' + F(y0) + 'h' + F(L2) + 'v' + F(tb) + 'h-' + F(L2 - tb) + 'v' + F(L2 - tb) + 'h-' + F(tb) + 'Z';
    }
    if (g === 'kleeqmark') {
      var pts = [[240, 40], [190, 40], [100, 130], [190, 220], [240, 220], [150, 130]],
          sc = R / 90, ox = cx2 - 170 * sc, oy = cy2 - 130 * sc;
      return 'M' + pts.map(function (q) { return F(ox + q[0] * sc) + ' ' + F(oy + q[1] * sc); }).join('L') + 'Z';
    }
    if (g === 'blade') return 'M' + F(cx2 - R) + ' ' + F(cy2 - R * 0.18) + 'L' + F(cx2 + R * 0.45) + ' ' + F(cy2 - R * 0.18) + 'L' + F(cx2 + R) + ' ' + F(cy2 - R * 0.02) + 'L' + F(cx2 + R * 0.5) + ' ' + F(cy2 + R * 0.2) + 'L' + F(cx2 - R * 0.7) + ' ' + F(cy2 + R * 0.24) + 'L' + F(cx2 - R * 0.7) + ' ' + F(cy2 + R * 0.08) + 'L' + F(cx2 - R) + ' ' + F(cy2 + R * 0.08) + 'Z';
    if (g === 'teardrop') return 'M' + F(cx2) + ' ' + F(cy2 - R) + 'C' + F(cx2 + R * 0.72) + ' ' + F(cy2 - R * 0.1) + ' ' + F(cx2 + R * 0.62) + ' ' + F(cy2 + R * 0.5) + ' ' + F(cx2) + ' ' + F(cy2 + R * 0.62) + 'C' + F(cx2 - R * 0.62) + ' ' + F(cy2 + R * 0.5) + ' ' + F(cx2 - R * 0.72) + ' ' + F(cy2 - R * 0.1) + ' ' + F(cx2) + ' ' + F(cy2 - R) + 'Z';
    if (g === 'slot') {
      var sw = R * 0.24, sh = R * 1.55;
      return 'M' + F(cx2 - sw) + ' ' + F(cy2 - sh) + 'L' + F(cx2 + sw) + ' ' + F(cy2 - sh) + 'L' + F(cx2 + sw) + ' ' + F(cy2 + sh) + 'L' + F(cx2 - sw) + ' ' + F(cy2 + sh) + 'Z';
    }
    if (g === 'crescent') return 'M' + F(cx2) + ' ' + F(cy2 - R) + 'A' + F(R) + ' ' + F(R) + ' 0 1 1 ' + F(cx2) + ' ' + F(cy2 + R) + 'A' + F(R * 1.5) + ' ' + F(R * 1.5) + ' 0 0 0 ' + F(cx2) + ' ' + F(cy2 - R) + 'Z';
    var K2 = 0.55, t3 = R * 0.55;
    return 'M' + F(cx2 - R) + ' ' + F(cy2 - R * 0.5 + K2 * R) + 'L' + F(cx2) + ' ' + F(cy2 - R * 0.5) + 'L' + F(cx2 + R) + ' ' + F(cy2 - R * 0.5 + K2 * R) + 'L' + F(cx2 + R) + ' ' + F(cy2 - R * 0.5 + K2 * R + t3) + 'L' + F(cx2) + ' ' + F(cy2 - R * 0.5 + t3) + 'L' + F(cx2 - R) + ' ' + F(cy2 - R * 0.5 + K2 * R + t3) + 'Z';
  }

  var NW = 52;
  var WTS = (function () {
    var a = [];
    for (var i = 0; i < NW; i++) {
      var w = 0.08 + (0.47 - 0.08) * (i / (NW - 1));
      a.push(i >= NW - 10 ? Math.min(w * 2.25, 0.52) : w);
    }
    return a;
  })();

  function build(o) {
    o = o || {};
    var W = Math.max(16, Math.round(o.w || 900)),
        H = Math.max(16, Math.round(o.h || 700)),
        glyph = o.glyph || 'star',
        style = o.style || 'camo',
        u = Math.max(4, +o.cell || 26),
        rot = +o.rot || 0,
        variety = Math.max(0, Math.min(1, (o.variety == null ? 45 : o.variety) / 100)),
        dust = Math.max(0, Math.min(1, (o.dust == null ? 18 : o.dust) / 100)),
        bands = Math.max(2, Math.min(16, +o.bands || 5)),
        spaceK = 1 - Math.max(0, Math.min(90, o.space == null ? 8 : o.space)) / 100,
        ink = o.ink || '#f2f2f4',
        ground = o.ground || '#141312',
        sd = (o.seed || 7) >>> 0;

    var rnd = rng(sd * 83 + 41);
    var ph = [rnd() * 6.283, rnd() * 6.283, rnd() * 6.283, rnd() * 6.283];
    /* the terrain field every style reads from */
    var fld = function (x, y) {
      var sc = 420 - variety * 220, a = x / sc, b = y / sc;
      var wa = a + (0.5 + variety * 0.7) * Math.sin(b * 1.7 + ph[3]),
          wb = b + (0.5 + variety * 0.7) * Math.sin(a * 1.7 + ph[2]);
      var v = Math.sin(wa + ph[0]) + Math.sin(wb * 1.3 + ph[1]) + 0.7 * Math.sin(wa * 2.1 + wb + ph[2]);
      return Math.max(0, Math.min(1, (v + 2.4) / 4.8));
    };
    var F1 = function (n) { return n.toFixed(1); };
    var out = [];
    var MK = function (x, y, R, ang) {
      if (R <= 0.2) return;
      out.push('<path d="' + glyphPath(glyph, x, y, R) + '" fill="' + ink + '" fill-rule="evenodd"' +
        ((ang || rot) ? ' transform="rotate(' + (ang == null ? rot : ang).toFixed(1) + ' ' + F1(x) + ' ' + F1(y) + ')"' : '') + '/>');
    };

    if (style === 'flow') {
      var rowGap = u * 1.15, stepX = u * 1.3;
      for (var fy = u / 2; fy < H; fy += rowGap) {
        for (var fx = u / 2; fx < W; fx += stepX) {
          var vf = fld(fx, fy);
          var angf = rot - Math.pow(vf, 1.3) * 95;
          var len = u * (0.6 + vf * 0.5) * spaceK,
              th = Math.max(1.4, u * (0.05 + Math.pow(vf, 1.6) * 0.24)) * spaceK;
          var hl = len / 2, ht = th / 2;
          out.push('<path d="M' + F1(fx - hl) + ' ' + F1(fy - ht) + 'L' + F1(fx + hl) + ' ' + F1(fy - ht) +
            'L' + F1(fx + hl) + ' ' + F1(fy + ht) + 'L' + F1(fx - hl) + ' ' + F1(fy + ht) + 'Z" fill="' + ink +
            '" transform="rotate(' + angf.toFixed(1) + ' ' + F1(fx) + ' ' + F1(fy) + ')"/>');
        }
      }
    } else if (style === 'lines') {
      var lGap = u * 1.5, lStep = u * 0.85;
      var wob = function (x, row) { return (fld(x, row) - 0.5) * u * 2.6 * (1 + (bands - 2) / 8 * 2); };
      for (var lr = u / 2; lr < H; lr += lGap) {
        for (var lx = u / 2; lx < W; lx += lStep) {
          var ly = lr + wob(lx, lr);
          if (ly < u / 2 || ly > H - u / 2) continue;
          MK(lx, ly, u * (0.1 + Math.pow(fld(lx, ly), 1.4) * 0.32) * spaceK);
        }
      }
    } else if (style === 'topo') {
      for (var ty = u / 2; ty < H; ty += u) {
        for (var tx = u / 2; tx < W; tx += u) {
          var vt = fld(tx, ty), tv = Math.max(0, Math.min(0.999, vt)) * bands,
              f2 = tv - Math.floor(tv), el = Math.floor(tv) / bands, li;
          if (f2 < 0.22) {
            var across = 1 - Math.abs(f2 - 0.11) / 0.11;
            li = Math.min(NW - 1, Math.round(NW * 0.5 + el * NW * 0.34 + Math.floor(across * 5) / 5 * NW * 0.16));
          } else if (f2 < 0.36) {
            var sh2 = (0.36 - f2) / 0.14;
            li = Math.round(NW * 0.28 + el * NW * 0.18 + Math.floor(sh2 * 4) / 4 * NW * 0.12);
          } else {
            var swell = 1 - Math.abs(f2 - 0.66) / 0.34;
            li = Math.round(NW * 0.08 + el * NW * 0.16 + Math.max(0, swell) * NW * 0.06);
          }
          MK(tx, ty, u * WTS[Math.max(0, Math.min(NW - 1, li))] * spaceK);
        }
      }
    } else {
      /* camo — banded stripes displaced by a wave, the original flag-field rule */
      var SH = H / 13, amp = SH * (0.25 + variety * 0.6);
      var wave = function (x) {
        return amp * Math.sin(x / W * 6.283 * 1.6 + ph[0]) + amp * 0.5 * Math.sin(x / W * 6.283 * 3.7 + ph[1]);
      };
      var fade = function (x, y) {
        return 0.5 + 0.5 * Math.sin(x / W * 6.283 + ph[2]) * Math.sin(y / H * 6.283 * 1.3 + ph[1]);
      };
      for (var cy = u / 2; cy < H; cy += u) {
        for (var cx = u / 2; cx < W; cx += u) {
          var yw = cy - wave(cx);
          var s = Math.floor(((yw % H) + H) % H / SH);
          var fd = fade(cx, cy);
          if (s % 2 === 0) { if (rnd() < 0.75 + fd * 0.25) MK(cx, cy, u * (0.34 + fd * 0.16) * spaceK); }
          else { MK(cx, cy, u * 0.18 * spaceK); }
        }
      }
    }
    /* scatter — the same dust pass the source applies to empty ground */
    if (dust > 0) {
      for (var dy = u / 2; dy < H; dy += u) {
        for (var dx2 = u / 2; dx2 < W; dx2 += u) {
          if (rnd() < dust * 0.12) MK(dx2, dy, u * 0.13 * spaceK);
        }
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W +
      '" height="' + H + '"><rect width="' + W + '" height="' + H + '" fill="' + ground + '"/>' +
      out.join('') + '</svg>';
  }

  window.KLEEQ_GLYPH_FIELDS = { GLYPHS: GLYPHS, STYLES: STYLES, glyphPath: glyphPath, build: build };
})();
