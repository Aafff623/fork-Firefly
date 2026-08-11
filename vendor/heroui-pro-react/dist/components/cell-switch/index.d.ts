import type { ComponentProps } from "react";
import { CellSwitchControl, CellSwitchLabel, CellSwitchRoot, CellSwitchTrigger } from "./cell-switch";
export declare const CellSwitch: (({ children, className, variant, ...props }: import("./cell-switch").CellSwitchRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Control: ({ children, className, ...props }: import("./cell-switch").CellSwitchControlProps) => import("react/jsx-runtime").JSX.Element;
    Label: ({ children, className, ...props }: import("./cell-switch").CellSwitchLabelProps) => import("react/jsx-runtime").JSX.Element;
    Root: ({ children, className, variant, ...props }: import("./cell-switch").CellSwitchRootProps) => import("react/jsx-runtime").JSX.Element;
    Trigger: ({ children, className, ...props }: import("./cell-switch").CellSwitchTriggerProps) => import("react/jsx-runtime").JSX.Element;
};
export type CellSwitch = {
    ControlProps: ComponentProps<typeof CellSwitchControl>;
    LabelProps: ComponentProps<typeof CellSwitchLabel>;
    Props: ComponentProps<typeof CellSwitchRoot>;
    RootProps: ComponentProps<typeof CellSwitchRoot>;
    TriggerProps: ComponentProps<typeof CellSwitchTrigger>;
};
export { CellSwitchControl, CellSwitchLabel, CellSwitchRoot, CellSwitchTrigger };
export type { CellSwitchRootProps, CellSwitchRootProps as CellSwitchProps, CellSwitchControlProps, CellSwitchLabelProps, CellSwitchTriggerProps, } from "./cell-switch";
export { cellSwitchVariants } from "./cell-switch.styles";
export type { CellSwitchVariants } from "./cell-switch.styles";
