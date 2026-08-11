import type { SelectRootProps } from "@heroui/react";
import type { ComponentProps } from "react";
import { Select } from "@heroui/react";
interface InlineSelectRootProps<T extends object = object, M extends "single" | "multiple" = "single"> extends SelectRootProps<T, M> {
}
declare const InlineSelectRoot: <T extends object = object, M extends "single" | "multiple" = "single">({ children, className, ...props }: InlineSelectRootProps<T, M>) => import("react/jsx-runtime").JSX.Element;
interface InlineSelectTriggerProps extends ComponentProps<typeof Select.Trigger> {
}
declare const InlineSelectTrigger: ({ children, className, ...props }: InlineSelectTriggerProps) => import("react/jsx-runtime").JSX.Element;
interface InlineSelectValueProps extends ComponentProps<typeof Select.Value> {
}
declare const InlineSelectValue: ({ children, className, ...props }: InlineSelectValueProps) => import("react/jsx-runtime").JSX.Element;
interface InlineSelectIndicatorProps extends ComponentProps<typeof Select.Indicator> {
}
declare const InlineSelectIndicator: ({ children, className, ...props }: InlineSelectIndicatorProps) => import("react/jsx-runtime").JSX.Element;
interface InlineSelectPopoverProps extends ComponentProps<typeof Select.Popover> {
}
declare const InlineSelectPopover: ({ children, className, placement, ...props }: InlineSelectPopoverProps) => import("react/jsx-runtime").JSX.Element;
export { InlineSelectIndicator, InlineSelectPopover, InlineSelectRoot, InlineSelectTrigger, InlineSelectValue, };
export type { InlineSelectIndicatorProps, InlineSelectPopoverProps, InlineSelectRootProps, InlineSelectTriggerProps, InlineSelectValueProps, };
