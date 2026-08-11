import type { ComponentPropsWithRef, ReactNode } from "react";
import { Disclosure } from "@heroui/react";
interface ChatToolGroupRootProps extends ComponentPropsWithRef<typeof Disclosure> {
    active?: boolean;
    children: ReactNode;
}
declare const ChatToolGroupRoot: ({ active, children, className, ...props }: ChatToolGroupRootProps) => import("react/jsx-runtime").JSX.Element;
interface ChatToolGroupTriggerProps extends ComponentPropsWithRef<typeof Disclosure.Trigger> {
    children: ReactNode;
}
declare const ChatToolGroupTrigger: ({ children, className, ...props }: ChatToolGroupTriggerProps) => import("react/jsx-runtime").JSX.Element;
interface ChatToolGroupContentProps extends ComponentPropsWithRef<typeof Disclosure.Content> {
    children: ReactNode;
}
declare const ChatToolGroupContent: ({ children, className, ...props }: ChatToolGroupContentProps) => import("react/jsx-runtime").JSX.Element;
export { ChatToolGroupContent, ChatToolGroupRoot, ChatToolGroupTrigger };
export type { ChatToolGroupContentProps, ChatToolGroupRootProps, ChatToolGroupRootProps as ChatToolGroupProps, ChatToolGroupTriggerProps, };
