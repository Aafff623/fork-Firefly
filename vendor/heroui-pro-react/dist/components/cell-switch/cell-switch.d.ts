import type { CellSwitchVariants } from "./cell-switch.styles";
import type { ComponentProps, ComponentPropsWithRef, ReactNode } from "react";
import { Switch } from "@heroui/react";
interface CellSwitchRootProps extends Omit<ComponentProps<typeof Switch>, "variant"> {
    /** Visual variant. @default "default" */
    variant?: CellSwitchVariants["variant"];
}
declare const CellSwitchRoot: ({ children, className, variant, ...props }: CellSwitchRootProps) => import("react/jsx-runtime").JSX.Element;
interface CellSwitchTriggerProps extends ComponentProps<typeof Switch.Content> {
    children: ReactNode;
}
declare const CellSwitchTrigger: ({ children, className, ...props }: CellSwitchTriggerProps) => import("react/jsx-runtime").JSX.Element;
interface CellSwitchLabelProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const CellSwitchLabel: ({ children, className, ...props }: CellSwitchLabelProps) => import("react/jsx-runtime").JSX.Element;
interface CellSwitchControlProps extends ComponentProps<typeof Switch.Control> {
}
declare const CellSwitchControl: ({ children, className, ...props }: CellSwitchControlProps) => import("react/jsx-runtime").JSX.Element;
export { CellSwitchControl, CellSwitchLabel, CellSwitchRoot, CellSwitchTrigger };
export type { CellSwitchControlProps, CellSwitchLabelProps, CellSwitchRootProps, CellSwitchTriggerProps, };
