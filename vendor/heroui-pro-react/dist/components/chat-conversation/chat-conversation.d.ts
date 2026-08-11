import type { ComponentPropsWithRef, ReactNode } from "react";
import { Button } from "@heroui/react";
interface ChatConversationRootProps extends Omit<ComponentPropsWithRef<"div">, "resize"> {
    children: ReactNode;
    /** Scroll behavior used on initial mount. @default "smooth" */
    initial?: "instant" | "smooth";
    /** Scroll behavior used when content grows while already at the bottom. @default "smooth" */
    resize?: "instant" | "smooth";
}
declare const ChatConversationRoot: ({ children, className, initial, onScroll, ref, resize, ...props }: ChatConversationRootProps) => import("react/jsx-runtime").JSX.Element;
interface ChatConversationContentProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChatConversationContent: ({ children, className, ref, ...props }: ChatConversationContentProps) => import("react/jsx-runtime").JSX.Element;
interface ChatConversationScrollAnchorProps extends ComponentPropsWithRef<"div"> {
}
declare const ChatConversationScrollAnchor: ({ className, ...props }: ChatConversationScrollAnchorProps) => import("react/jsx-runtime").JSX.Element;
interface ChatConversationScrollButtonProps extends ComponentPropsWithRef<typeof Button> {
    "aria-label"?: string;
    tooltip?: ReactNode;
}
declare const ChatConversationScrollButton: ({ "aria-label": ariaLabel, className, isDisabled, tooltip, ...props }: ChatConversationScrollButtonProps) => import("react/jsx-runtime").JSX.Element | null;
export { ChatConversationContent, ChatConversationRoot, ChatConversationScrollAnchor, ChatConversationScrollButton, };
export type { ChatConversationContentProps, ChatConversationRootProps, ChatConversationRootProps as ChatConversationProps, ChatConversationScrollAnchorProps, ChatConversationScrollButtonProps, };
