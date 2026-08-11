import type { ComponentProps } from "react";
import { ChatSourceDocumentIcon, ChatSourceIcon, ChatSourcePreview, ChatSourceRoot, ChatSourceTitle, ChatSourceTrigger } from "./chat-source";
import { ChatSourcesContent, ChatSourcesList, ChatSourcesRoot, ChatSourcesTrigger } from "./chat-sources";
export declare const ChatSource: (({ children, className, description, enablePreview: enablePreviewProp, faviconUrl, href, sourceType, title, ...props }: import("./chat-source").ChatSourceRootProps) => import("react/jsx-runtime").JSX.Element) & {
    DocumentIcon: ({ className }: {
        className?: string;
    }) => import("react/jsx-runtime").JSX.Element;
    Icon: ({ children, className, faviconUrl }: import("./chat-source").ChatSourceIconProps) => import("react/jsx-runtime").JSX.Element;
    Preview: ({ children, className, description, title, ...props }: import("./chat-source").ChatSourcePreviewProps) => import("react/jsx-runtime").JSX.Element | null;
    Root: ({ children, className, description, enablePreview: enablePreviewProp, faviconUrl, href, sourceType, title, ...props }: import("./chat-source").ChatSourceRootProps) => import("react/jsx-runtime").JSX.Element;
    Title: ({ children, className, ...props }: import("./chat-source").ChatSourceTitleProps) => import("react/jsx-runtime").JSX.Element;
    Trigger: ({ children, className, label, ...props }: import("./chat-source").ChatSourceTriggerProps) => import("react/jsx-runtime").JSX.Element;
};
export declare const ChatSources: (({ children, className, ...props }: import("./chat-sources").ChatSourcesRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Content: ({ children, className, ...props }: import("./chat-sources").ChatSourcesContentProps) => import("react/jsx-runtime").JSX.Element;
    List: ({ children, className, ...props }: import("./chat-sources").ChatSourcesListProps) => import("react/jsx-runtime").JSX.Element;
    Root: ({ children, className, ...props }: import("./chat-sources").ChatSourcesRootProps) => import("react/jsx-runtime").JSX.Element;
    Trigger: ({ children, className, ...props }: import("./chat-sources").ChatSourcesTriggerProps) => import("react/jsx-runtime").JSX.Element;
};
export type ChatSource = {
    DocumentIconProps: ComponentProps<typeof ChatSourceDocumentIcon>;
    IconProps: ComponentProps<typeof ChatSourceIcon>;
    PreviewProps: ComponentProps<typeof ChatSourcePreview>;
    Props: ComponentProps<typeof ChatSourceRoot>;
    RootProps: ComponentProps<typeof ChatSourceRoot>;
    TitleProps: ComponentProps<typeof ChatSourceTitle>;
    TriggerProps: ComponentProps<typeof ChatSourceTrigger>;
};
export type ChatSources = {
    ContentProps: ComponentProps<typeof ChatSourcesContent>;
    ListProps: ComponentProps<typeof ChatSourcesList>;
    Props: ComponentProps<typeof ChatSourcesRoot>;
    RootProps: ComponentProps<typeof ChatSourcesRoot>;
    TriggerProps: ComponentProps<typeof ChatSourcesTrigger>;
};
export { ChatSourceDocumentIcon, ChatSourceIcon, ChatSourcePreview, ChatSourceRoot, ChatSourceTitle, ChatSourceTrigger, ChatSourcesContent, ChatSourcesList, ChatSourcesRoot, ChatSourcesTrigger, };
export type { ChatSourceIconProps, ChatSourcePreviewProps, ChatSourceProps, ChatSourceTitleProps, ChatSourceTriggerProps, } from "./chat-source";
export type { ChatSourcesContentProps, ChatSourcesListProps, ChatSourcesProps, ChatSourcesTriggerProps, } from "./chat-sources";
export { extractSourceDomain } from "./chat-source";
export { chatSourceVariants, chatSourcesVariants } from "./chat-source.styles";
export type { ChatSourceVariants, ChatSourcesVariants } from "./chat-source.styles";
