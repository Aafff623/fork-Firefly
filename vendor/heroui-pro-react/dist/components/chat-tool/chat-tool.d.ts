import type { ChatToolVariants } from "./chat-tool.styles";
import type { ToolPartState } from "./chat-tool.types";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { Button, Disclosure } from "@heroui/react";
type ChatToolVisualState = NonNullable<ChatToolVariants["state"]>;
declare function mapToolStateToVisual(state: ToolPartState): ChatToolVisualState;
interface ChatToolRootProps extends ComponentPropsWithRef<typeof Disclosure> {
    /** Controls shimmer styling for running tools. Defaults to running when the state is in progress. */
    active?: boolean;
    approveLabel?: ReactNode;
    argsText?: string;
    children?: ReactNode;
    errorText?: string;
    input?: unknown;
    /** Whether the tool row can expand to reveal body content. Defaults to true for custom children. */
    isExpandable?: boolean;
    /** Preset: called when the user approves a tool that requires action. */
    onApprove?: () => void;
    /** Preset: called when the user rejects a tool that requires action. */
    onReject?: () => void;
    output?: unknown;
    rejectLabel?: ReactNode;
    state: ToolPartState;
    toolCallId?: string;
    toolName?: string;
    /** Preset: optional label before the tool name in the default trigger. */
    triggerPrefix?: ReactNode;
}
declare const ChatToolRoot: ({ active, approveLabel, argsText, children, className, errorText, input, isExpandable, onApprove, onReject, output, rejectLabel, state, toolCallId, toolName, triggerPrefix, ...props }: ChatToolRootProps) => import("react/jsx-runtime").JSX.Element;
interface ChatToolTriggerProps extends ComponentPropsWithRef<typeof Disclosure.Trigger> {
    children: ReactNode;
}
declare const ChatToolTrigger: ({ children, className, isDisabled, ...props }: ChatToolTriggerProps) => import("react/jsx-runtime").JSX.Element;
type ChatToolStatusIconProps = {
    children?: ReactNode;
    className?: string;
};
declare const ChatToolStatusIcon: ({ children, className }: ChatToolStatusIconProps) => import("react/jsx-runtime").JSX.Element;
interface ChatToolContentProps extends ComponentPropsWithRef<typeof Disclosure.Content> {
    children: ReactNode;
}
declare const ChatToolContent: ({ children, className, ...props }: ChatToolContentProps) => import("react/jsx-runtime").JSX.Element | null;
interface ChatToolArgsProps extends ComponentPropsWithRef<"div"> {
    argsText?: string;
    children?: ReactNode;
    input?: unknown;
    label?: ReactNode;
}
declare const ChatToolArgs: ({ argsText, children, className, input, label, ...props }: ChatToolArgsProps) => import("react/jsx-runtime").JSX.Element | null;
interface ChatToolResultProps extends ComponentPropsWithRef<"div"> {
    children?: ReactNode;
    label?: ReactNode;
    value?: unknown;
}
declare const ChatToolResult: ({ children, className, label, value, ...props }: ChatToolResultProps) => import("react/jsx-runtime").JSX.Element | null;
interface ChatToolErrorProps extends ComponentPropsWithRef<"div"> {
    children?: ReactNode;
    errorText?: string;
    label?: ReactNode;
}
declare const ChatToolError: ({ children, className, errorText, label, ...props }: ChatToolErrorProps) => import("react/jsx-runtime").JSX.Element | null;
interface ChatToolApprovalProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChatToolApproval: ({ children, className, ...props }: ChatToolApprovalProps) => import("react/jsx-runtime").JSX.Element | null;
interface ChatToolApprovalActionsProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChatToolApprovalActions: ({ children, className, ...props }: ChatToolApprovalActionsProps) => import("react/jsx-runtime").JSX.Element;
type ChatToolActionPresetProps = ComponentPropsWithRef<typeof Button> & {
    children?: ReactNode;
};
declare const ChatToolApprove: ({ children, ...props }: ChatToolActionPresetProps) => import("react/jsx-runtime").JSX.Element;
declare const ChatToolReject: ({ children, variant, ...props }: ChatToolActionPresetProps) => import("react/jsx-runtime").JSX.Element;
interface ChatToolMetaProps extends ComponentPropsWithRef<"div"> {
    toolCallId: string;
}
declare const ChatToolMeta: ({ className, toolCallId, ...props }: ChatToolMetaProps) => import("react/jsx-runtime").JSX.Element;
export { ChatToolApproval, ChatToolApprovalActions, ChatToolApprove, ChatToolArgs, ChatToolContent, ChatToolError, ChatToolMeta, ChatToolReject, ChatToolResult, ChatToolRoot, ChatToolStatusIcon, ChatToolTrigger, mapToolStateToVisual, };
export type { ChatToolApprovalActionsProps, ChatToolApprovalProps, ChatToolActionPresetProps, ChatToolArgsProps, ChatToolContentProps, ChatToolErrorProps, ChatToolMetaProps, ChatToolResultProps, ChatToolRootProps, ChatToolRootProps as ChatToolProps, ChatToolStatusIconProps, ChatToolTriggerProps, };
