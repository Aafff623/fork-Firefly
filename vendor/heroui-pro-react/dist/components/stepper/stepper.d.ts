import type { StepperVariants } from "./stepper.styles";
import type { ComponentPropsWithRef, ReactNode } from "react";
type StepStatus = "inactive" | "active" | "complete";
type StepperStepContextValue = {
    index: number;
    isLast: boolean;
    status: StepStatus;
};
/**
 * Hook to access per-step context (index, status, isLast) from any descendant
 * of `<Stepper.Step>`. Useful for building custom status-aware subcomponents.
 */
declare const useStepperStep: () => StepperStepContextValue;
interface StepperRootProps extends Omit<ComponentPropsWithRef<"ol">, "children"> {
    children: ReactNode;
    /** The current active step index (controlled). */
    currentStep?: number;
    /** The initial step index (uncontrolled). @default 0 */
    defaultStep?: number;
    /** Callback when a step is clicked. When provided, steps become interactive buttons. */
    onStepChange?: (step: number) => void;
    /** Layout direction. @default "horizontal" */
    orientation?: StepperVariants["orientation"];
    /** Size variant. @default "md" */
    size?: StepperVariants["size"];
}
type StepperStepInternalProps = {
    _index: number;
    _isLast: boolean;
};
declare const StepperRoot: ({ children, className, currentStep: currentStepProp, defaultStep, onStepChange, orientation, size, ...props }: StepperRootProps) => import("react/jsx-runtime").JSX.Element;
interface StepperIndicatorProps {
    children?: ReactNode;
    className?: string;
}
declare const StepperIndicator: ({ children, className, ...props }: StepperIndicatorProps) => import("react/jsx-runtime").JSX.Element;
interface StepperContentProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const StepperContent: ({ children, className, ...props }: StepperContentProps) => import("react/jsx-runtime").JSX.Element;
interface StepperTitleProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const StepperTitle: ({ children, className, ...props }: StepperTitleProps) => import("react/jsx-runtime").JSX.Element;
interface StepperDescriptionProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const StepperDescription: ({ children, className, ...props }: StepperDescriptionProps) => import("react/jsx-runtime").JSX.Element;
interface StepperIconProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const StepperIcon: ({ children, className, ...props }: StepperIconProps) => import("react/jsx-runtime").JSX.Element;
interface StepperSeparatorProps extends ComponentPropsWithRef<"div"> {
    /** Force rendering even on the last step. */
    force?: boolean;
    /** Explicit progress value (0–1). When omitted, auto-computed from `currentStep`. */
    progress?: number;
}
declare const StepperSeparator: ({ className, force, progress: progressProp, ...props }: StepperSeparatorProps) => import("react/jsx-runtime").JSX.Element | null;
interface StepperStepProps extends Omit<ComponentPropsWithRef<"li">, "children"> {
    children?: ReactNode;
}
declare const StepperStep: ({ _index: injectedIndex, _isLast: injectedIsLast, children, className, ...restProps }: StepperStepProps & Partial<StepperStepInternalProps>) => import("react/jsx-runtime").JSX.Element;
export { StepperRoot, StepperStep, StepperIndicator, StepperContent, StepperTitle, StepperDescription, StepperIcon, StepperSeparator, useStepperStep, };
export type { StepperRootProps, StepperStepProps, StepperIndicatorProps, StepperContentProps, StepperTitleProps, StepperDescriptionProps, StepperIconProps, StepperSeparatorProps, StepStatus, };
