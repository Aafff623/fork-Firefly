import type { ComponentProps } from "react";
import { AreaChartArea, AreaChartGrid, AreaChartRoot, AreaChartTooltip, AreaChartTooltipContent, AreaChartXAxis, AreaChartYAxis } from "./area-chart";
export declare const AreaChart: (({ children, className, data, height, margin, width, ...props }: import("./area-chart").AreaChartRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Area: <DataPointType = any, ValueAxisType = any>(props: import("recharts").AreaProps<DataPointType, ValueAxisType>) => import("react").ReactElement;
    Grid: typeof AreaChartGrid;
    Root: ({ children, className, data, height, margin, width, ...props }: import("./area-chart").AreaChartRootProps) => import("react/jsx-runtime").JSX.Element;
    Tooltip: typeof AreaChartTooltip;
    TooltipContent: ({ active, className, hideHeader, indicator, label, labelFormatter, payload, valueFormatter, }: import("..").ChartTooltipContentProps) => import("react/jsx-runtime").JSX.Element | null;
    XAxis: <DataPointType = any, DataValueType = any>(props: import("recharts").XAxisProps<DataPointType, DataValueType>) => import("react").ReactElement;
    YAxis: <DataPointType = any, DataValueType = any>(props: import("recharts").YAxisProps<DataPointType, DataValueType>) => import("react").ReactElement;
};
export type AreaChart = {
    AreaProps: ComponentProps<typeof AreaChartArea>;
    GridProps: ComponentProps<typeof AreaChartGrid>;
    Props: ComponentProps<typeof AreaChartRoot>;
    RootProps: ComponentProps<typeof AreaChartRoot>;
    TooltipContentProps: ComponentProps<typeof AreaChartTooltipContent>;
    TooltipProps: ComponentProps<typeof AreaChartTooltip>;
    XAxisProps: ComponentProps<typeof AreaChartXAxis>;
    YAxisProps: ComponentProps<typeof AreaChartYAxis>;
};
export { AreaChartArea, AreaChartGrid, AreaChartRoot, AreaChartTooltip, AreaChartTooltipContent, AreaChartXAxis, AreaChartYAxis, };
export type { AreaChartRootProps } from "./area-chart";
export { areaChartVariants } from "./area-chart.styles";
export type { AreaChartVariants } from "./area-chart.styles";
