import type { ComponentProps } from "react";
import { KPIGroupRoot, KPIGroupSeparator } from "./kpi-group";
export declare const KPIGroup: (({ children, className, orientation, ...props }: import("./kpi-group").KPIGroupRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Root: ({ children, className, orientation, ...props }: import("./kpi-group").KPIGroupRootProps) => import("react/jsx-runtime").JSX.Element;
    Separator: ({ className, ...props }: import("./kpi-group").KPIGroupSeparatorProps) => import("react/jsx-runtime").JSX.Element;
};
export type KPIGroup = {
    Props: ComponentProps<typeof KPIGroupRoot>;
    RootProps: ComponentProps<typeof KPIGroupRoot>;
    SeparatorProps: ComponentProps<typeof KPIGroupSeparator>;
};
export { KPIGroupRoot, KPIGroupSeparator };
export type { KPIGroupRootProps, KPIGroupRootProps as KPIGroupProps, KPIGroupSeparatorProps, } from "./kpi-group";
export { kpiGroupVariants } from "./kpi-group.styles";
export type { KPIGroupVariants } from "./kpi-group.styles";
