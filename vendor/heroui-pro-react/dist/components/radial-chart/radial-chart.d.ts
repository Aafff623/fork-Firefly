import type { ComponentPropsWithRef, ReactNode } from "react";
import { Cell, PolarAngleAxis, RadialBar, Tooltip } from "recharts";
import { ChartTooltipContent } from "../chart-tooltip/chart-tooltip-content";
interface RadialChartRootProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
    /** Chart data — array of objects. Each entry becomes a concentric ring. */
    data: Record<string, number | string>[];
    /** Bar thickness in pixels. @default 10 */
    barSize?: number;
    /** Chart height in pixels. @default 300 */
    height?: number;
    /** Inner radius of the bar area. @default "30%" */
    innerRadius?: number | string;
    /** Outer radius of the bar area. @default "80%" */
    outerRadius?: number | string;
    /** Start angle in degrees. @default 90 */
    startAngle?: number;
    /** End angle in degrees. @default -270 */
    endAngle?: number;
    /** Chart width in pixels or percentage string. @default "100%" */
    width?: number | `${number}%`;
}
declare const RadialChartRoot: ({ barSize, children, className, data, endAngle, height, innerRadius, outerRadius, startAngle, width, ...props }: RadialChartRootProps) => import("react/jsx-runtime").JSX.Element;
export { RadialChartRoot };
export type { RadialChartRootProps };
export { Cell as RadialChartCell, PolarAngleAxis as RadialChartAngleAxis, RadialBar as RadialChartBar, Tooltip as RadialChartTooltip, ChartTooltipContent as RadialChartTooltipContent, };
