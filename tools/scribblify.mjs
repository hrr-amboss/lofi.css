// scribblify.mjs — convert Lucide icons to the lofi.css hand-drawn "scribble" style.
// Reads lucide-static's icon-nodes.json, rewrites every shape as a wobbly
// single <path> symbol (viewBox 0 0 24 24, stroke inherits from .lf-icon CSS).
//
// Style rules (matching the hand-made lofi sprite):
//  - anchor points get a small deterministic jitter
//  - straight segments become quadratic curves with a gentle perpendicular bow
//  - circles/ellipses/large arcs are redrawn from jittered quadrant points
//  - tiny features (dots, small rounded corners) are kept crisp
//
// Usage (from tools/): npm install && node scribblify.mjs
// Writes ../lofi-icons.svg. Output is deterministic — same input, same wobble.

import { readFileSync, writeFileSync } from 'node:fs';

const NODES = JSON.parse(readFileSync(new URL('./node_modules/lucide-static/icon-nodes.json', import.meta.url), 'utf8'));

// ---------- deterministic RNG (per icon, seeded by name) ----------
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- helpers ----------
const f = n => {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? '0' : String(r);
};

const JIT = 0.20; // anchor jitter amplitude

function makeCtx(rng) {
  return {
    rng,
    r: (k = 1) => (rng() * 2 - 1) * JIT * k,
    sign: () => (rng() < 0.5 ? -1 : 1),
  };
}

// wobbly segment from (x1,y1) -> (x2,y2); endpoints already jittered
function wobbleSeg(ctx, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 2.2) return `L${f(x2)} ${f(y2)}`;
  const off = Math.min(0.8, 0.2 + len * 0.042) * ctx.sign() * (0.6 + 0.9 * ctx.rng());
  const px = -dy / len, py = dx / len;
  const slide = (ctx.rng() - 0.5) * len * 0.16;
  const cx = (x1 + x2) / 2 + px * off + (dx / len) * slide;
  const cy = (y1 + y2) / 2 + py * off + (dy / len) * slide;
  return `Q${f(cx)} ${f(cy)} ${f(x2)} ${f(y2)}`;
}

// arc chunk (ellipse-centered) -> quadratic with control at tangent intersection
// cx,cy center; rx,ry radii; phi rotation; a1->a2 sweep (radians, |a2-a1| <= ~100deg)
function ellipsePoint(cx, cy, rx, ry, phi, a) {
  const x = rx * Math.cos(a), y = ry * Math.sin(a);
  return [
    cx + x * Math.cos(phi) - y * Math.sin(phi),
    cy + x * Math.sin(phi) + y * Math.cos(phi),
  ];
}
function arcChunkQ(ctx, cx, cy, rx, ry, phi, a1, a2, jitterEnd = true) {
  const mid = (a1 + a2) / 2;
  const d = Math.abs(a2 - a1);
  const k = 1 / Math.cos(d / 2); // control distance factor for quadratic
  const [ex0, ey0] = ellipsePoint(cx, cy, rx * k, ry * k, phi, mid);
  const jc = 0.6; // control jitter
  const ctrlX = ex0 + ctx.r(jc), ctrlY = ey0 + ctx.r(jc);
  let [px, py] = ellipsePoint(cx, cy, rx, ry, phi, a2);
  if (jitterEnd) { px += ctx.r(); py += ctx.r(); }
  return { q: `Q${f(ctrlX)} ${f(ctrlY)} ${f(px)} ${f(py)}`, end: [px, py] };
}

