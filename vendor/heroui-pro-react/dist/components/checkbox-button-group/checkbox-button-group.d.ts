import type { CheckboxButtonGroupVariants } from "./checkbox-button-group.styles";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { Checkbox, CheckboxGroup } from "@heroui/react";
interface CheckboxButtonGroupRootProps extends ComponentPropsWithRef<typeof CheckboxGroup> {
    /** Layout mode for items. @default "flex" */
    layout?: CheckboxButtonGroupVariants["layout"];
}
declare const CheckboxButtonGroupRoot: ({ children, className, layout, ...props }: CheckboxButtonGroupRootProps) => import("react/jsx-runtime").JSX.Element;
interface CheckboxButtonGroupItemProps extends ComponentPropsWithRef<typeof Checkbox> {
}
declare const CheckboxButtonGroupItem: ({ children, className, ...props }: CheckboxButtonGroupItemProps) => import("react/jsx-runtime").JSX.Element;
interface CheckboxButtonGroupIndicatorProps extends ComponentPropsWithRef<"span"> {
}
declare const CheckboxButtonGroupIndicator: ({ children, className, ...props }: CheckboxButtonGroupIndicatorProps) => import("react/jsx-runtime").JSX.Element;
interface CheckboxButtonGroupItemContentProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const CheckboxButtonGroupItemContent: ({ children, className, ...props }: CheckboxButtonGroupItemContentProps) => import("react/jsx-runtime").JSX.Element;
interface CheckboxButtonGroupItemIconProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const CheckboxButtonGroupItemIcon: ({ children, className, ...props }: CheckboxButtonGroupItemIconProps) => import("react/jsx-runtime").JSX.Element;
export { CheckboxButtonGroupIndicator, CheckboxButtonGroupItem, CheckboxButtonGroupItemContent, CheckboxButtonGroupItemIcon, CheckboxButtonGroupRoot, };
export type { CheckboxButtonGroupIndicatorProps, CheckboxButtonGroupItemContentProps, CheckboxButtonGroupItemIconProps, CheckboxButtonGroupItemProps, CheckboxButtonGroupRootProps, };
