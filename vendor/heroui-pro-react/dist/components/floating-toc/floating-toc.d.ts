import type { ComponentPropsWithRef, ReactNode } from "react";
import { Popover as PopoverPrimitive } from "react-aria-components/Popover";
interface FloatingTocRootProps {
    children: ReactNode;
    /** Time in ms before the floating toc closes after pointer/focus leave. @default 300 */
    closeDelay?: number;
    /** Default open state (uncontrolled). */
    defaultOpen?: boolean;
    /** Callback when open state changes. */
    onOpenChange?: (open: boolean) => void;
    /** Controlled open state. */
    open?: boolean;
    /** Time in ms before the floating toc opens after hover. @default 200 */
    openDelay?: number;
    /** Which side of the page the TOC is on. Controls bar growth direction and default content side. @default "right" */
    placement?: "left" | "right";
    /** How the trigger opens the content. @default "hover" */
    triggerMode?: "hover" | "press";
}
declare const FloatingTocRoot: ({ children, closeDelay, defaultOpen, onOpenChange, open, openDelay, placement, triggerMode, }: FloatingTocRootProps) => import("react/jsx-runtime").JSX.Element;
interface FloatingTocTriggerProps extends ComponentPropsWithRef<"span"> {
}
declare const FloatingTocTrigger: ({ children, className, onBlur: onBlurProp, onClick: onClickProp, onFocus: onFocusProp, onKeyDown: onKeyDownProp, onPointerEnter: onPointerEnterProp, onPointerLeave: onPointerLeaveProp, ref, ...props }: FloatingTocTriggerProps) => import("react/jsx-runtime").JSX.Element;
interface FloatingTocBarProps extends ComponentPropsWithRef<"span"> {
    /** Highlights this bar as the currently active section. */
    active?: boolean;
    /** Nesting depth (1 = top-level). Deeper levels produce shorter bars. */
    level?: number;
}
declare const FloatingTocBar: ({ active, className, level, ref: refProp, style: styleProp, ...props }: FloatingTocBarProps) => import("react/jsx-runtime").JSX.Element;
interface FloatingTocContentProps extends Omit<ComponentPropsWithRef<typeof PopoverPrimitive>, "isOpen" | "triggerRef"> {
}
declare const FloatingTocContent: ({ children, className, offset, onOpenChange: onOpenChangeProp, onPointerEnter: onPointerEnterProp, onPointerLeave: onPointerLeaveProp, placement: placementProp, ...props }: FloatingTocContentProps) => import("react/jsx-runtime").JSX.Element;
interface FloatingTocItemProps extends ComponentPropsWithRef<"button"> {
    /** Highlights this item as the currently active section. */
    active?: boolean;
    /** Nesting depth (1 = top-level). Deeper levels are indented. */
    level?: number;
}
declare const FloatingTocItem: ({ active, children, className, level, style: styleProp, ...props }: FloatingTocItemProps) => import("react/jsx-runtime").JSX.Element;
export { FloatingTocRoot, FloatingTocTrigger, FloatingTocBar, FloatingTocContent, FloatingTocItem };
export type { FloatingTocRootProps, FloatingTocTriggerProps, FloatingTocBarProps, FloatingTocContentProps, FloatingTocItemProps, };
