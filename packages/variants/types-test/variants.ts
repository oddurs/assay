/**
 * The types ARE the feature, so they get a test.
 *
 * Every `@ts-expect-error` below must be a genuine error: if the typing ever
 * loosens, tsc fails on the unused directive and this file stops compiling.
 * That is the assertion.
 */
import { defineVariants, describeVariants } from '@stylegraph/variants';
import type { VariantProps } from '@stylegraph/variants';

declare const style: Record<string, never>;

const config = {
  base: style,
  variants: {
    size: { sm: style, md: style, lg: style },
    tone: { quiet: style, loud: style },
  },
  defaultVariants: { size: 'md' as const },
  compoundVariants: [{ size: 'lg' as const, tone: 'loud' as const, style }],
};

const button = defineVariants(config);

// Valid uses.
button();
button({ size: 'sm' });
button({ size: 'lg', tone: 'loud' });
button({ size: null });
button({ style });

// @ts-expect-error 'xl' is not a value of the size axis
button({ size: 'xl' });

// @ts-expect-error 'colour' is not an axis
button({ colour: 'red' });

// A default must be a value the axis actually has. Written with the offending
// value on its own line, because `@ts-expect-error` suppresses only the line
// that follows it and a formatter is free to reflow a multi-line call.
defineVariants({
  variants: { size: { sm: style } },
  // @ts-expect-error 'nope' is not a size
  defaultVariants: { size: 'nope' },
});

// Consumers can name the prop type without restating the axes.
type ButtonProps = VariantProps<typeof config.variants>;
const props: ButtonProps = { size: 'sm', tone: 'quiet' };
void props;

const described = describeVariants(config);
void described;
