import type { ResizablePanelGroupResizeBehavior, ResizableSize } from "../resizable";
import type { SidebarVariants } from "../sidebar/sidebar.styles";
import type { ComponentProps, ComponentPropsWithRef, ReactNode } from "react";
import { Button, Tooltip } from "@heroui/react";
import React from "react";
import { appLayoutVariants } from "./app-layout.styles";
type AppLayoutContextValue = {
    isAsideOpen: boolean;
    /** Whether a user-provided <AppLayout.MobileAside> slot was rendered. */
    hasMobileAside: boolean;
    /** Programmatic navigation function forwarded from `AppLayout.navigate`. */
    navigate?: (href: string) => void;
    /** Register a mobile aside from a child component. @internal */
    registerMobileAside?: (node: ReactNode) => void;
    setAsideOpen: (open: boolean) => void;
    slots: ReturnType<typeof appLayoutVariants>;
    toggleAside: () => void;
};
declare const AppLayoutContext: React.Context<AppLayoutContextValue | null>;
declare const useAppLayout: () => AppLayoutContextValue | null;
interface AppLayoutTooltipProps {
    /** Class name applied to the Tooltip.Content element. */
    className?: string;
    /** Delay in ms before hiding the tooltip. */
    closeDelay?: number;
    /** Delay in ms before showing the tooltip. */
    delay?: number;
    /** Whether the tooltip is disabled. */
    isDisabled?: boolean;
    /** Offset from the trigger element in px. */
    offset?: number;
    /** Tooltip placement relative to the trigger. @default "bottom" */
    placement?: ComponentProps<typeof Tooltip.Content>["placement"];
    /** Whether to show the tooltip arrow. @default false */
    showArrow?: boolean;
}
interface AppLayoutMenuToggleProps extends ComponentPropsWithRef<typeof Button> {
    /** Custom icon. Defaults to a hamburger (Bars) icon. */
    children?: ReactNode;
    /** Tooltip content. When omitted, no tooltip is rendered. */
    tooltip?: ReactNode;
    /** Additional props forwarded to the internal Tooltip (delay, placement, etc.). */
    tooltipProps?: AppLayoutTooltipProps;
}
declare const AppLayoutMenuToggle: ({ children, className, tooltip, tooltipProps, ...props }: AppLayoutMenuToggleProps) => string | number | bigint | boolean | import("react/jsx-runtime").JSX.Element | Iterable<ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined;
interface AppLayoutAsideTriggerProps extends ComponentPropsWithRef<typeof Button> {
    /** Custom icon. Defaults to a right-panel icon. */
    children?: ReactNode;
    /** Tooltip content when the aside is closed. When omitted, no tooltip is rendered. */
    closedTooltip?: ReactNode;
    /** Tooltip content when the aside is open. When omitted, no tooltip is rendered. */
    openTooltip?: ReactNode;
    /** Additional props forwarded to the internal Tooltip. */
    tooltipProps?: AppLayoutTooltipProps;
}
declare const AppLayoutAsideTrigger: ({ children, className, closedTooltip, openTooltip, tooltipProps, ...props }: AppLayoutAsideTriggerProps) => string | number | bigint | boolean | import("react/jsx-runtime").JSX.Element | Iterable<ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined;
interface AppLayoutMobileAsideProps {
    children: ReactNode;
}
declare const AppLayoutMobileAside: ({ children: _children }: AppLayoutMobileAsideProps) => null;
type SidebarNavigate = (href: string) => void;
type AppLayoutScrollMode = "content" | "page";
interface AppLayoutRootProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
    /** Content rendered in the optional right-side aside panel. */
    aside?: ReactNode;
    /** How the aside behaves on mobile (<=1024px). @default "hidden" */
    asideMobile?: "hidden" | "sheet";
    /** Default size of the aside when resizable. Numbers are percentages; strings accept CSS units. @default 20 */
    asideDefaultSize?: ResizableSize;
    /** Max aside size when resizable. Numbers are percentages; strings accept CSS units. @default 40 */
    asideMaxSize?: ResizableSize;
    /** Min aside size when resizable. Numbers are percentages; strings accept CSS units. @default 15 */
    asideMinSize?: ResizableSize;
    /** Controlled aside open state. */
    asideOpen?: boolean;
    /** Make the aside user-resizable by dragging a handle. @default false */
    asideResizable?: boolean;
    /**
     * How the aside panel behaves when the layout width changes.
     * @default "preserve-relative-size"
     */
    asideResizeBehavior?: ResizablePanelGroupResizeBehavior;
    /**
     * Keyboard shortcut that toggles the aside open/closed. Accepts the same combo
     * syntax as `toggleShortcut`. Pass `false` or `null` to disable.
     * @default null (disabled)
     */
    asideToggleShortcut?: string | false | null;
    children: ReactNode;
    /** Default aside open state (uncontrolled). @default true */
    defaultAsideOpen?: boolean;
    /** Default sidebar open state (uncontrolled). @default true */
    defaultSidebarOpen?: boolean;
    /** Optional footer pinned to the bottom of the shell. */
    footer?: ReactNode;
    /** Navbar content rendered inside the header row. */
    navbar?: ReactNode;
    /** Programmatic navigation function for client-side routing. */
    navigate?: SidebarNavigate;
    /** Callback when aside open state changes. */
    onAsideOpenChange?: (open: boolean) => void;
    /** Callback when sidebar open state changes. */
    onSidebarOpenChange?: (open: boolean) => void;
    /** Whether nested menu expand/collapse animations should be disabled. @default false */
    reduceMotion?: boolean;
    /** `autoSaveId` forwarded to the internal `Resizable` group (when resizable). */
    resizableAutoSaveId?: string;
    /**
     * Controls which element owns vertical scrolling.
     * - `"page"` keeps the default window/body scrolling behavior.
     * - `"content"` keeps the shell fixed to the viewport and scrolls only the main column.
     * @default "page"
     */
    scrollMode?: AppLayoutScrollMode;
    /** Sidebar content rendered in the full-height side panel. */
    sidebar?: ReactNode;
    /** Sidebar collapse behavior. @default "icon" */
    sidebarCollapsible?: "icon" | "none" | "offcanvas";
    /** Default size of the sidebar when resizable. Numbers are percentages; strings accept CSS units. @default 18 */
    sidebarDefaultSize?: ResizableSize;
    /** Max sidebar size when resizable. Numbers are percentages; strings accept CSS units. @default 30 */
    sidebarMaxSize?: ResizableSize;
    /** Min sidebar size when resizable. Numbers are percentages; strings accept CSS units. @default 12 */
    sidebarMinSize?: ResizableSize;
    /** Controlled sidebar open state. */
    sidebarOpen?: boolean;
    /** Make the sidebar user-resizable by dragging a handle. Requires
     * `sidebarCollapsible` to be `"offcanvas"` or `"none"`. @default false */
    sidebarResizable?: boolean;
    /**
     * How the sidebar panel behaves when the layout width changes.
     * @default "preserve-relative-size"
     */
    sidebarResizeBehavior?: ResizablePanelGroupResizeBehavior;
    /** Which side the sidebar is on. @default "left" */
    sidebarSide?: SidebarVariants["side"];
    /** Sidebar visual variant. @default "sidebar" */
    sidebarVariant?: SidebarVariants["variant"];
    /**
     * Keyboard shortcut that toggles the sidebar. Pass `false`/`null` to disable.
     * @default "mod+b"
     */
    toggleShortcut?: string | false | null;
    /** Optional toolbar rendered as a second sticky row below the navbar. */
    toolbar?: ReactNode;
}
declare const AppLayoutRoot: ({ aside, asideDefaultSize, asideMaxSize, asideMinSize, asideMobile, asideOpen: asideOpenProp, asideResizable, asideResizeBehavior, asideToggleShortcut, children, className, defaultAsideOpen, defaultSidebarOpen, footer, navbar, navigate, onAsideOpenChange, onSidebarOpenChange, reduceMotion, resizableAutoSaveId, scrollMode, sidebar, sidebarCollapsible, sidebarDefaultSize, sidebarMaxSize, sidebarMinSize, sidebarOpen: sidebarOpenProp, sidebarResizable, sidebarResizeBehavior, sidebarSide, sidebarVariant, style, toggleShortcut, toolbar, ...props }: AppLayoutRootProps) => import("react/jsx-runtime").JSX.Element;
export { AppLayoutAsideTrigger, AppLayoutContext, AppLayoutMenuToggle, AppLayoutMobileAside, AppLayoutRoot, useAppLayout, };
export type { AppLayoutAsideTriggerProps, AppLayoutContextValue, AppLayoutMenuToggleProps, AppLayoutMobileAsideProps, AppLayoutScrollMode, AppLayoutRootProps, AppLayoutTooltipProps, };
