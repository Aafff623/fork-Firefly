import type { ComponentPropsWithRef, ReactNode } from "react";
import { OverlayArrow as OverlayArrowPrimitive, Popover as PopoverPrimitive } from "react-aria-components/Popover";
interface HoverCardRootProps {
    children: ReactNode;
    /** Time in ms before the hover card closes after pointer/focus leave. @default 300 */
    closeDelay?: number;
    /** Default open state (uncontrolled). */
    defaultOpen?: boolean;
    /** Callback when open state changes. */
    onOpenChange?: (open: boolean) => void;
    /** Controlled open state. */
    open?: boolean;
    /** Time in ms before the hover card opens after hover. @default 700 */
    openDelay?: number;
}
declare const HoverCardRoot: ({ children, closeDelay, defaultOpen, onOpenChange, open, openDelay, }: HoverCardRootProps) => import("react/jsx-runtime").JSX.Element;
interface HoverCardTriggerProps extends ComponentPropsWithRef<"span"> {
}
declare const HoverCardTrigger: ({ children, className, onBlur: onBlurProp, onFocus: onFocusProp, onPointerEnter: onPointerEnterProp, onPointerLeave: onPointerLeaveProp, ref, ...props }: HoverCardTriggerProps) => import("react/jsx-runtime").JSX.Element;
interface HoverCardContentProps extends Omit<ComponentPropsWithRef<typeof PopoverPrimitive>, "isOpen" | "triggerRef"> {
}
declare const HoverCardContent: ({ children, className, offset, onOpenChange: onOpenChangeProp, onPointerEnter: onPointerEnterProp, onPointerLeave: onPointerLeaveProp, placement, ...props }: HoverCardContentProps) => import("react/jsx-runtime").JSX.Element;
interface HoverCardArrowProps extends ComponentPropsWithRef<typeof OverlayArrowPrimitive> {
}
declare const HoverCardArrow: ({ children, className, ...props }: HoverCardArrowProps) => import("react/jsx-runtime").JSX.Element;
export { HoverCardRoot, HoverCardTrigger, HoverCardContent, HoverCardArrow };
export type { HoverCardRootProps, HoverCardTriggerProps, HoverCardContentProps, HoverCardArrowProps };
