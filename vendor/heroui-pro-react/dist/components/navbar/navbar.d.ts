import type { NavbarVariants } from "./navbar.styles";
import type { DOMRenderProps } from "@heroui/react";
import type { ComponentPropsWithRef, ReactNode, RefObject } from "react";
import { Separator } from "@heroui/react";
import React from "react";
import { ToggleButton as ToggleButtonPrimitive } from "react-aria-components/ToggleButton";
import { navbarVariants } from "./navbar.styles";
type NavbarNavigate = (href: string) => void;
type NavbarContextValue = {
    height: string;
    isHidden: boolean;
    isMenuOpen: boolean;
    navigate?: NavbarNavigate;
    setMenuOpen: (open: boolean) => void;
    slots?: ReturnType<typeof navbarVariants>;
};
declare const useNavbar: () => NavbarContextValue;
interface NavbarRootProps extends ComponentPropsWithRef<"nav">, NavbarVariants {
    children: ReactNode;
    /** Default menu open state (uncontrolled). @default false */
    defaultMenuOpen?: boolean;
    /** Navbar height CSS value. @default "4rem" */
    height?: string;
    /** Enable hide-on-scroll behavior. @default false */
    hideOnScroll?: boolean;
    /** Controlled menu open state. */
    isMenuOpen?: boolean;
    /** Programmatic navigation function for client-side routing (e.g. `router.push`). Called when an Item/MenuItem with `href` is pressed. When the `Navbar` is rendered inside an `AppLayout`, it automatically inherits the layout's `navigate` unless this prop is set. If omitted, the `Navbar` defers to a global React Aria `RouterProvider` when one is present, falling back to native browser navigation otherwise. */
    navigate?: NavbarNavigate;
    /** Callback when menu open state changes. */
    onMenuOpenChange?: (isOpen: boolean) => void;
    /** Scroll container ref for hide-on-scroll. @default window */
    parentRef?: RefObject<HTMLElement | null>;
    /** Block background scroll when menu is open. @default true */
    shouldBlockScroll?: boolean;
}
declare const NavbarRoot: ({ children, className, defaultMenuOpen, height, hideOnScroll, isMenuOpen: isMenuOpenProp, maxWidth, navigate, onMenuOpenChange, parentRef, position, shouldBlockScroll, size, style, ...props }: NavbarRootProps) => import("react/jsx-runtime").JSX.Element;
interface NavbarHeaderProps extends ComponentPropsWithRef<"header"> {
    children: ReactNode;
}
declare const NavbarHeader: ({ children, className, ...props }: NavbarHeaderProps) => import("react/jsx-runtime").JSX.Element;
interface NavbarBrandProps<E extends keyof React.JSX.IntrinsicElements = "div"> extends DOMRenderProps<E, undefined> {
    children: ReactNode;
    className?: string;
}
declare const NavbarBrand: <E extends keyof React.JSX.IntrinsicElements = "div">({ children, className, ...props }: NavbarBrandProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof NavbarBrandProps<E>>) => import("react/jsx-runtime").JSX.Element;
interface NavbarContentProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const NavbarContent: ({ children, className, ...props }: NavbarContentProps) => import("react/jsx-runtime").JSX.Element;
interface NavbarItemProps<E extends keyof React.JSX.IntrinsicElements = "a"> extends DOMRenderProps<E, undefined> {
    children: ReactNode;
    className?: string;
    /** Force full page reload instead of client-side navigation. @default false */
    forceReload?: boolean;
    /** URL to navigate to. Uses the Root's `navigate` function (or a global React Aria `RouterProvider`) for client-side routing, or the browser's default navigation as a fallback. */
    href?: string;
    /** Marks the item as the current page. Shows animated indicator + sets `aria-current="page"`. @default false */
    isCurrent?: boolean;
}
declare const NavbarItem: <E extends keyof React.JSX.IntrinsicElements = "a">({ children, className, forceReload, href, isCurrent, ...props }: NavbarItemProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof NavbarItemProps<E>>) => import("react/jsx-runtime").JSX.Element;
interface NavbarLabelProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const NavbarLabel: ({ children, className, ...props }: NavbarLabelProps) => import("react/jsx-runtime").JSX.Element;
interface NavbarSeparatorProps extends ComponentPropsWithRef<typeof Separator> {
}
declare const NavbarSeparator: ({ className, ...props }: NavbarSeparatorProps) => import("react/jsx-runtime").JSX.Element;
interface NavbarSpacerProps extends ComponentPropsWithRef<"div"> {
}
declare const NavbarSpacer: ({ className, ...props }: NavbarSpacerProps) => import("react/jsx-runtime").JSX.Element;
interface NavbarMenuToggleProps extends Omit<ComponentPropsWithRef<typeof ToggleButtonPrimitive>, "isSelected" | "onChange"> {
    /** Custom icon. When omitted, renders an animated hamburger / close icon. */
    children?: ReactNode;
    /** Screen-reader label for the toggle button. @default "Toggle navigation menu" */
    srLabel?: string;
}
declare const NavbarMenuToggle: ({ children, className, srLabel, ...props }: NavbarMenuToggleProps) => import("react/jsx-runtime").JSX.Element;
interface NavbarMenuProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const NavbarMenu: ({ children, className, ...props }: NavbarMenuProps) => import("react/jsx-runtime").JSX.Element;
interface NavbarMenuItemProps<E extends keyof React.JSX.IntrinsicElements = "a"> extends DOMRenderProps<E, undefined> {
    children: ReactNode;
    className?: string;
    /** Force full page reload instead of client-side navigation. @default false */
    forceReload?: boolean;
    /** URL to navigate to. Uses the Root's `navigate` function (or a global React Aria `RouterProvider`) for client-side routing, or the browser's default navigation as a fallback. */
    href?: string;
    /** Marks the item as the current page. @default false */
    isCurrent?: boolean;
}
declare const NavbarMenuItem: <E extends keyof React.JSX.IntrinsicElements = "a">({ children, className, forceReload, href, isCurrent, ...props }: NavbarMenuItemProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof NavbarMenuItemProps<E>>) => import("react/jsx-runtime").JSX.Element;
export { NavbarBrand, NavbarContent, NavbarHeader, NavbarItem, NavbarLabel, NavbarMenu, NavbarMenuItem, NavbarMenuToggle, NavbarRoot, NavbarSeparator, NavbarSpacer, useNavbar, };
export type { NavbarBrandProps, NavbarContentProps, NavbarHeaderProps, NavbarItemProps, NavbarLabelProps, NavbarMenuItemProps, NavbarMenuProps, NavbarMenuToggleProps, NavbarNavigate, NavbarRootProps, NavbarSeparatorProps, NavbarSpacerProps, };
