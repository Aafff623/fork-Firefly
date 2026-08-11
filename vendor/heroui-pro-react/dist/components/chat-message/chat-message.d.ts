import type { ComponentPropsWithRef, ReactNode } from "react";
import { Button } from "@heroui/react";
interface ChatMessageUserProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChatMessageUser: ({ children, className, ...props }: ChatMessageUserProps) => import("react/jsx-runtime").JSX.Element;
interface ChatMessageAssistantProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChatMessageAssistant: ({ children, className, ...props }: ChatMessageAssistantProps) => import("react/jsx-runtime").JSX.Element;
interface ChatMessageBubbleProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChatMessageBubble: ({ children, className, ...props }: ChatMessageBubbleProps) => import("react/jsx-runtime").JSX.Element;
interface ChatMessageContentProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChatMessageContent: ({ children, className, ...props }: ChatMessageContentProps) => import("react/jsx-runtime").JSX.Element;
interface ChatMessageMediaProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChatMessageMedia: ({ children, className, ...props }: ChatMessageMediaProps) => import("react/jsx-runtime").JSX.Element;
interface ChatMessageActionsProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChatMessageActions: ({ children, className, ...props }: ChatMessageActionsProps) => import("react/jsx-runtime").JSX.Element;
interface ChatMessageActionProps extends ComponentPropsWithRef<typeof Button> {
    "aria-label"?: string;
    children?: ReactNode;
    tooltip?: ReactNode;
}
declare const ChatMessageAction: ({ "aria-label": ariaLabel, children, className, tooltip, ...props }: ChatMessageActionProps) => import("react/jsx-runtime").JSX.Element;
interface ChatMessageBodyProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChatMessageBody: ({ children, className, ...props }: ChatMessageBodyProps) => import("react/jsx-runtime").JSX.Element;
interface ChatMessageAvatarProps extends ComponentPropsWithRef<"div"> {
    alt: string;
    fallback?: string;
    /** When false, renders a same-size spacer to preserve row alignment in grouped threads. @default true */
    show?: boolean;
    src?: string;
}
declare const ChatMessageAvatar: ({ alt, className, fallback, show, src, ...props }: ChatMessageAvatarProps) => import("react/jsx-runtime").JSX.Element;
export { ChatMessageAction, ChatMessageActions, ChatMessageAssistant, ChatMessageAvatar, ChatMessageBody, ChatMessageBubble, ChatMessageContent, ChatMessageMedia, ChatMessageUser, };
export type { ChatMessageActionProps, ChatMessageActionsProps, ChatMessageAssistantProps, ChatMessageAvatarProps, ChatMessageBodyProps, ChatMessageBubbleProps, ChatMessageContentProps, ChatMessageMediaProps, ChatMessageUserProps, };