// full circle/ellipse -> wobbly closed path
function scribbleEllipse(ctx, cx, cy, rx, ry) {
  const rMax = Math.max(rx, ry);
  if (rMax < 1.4) {
    // tiny dot-ish circle: keep crisp with two arcs
    return `M${f(cx - rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx + rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx - rx)} ${f(cy)}Z`;
  }
  const nSeg = rMax > 6 ? 6 : 4;
  const a0 = -Math.PI / 2 + (ctx.rng() - 0.5) * 0.3; // start near top, slightly varied
  let [sx, sy] = ellipsePoint(cx, cy, rx, ry, 0, a0);
  sx += ctx.r(); sy += ctx.r();
  let d = `M${f(sx)} ${f(sy)}`;
  let prev = a0;
  for (let i = 1; i <= nSeg; i++) {
    const a = a0 + (i / nSeg) * Math.PI * 2;
    if (i === nSeg) {
      // close back to the jittered start point via a control near the last chunk
      const mid = (prev + a) / 2;
      const k = 1 / Math.cos((a - prev) / 2);
      const [ex, ey] = ellipsePoint(cx, cy, rx * k, ry * k, 0, mid);
      d += `Q${f(ex + ctx.r(0.6))} ${f(ey + ctx.r(0.6))} ${f(sx)} ${f(sy)}Z`;
    } else {
      const { q } = arcChunkQ(ctx, cx, cy, rx, ry, 0, prev, a);
      d += q;
    }
    prev = a;
  }
  return d;
}

// rect (optionally rounded) -> wobbly closed path
function scribbleRect(ctx, x, y, w, h, rx, ry) {
  rx = Math.min(rx || 0, w / 2); ry = Math.min(ry ?? rx, h / 2);
  const j = () => ctx.r();
  if (rx < 0.05) {
    const p = [
      [x + j(), y + j()], [x + w + j(), y + j()],
      [x + w + j(), y + h + j()], [x + j(), y + h + j()],
    ];
    let d = `M${f(p[0][0])} ${f(p[0][1])}`;
    for (let i = 1; i < 4; i++) d += wobbleSeg(ctx, p[i - 1][0], p[i - 1][1], p[i][0], p[i][1]);
    d += wobbleSeg(ctx, p[3][0], p[3][1], p[0][0], p[0][1]) + 'Z';
    return d;
  }
  // rounded rect: wobbly sides, crisp-ish corner curves
  const pts = {
    ts: [x + rx + j(), y + j()], te: [x + w - rx + j(), y + j()],
    rs: [x + w + j(), y + ry + j()], re: [x + w + j(), y + h - ry + j()],
    bs: [x + w - rx + j(), y + h + j()], be: [x + rx + j(), y + h + j()],
    ls: [x + j(), y + h - ry + j()], le: [x + j(), y + ry + j()],
  };
  let d = `M${f(pts.ts[0])} ${f(pts.ts[1])}`;
  d += wobbleSeg(ctx, ...pts.ts, ...pts.te);
  d += `Q${f(x + w + ctx.r(0.4))} ${f(y + ctx.r(0.4))} ${f(pts.rs[0])} ${f(pts.rs[1])}`;
  d += wobbleSeg(ctx, ...pts.rs, ...pts.re);
  d += `Q${f(x + w + ctx.r(0.4))} ${f(y + h + ctx.r(0.4))} ${f(pts.bs[0])} ${f(pts.bs[1])}`;
  d += wobbleSeg(ctx, ...pts.bs, ...pts.be);
  d += `Q${f(x + ctx.r(0.4))} ${f(y + h + ctx.r(0.4))} ${f(pts.ls[0])} ${f(pts.ls[1])}`;
  d += wobbleSeg(ctx, ...pts.ls, ...pts.le);
  d += `Q${f(x + ctx.r(0.4))} ${f(y + ctx.r(0.4))} ${f(pts.ts[0])} ${f(pts.ts[1])}Z`;
  return d;
}

