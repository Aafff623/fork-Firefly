import type { ComponentProps } from "react";
import { RadarChartAngleAxis, RadarChartGrid, RadarChartRadar, RadarChartRadiusAxis, RadarChartRoot, RadarChartTooltip, RadarChartTooltipContent } from "./radar-chart";
export declare const RadarChart: (({ children, className, data, height, width, ...props }: import("./radar-chart").RadarChartRootProps) => import("react/jsx-runtime").JSX.Element) & {
    AngleAxis: typeof RadarChartAngleAxis;
    Grid: {
        (outsideProps: import("recharts").PolarGridProps): React.JSX.Element | null;
        displayName: string;
    };
    Radar: typeof RadarChartRadar;
    RadiusAxis: typeof RadarChartRadiusAxis;
    Root: ({ children, className, data, height, width, ...props }: import("./radar-chart").RadarChartRootProps) => import("react/jsx-runtime").JSX.Element;
    Tooltip: typeof RadarChartTooltip;
    TooltipContent: ({ active, className, hideHeader, indicator, label, labelFormatter, payload, valueFormatter, }: import("..").ChartTooltipContentProps) => import("react/jsx-runtime").JSX.Element | null;
};
export type RadarChart = {
    AngleAxisProps: ComponentProps<typeof RadarChartAngleAxis>;
    GridProps: ComponentProps<typeof RadarChartGrid>;
    Props: ComponentProps<typeof RadarChartRoot>;
    RadarProps: ComponentProps<typeof RadarChartRadar>;
    RadiusAxisProps: ComponentProps<typeof RadarChartRadiusAxis>;
    RootProps: ComponentProps<typeof RadarChartRoot>;
    TooltipContentProps: ComponentProps<typeof RadarChartTooltipContent>;
    TooltipProps: ComponentProps<typeof RadarChartTooltip>;
};
export { RadarChartAngleAxis, RadarChartGrid, RadarChartRadar, RadarChartRadiusAxis, RadarChartRoot, RadarChartTooltip, RadarChartTooltipContent, };
export type { RadarChartRootProps } from "./radar-chart";
export { radarChartVariants } from "./radar-chart.styles";
export type { RadarChartVariants } from "./radar-chart.styles";
