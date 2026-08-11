import type { ComponentProps } from "react";
import { ChatLoaderDots, ChatLoaderPulse, ChatLoaderSkeleton, ChatLoaderSkeletonAvatar, ChatLoaderSkeletonBlock, ChatLoaderSkeletonLine, ChatLoaderSpinner } from "./chat-loader";
export declare const ChatLoader: {
    Dots: ({ className, label, size, ...props }: import("./chat-loader").ChatLoaderDotsProps) => import("react/jsx-runtime").JSX.Element;
    Pulse: ({ className, label, size, ...props }: import("./chat-loader").ChatLoaderPulseProps) => import("react/jsx-runtime").JSX.Element;
    Skeleton: ({ children, className, label, size, ...props }: import("./chat-loader").ChatLoaderSkeletonProps) => import("react/jsx-runtime").JSX.Element;
    SkeletonAvatar: ({ className, ...props }: import("./chat-loader").ChatLoaderSkeletonAvatarProps) => import("react/jsx-runtime").JSX.Element;
    SkeletonBlock: ({ children, className, ...props }: import("./chat-loader").ChatLoaderSkeletonBlockProps) => import("react/jsx-runtime").JSX.Element;
    SkeletonLine: ({ className, ...props }: import("./chat-loader").ChatLoaderSkeletonLineProps) => import("react/jsx-runtime").JSX.Element;
    Spinner: ({ className, label, size, ...props }: import("./chat-loader").ChatLoaderSpinnerProps) => import("react/jsx-runtime").JSX.Element;
};
export type ChatLoader = {
    DotsProps: ComponentProps<typeof ChatLoaderDots>;
    PulseProps: ComponentProps<typeof ChatLoaderPulse>;
    SkeletonAvatarProps: ComponentProps<typeof ChatLoaderSkeletonAvatar>;
    SkeletonBlockProps: ComponentProps<typeof ChatLoaderSkeletonBlock>;
    SkeletonLineProps: ComponentProps<typeof ChatLoaderSkeletonLine>;
    SkeletonProps: ComponentProps<typeof ChatLoaderSkeleton>;
    SpinnerProps: ComponentProps<typeof ChatLoaderSpinner>;
};
export { ChatLoaderDots, ChatLoaderPulse, ChatLoaderSkeleton, ChatLoaderSkeletonAvatar, ChatLoaderSkeletonBlock, ChatLoaderSkeletonLine, ChatLoaderSpinner, };
export type { ChatLoaderDotsProps, ChatLoaderPulseProps, ChatLoaderSkeletonAvatarProps, ChatLoaderSkeletonBlockProps, ChatLoaderSkeletonLineProps, ChatLoaderSkeletonProps, ChatLoaderSpinnerProps, } from "./chat-loader";
export { chatLoaderVariants } from "./chat-loader.styles";
export type { ChatLoaderVariants } from "./chat-loader.styles";
