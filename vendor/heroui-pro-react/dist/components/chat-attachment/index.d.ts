import type { ComponentProps } from "react";
import { ChatAttachmentName, ChatAttachmentPreview, ChatAttachmentRemove, ChatAttachmentRoot } from "./chat-attachment";
import { ChatAttachmentGroupRoot } from "./chat-attachment-group";
import { ChatAttachmentInputDropzone, ChatAttachmentInputRoot, ChatAttachmentInputTrigger } from "./chat-attachment-input";
export declare const ChatAttachment: (({ children, className, mediaType, mimeType, name, src, ...props }: import("./chat-attachment").ChatAttachmentRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Name: ({ children, className, ...props }: import("./chat-attachment").ChatAttachmentNameProps) => import("react/jsx-runtime").JSX.Element;
    Preview: ({ children, className }: import("./chat-attachment").ChatAttachmentPreviewProps) => import("react/jsx-runtime").JSX.Element;
    Remove: ({ children, className, ...props }: import("./chat-attachment").ChatAttachmentRemoveProps) => import("react/jsx-runtime").JSX.Element;
    Root: ({ children, className, mediaType, mimeType, name, src, ...props }: import("./chat-attachment").ChatAttachmentRootProps) => import("react/jsx-runtime").JSX.Element;
};
export declare const ChatAttachmentGroup: (({ children, className, ...props }: import("./chat-attachment-group").ChatAttachmentGroupRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Root: ({ children, className, ...props }: import("./chat-attachment-group").ChatAttachmentGroupRootProps) => import("react/jsx-runtime").JSX.Element;
};
export declare const ChatAttachmentInput: (({ accept, children, disabled, multiple, onFilesSelected, }: import("./chat-attachment-input").ChatAttachmentInputProps) => import("react/jsx-runtime").JSX.Element) & {
    Dropzone: ({ children, className, onDragEnterCapture, onDragLeaveCapture, onDragOverCapture, onDropCapture, onPasteCapture, render, ...props }: import("./chat-attachment-input").ChatAttachmentInputDropzoneProps) => string | number | bigint | boolean | import("react/jsx-runtime").JSX.Element | Iterable<import("react").ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | null | undefined> | null | undefined;
    Root: ({ accept, children, disabled, multiple, onFilesSelected, }: import("./chat-attachment-input").ChatAttachmentInputProps) => import("react/jsx-runtime").JSX.Element;
    Trigger: ({ children, className, onClick, render, ...props }: import("./chat-attachment-input").ChatAttachmentInputTriggerProps) => string | number | bigint | boolean | import("react/jsx-runtime").JSX.Element | Iterable<import("react").ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | null | undefined> | null | undefined;
};
export type ChatAttachment = {
    NameProps: ComponentProps<typeof ChatAttachmentName>;
    PreviewProps: ComponentProps<typeof ChatAttachmentPreview>;
    Props: ComponentProps<typeof ChatAttachmentRoot>;
    RemoveProps: ComponentProps<typeof ChatAttachmentRemove>;
    RootProps: ComponentProps<typeof ChatAttachmentRoot>;
};
export type ChatAttachmentGroup = {
    Props: ComponentProps<typeof ChatAttachmentGroupRoot>;
    RootProps: ComponentProps<typeof ChatAttachmentGroupRoot>;
};
export type ChatAttachmentInput = {
    DropzoneProps: ComponentProps<typeof ChatAttachmentInputDropzone>;
    Props: ComponentProps<typeof ChatAttachmentInputRoot>;
    RootProps: ComponentProps<typeof ChatAttachmentInputRoot>;
    TriggerProps: ComponentProps<typeof ChatAttachmentInputTrigger>;
};
export { ChatAttachmentGroupRoot, ChatAttachmentInputDropzone, ChatAttachmentInputRoot, ChatAttachmentInputTrigger, ChatAttachmentName, ChatAttachmentPreview, ChatAttachmentRemove, ChatAttachmentRoot, };
export type { ChatAttachmentNameProps, ChatAttachmentPreviewProps, ChatAttachmentProps, ChatAttachmentRemoveProps, } from "./chat-attachment";
export type { ChatAttachmentGroupProps } from "./chat-attachment-group";
export type { ChatAttachmentInputDropzoneProps, ChatAttachmentInputProps, ChatAttachmentInputTriggerProps, } from "./chat-attachment-input";
export { inferChatAttachmentMediaType } from "./chat-attachment";
export { chatAttachmentGroupVariants, chatAttachmentVariants } from "./chat-attachment.styles";
export type { ChatAttachmentGroupVariants, ChatAttachmentVariants } from "./chat-attachment.styles";
