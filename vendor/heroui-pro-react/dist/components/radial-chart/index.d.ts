import type { ComponentProps } from "react";
import { RadialChartAngleAxis, RadialChartBar, RadialChartCell, RadialChartRoot, RadialChartTooltip, RadialChartTooltipContent } from "./radial-chart";
export declare const RadialChart: (({ barSize, children, className, data, endAngle, height, innerRadius, outerRadius, startAngle, width, ...props }: import("./radial-chart").RadialChartRootProps) => import("react/jsx-runtime").JSX.Element) & {
    AngleAxis: typeof RadialChartAngleAxis;
    Bar: typeof RadialChartBar;
    Cell: import("react").FunctionComponent<import("recharts").CellProps>;
    Root: ({ barSize, children, className, data, endAngle, height, innerRadius, outerRadius, startAngle, width, ...props }: import("./radial-chart").RadialChartRootProps) => import("react/jsx-runtime").JSX.Element;
    Tooltip: typeof RadialChartTooltip;
    TooltipContent: ({ active, className, hideHeader, indicator, label, labelFormatter, payload, valueFormatter, }: import("..").ChartTooltipContentProps) => import("react/jsx-runtime").JSX.Element | null;
};
export type RadialChart = {
    AngleAxisProps: ComponentProps<typeof RadialChartAngleAxis>;
    BarProps: ComponentProps<typeof RadialChartBar>;
    CellProps: ComponentProps<typeof RadialChartCell>;
    Props: ComponentProps<typeof RadialChartRoot>;
    RootProps: ComponentProps<typeof RadialChartRoot>;
    TooltipContentProps: ComponentProps<typeof RadialChartTooltipContent>;
    TooltipProps: ComponentProps<typeof RadialChartTooltip>;
};
export { RadialChartAngleAxis, RadialChartBar, RadialChartCell, RadialChartRoot, RadialChartTooltip, RadialChartTooltipContent, };
export type { RadialChartRootProps } from "./radial-chart";
export { radialChartVariants } from "./radial-chart.styles";
export type { RadialChartVariants } from "./radial-chart.styles";
