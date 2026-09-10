/**
 * Matchers that assert on tokens, not on generated class names.
 *
 * A failure has to say what it expected, what it found, and where — a matcher
 * that reports `false` sends someone to the compiler output to work out why.
 */
import { indexGraph, findUnit, findToken, readable, tokensUsed } from './resolve.js';

const list = (xs) => (xs.length ? xs.map((x) => `    ${x}`).join('\n') : '    (none)');

/**
 * Build the matchers against a graph. Vitest and jest both take the object
 * `expect.extend` wants, so the same factory serves either.
 *
 *   expect.extend(createMatchers(graph));
 */
export function createMatchers(graph) {
  const index = indexGraph(graph);

  const resolveUnit = (received) => {
    if (received && typeof received === 'object' && received.declarations)
      return received;
    return findUnit(index, String(received));
  };

  const missing = (received) => ({
    pass: false,
    message: () =>
      `Expected a styled unit, but nothing in the graph matches ${JSON.stringify(String(received))}.\n` +
      `  Units are named "<file>#<key>", for example "Button.tsx#primary".`,
  });

  return {
    /** The unit uses this token anywhere. */
    toUseToken(received, tokenName) {
      const unit = resolveUnit(received);
      if (!unit) return missing(received);

      const token = findToken(index, tokenName);
      const used = tokensUsed(unit);
      const pass = token
        ? (unit.tokens ?? []).includes(token.id)
        : used.includes(tokenName);

      return {
        pass,
        message: () =>
          pass
            ? `Expected ${unit.id} not to use ${tokenName}.`
            : `Expected ${unit.id} to use ${tokenName}.\n` +
              `  It uses:\n${list(used)}` +
              (token ? '' : `\n  No token named ${tokenName} exists in the graph.`),
      };
    },

    /**
     * The unit sets these properties to these tokens or values.
     * Keys may name a condition: `'padding@:hover'`.
     */
    toHaveTokenStyle(received, expected) {
      const unit = resolveUnit(received);
      if (!unit) return missing(received);

      const actual = readable(unit);
      const wrong = Object.entries(expected).filter(
        ([prop, want]) => actual[prop] !== want,
      );

      return {
        pass: wrong.length === 0,
        message: () =>
          wrong.length === 0
            ? `Expected ${unit.id} not to have that style.`
            : `Expected ${unit.id} to have:\n` +
              list(
                wrong.map(
                  ([prop, want]) =>
                    `${prop}: ${JSON.stringify(want)}  (found ${JSON.stringify(actual[prop] ?? undefined)})`,
                ),
              ),
      };
    },

    /**
     * Every value in a token-bearing family came from a token.
     *
     * The point of a design system, expressed as an assertion a component can
     * be held to in review.
     */
    toBeFullyTokenized(received) {
      const unit = resolveUnit(received);
      if (!unit) return missing(received);

      const literals = (unit.declarations ?? []).filter(
        (d) => d.cat === 'literal' && d.family,
      );

      return {
        pass: literals.length === 0,
        message: () =>
          literals.length === 0
            ? `Expected ${unit.id} to contain a raw value, but every one is a token.`
            : `Expected every value in ${unit.id} to come from a token.\n` +
              list(literals.map((d) => `${d.prop}: ${d.value}  (${d.rule})`)),
      };
    },
  };
}

/** The same assertions without a test framework, for a plain script. */
export function styleOf(graph, name) {
  const index = indexGraph(graph);
  const unit = findUnit(index, name);
  return unit ? readable(unit) : null;
}
