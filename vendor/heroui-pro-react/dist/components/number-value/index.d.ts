import type { ComponentProps } from "react";
import { NumberValuePrefix, NumberValueRoot, NumberValueSuffix } from "./number-value";
export declare const NumberValue: (({ children, className, currency, formatOptions, locale: localeProp, maximumFractionDigits, minimumFractionDigits, notation, signDisplay, style, unit, value, ...props }: import("./number-value").NumberValueRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Prefix: ({ children, className, ...props }: import("./number-value").NumberValuePrefixProps) => import("react/jsx-runtime").JSX.Element;
    Root: ({ children, className, currency, formatOptions, locale: localeProp, maximumFractionDigits, minimumFractionDigits, notation, signDisplay, style, unit, value, ...props }: import("./number-value").NumberValueRootProps) => import("react/jsx-runtime").JSX.Element;
    Suffix: ({ children, className, ...props }: import("./number-value").NumberValueSuffixProps) => import("react/jsx-runtime").JSX.Element;
};
export type NumberValue = {
    PrefixProps: ComponentProps<typeof NumberValuePrefix>;
    Props: ComponentProps<typeof NumberValueRoot>;
    RootProps: ComponentProps<typeof NumberValueRoot>;
    SuffixProps: ComponentProps<typeof NumberValueSuffix>;
};
export { NumberValueRoot, NumberValuePrefix, NumberValueSuffix };
export type { NumberValueRootProps, NumberValueRootProps as NumberValueProps, NumberValuePrefixProps, NumberValueSuffixProps, } from "./number-value";
export { numberValueVariants } from "./number-value.styles";
export type { NumberValueVariants } from "./number-value.styles";
