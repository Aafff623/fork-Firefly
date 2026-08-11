import type { SegmentVariants } from "./segment.styles";
import type { ComponentPropsWithRef } from "react";
import type { Key } from "react-aria-components/Breadcrumbs";
import { ToggleButtonGroup as ToggleButtonGroupPrimitive, ToggleButton as ToggleButtonPrimitive } from "react-aria-components/ToggleButtonGroup";
interface SegmentRootProps extends Omit<ComponentPropsWithRef<typeof ToggleButtonGroupPrimitive>, "selectionMode" | "selectedKeys" | "defaultSelectedKeys" | "onSelectionChange"> {
    className?: string;
    /** The key of the currently selected item (controlled). */
    selectedKey?: Key | null;
    /** The key of the initially selected item (uncontrolled). */
    defaultSelectedKey?: Key;
    /** Handler called when the selected item changes. */
    onSelectionChange?: (key: Key) => void;
    /** Whether all items are disabled. */
    isDisabled?: boolean;
    /** Size variant. @default "md" */
    size?: SegmentVariants["size"];
    /** Visual variant. @default "default" */
    variant?: SegmentVariants["variant"];
}
declare const SegmentRoot: ({ children, className, defaultSelectedKey, isDisabled, onSelectionChange, selectedKey, size, variant, ...props }: SegmentRootProps) => import("react/jsx-runtime").JSX.Element;
interface SegmentItemProps extends ComponentPropsWithRef<typeof ToggleButtonPrimitive> {
    className?: string;
}
declare const SegmentItem: ({ children, className, ...props }: SegmentItemProps) => import("react/jsx-runtime").JSX.Element;
interface SegmentSeparatorProps extends ComponentPropsWithRef<"span"> {
    className?: string;
}
declare const SegmentSeparator: ({ className, ...props }: SegmentSeparatorProps) => import("react/jsx-runtime").JSX.Element;
export { SegmentRoot, SegmentItem, SegmentSeparator };
export type { SegmentRootProps, SegmentItemProps, SegmentSeparatorProps };
