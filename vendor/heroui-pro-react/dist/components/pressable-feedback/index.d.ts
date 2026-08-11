import type { ComponentProps } from "react";
import { PressableFeedbackHighlight, PressableFeedbackHoldConfirm, PressableFeedbackProgressFeedback, PressableFeedbackRipple, PressableFeedbackRoot } from "./pressable-feedback";
export declare const PressableFeedback: (<E extends keyof React.JSX.IntrinsicElements = "button">({ children, className, isDisabled, ...props }: import("./pressable-feedback").PressableFeedbackRootProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof import("./pressable-feedback").PressableFeedbackRootProps<E>>) => import("react/jsx-runtime").JSX.Element) & {
    Highlight: ({ className, ...props }: import("./pressable-feedback").PressableFeedbackHighlightProps) => import("react/jsx-runtime").JSX.Element;
    HoldConfirm: ({ className, ...props }: import("./pressable-feedback").PressableFeedbackHoldConfirmProps) => import("react/jsx-runtime").JSX.Element;
    ProgressFeedback: ({ className, ...props }: import("./pressable-feedback").PressableFeedbackProgressFeedbackProps) => import("react/jsx-runtime").JSX.Element;
    Ripple: ({ className, ...props }: import("./pressable-feedback").PressableFeedbackRippleProps) => import("react/jsx-runtime").JSX.Element;
    Root: <E extends keyof React.JSX.IntrinsicElements = "button">({ children, className, isDisabled, ...props }: import("./pressable-feedback").PressableFeedbackRootProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof import("./pressable-feedback").PressableFeedbackRootProps<E>>) => import("react/jsx-runtime").JSX.Element;
};
export type PressableFeedback = {
    HighlightProps: ComponentProps<typeof PressableFeedbackHighlight>;
    HoldConfirmProps: ComponentProps<typeof PressableFeedbackHoldConfirm>;
    ProgressFeedbackProps: ComponentProps<typeof PressableFeedbackProgressFeedback>;
    Props: ComponentProps<typeof PressableFeedbackRoot>;
    RippleProps: ComponentProps<typeof PressableFeedbackRipple>;
    RootProps: ComponentProps<typeof PressableFeedbackRoot>;
};
export { PressableFeedbackHighlight, PressableFeedbackHoldConfirm, PressableFeedbackProgressFeedback, PressableFeedbackRipple, PressableFeedbackRoot, };
export type { PressableFeedbackRootProps, PressableFeedbackRootProps as PressableFeedbackProps, PressableFeedbackHighlightProps, PressableFeedbackHoldConfirmProps, PressableFeedbackProgressFeedbackProps, PressableFeedbackRippleProps, } from "./pressable-feedback";
export { pressableFeedbackVariants } from "./pressable-feedback.styles";
