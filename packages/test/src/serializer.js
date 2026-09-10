/**
 * A snapshot serializer a reviewer can read.
 *
 * StyleX renders a component's styles as a list of atomic class names, so a
 * snapshot diff looks like this:
 *
 *   - x1e2nbdu x78zum5 xdt5ytf
 *   + x1e2nbdu x78zum5 x1q0g3np
 *
 * Nobody can review that. It is the reason style snapshots get deleted rather
 * than fixed. Rendered as the declarations those classes encode, the same diff
 * says a padding changed from one token to another.
 */
import { findUnit, indexGraph, readable } from './resolve.js';

const CLASS = /^x[a-z0-9]{6,}$/;

/** Does this look like StyleX's compiled output rather than a real class? */
export function isAtomicClassName(value) {
  return typeof value === 'string' && CLASS.test(value);
}

/**
 * A serializer for vitest's `expect.addSnapshotSerializer` or jest's
 * `snapshotSerializers`.
 */
export function createSerializer() {
  return {
    test(value) {
      if (value && typeof value === 'object' && Array.isArray(value.declarations)) {
        return true;
      }
      // `stylex.props()` output: a className of atomic classes.
      return (
        value &&
        typeof value === 'object' &&
        typeof value.className === 'string' &&
        value.className.split(/\s+/).some(isAtomicClassName)
      );
    },

    serialize(value, config, indentation, depth, refs, printer) {
      if (Array.isArray(value.declarations)) {
        return printer(readable(value), config, indentation, depth, refs);
      }

      // A props object: show the declarations, and keep the class list only as
      // a count, since the names themselves are the part nobody can use.
      const classes = value.className.split(/\s+/).filter(Boolean);
      const shown = {
        classes: `${classes.length} atomic ${classes.length === 1 ? 'class' : 'classes'}`,
      };

      if (value.style && Object.keys(value.style).length) {
        // Dynamic styles arrive as CSS custom properties on the element.
        shown.dynamic = value.style;
      }
      return printer(shown, config, indentation, depth, refs);
    },
  };
}

/** Render one unit as a readable block, for a plain assertion or a log. */
export function format(graph, name) {
  const unit = findUnit(indexGraph(graph), name);
  if (!unit) return `(no unit named ${name})`;

  const decls = readable(unit);
  const width = Math.max(...Object.keys(decls).map((k) => k.length), 0);
  const lines = Object.entries(decls).map(
    ([prop, value]) => `  ${prop.padEnd(width)}  ${value}`,
  );
  return [`${unit.id}`, ...lines].join('\n');
}
