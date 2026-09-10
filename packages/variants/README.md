# @stylegraph/variants

Typed, compile-time variants for StyleX.

```ts
import * as stylex from '@stylexjs/stylex';
import { defineVariants } from '@stylegraph/variants';

const styles = stylex.create({
  base: { borderRadius: radius.round },
  sm: { padding: space.snug }, md: { padding: space.gutter },
  quiet: { backgroundColor: colors.bgRaised },
  loud: { backgroundColor: colors.accent },
});

export const button = defineVariants({
  base: styles.base,
  variants: {
    size: { sm: styles.sm, md: styles.md },
    tone: { quiet: styles.quiet, loud: styles.loud },
  },
  defaultVariants: { size: 'md', tone: 'quiet' },
  compoundVariants: [{ size: 'md', tone: 'loud', style: styles.emphatic }],
});

<button {...stylex.props(button({ size: 'sm' }))} />
```

## Typed

An unknown value does not compile:

```ts
button({ size: 'xl' }); // ✗ 'xl' is not a value of the size axis
button({ colour: 'red' }); // ✗ 'colour' is not an axis
```

The axes are inferred from the config, so there is nothing to keep in sync.
`VariantProps<typeof config.variants>` names the prop type for a consumer
without restating them.

## Order is the contract

StyleX merges by application order, and the last style wins:

```
base → variants → compound → the caller's style
```

The caller's `style` prop goes **last**, deliberately. A component its own
consumer cannot override is a component people fork.

`undefined` takes the default for an axis; **`null` opts out of it entirely**,
which is how a caller says "no size" rather than "the default size".

## Visible to the graph

Hand-rolled conditional style arrays are read by an analyser as unrelated
declarations — the fact that `sm` and `md` are two answers to one question is
lost. Because this runs at compile time, the structure is recorded:

```jsonc
"variants": { "Button.tsx#button": {
  "axes": { "size": ["sm", "md"], "tone": ["quiet", "loud"] } } }
```

So conformance, blast radius and documentation can all know what a component's
API actually is. No runtime variant library can offer that.

## Budget

This is the only package in the family that enters a production bundle, so it
carries rules the others do not: **zero runtime dependencies**, and a size
budget enforced by `scripts/task check` rather than merely intended.

Part of [stylegraph](https://github.com/stylegraphjs/stylegraph).

MIT.
