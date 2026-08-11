import type { SidebarVariants } from "./sidebar.styles";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { Button, ScrollShadow, Separator, Tooltip } from "@heroui/react";
import { Button as AriaButton } from "react-aria-components/Button";
import { TreeHeader as TreeHeaderPrimitive, TreeItem as TreeItemPrimitive, Tree as TreePrimitive, TreeSection as TreeSectionPrimitive } from "react-aria-components/Tree";
import { ChevronRight } from "../icons";
import { sidebarVariants } from "./sidebar.styles";
type SidebarNavigate = (href: string) => void;
type SidebarContextValue = {
    collapsible: "icon" | "none" | "offcanvas";
    isMobile: boolean;
    isMobileOpen: boolean;
    isOpen: boolean;
    navigate?: SidebarNavigate;
    reduceMotion: boolean;
    setMobileOpen: (open: boolean) => void;
    setOpen: (open: boolean) => void;
    side: "left" | "right";
    slots?: ReturnType<typeof sidebarVariants>;
    toggleSidebar: () => void;
    variant: "floating" | "inset" | "sidebar";
};
/** Hook for programmatic sidebar control. */
declare const useSidebar: () => SidebarContextValue;
interface SidebarProviderProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
    /** Collapse behavior. @default "icon" */
    collapsible?: "icon" | "none" | "offcanvas";
    /** Initial open state for uncontrolled usage. @default true */
    defaultOpen?: boolean;
    /** Callback when open state changes. */
    onOpenChange?: (open: boolean) => void;
    /** Programmatic navigation function for client-side routing (e.g. `router.push`). Called when a menu item with `href` is pressed. */
    navigate?: SidebarNavigate;
    /** Controlled open state. */
    open?: boolean;
    /** Whether nested menu expand/collapse animations should be disabled. Also respects the user's reduced-motion preference. @default false */
    reduceMotion?: boolean;
    /** Which side the sidebar is on. @default "left" */
    side?: SidebarVariants["side"];
    /**
     * Keyboard shortcut that toggles the sidebar. Accepts a combo string with modifiers joined by `+`:
     * `mod` (Cmd on macOS, Ctrl elsewhere), `cmd`, `ctrl`, `meta`, `shift`, `alt` followed by a single key.
     * Pass `false` or `null` to disable the shortcut entirely.
     * @default "mod+b"
     */
    toggleShortcut?: string | false | null;
    /** Visual style variant. @default "sidebar" */
    variant?: SidebarVariants["variant"];
}
declare const SidebarProvider: ({ children, className, collapsible, defaultOpen, navigate, onOpenChange, open: openProp, reduceMotion, side, toggleShortcut, variant, ...props }: SidebarProviderProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarRootProps extends ComponentPropsWithRef<"aside"> {
    children: ReactNode;
}
declare const SidebarRoot: ({ children, className, ...props }: SidebarRootProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarHeaderProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const SidebarHeader: ({ children, className, ...props }: SidebarHeaderProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarContentProps extends ComponentPropsWithRef<typeof ScrollShadow> {
    children: ReactNode;
}
declare const SidebarContent: ({ children, className, ...props }: SidebarContentProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarFooterProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const SidebarFooter: ({ children, className, ...props }: SidebarFooterProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarGroupProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
    /** Whether pressing a menu item in this group automatically closes the mobile sidebar sheet. Inherited by all `Sidebar.Menu` and `Sidebar.MenuItem` descendants. @default true */
    closeMobileOnAction?: boolean;
}
declare const SidebarGroup: ({ children, className, closeMobileOnAction, ...props }: SidebarGroupProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarGroupLabelProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const SidebarGroupLabel: ({ children, className, ...props }: SidebarGroupLabelProps) => import("react/jsx-runtime").JSX.Element;
type SidebarMenuDisallowedProps = "defaultSelectedKeys" | "disallowEmptySelection" | "escapeKeyBehavior" | "onSelectionChange" | "selectedKeys" | "selectionBehavior" | "selectionMode" | "shouldSelectOnPressUp";
interface SidebarMenuProps<T extends object> extends Omit<ComponentPropsWithRef<typeof TreePrimitive<T>>, SidebarMenuDisallowedProps> {
    defaultSelectedKeys?: never;
    disallowEmptySelection?: never;
    escapeKeyBehavior?: never;
    onSelectionChange?: never;
    /** Whether to disable submenu expand/collapse animations for this menu. Also respects the user's reduced-motion preference. @default inherited from Sidebar.Provider */
    reduceMotion?: boolean;
    selectedKeys?: never;
    selectionBehavior?: never;
    selectionMode?: never;
    /** Whether pressing a menu item automatically closes the mobile sidebar sheet. @default true */
    closeMobileOnAction?: boolean;
    /** Whether to show submenu guide lines. `true` = always, `false` = never, `"hover"` = on menu hover only. @default true */
    showGuideLines?: boolean | "hover";
    shouldSelectOnPressUp?: never;
}
declare const SidebarMenu: <T extends object>({ children, className, closeMobileOnAction, reduceMotion, showGuideLines, ...props }: SidebarMenuProps<T>) => import("react/jsx-runtime").JSX.Element;
interface SidebarMenuSectionProps extends ComponentPropsWithRef<typeof TreeSectionPrimitive> {
}
declare const SidebarMenuSection: ({ children, className, ...props }: SidebarMenuSectionProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarMenuHeaderProps extends ComponentPropsWithRef<typeof TreeHeaderPrimitive> {
}
declare const SidebarMenuHeader: ({ children, className, ...props }: SidebarMenuHeaderProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarMenuIconProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const SidebarMenuIcon: ({ children, className, ...props }: SidebarMenuIconProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarMenuLabelProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const SidebarMenuLabel: ({ children, className, ...props }: SidebarMenuLabelProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarMenuChipProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const SidebarMenuChip: ({ children, className, ...props }: SidebarMenuChipProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarMenuActionsProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const SidebarMenuActions: ({ children, className, ...props }: SidebarMenuActionsProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarMenuActionProps extends ComponentPropsWithRef<typeof AriaButton> {
    children: ReactNode;
}
declare const SidebarMenuAction: ({ children, className, ...props }: SidebarMenuActionProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarMenuItemContentProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const SidebarMenuItemContent: ({ children }: SidebarMenuItemContentProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarMenuTriggerProps extends ComponentPropsWithRef<typeof AriaButton> {
    children: ReactNode;
}
declare const SidebarMenuTrigger: ({ children }: SidebarMenuTriggerProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarMenuIndicatorProps extends ComponentPropsWithRef<typeof ChevronRight> {
    children?: ReactNode;
}
declare const SidebarMenuIndicator: ({ children, className, ...props }: SidebarMenuIndicatorProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarSubmenuProps {
    children: ReactNode;
}
declare const SidebarSubmenu: ({ children }: SidebarSubmenuProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarMenuItemTooltipProps {
    /** Tooltip content. */
    content: ReactNode;
    /** Additional CSS classes for the tooltip content. */
    className?: string;
    /** Delay in ms before showing the tooltip. */
    delay?: number;
    /** Delay in ms before hiding the tooltip. */
    closeDelay?: number;
    /** Placement of the tooltip relative to the item. */
    placement?: "top" | "bottom" | "left" | "right";
}
interface SidebarMenuItemProps extends Partial<ComponentPropsWithRef<typeof TreeItemPrimitive>> {
    /** Override the inherited closeMobileOnAction for this specific item. Set to `false` to keep the mobile sidebar open when this item is pressed. */
    closeMobileOnAction?: boolean;
    /** Force a full page reload instead of client-side navigation. Uses `window.location.href` instead of the Provider's `navigate` function. */
    forceReload?: boolean;
    /** URL to navigate to. Uses native link behavior, with the Provider's `navigate` function for unmodified same-origin clicks. */
    href?: string;
    /** Marks the item as the current page in navigation UIs. */
    isCurrent?: boolean;
    /** Tooltip content shown for icon-only collapsed sidebars. Defaults to the item label. */
    tooltip?: ReactNode;
    /** Show a tooltip on hover even when the sidebar is expanded. Wraps the item content internally. */
    tooltipProps?: SidebarMenuItemTooltipProps;
}
declare const SidebarMenuItem: ({ children, className, closeMobileOnAction, forceReload, href, isCurrent, rel, render: renderProp, routerOptions, target, textValue, tooltip, tooltipProps, ...props }: SidebarMenuItemProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarSeparatorProps extends ComponentPropsWithRef<typeof Separator> {
}
declare const SidebarSeparator: ({ className, ...props }: SidebarSeparatorProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarTriggerProps extends ComponentPropsWithRef<typeof Button> {
    children?: ReactNode;
}
declare const SidebarTrigger: ({ children, className, ...props }: SidebarTriggerProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarRailProps extends ComponentPropsWithRef<"button"> {
}
declare const SidebarRail: ({ className, ...props }: SidebarRailProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarMainProps extends ComponentPropsWithRef<"main"> {
    children: ReactNode;
}
declare const SidebarMain: ({ children, className, ...props }: SidebarMainProps) => import("react/jsx-runtime").JSX.Element;
interface SidebarMobileProps extends ComponentPropsWithRef<"div"> {
    /** Backdrop style for the mobile sheet. @default "blur" */
    backdrop?: "blur" | "opaque" | "transparent";
    children: ReactNode;
}
declare const SidebarMobile: ({ backdrop, children, className, ...props }: SidebarMobileProps) => import("react/jsx-runtime").JSX.Element | null;
interface SidebarTooltipProps extends Omit<ComponentPropsWithRef<typeof Tooltip.Content>, "children"> {
    children: ReactNode;
    /** Tooltip content shown when sidebar is collapsed. */
    content: ReactNode;
    /** Delay in ms before showing the tooltip. */
    delay?: number;
    /** Delay in ms before hiding the tooltip. */
    closeDelay?: number;
}
declare const SidebarTooltip: ({ children, closeDelay, content, delay, placement, ...props }: SidebarTooltipProps) => import("react/jsx-runtime").JSX.Element;
export { SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMain, SidebarMenu, SidebarMenuAction, SidebarMenuActions, SidebarMenuChip, SidebarMenuHeader, SidebarMenuIcon, SidebarMenuIndicator, SidebarMenuItemContent, SidebarMenuItem, SidebarMenuLabel, SidebarMenuSection, SidebarMenuTrigger, SidebarMobile, SidebarProvider, SidebarRail, SidebarRoot, SidebarSeparator, SidebarSubmenu, SidebarTooltip, SidebarTrigger, useSidebar, };
export type { SidebarNavigate, SidebarContentProps, SidebarFooterProps, SidebarGroupLabelProps, SidebarGroupProps, SidebarHeaderProps, SidebarMainProps, SidebarMenuActionProps, SidebarMenuActionsProps, SidebarMenuChipProps, SidebarMenuHeaderProps, SidebarMenuIconProps, SidebarMenuIndicatorProps, SidebarMenuItemContentProps, SidebarMenuItemProps, SidebarMenuItemTooltipProps, SidebarMenuLabelProps, SidebarMenuProps, SidebarMenuSectionProps, SidebarMenuTriggerProps, SidebarMobileProps, SidebarProviderProps, SidebarRailProps, SidebarRootProps, SidebarSeparatorProps, SidebarSubmenuProps, SidebarTooltipProps, SidebarTriggerProps, };