// ---------- SVG path parsing ----------
function tokenizePath(d) {
  const re = /[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g;
  return d.match(re) || [];
}

// parse into absolute, normalized commands: M L C Q A Z (S->C, T->Q, H/V->L)
function parsePath(d) {
  const toks = tokenizePath(d);
  const cmds = [];
  let i = 0, cmd = null;
  let cx = 0, cy = 0, sx = 0, sy = 0;
  let prevC = null, prevQ = null; // for S/T reflection
  const num = () => parseFloat(toks[i++]);
  while (i < toks.length) {
    const t = toks[i];
    if (/^[A-Za-z]$/.test(t)) { cmd = t; i++; }
    else if (cmd === null) throw new Error('path starts with number');
    // implicit repeat: M -> L
    let c = cmd;
    if ((c === 'M' || c === 'm') && cmds.length && cmds[cmds.length - 1].type !== 'Z' && /^[Mm]$/.test(cmd) === false) { /* unreachable */ }
    const rel = c === c.toLowerCase();
    const C = c.toUpperCase();
    switch (C) {
      case 'M': {
        let x = num(), y = num();
        if (rel) { x += cx; y += cy; }
        cmds.push({ type: 'M', x, y });
        cx = x; cy = y; sx = x; sy = y;
        cmd = rel ? 'l' : 'L'; // subsequent pairs are lineto
        prevC = prevQ = null;
        break;
      }
      case 'L': {
        let x = num(), y = num();
        if (rel) { x += cx; y += cy; }
        cmds.push({ type: 'L', x, y });
        cx = x; cy = y; prevC = prevQ = null;
        break;
      }
      case 'H': {
        let x = num(); if (rel) x += cx;
        cmds.push({ type: 'L', x, y: cy });
        cx = x; prevC = prevQ = null;
        break;
      }
      case 'V': {
        let y = num(); if (rel) y += cy;
        cmds.push({ type: 'L', x: cx, y });
        cy = y; prevC = prevQ = null;
        break;
      }
      case 'C': {
        let x1 = num(), y1 = num(), x2 = num(), y2 = num(), x = num(), y = num();
        if (rel) { x1 += cx; y1 += cy; x2 += cx; y2 += cy; x += cx; y += cy; }
        cmds.push({ type: 'C', x1, y1, x2, y2, x, y });
        prevC = [x2, y2]; prevQ = null; cx = x; cy = y;
        break;
      }
      case 'S': {
        let x2 = num(), y2 = num(), x = num(), y = num();
        if (rel) { x2 += cx; y2 += cy; x += cx; y += cy; }
        const x1 = prevC ? 2 * cx - prevC[0] : cx;
        const y1 = prevC ? 2 * cy - prevC[1] : cy;
        cmds.push({ type: 'C', x1, y1, x2, y2, x, y });
        prevC = [x2, y2]; prevQ = null; cx = x; cy = y;
        break;
      }
      case 'Q': {
        let x1 = num(), y1 = num(), x = num(), y = num();
        if (rel) { x1 += cx; y1 += cy; x += cx; y += cy; }
        cmds.push({ type: 'Q', x1, y1, x, y });
        prevQ = [x1, y1]; prevC = null; cx = x; cy = y;
        break;
      }
      case 'T': {
        let x = num(), y = num();
        if (rel) { x += cx; y += cy; }
        const x1 = prevQ ? 2 * cx - prevQ[0] : cx;
        const y1 = prevQ ? 2 * cy - prevQ[1] : cy;
        cmds.push({ type: 'Q', x1, y1, x, y });
        prevQ = [x1, y1]; prevC = null; cx = x; cy = y;
        break;
      }
      case 'A': {
        const rx = num(), ry = num(), rot = num();
        // arc flags may be glued to following numbers in compact data
        const readFlag = () => {
          const tok = toks[i];
          if (tok === '0' || tok === '1') { i++; return +tok; }
          // split compact token like "01-1.5"
          const fl = tok[0];
          toks[i] = tok.slice(1);
          if (toks[i] === '') i++;
          return +fl;
        };
        const laf = readFlag(), sf = readFlag();
        let x = num(), y = num();
        if (rel) { x += cx; y += cy; }
        cmds.push({ type: 'A', rx, ry, rot, laf, sf, x0: cx, y0: cy, x, y });
        cx = x; cy = y; prevC = prevQ = null;
        break;
      }
      case 'Z': {
        cmds.push({ type: 'Z' });
        cx = sx; cy = sy; prevC = prevQ = null;
        break;
      }
      default: throw new Error('unknown cmd ' + c);
    }
  }
  return cmds;
}

// endpoint -> center parameterization of an SVG arc (spec B.2.4)
function arcCenter(a) {
  let { rx, ry, rot, laf, sf, x0, y0, x, y } = a;
  const phi = (rot * Math.PI) / 180;
  rx = Math.abs(rx); ry = Math.abs(ry);
  const dx2 = (x0 - x) / 2, dy2 = (y0 - y) / 2;
  const x1p = Math.cos(phi) * dx2 + Math.sin(phi) * dy2;
  const y1p = -Math.sin(phi) * dx2 + Math.cos(phi) * dy2;
  const l = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (l > 1) { const s = Math.sqrt(l); rx *= s; ry *= s; }
  const sign = laf !== sf ? 1 : -1;
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const co = sign * Math.sqrt(Math.max(0, num / den));
  const cxp = co * (rx * y1p) / ry;
  const cyp = co * (-ry * x1p) / rx;
  const cx = Math.cos(phi) * cxp - Math.sin(phi) * cyp + (x0 + x) / 2;
  const cy = Math.sin(phi) * cxp + Math.cos(phi) * cyp + (y0 + y) / 2;
  const ang = (ux, uy, vx, vy) => {
    const dot = ux * vx + uy * vy;
    const len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
    let a2 = Math.acos(Math.min(1, Math.max(-1, dot / len)));
    if (ux * vy - uy * vx < 0) a2 = -a2;
    return a2;
  };
  const a1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let da = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sf && da > 0) da -= 2 * Math.PI;
  if (sf && da < 0) da += 2 * Math.PI;
  return { cx, cy, rx, ry, phi, a1, da };
}

