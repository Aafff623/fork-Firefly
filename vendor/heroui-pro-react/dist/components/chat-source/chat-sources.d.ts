import type { ComponentPropsWithRef, ReactNode } from "react";
import { Disclosure } from "@heroui/react";
interface ChatSourcesRootProps extends ComponentPropsWithRef<typeof Disclosure> {
    children: ReactNode;
}
declare const ChatSourcesRoot: ({ children, className, ...props }: ChatSourcesRootProps) => import("react/jsx-runtime").JSX.Element;
interface ChatSourcesTriggerProps extends ComponentPropsWithRef<typeof Disclosure.Trigger> {
    children: ReactNode;
}
declare const ChatSourcesTrigger: ({ children, className, ...props }: ChatSourcesTriggerProps) => import("react/jsx-runtime").JSX.Element;
interface ChatSourcesContentProps extends ComponentPropsWithRef<typeof Disclosure.Content> {
    children: ReactNode;
}
declare const ChatSourcesContent: ({ children, className, ...props }: ChatSourcesContentProps) => import("react/jsx-runtime").JSX.Element;
interface ChatSourcesListProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChatSourcesList: ({ children, className, ...props }: ChatSourcesListProps) => import("react/jsx-runtime").JSX.Element;
export { ChatSourcesContent, ChatSourcesList, ChatSourcesRoot, ChatSourcesTrigger };
export type { ChatSourcesContentProps, ChatSourcesListProps, ChatSourcesRootProps, ChatSourcesRootProps as ChatSourcesProps, ChatSourcesTriggerProps, };
