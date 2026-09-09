/**
 * Terminal output. The exit criterion for M1 is that someone who is not the
 * author runs this and the output makes sense without explanation — so every
 * number states its denominator, and every violation names its rule.
 */
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const ESC = String.fromCharCode(27);
const c = (code) => (s) => (useColor ? `${ESC}[${code}m${s}${ESC}[0m` : String(s));

export const dim = c('2;39');
export const bold = c('1');
export const green = c('32');
export const red = c('31');
export const yellow = c('33');
export const magenta = c('35');
export const cyan = c('36');

const pad = (s, n) => String(s).padStart(n);
const padEnd = (s, n) => String(s).padEnd(n);

export function bar(pct, width = 34) {
  const n = Math.max(0, Math.min(width, Math.round(pct * width)));
  return '█'.repeat(n) + dim('░'.repeat(width - n));
}

function tone(pct) {
  return pct >= 0.9 ? green : pct >= 0.6 ? yellow : red;
}

export function renderSummary(r, opts = {}) {
  const L = [];
  const push = (s = '') => L.push(s);

  push();
  push(`  ${bold('assay')}  ${dim(r.root)}`);
  if (r.config.configFile) push(`  ${dim(r.config.configFile)}`);
  push('  ' + dim('─'.repeat(58)));

  if (r.scored === 0) {
    push('  No token-bearing declarations found.');
    push(dim('  Either this tree has no StyleX, or every property in it is untokenizable.'));
    push();
    return L.join('\n');
  }

  const pct = r.score;
  push(`  ${tone(pct)(bar(pct))}  ${bold((pct * 100).toFixed(1) + '%')}`);
  push();
  push(`  ${green(pad(r.token, 6))}  token-resolved`);
  push(`  ${red(pad(r.literal, 6))}  raw literals`);
  push(`  ${pad(r.scored, 6)}  scored declarations`);
  push();
  push(dim('  excluded from the score'));
  push(dim(`  ${pad(r.excluded.dynamic, 6)}  dynamic — runtime value, unknowable by design`));
  push(dim(`  ${pad(r.excluded.neutral, 6)}  keyword, zero, or layout geometry`));
  push(dim(`  ${pad(r.excluded.cssvar, 6)}  raw var(--…)`));
  push(dim(`  ${pad(r.excluded.expr, 6)}  unresolved expression`));
  push(dim(`  ${pad(r.excluded.untokenizable, 6)}  non-token property — display, position, …`));
  push();

  if (r.families.length) {
    push(bold('  by family'));
    for (const f of r.families) {
      push(
        `  ${padEnd(f.name, 8)} ${tone(f.score)(bar(f.score, 18))} ` +
        `${pad((f.score * 100).toFixed(0) + '%', 5)}  ${dim(`${f.token}/${f.total}`)}`,
      );
    }
    push();
  }

  if (Object.keys(r.byRule).length) {
    push(bold('  by rule'));
    for (const [rule, n] of Object.entries(r.byRule).sort((a, b) => b[1] - a[1])) {
      push(`  ${pad(n, 6)}  ${rule}`);
    }
    push();
  }

  if (Object.keys(r.byOwner).length) {
    push(bold('  by owner'));
    for (const [owner, n] of Object.entries(r.byOwner).sort((a, b) => b[1] - a[1])) {
      push(`  ${pad(n, 6)}  ${owner}`);
    }
    push();
  }

  push(`  ${pad(r.stats.files, 6)}  files scanned`);
  push(`  ${pad(r.stats.callSites, 6)}  stylex.create call sites`);
  push(`  ${pad(r.tokens.defined.length, 6)}  tokens defined`);
  push(`  ${pad(r.tokens.dead.length, 6)}  tokens never referenced`);
  if (r.suppressed.length) push(`  ${pad(r.suppressed.length, 6)}  ${dim('violations allow-listed')}`);
  if (r.stats.excludedFiles) push(`  ${pad(r.stats.excludedFiles, 6)}  ${dim('files excluded')}`);
  if (r.stats.unparsed.length) push(`  ${yellow(pad(r.stats.unparsed.length, 6))}  files failed to parse`);
  push();

  if (r.config.contrast.enabled && r.contrast.checked) {
    const f = r.contrast.failing.length;
    const head = f === 0
      ? green(`  ✓ contrast ${r.contrast.level}: ${r.contrast.checked} real pairings, all pass`)
      : red(`  ✗ contrast ${r.contrast.level}: ${f} of ${r.contrast.checked} real pairings fail`);
    push(head);
    for (const x of r.contrast.failing.slice(0, 8)) {
      push(
        `    ${x.file}:${x.line} ${dim(x.styleRule)}  ` +
        `${x.ratio}:1 ${dim(`needs ${x.required}`)}  ${x.fg} on ${x.bg}`,
      );
    }
    if (r.contrast.unpaired) {
      push(dim(`    ${r.contrast.unpaired} pairings not checkable — background is inherited or translucent`));
    }
    push();
  }

  // A score one file can dominate is not a score.
  const worst = {};
  for (const v of r.violations) worst[v.file] = (worst[v.file] || 0) + 1;
  const top = Object.entries(worst).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (top.length) {
    const [topFile, topN] = top[0];
    if (topN >= 25 && topN / r.scored > 0.2) {
      push(yellow(`  !  ${((topN / r.scored) * 100).toFixed(0)}% of all violations come from one file:`));
      push(`     ${topFile}`);
      push(dim('     Generated or vendored code skews the score. Add it to `exclude`.'));
      push();
    }
    push(bold('  most literals'));
    for (const [f, n] of top) push(`  ${pad(n, 6)}  ${f}`);
    push();
  }

  if (opts.violations) {
    push(bold('  violations'));
    for (const v of r.violations) {
      push(`  ${v.file}:${v.line}  ${v.prop}: ${v.value}`);
      push(dim(`      ${v.rule} · in ${v.styleRule}${v.owner ? ` · ${v.owner}` : ''}`));
    }
    push();
  }

  return L.join('\n');
}

