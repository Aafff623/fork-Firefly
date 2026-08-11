import type { TrendChipVariants } from "./trend-chip.styles";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { Chip } from "@heroui/react";
import React from "react";
interface TrendChipIndicatorProps extends ComponentPropsWithRef<"svg"> {
    children?: ReactNode;
    className?: string;
}
declare const TrendChipIndicator: ({ children, className, ...props }: TrendChipIndicatorProps) => React.ReactElement<{
    className?: string;
    "data-slot"?: string;
}, string | React.JSXElementConstructor<any>> | null;
interface TrendChipPrefixProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const TrendChipPrefix: ({ children, className, ...props }: TrendChipPrefixProps) => import("react/jsx-runtime").JSX.Element;
interface TrendChipSuffixProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const TrendChipSuffix: ({ children, className, ...props }: TrendChipSuffixProps) => import("react/jsx-runtime").JSX.Element;
interface TrendChipRootProps extends Omit<ComponentPropsWithRef<typeof Chip>, "children" | "color" | "size" | "variant"> {
    children: ReactNode;
    /** Size variant. @default "sm" */
    size?: TrendChipVariants["size"];
    /** Trend direction — controls both the arrow icon and the color. @default "up" */
    trend?: "down" | "neutral" | "up";
    /** Chip style variant. @default "soft" */
    variant?: "primary" | "secondary" | "soft" | "tertiary";
}
declare const TrendChipRoot: ({ children, className, size, trend, variant, ...props }: TrendChipRootProps) => import("react/jsx-runtime").JSX.Element;
export { TrendChipIndicator, TrendChipPrefix, TrendChipRoot, TrendChipSuffix };
export type { TrendChipIndicatorProps, TrendChipPrefixProps, TrendChipRootProps, TrendChipSuffixProps, };
