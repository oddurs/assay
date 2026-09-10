/**
 * Reading and writing DTCG values.
 *
 * The 2025.10 spec takes structured values, not strings: a colour is
 * `{ colorSpace, components, alpha?, hex? }` with sRGB components in 0–1, and a
 * dimension is `{ value, unit }`. Emitting `"#7350F5"` produces a document that
 * looks right, validates nowhere, and is the single most common mistake in
 * implementations of this format.
 */

const HEX = /^#([0-9a-f]{3,8})$/i;
const RGB = /^rgba?\(([^)]+)\)$/i;
const DIMENSION = /^(-?\d*\.?\d+)(px|rem)$/;
const DURATION = /^(-?\d*\.?\d+)(ms|s)$/;
const NUMERIC = /^-?\d*\.?\d+$/;
const CUBIC = /^cubic-bezier\(([^)]+)\)$/i;

const round = (n, places = 4) => Number(n.toFixed(places));
const clamp01 = (n) => Math.min(1, Math.max(0, n));

/** A CSS colour string becomes a DTCG colour object, or null if it is not one. */
export function toColor(css) {
  if (typeof css !== 'string') return null;
  const value = css.trim();

  const hex = HEX.exec(value);
  if (hex) {
    const h = hex[1];
    const expand = (s) =>
      s.length === 3 || s.length === 4
        ? s
            .split('')
            .map((c) => c + c)
            .join('')
        : s;
    const full = expand(h);
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
    const alpha = full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1;
    const out = {
      colorSpace: 'srgb',
      components: [round(r), round(g), round(b)],
      // `hex` is an optional fallback for tools that cannot read components.
      hex: `#${full.slice(0, 6).toLowerCase()}`,
    };
    if (alpha !== 1) out.alpha = round(alpha);
    return out;
  }

  const rgb = RGB.exec(value);
  if (rgb) {
    const parts = rgb[1].split(/[,\s/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const channel = (p) =>
      p.endsWith('%') ? parseFloat(p) / 100 : parseFloat(p) / 255;
    const [r, g, b] = parts.slice(0, 3).map(channel);
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    const a =
      parts[3] == null
        ? 1
        : parts[3].endsWith('%')
          ? parseFloat(parts[3]) / 100
          : parseFloat(parts[3]);
    const byte = (n) =>
      Math.round(clamp01(n) * 255)
        .toString(16)
        .padStart(2, '0');
    const out = {
      colorSpace: 'srgb',
      components: [round(r), round(g), round(b)],
      hex: `#${byte(r)}${byte(g)}${byte(b)}`,
    };
    if (a !== 1) out.alpha = round(clamp01(a));
    return out;
  }

  return null;
}

/** A DTCG colour object becomes a CSS string a StyleX token can hold. */
export function fromColor(value) {
  if (!value || typeof value !== 'object') return null;
  const { components, alpha } = value;
  if (!Array.isArray(components) || components.length < 3) return value.hex ?? null;

  // `none` is a real component value in the spec; treat it as zero, which is
  // what it means for a missing channel in sRGB.
  const nums = components.slice(0, 3).map((c) => (c === 'none' ? 0 : Number(c)));
  if (nums.some((n) => Number.isNaN(n))) return value.hex ?? null;

  if (value.colorSpace && value.colorSpace !== 'srgb') {
    // Out of scope rather than guessed: converting Oklch to sRGB silently would
    // change the colour someone chose.
    return value.hex ?? null;
  }

  const byte = (n) =>
    Math.round(clamp01(n) * 255)
      .toString(16)
      .padStart(2, '0');
  const hex = `#${nums.map(byte).join('')}`;
  if (alpha == null || alpha === 1) return hex;
  return `rgba(${nums.map((n) => Math.round(clamp01(n) * 255)).join(', ')}, ${round(alpha, 3)})`;
}

export function toDimension(css) {
  const m = DIMENSION.exec(String(css).trim());
  if (!m) return null;
  return { value: Number(m[1]), unit: m[2] };
}

export function fromDimension(value) {
  if (value && typeof value === 'object' && 'value' in value) {
    return `${value.value}${value.unit ?? 'px'}`;
  }
  return typeof value === 'string' ? value : null;
}

export function toDuration(css) {
  const m = DURATION.exec(String(css).trim());
  if (!m) return null;
  return { value: Number(m[1]), unit: m[2] };
}

export function fromDuration(value) {
  if (value && typeof value === 'object' && 'value' in value) {
    return `${value.value}${value.unit ?? 'ms'}`;
  }
  return typeof value === 'string' ? value : null;
}

export function toCubicBezier(css) {
  const m = CUBIC.exec(String(css).trim());
  if (!m) return null;
  const nums = m[1].split(',').map((n) => Number(n.trim()));
  return nums.length === 4 && nums.every((n) => !Number.isNaN(n)) ? nums : null;
}

export function fromCubicBezier(value) {
  return Array.isArray(value) && value.length === 4
    ? `cubic-bezier(${value.join(', ')})`
    : null;
}

/**
 * Which DTCG type a raw CSS value is, decided from the value itself.
 *
 * A token's name is a hint, not evidence — `colors.borderRadius` is a real
 * thing someone will write. Returns null when the value is not a type this
 * format can carry, so the caller can report it rather than force it.
 */
export function classify(raw) {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (value === '') return null;

  if (toColor(value)) return 'color';
  if (DIMENSION.test(value)) return 'dimension';
  if (DURATION.test(value)) return 'duration';
  if (CUBIC.test(value)) return 'cubicBezier';
  if (NUMERIC.test(value)) return 'number';
  // Font weights arrive as keywords as often as numbers.
  if (/^(normal|bold|lighter|bolder)$/i.test(value)) return 'fontWeight';
  if (/,/.test(value) && /[a-z]/i.test(value) && !/\d(px|rem|s|ms)/.test(value)) {
    return 'fontFamily';
  }
  return null;
}

export function toValue(type, raw) {
  switch (type) {
    case 'color':
      return toColor(raw);
    case 'dimension':
      return toDimension(raw);
    case 'duration':
      return toDuration(raw);
    case 'cubicBezier':
      return toCubicBezier(raw);
    case 'number':
      return Number(raw);
    case 'fontWeight':
      return /^\d+$/.test(String(raw).trim()) ? Number(raw) : String(raw).trim();
    case 'fontFamily':
      return String(raw)
        .split(',')
        .map((f) => f.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    default:
      return null;
  }
}

export function fromValue(type, value) {
  switch (type) {
    case 'color':
      return fromColor(value);
    case 'dimension':
      return fromDimension(value);
    case 'duration':
      return fromDuration(value);
    case 'cubicBezier':
      return fromCubicBezier(value);
    case 'number':
      return String(value);
    case 'fontWeight':
      return String(value);
    case 'fontFamily':
      return Array.isArray(value)
        ? value.map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', ')
        : String(value);
    default:
      return typeof value === 'string' ? value : null;
  }
}
