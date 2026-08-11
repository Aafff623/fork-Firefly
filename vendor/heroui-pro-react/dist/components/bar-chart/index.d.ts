import type { ComponentProps } from "react";
import { BarChartBar, BarChartGrid, BarChartRoot, BarChartTooltip, BarChartTooltipContent, BarChartXAxis, BarChartYAxis } from "./bar-chart";
export declare const BarChart: (({ children, className, data, height, layout, margin, width, ...props }: import("./bar-chart").BarChartRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Bar: <DataPointType = any, ValueAxisType = any>(props: import("recharts").BarProps<DataPointType, ValueAxisType>) => import("react").ReactElement;
    Grid: typeof BarChartGrid;
    Root: ({ children, className, data, height, layout, margin, width, ...props }: import("./bar-chart").BarChartRootProps) => import("react/jsx-runtime").JSX.Element;
    Tooltip: typeof BarChartTooltip;
    TooltipContent: ({ active, className, hideHeader, indicator, label, labelFormatter, payload, valueFormatter, }: import("..").ChartTooltipContentProps) => import("react/jsx-runtime").JSX.Element | null;
    XAxis: <DataPointType = any, DataValueType = any>(props: import("recharts").XAxisProps<DataPointType, DataValueType>) => import("react").ReactElement;
    YAxis: <DataPointType = any, DataValueType = any>(props: import("recharts").YAxisProps<DataPointType, DataValueType>) => import("react").ReactElement;
};
export type BarChart = {
    BarProps: ComponentProps<typeof BarChartBar>;
    GridProps: ComponentProps<typeof BarChartGrid>;
    Props: ComponentProps<typeof BarChartRoot>;
    RootProps: ComponentProps<typeof BarChartRoot>;
    TooltipContentProps: ComponentProps<typeof BarChartTooltipContent>;
    TooltipProps: ComponentProps<typeof BarChartTooltip>;
    XAxisProps: ComponentProps<typeof BarChartXAxis>;
    YAxisProps: ComponentProps<typeof BarChartYAxis>;
};
export { BarChartBar, BarChartGrid, BarChartRoot, BarChartTooltip, BarChartTooltipContent, BarChartXAxis, BarChartYAxis, };
export type { BarChartRootProps } from "./bar-chart";
export { barChartVariants } from "./bar-chart.styles";
export type { BarChartVariants } from "./bar-chart.styles";