export function renderTokens(r) {
  const L = [];
  const push = (s = '') => L.push(s);
  const short = (id) => id.split('#').pop();

  push();
  push(`  ${bold('tokens')}  ${dim(r.root)}`);
  push('  ' + dim('─'.repeat(58)));
  push(`  ${r.tokens.defined.length} defined · ${r.tokens.referenced.length} referenced · ${r.tokens.dead.length} dead`);
  push();

  if (r.config.publishesTokens) {
    push(dim('  publishesTokens is on — dead-token analysis is disabled, because'));
    push(dim('  the consumers of these tokens are not in this tree.'));
    push();
  }

  const byFile = {};
  for (const id of r.tokens.defined) {
    const [file] = id.split('#');
    (byFile[file] = byFile[file] || []).push(id);
  }
  for (const [file, ids] of Object.entries(byFile)) {
    push(`  ${bold(file)}`);
    for (const id of ids) {
      const v = r.tokens.values[id];
      const isDead = r.tokens.dead.includes(id);
      const name = padEnd(short(id), 34);
      push(`    ${isDead ? red(name) : name} ${dim(v ?? '—')}${isDead ? red('  dead') : ''}`);
    }
    push();
  }
  return L.join('\n');
}

export function renderContrast(r) {
  const L = [];
  const push = (s = '') => L.push(s);
  push();
  push(`  ${bold('contrast')}  ${dim(`${r.contrast.level} · real pairings only`)}`);
  push('  ' + dim('─'.repeat(58)));
  if (!r.contrast.checked) {
    push('  No co-declared foreground/background pairs found.');
    push(dim('  Assay only checks colours declared together in one style rule, on an'));
    push(dim('  opaque background — inherited and translucent backdrops depend on what'));
    push(dim('  is painted behind them, which is not knowable from the style rule.'));
    push();
    return L.join('\n');
  }
  for (const x of r.contrast.results) {
    const mark = x.passes ? green('pass') : red('FAIL');
    push(
      `  ${mark}  ${pad(x.ratio.toFixed(2), 6)}:1 ${dim(`needs ${x.required}`)}` +
      `${x.large ? dim(' large') : '     '}  ${x.file}:${x.line} ${dim(x.styleRule)}`,
    );
    push(dim(`        ${x.fgToken ? x.fgToken.split('#').pop() : x.fg} on ${x.bgToken ? x.bgToken.split('#').pop() : x.bg}   (${x.fg} / ${x.bg})`));
  }
  push();
  if (r.contrast.unpaired) {
    push(dim(`  ${r.contrast.unpaired} pairings not checkable — background is inherited or translucent.`));
    push();
  }
  return L.join('\n');
}

export function renderExplain() {
  const L = [];
  const push = (s = '') => L.push(s);
  push();
  push(`  ${bold('How the score is defined')}`);
  push('  ' + dim('─'.repeat(58)));
  push();
  push('  The denominator is not every declaration. `display: flex` cannot carry');
  push('  a token, so counting it as a violation would make the score meaningless.');
  push('  Only properties in a token-bearing family are scored.');
  push();
  return L.join('\n');
}