// ---------- element -> scribbled d ----------
function scribblePathD(ctx, d) {
  const cmds = parsePath(d);
  let out = '';
  // current point: true (original) and jittered
  let tx = 0, ty = 0, jx = 0, jy = 0;
  let jsx = 0, jsy = 0; // jittered subpath start
  for (const c of cmds) {
    switch (c.type) {
      case 'M': {
        jx = c.x + ctx.r(); jy = c.y + ctx.r();
        jsx = jx; jsy = jy;
        out += `M${f(jx)} ${f(jy)}`;
        tx = c.x; ty = c.y;
        break;
      }
      case 'L': {
        const len = Math.hypot(c.x - tx, c.y - ty);
        const k = len < 0.6 ? 0 : len < 2 ? 0.5 : 1; // keep dots as dots
        const ex = c.x + ctx.r(k), ey = c.y + ctx.r(k);
        out += wobbleSeg(ctx, jx, jy, ex, ey);
        jx = ex; jy = ey; tx = c.x; ty = c.y;
        break;
      }
      case 'C': {
        // shift control points by the same delta as their neighboring endpoints,
        // plus a little independent wiggle, so tangents stay plausible
        const dx0 = jx - tx, dy0 = jy - ty;
        const ex = c.x + ctx.r(), ey = c.y + ctx.r();
        const dx1 = ex - c.x, dy1 = ey - c.y;
        const x1 = c.x1 + dx0 + ctx.r(0.5), y1 = c.y1 + dy0 + ctx.r(0.5);
        const x2 = c.x2 + dx1 + ctx.r(0.5), y2 = c.y2 + dy1 + ctx.r(0.5);
        out += `C${f(x1)} ${f(y1)} ${f(x2)} ${f(y2)} ${f(ex)} ${f(ey)}`;
        jx = ex; jy = ey; tx = c.x; ty = c.y;
        break;
      }
      case 'Q': {
        const ex = c.x + ctx.r(), ey = c.y + ctx.r();
        out += `Q${f(c.x1 + ctx.r(0.6))} ${f(c.y1 + ctx.r(0.6))} ${f(ex)} ${f(ey)}`;
        jx = ex; jy = ey; tx = c.x; ty = c.y;
        break;
      }
      case 'A': {
        const rMax = Math.max(Math.abs(c.rx), Math.abs(c.ry));
        if (rMax <= 2.6) {
          // small rounded corner: keep the arc, land on a jittered endpoint
          const ex = c.x + ctx.r(0.5), ey = c.y + ctx.r(0.5);
          out += `A${f(Math.abs(c.rx))} ${f(Math.abs(c.ry))} ${f(c.rot)} ${c.laf} ${c.sf} ${f(ex)} ${f(ey)}`;
          jx = ex; jy = ey;
        } else {
          // big arc: redraw as wobbly quadratic chunks
          const g = arcCenter({ ...c, x0: tx, y0: ty });
          const n = Math.max(1, Math.ceil(Math.abs(g.da) / (Math.PI / 2.2)));
          let prev = g.a1;
          for (let s = 1; s <= n; s++) {
            const a = g.a1 + (g.da * s) / n;
            const { q, end } = arcChunkQ(ctx, g.cx, g.cy, g.rx, g.ry, g.phi, prev, a);
            out += q;
            [jx, jy] = end;
            prev = a;
          }
        }
        tx = c.x; ty = c.y;
        break;
      }
      case 'Z': {
        // close with a wobble back to the jittered start if there is distance
        const len = Math.hypot(jsx - jx, jsy - jy);
        if (len > 2.2) out += wobbleSeg(ctx, jx, jy, jsx, jsy);
        out += 'Z';
        jx = jsx; jy = jsy;
        break;
      }
    }
  }
  return out;
}

