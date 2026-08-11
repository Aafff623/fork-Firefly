import type { ComponentPropsWithRef, ReactNode } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, Tooltip } from "recharts";
import { ChartTooltipContent } from "../chart-tooltip/chart-tooltip-content";
interface RadarChartRootProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
    /** Chart data — array of objects with a category key and numeric series fields. */
    data: Record<string, number | string>[];
    /** Chart height in pixels. @default 300 */
    height?: number;
    /** Chart width in pixels or percentage string. @default "100%" */
    width?: number | `${number}%`;
}
declare const RadarChartRoot: ({ children, className, data, height, width, ...props }: RadarChartRootProps) => import("react/jsx-runtime").JSX.Element;
export { RadarChartRoot };
export type { RadarChartRootProps };
export { PolarAngleAxis as RadarChartAngleAxis, PolarGrid as RadarChartGrid, PolarRadiusAxis as RadarChartRadiusAxis, Radar as RadarChartRadar, Tooltip as RadarChartTooltip, ChartTooltipContent as RadarChartTooltipContent, };
