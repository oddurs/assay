# @stylegraph/test

Matchers that assert on tokens, a snapshot serializer a reviewer can read, and
a runner for the theme matrix.

```js
import { audit } from '@stylegraph/audit';
import { buildGraph } from '@stylegraph/extract';
import { createMatchers, createSerializer } from '@stylegraph/test';

const graph = buildGraph(await audit('src'));

expect.extend(createMatchers(graph));
expect.addSnapshotSerializer(createSerializer());
```

One graph serves the whole suite — build it once in a setup file.

## Assert on tokens, not class names

```js
expect('Button.tsx#primary').toUseToken('colors.accent');
expect('Button.tsx#primary').toHaveTokenStyle({
  backgroundColor: 'colors.accent',
  'backgroundColor@:hover': 'colors.accentHover',
});
expect('Button.tsx#primary').toBeFullyTokenized();
```

`toBeFullyTokenized` is the design system's promise written as an assertion:
every value in a token-bearing family came from a token. Properties outside
those families are not its business, and a runtime value is never counted
against you.

A failure says what it found:

```
Expected Banner.tsx#banner to use colors.accent.
  It uses:
    colors.fg
    space.lg
```

Units are named `<file>#<key>`, and any unambiguous suffix works — a test can
say `Button.tsx#primary` without repeating a path that will eventually move.

## Snapshots people can review

StyleX compiles a declaration to an atomic class name, so a style snapshot
diff reads like this:

```diff
- x1e2nbdu x78zum5 xdt5ytf
+ x1e2nbdu x78zum5 x1q0g3np
```

Nobody can review that, which is why style snapshots get deleted rather than
fixed. The serializer renders the declarations those classes encode:

```
Banner.tsx#banner
  color@:hover  #B01455
  color         colors.fg
  paddingBlock  space.lg
```

Now the diff says a padding moved from one token to another. `format(graph,
name)` returns the same block for a plain assertion or a log.

## The theme matrix

Themes are where design systems break, and almost nothing tests them. This
project's own site shipped three themes carrying contrast failures that a
base-theme-only check reported as passing.

```js
forEachTheme(graph, ({ name, valueOf }) => {
  test(`accent reads on ${name}`, () => {
    expect(
      contrast(valueOf('colors.accent'), valueOf('colors.bgBase')),
    ).toBeGreaterThan(4.5);
  });
});
```

The base theme is always included: a suite that ran only the alternates would
stop testing the theme most people see.

A theme in an app is usually several `createTheme` calls applied together —
colour, radius and elevation. Nothing in the source says which ones travel as a
set, so the suite says it:

```js
forEachTheme(graph, fn, {
  bundles: { bone: ['boneColors', 'boneShape', 'boneElevation'] },
});
```

Without that, a suite asserting on colour also runs once per radius theme,
re-testing the base value under a name implying otherwise. A bundle naming a
theme that does not exist is an error rather than a silent pass.

Part of [stylegraph](https://github.com/stylegraphjs/stylegraph).

MIT.
