import type { ComponentProps } from "react";
import { HoverCardArrow, HoverCardContent, HoverCardRoot, HoverCardTrigger } from "./hover-card";
export declare const HoverCard: (({ children, closeDelay, defaultOpen, onOpenChange, open, openDelay, }: import("./hover-card").HoverCardRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Arrow: ({ children, className, ...props }: import("./hover-card").HoverCardArrowProps) => import("react/jsx-runtime").JSX.Element;
    Content: ({ children, className, offset, onOpenChange: onOpenChangeProp, onPointerEnter: onPointerEnterProp, onPointerLeave: onPointerLeaveProp, placement, ...props }: import("./hover-card").HoverCardContentProps) => import("react/jsx-runtime").JSX.Element;
    Root: ({ children, closeDelay, defaultOpen, onOpenChange, open, openDelay, }: import("./hover-card").HoverCardRootProps) => import("react/jsx-runtime").JSX.Element;
    Trigger: ({ children, className, onBlur: onBlurProp, onFocus: onFocusProp, onPointerEnter: onPointerEnterProp, onPointerLeave: onPointerLeaveProp, ref, ...props }: import("./hover-card").HoverCardTriggerProps) => import("react/jsx-runtime").JSX.Element;
};
export type HoverCard = {
    ArrowProps: ComponentProps<typeof HoverCardArrow>;
    ContentProps: ComponentProps<typeof HoverCardContent>;
    Props: ComponentProps<typeof HoverCardRoot>;
    RootProps: ComponentProps<typeof HoverCardRoot>;
    TriggerProps: ComponentProps<typeof HoverCardTrigger>;
};
export { HoverCardRoot, HoverCardTrigger, HoverCardContent, HoverCardArrow };
export type { HoverCardRootProps, HoverCardRootProps as HoverCardProps, HoverCardTriggerProps, HoverCardContentProps, HoverCardArrowProps, } from "./hover-card";
export { hoverCardVariants } from "./hover-card.styles";
export type { HoverCardVariants } from "./hover-card.styles";
