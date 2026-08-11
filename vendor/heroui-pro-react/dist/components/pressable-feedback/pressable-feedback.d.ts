import type { HoldConfirmProps } from "./hold-confirm";
import type { ProgressFeedbackProps } from "./progress-feedback";
import type { RippleProps } from "./ripple";
import type { DOMRenderProps } from "@heroui/react";
import type { ComponentPropsWithRef, ReactNode } from "react";
interface PressableFeedbackRootProps<E extends keyof React.JSX.IntrinsicElements = "button"> extends DOMRenderProps<E, undefined> {
    children: ReactNode;
    className?: string;
    /** Whether the pressable is disabled. */
    isDisabled?: boolean;
}
declare const PressableFeedbackRoot: <E extends keyof React.JSX.IntrinsicElements = "button">({ children, className, isDisabled, ...props }: PressableFeedbackRootProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof PressableFeedbackRootProps<E>>) => import("react/jsx-runtime").JSX.Element;
interface PressableFeedbackHighlightProps extends ComponentPropsWithRef<"div"> {
}
declare const PressableFeedbackHighlight: ({ className, ...props }: PressableFeedbackHighlightProps) => import("react/jsx-runtime").JSX.Element;
interface PressableFeedbackRippleProps extends RippleProps {
}
declare const PressableFeedbackRipple: ({ className, ...props }: PressableFeedbackRippleProps) => import("react/jsx-runtime").JSX.Element;
interface PressableFeedbackHoldConfirmProps extends HoldConfirmProps {
}
declare const PressableFeedbackHoldConfirm: ({ className, ...props }: PressableFeedbackHoldConfirmProps) => import("react/jsx-runtime").JSX.Element;
interface PressableFeedbackProgressFeedbackProps extends ProgressFeedbackProps {
}
declare const PressableFeedbackProgressFeedback: ({ className, ...props }: PressableFeedbackProgressFeedbackProps) => import("react/jsx-runtime").JSX.Element;
export { PressableFeedbackHighlight, PressableFeedbackHoldConfirm, PressableFeedbackProgressFeedback, PressableFeedbackRipple, PressableFeedbackRoot, };
export type { PressableFeedbackHighlightProps, PressableFeedbackHoldConfirmProps, PressableFeedbackProgressFeedbackProps, PressableFeedbackRippleProps, PressableFeedbackRootProps, };
