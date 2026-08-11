import type { ComponentPropsWithRef, ReactNode } from "react";
import { Area, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltipContent } from "../chart-tooltip/chart-tooltip-content";
interface AreaChartRootProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
    /** Chart data — array of objects with numeric/string fields for each series. */
    data: Record<string, number | string>[];
    /** Chart height in pixels. @default 300 */
    height?: number;
    /** Recharts margin. @default { top: 8, right: 8, bottom: 0, left: 0 } */
    margin?: {
        bottom?: number;
        left?: number;
        right?: number;
        top?: number;
    };
    /** Chart width in pixels or percentage string like "100%". @default "100%" */
    width?: number | `${number}%`;
}
declare const AreaChartRoot: ({ children, className, data, height, margin, width, ...props }: AreaChartRootProps) => import("react/jsx-runtime").JSX.Element;
export { AreaChartRoot };
export type { AreaChartRootProps };
export { Area as AreaChartArea, CartesianGrid as AreaChartGrid, Tooltip as AreaChartTooltip, XAxis as AreaChartXAxis, YAxis as AreaChartYAxis, ChartTooltipContent as AreaChartTooltipContent, };
