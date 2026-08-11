import type { ComponentPropsWithRef, ReactNode } from "react";
import { HoverCard } from "../hover-card";
export type ChatSourceType = "document" | "url";
export declare function extractSourceDomain(href: string): string;
interface ChatSourceRootProps extends ComponentPropsWithRef<"div"> {
    children?: ReactNode;
    description?: string;
    /**
     * Controls the hover preview for URL sources. By default, preview is enabled when
     * a URL source has a title or description. Set to `true` for custom preview content.
     */
    enablePreview?: boolean;
    faviconUrl?: string;
    href?: string;
    sourceType?: ChatSourceType;
    title?: string;
}
declare const ChatSourceRoot: ({ children, className, description, enablePreview: enablePreviewProp, faviconUrl, href, sourceType, title, ...props }: ChatSourceRootProps) => import("react/jsx-runtime").JSX.Element;
interface ChatSourceTriggerProps extends ComponentPropsWithRef<"a"> {
    children?: ReactNode;
    label?: ReactNode;
}
declare const ChatSourceTrigger: ({ children, className, label, ...props }: ChatSourceTriggerProps) => import("react/jsx-runtime").JSX.Element;
type ChatSourceIconProps = {
    children?: ReactNode;
    className?: string;
    faviconUrl?: string;
};
declare const ChatSourceIcon: ({ children, className, faviconUrl }: ChatSourceIconProps) => import("react/jsx-runtime").JSX.Element;
declare const ChatSourceDocumentIcon: ({ className }: {
    className?: string;
}) => import("react/jsx-runtime").JSX.Element;
interface ChatSourceTitleProps extends ComponentPropsWithRef<"span"> {
    children?: ReactNode;
}
declare const ChatSourceTitle: ({ children, className, ...props }: ChatSourceTitleProps) => import("react/jsx-runtime").JSX.Element;
interface ChatSourcePreviewProps extends ComponentPropsWithRef<typeof HoverCard.Content> {
    children?: ReactNode;
    description?: ReactNode;
    title?: ReactNode;
}
declare const ChatSourcePreview: ({ children, className, description, title, ...props }: ChatSourcePreviewProps) => import("react/jsx-runtime").JSX.Element | null;
export { ChatSourceDocumentIcon, ChatSourceIcon, ChatSourcePreview, ChatSourceRoot, ChatSourceTitle, ChatSourceTrigger, };
export type { ChatSourceIconProps, ChatSourcePreviewProps, ChatSourceRootProps, ChatSourceRootProps as ChatSourceProps, ChatSourceTitleProps, ChatSourceTriggerProps, };
