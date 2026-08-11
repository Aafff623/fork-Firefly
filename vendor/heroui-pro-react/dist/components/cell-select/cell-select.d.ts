import type { CellSelectVariants } from "./cell-select.styles";
import type { SelectRootProps } from "@heroui/react";
import type { ComponentProps, ComponentPropsWithRef, ReactNode } from "react";
import { Select } from "@heroui/react";
interface CellSelectRootProps<T extends object = object, M extends "single" | "multiple" = "single"> extends Omit<SelectRootProps<T, M>, "variant"> {
    /** Visual variant. @default "default" */
    variant?: CellSelectVariants["variant"];
}
declare const CellSelectRoot: <T extends object = object, M extends "single" | "multiple" = "single">({ children, className, variant, ...props }: CellSelectRootProps<T, M>) => import("react/jsx-runtime").JSX.Element;
interface CellSelectTriggerProps extends ComponentProps<typeof Select.Trigger> {
}
declare const CellSelectTrigger: ({ children, className, ...props }: CellSelectTriggerProps) => import("react/jsx-runtime").JSX.Element;
interface CellSelectLabelProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const CellSelectLabel: ({ children, className, ...props }: CellSelectLabelProps) => import("react/jsx-runtime").JSX.Element;
interface CellSelectValueProps extends ComponentProps<typeof Select.Value> {
}
declare const CellSelectValue: ({ children, className, ...props }: CellSelectValueProps) => import("react/jsx-runtime").JSX.Element;
interface CellSelectIndicatorProps extends ComponentProps<typeof Select.Indicator> {
}
declare const CellSelectIndicator: ({ children, className, ...props }: CellSelectIndicatorProps) => import("react/jsx-runtime").JSX.Element;
interface CellSelectPopoverProps extends ComponentProps<typeof Select.Popover> {
}
declare const CellSelectPopover: ({ children, className, placement, ...props }: CellSelectPopoverProps) => import("react/jsx-runtime").JSX.Element;
export { CellSelectIndicator, CellSelectLabel, CellSelectPopover, CellSelectRoot, CellSelectTrigger, CellSelectValue, };
export type { CellSelectIndicatorProps, CellSelectLabelProps, CellSelectPopoverProps, CellSelectRootProps, CellSelectTriggerProps, CellSelectValueProps, };
