import type { ComponentPropsWithRef, ReactNode } from "react";
import { Area, Bar, CartesianGrid, Line, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltipContent } from "../chart-tooltip/chart-tooltip-content";
interface ComposedChartRootProps extends ComponentPropsWithRef<"div"> {
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
declare const ComposedChartRoot: ({ children, className, data, height, margin, width, ...props }: ComposedChartRootProps) => import("react/jsx-runtime").JSX.Element;
export { ComposedChartRoot };
export type { ComposedChartRootProps };
export { Area as ComposedChartArea, Bar as ComposedChartBar, CartesianGrid as ComposedChartGrid, Line as ComposedChartLine, Tooltip as ComposedChartTooltip, XAxis as ComposedChartXAxis, YAxis as ComposedChartYAxis, ChartTooltipContent as ComposedChartTooltipContent, };
