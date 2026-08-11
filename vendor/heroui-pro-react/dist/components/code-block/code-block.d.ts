import type { ComponentPropsWithRef, ReactNode } from "react";
interface CodeBlockRootProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const CodeBlockRoot: ({ children, className, ...props }: CodeBlockRootProps) => import("react/jsx-runtime").JSX.Element;
interface CodeBlockHeaderProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const CodeBlockHeader: ({ children, className, ...props }: CodeBlockHeaderProps) => import("react/jsx-runtime").JSX.Element;
interface CodeBlockCodeProps extends ComponentPropsWithRef<"div"> {
    code: string;
    darkTheme?: string;
    language?: string;
    theme?: string;
}
declare const CodeBlockCode: ({ className, code, darkTheme, language, theme, ...props }: CodeBlockCodeProps) => import("react/jsx-runtime").JSX.Element;
interface CodeBlockCopyButtonProps {
    code: string;
    "aria-label"?: string;
    className?: string;
}
declare const CodeBlockCopyButton: ({ "aria-label": ariaLabel, className, code, }: CodeBlockCopyButtonProps) => import("react/jsx-runtime").JSX.Element;
export { CodeBlockCode, CodeBlockCopyButton, CodeBlockHeader, CodeBlockRoot };
export type { CodeBlockCodeProps, CodeBlockCopyButtonProps, CodeBlockHeaderProps, CodeBlockRootProps, CodeBlockRootProps as CodeBlockProps, };
