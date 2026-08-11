import type { ComponentPropsWithRef, ReactNode } from "react";
interface ChatAttachmentGroupRootProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChatAttachmentGroupRoot: ({ children, className, ...props }: ChatAttachmentGroupRootProps) => import("react/jsx-runtime").JSX.Element;
export { ChatAttachmentGroupRoot };
export type { ChatAttachmentGroupRootProps, ChatAttachmentGroupRootProps as ChatAttachmentGroupProps, };