function scribbleElement(ctx, [tag, attrs]) {
  const n = k => parseFloat(attrs[k] ?? 0);
  switch (tag) {
    case 'path': return scribblePathD(ctx, attrs.d);
    case 'circle': return scribbleEllipse(ctx, n('cx'), n('cy'), n('r'), n('r'));
    case 'ellipse': return scribbleEllipse(ctx, n('cx'), n('cy'), n('rx'), n('ry'));
    case 'rect': return scribbleRect(ctx, n('x'), n('y'), n('width'), n('height'), attrs.rx ? n('rx') : 0, attrs.ry ? n('ry') : undefined);
    case 'line': {
      const x1 = n('x1') + ctx.r(), y1 = n('y1') + ctx.r();
      const x2 = n('x2') + ctx.r(), y2 = n('y2') + ctx.r();
      return `M${f(x1)} ${f(y1)}` + wobbleSeg(ctx, x1, y1, x2, y2);
    }
    case 'polyline':
    case 'polygon': {
      const pts = (attrs.points || '').trim().split(/[\s,]+/).map(Number);
      const p = [];
      for (let i = 0; i < pts.length; i += 2) p.push([pts[i] + ctx.r(), pts[i + 1] + ctx.r()]);
      let d = `M${f(p[0][0])} ${f(p[0][1])}`;
      for (let i = 1; i < p.length; i++) d += wobbleSeg(ctx, p[i - 1][0], p[i - 1][1], p[i][0], p[i][1]);
      if (tag === 'polygon') d += wobbleSeg(ctx, p[p.length - 1][0], p[p.length - 1][1], p[0][0], p[0][1]) + 'Z';
      return d;
    }
    default: throw new Error('unhandled tag ' + tag);
  }
}

export function scribbleIcon(name, nodes) {
  const rng = mulberry32(hashStr(name));
  const ctx = makeCtx(rng);
  return nodes.map(el => scribbleElement(ctx, el)).join(' ');
}

// ---------- main ----------
const names = Object.keys(NODES).sort();
const symbols = [];
const errors = [];
for (const name of names) {
  try {
    const d = scribbleIcon(name, NODES[name]);
    symbols.push(`  <symbol id="lf-i-${name}" viewBox="0 0 24 24"><path d="${d}"/></symbol>`);
  } catch (e) {
    errors.push(`${name}: ${e.message}`);
  }
}
if (errors.length) {
  console.error('ERRORS:\n' + errors.join('\n'));
}
const version = JSON.parse(readFileSync(new URL('./node_modules/lucide-static/package.json', import.meta.url), 'utf8')).version;
const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
<!-- lofi-icons: ${symbols.length} scribble-style icons derived from Lucide v${version} (https://lucide.dev, ISC license).
     Hand-drawn conversion for lofi.css. Icons are stroke-only; style them with the .lf-icon class. -->
${symbols.join('\n')}
</svg>
`;
writeFileSync(new URL('../lofi-icons.svg', import.meta.url), sprite);
console.log(`wrote ${symbols.length} symbols, ${errors.length} errors`);
