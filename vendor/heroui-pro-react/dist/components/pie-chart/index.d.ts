import type { ComponentProps } from "react";
import { PieChartCell, PieChartLabel, PieChartPie, PieChartRoot, PieChartTooltip, PieChartTooltipContent } from "./pie-chart";
export declare const PieChart: (({ children, className, height, width, ...props }: import("./pie-chart").PieChartRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Cell: import("react").FunctionComponent<import("recharts").CellProps>;
    Label: typeof PieChartLabel;
    Pie: {
        <DataPointType = any, DataValueType = any>(outsideProps: import("recharts").PieProps<DataPointType, DataValueType>): import("react").ReactElement;
        (outsideProps: import("recharts").PieProps<any, any>): import("react").ReactElement;
    };
    Root: ({ children, className, height, width, ...props }: import("./pie-chart").PieChartRootProps) => import("react/jsx-runtime").JSX.Element;
    Tooltip: typeof PieChartTooltip;
    TooltipContent: ({ active, className, hideHeader, indicator, label, labelFormatter, payload, valueFormatter, }: import("..").ChartTooltipContentProps) => import("react/jsx-runtime").JSX.Element | null;
};
export type PieChart = {
    CellProps: ComponentProps<typeof PieChartCell>;
    LabelProps: ComponentProps<typeof PieChartLabel>;
    PieProps: ComponentProps<typeof PieChartPie>;
    Props: ComponentProps<typeof PieChartRoot>;
    RootProps: ComponentProps<typeof PieChartRoot>;
    TooltipContentProps: ComponentProps<typeof PieChartTooltipContent>;
    TooltipProps: ComponentProps<typeof PieChartTooltip>;
};
export { PieChartCell, PieChartLabel, PieChartPie, PieChartRoot, PieChartTooltip, PieChartTooltipContent, };
export type { PieChartRootProps } from "./pie-chart";
export { pieChartVariants } from "./pie-chart.styles";
export type { PieChartVariants } from "./pie-chart.styles";
