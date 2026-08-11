import type { ComponentPropsWithRef } from "react";
import type { Components as ReactMarkdownComponents } from "react-markdown";
import type { Components as StreamdownComponents, StreamdownProps } from "streamdown";
import { markdownVariants } from "./markdown.styles";
interface MarkdownRootProps extends ComponentPropsWithRef<"div"> {
    children: string;
    components?: Partial<ReactMarkdownComponents>;
    id?: string;
}
interface StreamMarkdownRootProps extends ComponentPropsWithRef<"div"> {
    animated?: StreamdownProps["animated"];
    caret?: StreamdownProps["caret"];
    children: string;
    components?: StreamdownComponents;
    controls?: StreamdownProps["controls"];
    isStreaming?: boolean;
}
declare const MarkdownRoot: import("react").NamedExoticComponent<MarkdownRootProps>;
declare const StreamMarkdownRoot: import("react").NamedExoticComponent<StreamMarkdownRootProps>;
export { MarkdownRoot, StreamMarkdownRoot };
export type { MarkdownRootProps, MarkdownRootProps as MarkdownProps, StreamMarkdownRootProps, StreamMarkdownRootProps as StreamMarkdownProps, };
export { markdownVariants };
export type { MarkdownVariants } from "./markdown.styles";
