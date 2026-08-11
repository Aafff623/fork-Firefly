import type { DOMRenderProps } from "@heroui/react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { DropdownItem, DropdownItemIndicator, DropdownSection, DropdownSubmenuIndicator, DropdownSubmenuTrigger } from "@heroui/react";
import { Menu as MenuPrimitive, Popover as PopoverPrimitive, Separator as SeparatorPrimitive } from "react-aria-components/Menu";
interface ContextMenuRootProps {
    children: ReactNode;
    /** Default open state (uncontrolled). */
    defaultOpen?: boolean;
    /** Whether the context menu is disabled. */
    isDisabled?: boolean;
    /** Callback when open state changes. */
    onOpenChange?: (open: boolean) => void;
    /** Controlled open state. */
    open?: boolean;
}
declare const ContextMenuRoot: ({ children, defaultOpen, isDisabled, onOpenChange, open, }: ContextMenuRootProps) => import("react/jsx-runtime").JSX.Element;
interface ContextMenuTriggerProps<E extends keyof React.JSX.IntrinsicElements = "div"> extends DOMRenderProps<E, undefined> {
    children: ReactNode;
    className?: string;
}
declare const ContextMenuTrigger: <E extends keyof React.JSX.IntrinsicElements = "div">({ children, className, ...props }: ContextMenuTriggerProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof ContextMenuTriggerProps<E>>) => import("react/jsx-runtime").JSX.Element;
interface ContextMenuPopoverProps extends Omit<ComponentPropsWithRef<typeof PopoverPrimitive>, "children" | "isOpen" | "triggerRef"> {
    children: ReactNode;
}
declare const ContextMenuPopover: ({ children, className, offset, placement, ...props }: ContextMenuPopoverProps) => import("react/jsx-runtime").JSX.Element;
interface ContextMenuMenuProps<T extends object> extends ComponentPropsWithRef<typeof MenuPrimitive<T>> {
}
declare function ContextMenuMenu<T extends object>({ children, className, onClose, ...props }: ContextMenuMenuProps<T>): import("react/jsx-runtime").JSX.Element;
interface ContextMenuSeparatorProps extends ComponentPropsWithRef<typeof SeparatorPrimitive> {
}
declare const ContextMenuSeparator: ({ className, ...props }: ContextMenuSeparatorProps) => import("react/jsx-runtime").JSX.Element;
declare const ContextMenuItem: (props: import("@heroui/react").DropdownItemProps) => import("react/jsx-runtime").JSX.Element;
type ContextMenuItemProps = ComponentPropsWithRef<typeof DropdownItem>;
declare const ContextMenuItemIndicator: (props: import("@heroui/react").DropdownItemIndicatorProps) => import("react/jsx-runtime").JSX.Element;
type ContextMenuItemIndicatorProps = ComponentPropsWithRef<typeof DropdownItemIndicator>;
declare const ContextMenuSection: (props: import("@heroui/react").DropdownSectionProps) => import("react/jsx-runtime").JSX.Element;
type ContextMenuSectionProps = ComponentPropsWithRef<typeof DropdownSection>;
declare const ContextMenuSubmenuTrigger: ({ children, ...props }: import("@heroui/react").DropdownSubmenuTriggerProps) => import("react/jsx-runtime").JSX.Element;
type ContextMenuSubmenuTriggerProps = ComponentPropsWithRef<typeof DropdownSubmenuTrigger>;
declare const ContextMenuSubmenuIndicator: (props: import("@heroui/react").DropdownSubmenuIndicatorProps) => import("react/jsx-runtime").JSX.Element;
type ContextMenuSubmenuIndicatorProps = ComponentPropsWithRef<typeof DropdownSubmenuIndicator>;
export { ContextMenuItem, ContextMenuItemIndicator, ContextMenuMenu, ContextMenuPopover, ContextMenuRoot, ContextMenuSection, ContextMenuSeparator, ContextMenuSubmenuIndicator, ContextMenuSubmenuTrigger, ContextMenuTrigger, };
export type { ContextMenuItemIndicatorProps, ContextMenuItemProps, ContextMenuMenuProps, ContextMenuPopoverProps, ContextMenuRootProps, ContextMenuSectionProps, ContextMenuSeparatorProps, ContextMenuSubmenuIndicatorProps, ContextMenuSubmenuTriggerProps, ContextMenuTriggerProps, };