/* ------------------------------------------------------------------ *
 * Diff
 * ------------------------------------------------------------------ */

export function renderDiff(d, labels = {}) {
  const L = [];
  const push = (s = '') => L.push(s);
  const s = d.summary;

  push();
  push(`  ${bold('assay diff')}  ${dim(`${labels.base ?? 'base'} → ${labels.head ?? 'head'}`)}`);
  push('  ' + dim('─'.repeat(58)));

  if (s.scoreDelta != null) {
    const pts = s.scoreDelta * 100;
    const arrow = pts > 0.05 ? green(`+${pts.toFixed(1)} pts`)
      : pts < -0.05 ? red(`${pts.toFixed(1)} pts`)
      : dim('no change');
    push(`  conformance  ${(s.baseScore * 100).toFixed(1)}% → ${bold((s.headScore * 100).toFixed(1) + '%')}   ${arrow}`);
    push();
  }

  const none =
    s.unitsStyleChanged === 0 && s.unitsAdded === 0 && s.unitsRemoved === 0 &&
    s.tokensChanged === 0 && s.tokensAdded === 0 && s.tokensRemoved === 0;
  if (none) {
    push(green('  ✓ no style changes'));
    push(dim('    Every unit hashes identically. Nothing rendered differently.'));
    push();
    return L.join('\n');
  }

  if (s.tokensChanged || s.tokensAdded || s.tokensRemoved) {
    push(bold('  tokens'));
    for (const t of d.tokens.changed) {
      push(`  ${yellow('~')} ${t.id.split('#').pop().padEnd(30)} ${dim(String(t.from))} → ${bold(String(t.to))}`);
    }
    for (const id of d.tokens.added) push(`  ${green('+')} ${id.split('#').pop()}`);
    for (const id of d.tokens.removed) push(`  ${red('-')} ${id.split('#').pop()}`);
    push();
  }

  if (d.blastRadius.units.length) {
    const files = d.blastRadius.files.length;
    push(bold('  blast radius'));
    push(
      `  ${d.blastRadius.units.length} unit${d.blastRadius.units.length === 1 ? '' : 's'} ` +
      `across ${files} file${files === 1 ? '' : 's'} reference the changed tokens`,
    );
    if (d.blastRadius.tokens.length > d.tokens.changed.length + d.tokens.removed.length) {
      push(dim(`  (via ${d.blastRadius.tokens.length} tokens once semantic aliases are followed)`));
    }
    for (const u of d.blastRadius.units.slice(0, 12)) {
      push(`    ${u.id}  ${dim(u.via.map((v) => v.split('#').pop()).join(', '))}`);
    }
    if (d.blastRadius.units.length > 12) {
      push(dim(`    … and ${d.blastRadius.units.length - 12} more`));
    }
    push();
  }

  if (s.unitsStyleChanged) {
    push(bold(`  styles changed  ${dim(`${s.unitsStyleChanged} unit${s.unitsStyleChanged === 1 ? '' : 's'}`)}`));
    for (const u of d.units.styleChanged.slice(0, 20)) {
      push(`  ${u.id}${u.line ? dim(':' + u.line) : ''}`);
      for (const ch of u.changes.slice(0, 6)) {
        const label = (x) => `${x.prop}${x.cond !== 'default' ? dim('@' + x.cond) : ''}`;
        const val = (x) => (x.token ? x.token.split('#').pop() : x.value ?? x.cat);
        if (ch.kind === 'changed') {
          push(`      ${yellow('~')} ${label(ch.to)}: ${dim(val(ch.from))} → ${val(ch.to)}`);
        } else if (ch.kind === 'added') {
          push(`      ${green('+')} ${label(ch.decl)}: ${val(ch.decl)}`);
        } else {
          push(`      ${red('-')} ${label(ch.decl)}: ${dim(val(ch.decl))}`);
        }
      }
      if (u.changes.length > 6) push(dim(`      … ${u.changes.length - 6} more`));
    }
    if (d.units.styleChanged.length > 20) {
      push(dim(`  … and ${d.units.styleChanged.length - 20} more units`));
    }
    push();
  }

  if (s.unitsAdded || s.unitsRemoved) {
    push(bold('  units'));
    for (const id of d.units.added.slice(0, 10)) push(`  ${green('+')} ${id}`);
    for (const id of d.units.removed.slice(0, 10)) push(`  ${red('-')} ${id}`);
    push();
  }

  push(dim('  Style changes are exact for styling. They do not catch markup or'));
  push(dim('  logic changes — union with changed source files for a visual set.'));
  push();
  return L.join('\n');
}
