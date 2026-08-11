import type { ToolbarProps } from "@heroui/react";
import type { ComponentPropsWithRef, ReactNode } from "react";
interface ActionBarRootProps extends Omit<ToolbarProps, "children"> {
    children: ReactNode;
    /** Controls visibility with animated enter/exit. */
    isOpen: boolean;
}
declare const ActionBarRoot: ({ "aria-label": ariaLabel, children, className, isAttached, isOpen, orientation, ...props }: ActionBarRootProps) => import("react/jsx-runtime").JSX.Element;
interface ActionBarPrefixProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ActionBarPrefix: ({ children, className, ...props }: ActionBarPrefixProps) => import("react/jsx-runtime").JSX.Element;
interface ActionBarContentProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ActionBarContent: ({ children, className, ...props }: ActionBarContentProps) => import("react/jsx-runtime").JSX.Element;
interface ActionBarSuffixProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ActionBarSuffix: ({ children, className, ...props }: ActionBarSuffixProps) => import("react/jsx-runtime").JSX.Element;
export { ActionBarRoot, ActionBarPrefix, ActionBarContent, ActionBarSuffix };
export type { ActionBarRootProps, ActionBarPrefixProps, ActionBarContentProps, ActionBarSuffixProps };
