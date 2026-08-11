import type { ComponentPropsWithRef, ReactNode } from "react";
import { Cell, Label, Pie, Tooltip } from "recharts";
import { ChartTooltipContent } from "../chart-tooltip/chart-tooltip-content";
interface PieChartRootProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
    /** Chart height in pixels. @default 300 */
    height?: number;
    /** Chart width in pixels or percentage string like "100%". @default "100%" */
    width?: number | `${number}%`;
}
declare const PieChartRoot: ({ children, className, height, width, ...props }: PieChartRootProps) => import("react/jsx-runtime").JSX.Element;
export { PieChartRoot };
export type { PieChartRootProps };
export { Cell as PieChartCell, Label as PieChartLabel, Pie as PieChartPie, Tooltip as PieChartTooltip, ChartTooltipContent as PieChartTooltipContent, };
