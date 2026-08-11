import type { ComponentProps } from "react";
import { MarkdownRoot, StreamMarkdownRoot } from "./markdown";
export declare const Markdown: import("react").NamedExoticComponent<import("./markdown").MarkdownRootProps>;
export declare const StreamMarkdown: import("react").NamedExoticComponent<import("./markdown").StreamMarkdownRootProps>;
export type Markdown = {
    Props: ComponentProps<typeof MarkdownRoot>;
};
export type StreamMarkdown = {
    Props: ComponentProps<typeof StreamMarkdownRoot>;
};
export { MarkdownRoot, StreamMarkdownRoot };
export type { MarkdownProps, MarkdownRootProps, StreamMarkdownProps, StreamMarkdownRootProps, } from "./markdown";
export { markdownVariants } from "./markdown.styles";
export type { MarkdownVariants } from "./markdown.styles";
