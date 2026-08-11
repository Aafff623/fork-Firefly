import type { ComponentProps } from "react";
import { TrendChipIndicator, TrendChipPrefix, TrendChipRoot, TrendChipSuffix } from "./trend-chip";
export declare const TrendChip: (({ children, className, size, trend, variant, ...props }: import("./trend-chip").TrendChipRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Indicator: ({ children, className, ...props }: import("./trend-chip").TrendChipIndicatorProps) => import("react").ReactElement<{
        className?: string;
        "data-slot"?: string;
    }, string | import("react").JSXElementConstructor<any>> | null;
    Prefix: ({ children, className, ...props }: import("./trend-chip").TrendChipPrefixProps) => import("react/jsx-runtime").JSX.Element;
    Root: ({ children, className, size, trend, variant, ...props }: import("./trend-chip").TrendChipRootProps) => import("react/jsx-runtime").JSX.Element;
    Suffix: ({ children, className, ...props }: import("./trend-chip").TrendChipSuffixProps) => import("react/jsx-runtime").JSX.Element;
};
export type TrendChip = {
    IndicatorProps: ComponentProps<typeof TrendChipIndicator>;
    PrefixProps: ComponentProps<typeof TrendChipPrefix>;
    Props: ComponentProps<typeof TrendChipRoot>;
    RootProps: ComponentProps<typeof TrendChipRoot>;
    SuffixProps: ComponentProps<typeof TrendChipSuffix>;
};
export { TrendChipRoot, TrendChipIndicator, TrendChipPrefix, TrendChipSuffix };
export type { TrendChipRootProps, TrendChipRootProps as TrendChipProps, TrendChipIndicatorProps, TrendChipPrefixProps, TrendChipSuffixProps, } from "./trend-chip";
export { trendChipVariants } from "./trend-chip.styles";
export type { TrendChipVariants } from "./trend-chip.styles";
