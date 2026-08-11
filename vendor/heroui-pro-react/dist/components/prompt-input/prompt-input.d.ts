import type { PromptInputVariants } from "./prompt-input.styles";
import type { ChatStatus } from "./prompt-input.types";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { Button, TextArea } from "@heroui/react";
type PromptInputLayout = NonNullable<PromptInputVariants["layout"]>;
type PromptInputSurfaceVariant = NonNullable<PromptInputVariants["variant"]>;
interface PromptInputRootProps extends ComponentPropsWithRef<"div"> {
    allowSubmitWhileRunning?: boolean;
    children: ReactNode;
    isDisabled?: boolean;
    /** @deprecated Prefer `status`. When true, treated as `status="streaming"`. */
    isPending?: boolean;
    /** Layout behavior for toolbar placement and inline resizing. @default "stacked" */
    layout?: PromptInputLayout;
    lockInputOnRun?: boolean;
    maxHeight?: number | string;
    onStop?: () => void;
    onSubmit?: () => void;
    onValueChange?: (value: string) => void;
    size?: PromptInputVariants["size"];
    status?: ChatStatus;
    /** Shell surface variant aligned with HeroUI OSS field inputs. @default "primary" */
    variant?: PromptInputSurfaceVariant;
    value?: string;
}
declare const PromptInputRoot: ({ allowSubmitWhileRunning, children, className, isDisabled, isPending, layout, lockInputOnRun, maxHeight, onStop, onSubmit, onValueChange, size, status, value: valueProp, variant, ...props }: PromptInputRootProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputShellProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const PromptInputShell: ({ children, className, ...props }: PromptInputShellProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputContentProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const PromptInputContent: ({ children, className, ...props }: PromptInputContentProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputAttachmentsProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const PromptInputAttachments: ({ children, className, ...props }: PromptInputAttachmentsProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputTextAreaProps extends ComponentPropsWithRef<typeof TextArea> {
    disableAutosize?: boolean;
}
declare const PromptInputTextArea: ({ className, disableAutosize, onKeyDown, ...props }: PromptInputTextAreaProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputToolbarProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const PromptInputToolbar: ({ children, className, ...props }: PromptInputToolbarProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputToolbarStartProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const PromptInputToolbarStart: ({ children, className, ...props }: PromptInputToolbarStartProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputToolbarEndProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const PromptInputToolbarEnd: ({ children, className, ...props }: PromptInputToolbarEndProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputFooterProps extends ComponentPropsWithRef<"p"> {
    children: ReactNode;
}
declare const PromptInputFooter: ({ children, className, ...props }: PromptInputFooterProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputSendProps extends ComponentPropsWithRef<typeof Button> {
    children?: ReactNode;
    onStop?: () => void;
    status?: ChatStatus;
}
declare const PromptInputSend: ({ children, className, isDisabled: isDisabledProp, onPress, onStop: onStopProp, status: statusProp, ...props }: PromptInputSendProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputActionProps extends ComponentPropsWithRef<typeof Button> {
    children: ReactNode;
    tooltip?: ReactNode;
}
declare const PromptInputAction: ({ children, className, tooltip, variant: variantProp, ...props }: PromptInputActionProps) => import("react/jsx-runtime").JSX.Element;
export { PromptInputAction, PromptInputAttachments, PromptInputContent, PromptInputFooter, PromptInputRoot, PromptInputSend, PromptInputShell, PromptInputTextArea, PromptInputToolbar, PromptInputToolbarEnd, PromptInputToolbarStart, };
export type { PromptInputActionProps, PromptInputAttachmentsProps, PromptInputContentProps, PromptInputFooterProps, PromptInputRootProps, PromptInputRootProps as PromptInputProps, PromptInputSendProps, PromptInputShellProps, PromptInputTextAreaProps, PromptInputToolbarEndProps, PromptInputToolbarProps, PromptInputToolbarStartProps, };
