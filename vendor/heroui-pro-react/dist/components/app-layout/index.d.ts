import type { ComponentProps } from "react";
import { AppLayoutAsideTrigger, AppLayoutMenuToggle, AppLayoutMobileAside, AppLayoutRoot } from "./app-layout";
export declare const AppLayout: (({ aside, asideDefaultSize, asideMaxSize, asideMinSize, asideMobile, asideOpen: asideOpenProp, asideResizable, asideResizeBehavior, asideToggleShortcut, children, className, defaultAsideOpen, defaultSidebarOpen, footer, navbar, navigate, onAsideOpenChange, onSidebarOpenChange, reduceMotion, resizableAutoSaveId, scrollMode, sidebar, sidebarCollapsible, sidebarDefaultSize, sidebarMaxSize, sidebarMinSize, sidebarOpen: sidebarOpenProp, sidebarResizable, sidebarResizeBehavior, sidebarSide, sidebarVariant, style, toggleShortcut, toolbar, ...props }: import("./app-layout").AppLayoutRootProps) => import("react/jsx-runtime").JSX.Element) & {
    AsideTrigger: ({ children, className, closedTooltip, openTooltip, tooltipProps, ...props }: import("./app-layout").AppLayoutAsideTriggerProps) => string | number | bigint | boolean | import("react/jsx-runtime").JSX.Element | Iterable<import("react").ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | null | undefined> | null | undefined;
    MenuToggle: ({ children, className, tooltip, tooltipProps, ...props }: import("./app-layout").AppLayoutMenuToggleProps) => string | number | bigint | boolean | import("react/jsx-runtime").JSX.Element | Iterable<import("react").ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | null | undefined> | null | undefined;
    MobileAside: ({ children: _children }: import("./app-layout").AppLayoutMobileAsideProps) => null;
    Root: ({ aside, asideDefaultSize, asideMaxSize, asideMinSize, asideMobile, asideOpen: asideOpenProp, asideResizable, asideResizeBehavior, asideToggleShortcut, children, className, defaultAsideOpen, defaultSidebarOpen, footer, navbar, navigate, onAsideOpenChange, onSidebarOpenChange, reduceMotion, resizableAutoSaveId, scrollMode, sidebar, sidebarCollapsible, sidebarDefaultSize, sidebarMaxSize, sidebarMinSize, sidebarOpen: sidebarOpenProp, sidebarResizable, sidebarResizeBehavior, sidebarSide, sidebarVariant, style, toggleShortcut, toolbar, ...props }: import("./app-layout").AppLayoutRootProps) => import("react/jsx-runtime").JSX.Element;
};
export type AppLayout = {
    AsideTriggerProps: ComponentProps<typeof AppLayoutAsideTrigger>;
    MenuToggleProps: ComponentProps<typeof AppLayoutMenuToggle>;
    MobileAsideProps: ComponentProps<typeof AppLayoutMobileAside>;
    Props: ComponentProps<typeof AppLayoutRoot>;
    RootProps: ComponentProps<typeof AppLayoutRoot>;
};
export { AppLayoutAsideTrigger, AppLayoutMenuToggle, AppLayoutMobileAside, AppLayoutRoot };
export type { AppLayoutAsideTriggerProps, AppLayoutMenuToggleProps, AppLayoutMobileAsideProps, AppLayoutRootProps, AppLayoutRootProps as AppLayoutProps, AppLayoutScrollMode, AppLayoutTooltipProps, } from "./app-layout";
export { AppLayoutContext, useAppLayout } from "./app-layout";
export type { AppLayoutContextValue } from "./app-layout";
export { appLayoutVariants } from "./app-layout.styles";
export type { AppLayoutVariants } from "./app-layout.styles";
