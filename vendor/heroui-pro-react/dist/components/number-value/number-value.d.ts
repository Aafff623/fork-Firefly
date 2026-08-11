import type { NumberFormatOptions } from "@internationalized/number";
import type { ComponentPropsWithRef, ReactNode } from "react";
interface NumberValuePrefixProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const NumberValuePrefix: ({ children, className, ...props }: NumberValuePrefixProps) => import("react/jsx-runtime").JSX.Element;
interface NumberValueSuffixProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const NumberValueSuffix: ({ children, className, ...props }: NumberValueSuffixProps) => import("react/jsx-runtime").JSX.Element;
interface NumberValueRootProps extends Omit<ComponentPropsWithRef<"span">, "children" | "style"> {
    /** Render prop receiving the formatted string, or ReactNode children (Prefix/Suffix subcomponents). When a function, you control the wrapping element. */
    children?: ((formatted: string) => ReactNode) | ReactNode;
    /** Currency code (e.g. "USD", "EUR"). Required when style is "currency". */
    currency?: string;
    /** Format options passed directly to NumberFormatter. Overrides individual convenience props. */
    formatOptions?: NumberFormatOptions;
    /** Override the locale from the nearest I18nProvider. */
    locale?: string;
    /** Maximum number of fraction digits. */
    maximumFractionDigits?: number;
    /** Minimum number of fraction digits. */
    minimumFractionDigits?: number;
    /** Notation style. @default "standard" */
    notation?: "compact" | "engineering" | "scientific" | "standard";
    /** Controls when the sign is displayed. */
    signDisplay?: "always" | "auto" | "exceptZero" | "never";
    /** Formatting style. @default "decimal" */
    style?: "currency" | "decimal" | "percent" | "unit";
    /** Unit type (e.g. "degree", "celsius"). Required when style is "unit". */
    unit?: string;
    /** The numeric value to format. */
    value: number;
}
declare const NumberValueRoot: ({ children, className, currency, formatOptions, locale: localeProp, maximumFractionDigits, minimumFractionDigits, notation, signDisplay, style, unit, value, ...props }: NumberValueRootProps) => import("react/jsx-runtime").JSX.Element;
export { NumberValuePrefix, NumberValueRoot, NumberValueSuffix };
export type { NumberValuePrefixProps, NumberValueRootProps, NumberValueSuffixProps };
