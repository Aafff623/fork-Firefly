import type { KPIGroupVariants } from "./kpi-group.styles";
import type { ComponentPropsWithRef, ReactNode } from "react";
interface KPIGroupRootProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
    /** Layout direction. @default "horizontal" */
    orientation?: KPIGroupVariants["orientation"];
}
declare const KPIGroupRoot: ({ children, className, orientation, ...props }: KPIGroupRootProps) => import("react/jsx-runtime").JSX.Element;
interface KPIGroupSeparatorProps extends ComponentPropsWithRef<"span"> {
}
declare const KPIGroupSeparator: ({ className, ...props }: KPIGroupSeparatorProps) => import("react/jsx-runtime").JSX.Element;
export { KPIGroupRoot, KPIGroupSeparator };
export type { KPIGroupRootProps, KPIGroupSeparatorProps };
