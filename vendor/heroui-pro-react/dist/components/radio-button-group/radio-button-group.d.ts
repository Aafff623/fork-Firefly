import type { RadioButtonGroupVariants } from "./radio-button-group.styles";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { Radio, RadioGroup } from "@heroui/react";
interface RadioButtonGroupRootProps extends ComponentPropsWithRef<typeof RadioGroup> {
    /** Layout mode for items. @default "flex" */
    layout?: RadioButtonGroupVariants["layout"];
}
declare const RadioButtonGroupRoot: ({ children, className, layout, ...props }: RadioButtonGroupRootProps) => import("react/jsx-runtime").JSX.Element;
interface RadioButtonGroupItemProps extends ComponentPropsWithRef<typeof Radio> {
}
declare const RadioButtonGroupItem: ({ children, className, ...props }: RadioButtonGroupItemProps) => import("react/jsx-runtime").JSX.Element;
interface RadioButtonGroupIndicatorProps extends ComponentPropsWithRef<"span"> {
}
declare const RadioButtonGroupIndicator: ({ children, className, ...props }: RadioButtonGroupIndicatorProps) => import("react/jsx-runtime").JSX.Element;
interface RadioButtonGroupItemContentProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const RadioButtonGroupItemContent: ({ children, className, ...props }: RadioButtonGroupItemContentProps) => import("react/jsx-runtime").JSX.Element;
interface RadioButtonGroupItemIconProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const RadioButtonGroupItemIcon: ({ children, className, ...props }: RadioButtonGroupItemIconProps) => import("react/jsx-runtime").JSX.Element;
export { RadioButtonGroupIndicator, RadioButtonGroupItem, RadioButtonGroupItemContent, RadioButtonGroupItemIcon, RadioButtonGroupRoot, };
export type { RadioButtonGroupIndicatorProps, RadioButtonGroupItemContentProps, RadioButtonGroupItemIconProps, RadioButtonGroupItemProps, RadioButtonGroupRootProps, };
