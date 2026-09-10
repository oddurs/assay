/**
 * Contrast on REAL pairings.
 *
 * Not every theoretical combination in the palette — only the foreground and
 * background that are declared together in the same style rule and therefore
 * actually render together. That is a much smaller set, and every failure in
 * it is a real one.
 *
 * The honest limit: a component whose background comes from a parent cannot be
 * checked statically. Those pairs are reported as `unpaired`, never as passes.
 */

/* --------------------------- colour parsing --------------------------- */

const NAMED = {
  white: '#ffffff',
  black: '#000000',
  red: '#ff0000',
  blue: '#0000ff',
  green: '#008000',
  gray: '#808080',
  grey: '#808080',
  silver: '#c0c0c0',
};

/** `rgb(0 0 0 / 50%)` is legal CSS; a bare parseFloat turns 50% into alpha 50. */
const alphaOf = (p) => (String(p).endsWith('%') ? parseFloat(p) / 100 : parseFloat(p));

export function parseColor(input) {
  if (typeof input !== 'string') return null;
  const s = input.trim().toLowerCase();

  if (NAMED[s]) return parseColor(NAMED[s]);

  let m = /^#([0-9a-f]{3,8})$/.exec(s);
  if (m) {
    const h = m[1];
    if (h.length === 3 || h.length === 4) {
      const [r, g, b] = [h[0], h[1], h[2]].map((c) => parseInt(c + c, 16));
      const a = h.length === 4 ? parseInt(h[3] + h[3], 16) / 255 : 1;
      return { r, g, b, a };
    }
    if (h.length === 6 || h.length === 8) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
      return { r, g, b, a };
    }
  }

  m = /^rgba?\(([^)]+)\)$/.exec(s);
  if (m) {
    const parts = m[1].split(/[,\s/]+/).filter(Boolean);
    if (parts.length >= 3) {
      const num = (p) =>
        p.endsWith('%') ? (parseFloat(p) / 100) * 255 : parseFloat(p);
      return {
        r: num(parts[0]),
        g: num(parts[1]),
        b: num(parts[2]),
        a: parts[3] != null ? alphaOf(parts[3]) : 1,
      };
    }
  }

  m = /^hsla?\(([^)]+)\)$/.exec(s);
  if (m) {
    const parts = m[1].split(/[,\s/]+/).filter(Boolean);
    if (parts.length >= 3) {
      const h = parseFloat(parts[0]);
      const sat = parseFloat(parts[1]) / 100;
      const l = parseFloat(parts[2]) / 100;
      const a = parts[3] != null ? alphaOf(parts[3]) : 1;
      const c = (1 - Math.abs(2 * l - 1)) * sat;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const mm = l - c / 2;
      const seg = [
        [c, x, 0],
        [x, c, 0],
        [0, c, x],
        [0, x, c],
        [x, 0, c],
        [c, 0, x],
      ][Math.floor((((h % 360) + 360) % 360) / 60)];
      return {
        r: Math.round((seg[0] + mm) * 255),
        g: Math.round((seg[1] + mm) * 255),
        b: Math.round((seg[2] + mm) * 255),
        a,
      };
    }
  }

  return null;
}

const chan = (v) => {
  const c = Math.min(255, Math.max(0, v)) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export function luminance({ r, g, b }) {
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

/** Composite a translucent foreground over an opaque background. */
export function flatten(fg, bg) {
  if (fg.a >= 1) return fg;
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

export function ratio(fg, bg) {
  const f = luminance(flatten(fg, bg));
  const b = luminance(bg);
  const [hi, lo] = f > b ? [f, b] : [b, f];
  return (hi + 0.05) / (lo + 0.05);
}

/* ----------------------------- the analysis ----------------------------- */

const LARGE_PX = 24;
const LARGE_BOLD_PX = 18.66;

function pxOf(value) {
  if (value == null) return null;
  const m = /^(-?\d*\.?\d+)px$/.exec(String(value).trim());
  return m ? parseFloat(m[1]) : null;
}

export function analyzeContrast(pairs, resolve, opts = {}) {
  const level = opts.level === 'AAA' ? 'AAA' : 'AA';
  const results = [];
  let unpaired = 0;

  const valueOf = (slot) =>
    slot ? (slot.token ? resolve(slot.token) : slot.literal) : undefined;

  for (const p of pairs.values()) {
    const byCond = p.byCond ?? {};
    const base = byCond.default ?? {};
    const seen = new Set();

    // Every condition renders its own pairing. `:hover` inherits whatever the
    // default state declared, exactly as the cascade does — so a hover colour
    // is checked against the default background, and the DEFAULT colour is
    // still checked on its own. Merging them into one pairing reports a pass
    // on text that is invisible at rest.
    for (const cond of Object.keys(byCond)) {
      const eff = { ...base, ...byCond[cond] };
      const fgRaw = eff.color;
      const bgRaw = eff.backgroundColor;
      if (!fgRaw || !bgRaw) {
        if (fgRaw || bgRaw) unpaired += 1;
        continue;
      }

      const fgVal = valueOf(fgRaw);
      const bgVal = valueOf(bgRaw);
      const fg = parseColor(fgVal);
      const bg = parseColor(bgVal);
      if (!fg || !bg) {
        unpaired += 1;
        continue;
      }

      // A TRANSLUCENT background is as unknowable as an inherited one: the
      // effective colour depends on whatever is painted behind it, which is not
      // in this style rule. Treating the film itself as the backdrop makes a
      // glass panel over a dark page look like light text on near-white.
      // Report it as unresolvable rather than inventing a verdict.
      if (bg.a < 1) {
        unpaired += 1;
        continue;
      }

      // The same colours under several conditions are one pairing, not three.
      const dedupe = `${fgVal}|${bgVal}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);

      const sizePx = pxOf(valueOf(eff.fontSize));
      const weight = valueOf(eff.fontWeight);
      const bold = weight != null && (Number(weight) >= 700 || weight === 'bold');
      const large =
        sizePx != null && (sizePx >= LARGE_PX || (bold && sizePx >= LARGE_BOLD_PX));

      const need = level === 'AAA' ? (large ? 4.5 : 7) : large ? 3 : 4.5;
      const r = ratio(fg, bg);

      results.push({
        file: p.file,
        line: p.line,
        styleRule: p.rule,
        cond,
        fg: fgVal,
        bg: bgVal,
        fgToken: fgRaw.token ?? null,
        bgToken: bgRaw.token ?? null,
        large,
        ratio: Math.round(r * 100) / 100,
        required: need,
        passes: r >= need,
        level,
        rule: 'contrast-below-threshold',
      });
    }
  }

  results.sort((a, b) => a.ratio - b.ratio);
  return {
    level,
    checked: results.length,
    failing: results.filter((r) => !r.passes),
    results,
    unpaired,
  };
}
