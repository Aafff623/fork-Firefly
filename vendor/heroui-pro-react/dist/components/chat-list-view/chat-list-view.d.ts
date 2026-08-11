import type { ChatListViewVariants } from "./chat-list-view.styles";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { ListViewDescription, ListViewItem, ListViewItemAction, ListViewItemContent, ListViewRoot, ListViewTitle } from "../list-view/list-view";
interface ChatListViewRootProps<T extends object> extends Omit<ComponentPropsWithRef<typeof ListViewRoot<T>>, "variant"> {
    /** Row density. @default "comfortable" */
    density?: ChatListViewVariants["density"];
}
declare const ChatListViewRoot: <T extends object>({ children, className, density, ...props }: ChatListViewRootProps<T>) => import("react/jsx-runtime").JSX.Element;
interface ChatListViewItemProps<T extends object> extends ComponentPropsWithRef<typeof ListViewItem<T>> {
    children: ReactNode;
}
declare const ChatListViewItem: <T extends object>({ children, className, ...props }: ChatListViewItemProps<T>) => import("react/jsx-runtime").JSX.Element;
interface ChatListViewItemContentProps extends ComponentPropsWithRef<typeof ListViewItemContent> {
    children: ReactNode;
}
declare const ChatListViewItemContent: ({ children, className, ...props }: ChatListViewItemContentProps) => import("react/jsx-runtime").JSX.Element;
interface ChatListViewIconProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChatListViewIcon: ({ children, className, ...props }: ChatListViewIconProps) => import("react/jsx-runtime").JSX.Element;
interface ChatListViewTextProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChatListViewText: ({ children, className, ...props }: ChatListViewTextProps) => import("react/jsx-runtime").JSX.Element;
interface ChatListViewTitleProps extends ComponentPropsWithRef<typeof ListViewTitle> {
    children: ReactNode;
}
declare const ChatListViewTitle: ({ children, className, ...props }: ChatListViewTitleProps) => import("react/jsx-runtime").JSX.Element;
interface ChatListViewPreviewProps extends ComponentPropsWithRef<typeof ListViewDescription> {
    children: ReactNode;
}
declare const ChatListViewPreview: ({ children, className, ...props }: ChatListViewPreviewProps) => import("react/jsx-runtime").JSX.Element;
interface ChatListViewMetaProps extends ComponentPropsWithRef<typeof ListViewItemAction> {
    children: ReactNode;
}
declare const ChatListViewMeta: ({ children, className, ...props }: ChatListViewMetaProps) => import("react/jsx-runtime").JSX.Element;
export { ChatListViewIcon, ChatListViewItem, ChatListViewItemContent, ChatListViewMeta, ChatListViewPreview, ChatListViewRoot, ChatListViewText, ChatListViewTitle, };
export type { ChatListViewIconProps, ChatListViewItemContentProps, ChatListViewItemProps, ChatListViewMetaProps, ChatListViewPreviewProps, ChatListViewRootProps, ChatListViewRootProps as ChatListViewProps, ChatListViewTextProps, ChatListViewTitleProps, };
