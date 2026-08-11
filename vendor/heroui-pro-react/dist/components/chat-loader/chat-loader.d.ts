import type { ChatLoaderVariants } from "./chat-loader.styles";
import type { ComponentPropsWithRef, ReactNode } from "react";
interface ChatLoaderDotsProps extends ComponentPropsWithRef<"span"> {
    /** Accessible label for assistive tech. Omit for decorative loaders. */
    label?: string;
    size?: ChatLoaderVariants["size"];
}
declare const ChatLoaderDots: ({ className, label, size, ...props }: ChatLoaderDotsProps) => import("react/jsx-runtime").JSX.Element;
interface ChatLoaderPulseProps extends ComponentPropsWithRef<"span"> {
    /** Accessible label for assistive tech. Omit for decorative loaders. */
    label?: string;
    size?: ChatLoaderVariants["size"];
}
declare const ChatLoaderPulse: ({ className, label, size, ...props }: ChatLoaderPulseProps) => import("react/jsx-runtime").JSX.Element;
interface ChatLoaderSpinnerProps extends ComponentPropsWithRef<"span"> {
    /** Accessible label for assistive tech. Omit for decorative loaders. */
    label?: string;
    size?: ChatLoaderVariants["size"];
}
declare const ChatLoaderSpinner: ({ className, label, size, ...props }: ChatLoaderSpinnerProps) => import("react/jsx-runtime").JSX.Element;
interface ChatLoaderSkeletonProps extends ComponentPropsWithRef<"div"> {
    children?: ReactNode;
    /** Accessible label announced while the skeleton placeholder is visible. */
    label?: string;
    size?: ChatLoaderVariants["size"];
}
declare const ChatLoaderSkeleton: ({ children, className, label, size, ...props }: ChatLoaderSkeletonProps) => import("react/jsx-runtime").JSX.Element;
interface ChatLoaderSkeletonAvatarProps extends ComponentPropsWithRef<"div"> {
}
declare const ChatLoaderSkeletonAvatar: ({ className, ...props }: ChatLoaderSkeletonAvatarProps) => import("react/jsx-runtime").JSX.Element;
interface ChatLoaderSkeletonBlockProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChatLoaderSkeletonBlock: ({ children, className, ...props }: ChatLoaderSkeletonBlockProps) => import("react/jsx-runtime").JSX.Element;
interface ChatLoaderSkeletonLineProps extends ComponentPropsWithRef<"div"> {
}
declare const ChatLoaderSkeletonLine: ({ className, ...props }: ChatLoaderSkeletonLineProps) => import("react/jsx-runtime").JSX.Element;
export { ChatLoaderDots, ChatLoaderPulse, ChatLoaderSkeleton, ChatLoaderSkeletonAvatar, ChatLoaderSkeletonBlock, ChatLoaderSkeletonLine, ChatLoaderSpinner, };
export type { ChatLoaderDotsProps, ChatLoaderPulseProps, ChatLoaderSkeletonAvatarProps, ChatLoaderSkeletonBlockProps, ChatLoaderSkeletonLineProps, ChatLoaderSkeletonProps, ChatLoaderSpinnerProps, };
