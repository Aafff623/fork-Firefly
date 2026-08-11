import type { ChartTooltipVariants } from "./chart-tooltip.styles";
import type { ComponentPropsWithRef, ReactNode } from "react";
interface ChartTooltipRootProps extends ComponentPropsWithRef<"div">, ChartTooltipVariants {
    /** Controls visibility. When false, the tooltip is not rendered. */
    active?: boolean;
    children: ReactNode;
}
declare const ChartTooltipRoot: ({ active, children, className, indicator, ...props }: ChartTooltipRootProps) => import("react/jsx-runtime").JSX.Element | null;
interface ChartTooltipHeaderProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChartTooltipHeader: ({ children, className, ...props }: ChartTooltipHeaderProps) => import("react/jsx-runtime").JSX.Element;
interface ChartTooltipItemProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChartTooltipItem: ({ children, className, ...props }: ChartTooltipItemProps) => import("react/jsx-runtime").JSX.Element;
interface ChartTooltipIndicatorProps extends ComponentPropsWithRef<"span"> {
    /** Color for the indicator. Accepts any CSS color value. */
    color?: string;
}
declare const ChartTooltipIndicator: ({ className, color, style, ...props }: ChartTooltipIndicatorProps) => import("react/jsx-runtime").JSX.Element;
interface ChartTooltipLabelProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const ChartTooltipLabel: ({ children, className, ...props }: ChartTooltipLabelProps) => import("react/jsx-runtime").JSX.Element;
interface ChartTooltipValueProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const ChartTooltipValue: ({ children, className, ...props }: ChartTooltipValueProps) => import("react/jsx-runtime").JSX.Element;
export { ChartTooltipHeader, ChartTooltipIndicator, ChartTooltipItem, ChartTooltipLabel, ChartTooltipRoot, ChartTooltipValue, };
export type { ChartTooltipHeaderProps, ChartTooltipIndicatorProps, ChartTooltipItemProps, ChartTooltipLabelProps, ChartTooltipRootProps, ChartTooltipValueProps, };
