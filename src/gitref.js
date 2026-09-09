/**
 * Materialising a git ref.
 *
 * `assay diff main HEAD` has to compare two versions of a working tree, and the
 * only honest way to analyse a ref is to have the files on disk. `git archive`
 * is read-only, touches neither the index nor the working tree, and cannot
 * disturb uncommitted work — which matters, because this runs on machines where
 * someone is mid-edit.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

export function isGitRepo(dir) {
  const r = spawnSync('git', ['-C', dir, 'rev-parse', '--is-inside-work-tree'], {
    encoding: 'utf8',
  });
  return r.status === 0 && String(r.stdout).trim() === 'true';
}

export function refExists(dir, ref) {
  const r = spawnSync(
    'git',
    ['-C', dir, 'rev-parse', '--verify', '--quiet', `${ref}^{commit}`],
    {
      encoding: 'utf8',
    },
  );
  return r.status === 0;
}

export function repoRoot(dir) {
  const r = spawnSync('git', ['-C', dir, 'rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
  });
  return r.status === 0 ? String(r.stdout).trim() : null;
}

/**
 * Extract `ref` into a temp directory and return { dir, cleanup }.
 * `subpath` limits extraction to one directory of the repo.
 */
export function materialize(cwd, ref, subpath = null) {
  const root = repoRoot(cwd);
  if (!root) throw new Error(`not a git repository: ${cwd}`);

  const dir = mkdtempSync(join(tmpdir(), 'assay-ref-'));
  const args = ['-C', root, 'archive', '--format=tar', ref];
  if (subpath) args.push('--', subpath);

  try {
    const tar = execFileSync('git', args, { maxBuffer: 512 * 1024 * 1024 });
    mkdirSync(dir, { recursive: true });
    execFileSync('tar', ['-x', '-C', dir], {
      input: tar,
      maxBuffer: 512 * 1024 * 1024,
    });
  } catch (e) {
    rmSync(dir, { recursive: true, force: true });
    throw new Error(`could not read ref '${ref}': ${e.message.split('\n')[0]}`);
  }

  return {
    dir,
    root,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

/**
 * Resolve a diff argument to a directory to analyse.
 * A path on disk wins over a ref of the same name — the local thing you can see
 * is the less surprising interpretation.
 */
export function resolveSide(arg, opts = {}) {
  const asPath = resolve(arg);
  if (existsSync(asPath)) {
    return { kind: 'path', dir: asPath, label: arg, cleanup: () => {} };
  }
  const cwd = opts.cwd ?? process.cwd();
  if (isGitRepo(cwd) && refExists(cwd, arg)) {
    const { dir, root, cleanup } = materialize(cwd, arg, opts.subpath);
    const sub = opts.subpath ? join(dir, opts.subpath) : dir;
    return { kind: 'ref', dir: sub, root, label: arg, cleanup };
  }
  throw new Error(
    `'${arg}' is neither a path on disk nor a git ref in this repository`,
  );
}
