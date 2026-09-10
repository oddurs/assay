import type { StyleXStyles } from '@stylexjs/stylex';

/**
 * Hand-written because the package ships JavaScript, and the types are the
 * feature: `button({ size: 'xl' })` must not compile when the axis has no
 * `xl`. Inferring the axes from the config is what makes that possible.
 */
export type VariantMap = Record<string, Record<string, StyleXStyles>>;

export type VariantConfig<V extends VariantMap> = {
  base?: StyleXStyles;
  variants: V;
  defaultVariants?: { [A in keyof V]?: keyof V[A] };
  compoundVariants?: Array<{ [A in keyof V]?: keyof V[A] } & { style: StyleXStyles }>;
};

/** `null` opts an axis out entirely; omitting it takes the default. */
export type VariantProps<V extends VariantMap> = {
  [A in keyof V]?: keyof V[A] | null;
} & { style?: StyleXStyles };

export declare function defineVariants<V extends VariantMap>(
  config: VariantConfig<V>,
): (props?: VariantProps<V>) => StyleXStyles[];

export declare function describeVariants<V extends VariantMap>(
  config: VariantConfig<V>,
): Array<{ axis: keyof V & string; values: string[]; default: string | null }>;
