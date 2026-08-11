import type { ComponentPropsWithoutRef, ReactNode } from "react";
export type ChatAttachmentInputProps = {
    accept?: string;
    children: ReactNode;
    disabled?: boolean;
    multiple?: boolean;
    onFilesSelected: (files: File[]) => void;
};
declare const ChatAttachmentInputRoot: ({ accept, children, disabled, multiple, onFilesSelected, }: ChatAttachmentInputProps) => import("react/jsx-runtime").JSX.Element;
type ChatAttachmentInputTriggerRenderProps = {
    "aria-label"?: string;
    className?: string;
    disabled?: boolean;
    isDisabled?: boolean;
    onPress: () => void;
    type: "button" | "reset" | "submit";
};
export type ChatAttachmentInputTriggerProps = ComponentPropsWithoutRef<"button"> & {
    render?: (props: ChatAttachmentInputTriggerRenderProps) => ReactNode;
};
declare const ChatAttachmentInputTrigger: ({ children, className, onClick, render, ...props }: ChatAttachmentInputTriggerProps) => string | number | bigint | boolean | import("react/jsx-runtime").JSX.Element | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined;
type ChatAttachmentInputDropzoneRenderProps = ComponentPropsWithoutRef<"div"> & {
    "data-dragging"?: true;
};
export type ChatAttachmentInputDropzoneProps = ComponentPropsWithoutRef<"div"> & {
    render?: (props: ChatAttachmentInputDropzoneRenderProps) => ReactNode;
};
declare const ChatAttachmentInputDropzone: ({ children, className, onDragEnterCapture, onDragLeaveCapture, onDragOverCapture, onDropCapture, onPasteCapture, render, ...props }: ChatAttachmentInputDropzoneProps) => string | number | bigint | boolean | import("react/jsx-runtime").JSX.Element | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined;
export { ChatAttachmentInputDropzone, ChatAttachmentInputRoot, ChatAttachmentInputTrigger };
