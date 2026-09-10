/**
 * A DTCG document becomes StyleX source.
 *
 * Half a bridge is not a bridge. Designers change tokens in Figma; that has to
 * arrive in code without anyone copying hex values by hand.
 *
 * The rule that makes the output worth having: **an alias becomes an import,
 * not an inlined value.** Generated code that flattens `{palette.violet500}`
 * into `'#7350F5'` throws away the structure the designer expressed, and the
 * next export loses it for good.
 */
import { fromValue } from './values.js';

const ALIAS = /^\{([^}]+)\}$/;

const isToken = (node) => node && typeof node === 'object' && node.$value !== undefined;

/** Walk the document, resolving inherited `$type` down each group. */
function collect(node, path, inheritedType, out) {
  if (!node || typeof node !== 'object') return;
  const type = node.$type ?? inheritedType;

  if (isToken(node)) {
    out.push({
      path,
      type: node.$type ?? inheritedType,
      value: node.$value,
      description: node.$description,
    });
    return;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    collect(child, [...path, key], type, out);
  }
}

/** A JS identifier, or a quoted key when the name cannot be one. */
function keyFor(name) {
  return /^[A-Za-z_$][\w$]*$/.test(name) ? name : `'${name.replace(/'/g, "\\'")}'`;
}

function literal(value) {
  return `'${String(value).replace(/'/g, "\\'")}'`;
}

/**
 * @param doc a DTCG document
 * @returns {{ files, lossy }} generated sources keyed by filename
 */
export function fromDTCG(doc, opts = {}) {
  const lossy = [];
  const tokens = [];
  collect(doc, [], undefined, tokens);

  // Top-level group becomes a file; that is how a designer already thinks about
  // them, and it keeps generated modules small enough to read.
  const groups = new Map();
  for (const token of tokens) {
    if (token.path.length < 2) {
      lossy.push({
        token: token.path.join('.'),
        reason: 'a token at the document root has no group to live in',
      });
      continue;
    }
    const [group] = token.path;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(token);
  }

  const files = {};

  for (const [group, entries] of groups) {
    // Which other groups this one aliases into — each becomes an import.
    const imports = new Set();
    for (const entry of entries) {
      const alias = ALIAS.exec(String(entry.value));
      if (!alias) continue;
      const target = alias[1].split('.');
      if (target[0] !== group) imports.add(target[0]);
    }

    const lines = [];
    lines.push(`import * as stylex from '@stylexjs/stylex';`);
    for (const dep of [...imports].sort()) {
      lines.push(`import { ${dep} } from './${dep}.stylex';`);
    }
    lines.push('');
    lines.push(`export const ${group} = stylex.defineVars({`);

    for (const entry of entries) {
      const name = entry.path.slice(1).join('.');
      const alias = ALIAS.exec(String(entry.value));

      if (alias) {
        // The whole point: a reference stays a reference.
        const [head, ...rest] = alias[1].split('.');
        const ref = rest.length ? `${head}.${rest.join('.')}` : head;
        lines.push(`  ${keyFor(name)}: ${ref},`);
        continue;
      }

      const css = fromValue(entry.type, entry.value);
      if (css == null) {
        lossy.push({
          token: entry.path.join('.'),
          type: entry.type,
          reason: entry.type
            ? `no StyleX value for DTCG type "${entry.type}"`
            : 'token has no $type and none could be inferred',
        });
        continue;
      }
      if (entry.description) lines.push(`  // ${entry.description}`);
      lines.push(`  ${keyFor(name)}: ${literal(css)},`);
    }

    lines.push('});');
    lines.push('');
    files[`${group}.stylex.ts`] = lines.join('\n');
  }

  if (opts.header) {
    for (const name of Object.keys(files)) {
      files[name] = `${opts.header}\n\n${files[name]}`;
    }
  }

  return { files, lossy };
}
