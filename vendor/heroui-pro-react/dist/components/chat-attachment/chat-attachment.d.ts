import type { ComponentPropsWithRef, ReactNode } from "react";
import { CloseButton } from "@heroui/react";
export type ChatAttachmentMediaType = "audio" | "document" | "image" | "unknown" | "video";
export declare function inferChatAttachmentMediaType(mimeType?: string): ChatAttachmentMediaType;
interface ChatAttachmentRootProps extends ComponentPropsWithRef<"div"> {
    children?: ReactNode;
    mediaType?: ChatAttachmentMediaType;
    mimeType?: string;
    name?: string;
    src?: string;
}
declare const ChatAttachmentRoot: ({ children, className, mediaType, mimeType, name, src, ...props }: ChatAttachmentRootProps) => import("react/jsx-runtime").JSX.Element;
type ChatAttachmentPreviewProps = {
    children?: ReactNode;
    className?: string;
};
declare const ChatAttachmentPreview: ({ children, className }: ChatAttachmentPreviewProps) => import("react/jsx-runtime").JSX.Element;
interface ChatAttachmentNameProps extends ComponentPropsWithRef<"span"> {
    children?: ReactNode;
}
declare const ChatAttachmentName: ({ children, className, ...props }: ChatAttachmentNameProps) => import("react/jsx-runtime").JSX.Element;
type ChatAttachmentRemoveProps = ComponentPropsWithRef<typeof CloseButton>;
declare const ChatAttachmentRemove: ({ children, className, ...props }: ChatAttachmentRemoveProps) => import("react/jsx-runtime").JSX.Element;
export { ChatAttachmentName, ChatAttachmentPreview, ChatAttachmentRemove, ChatAttachmentRoot };
export type { ChatAttachmentNameProps, ChatAttachmentPreviewProps, ChatAttachmentRemoveProps, ChatAttachmentRootProps, ChatAttachmentRootProps as ChatAttachmentProps, };
