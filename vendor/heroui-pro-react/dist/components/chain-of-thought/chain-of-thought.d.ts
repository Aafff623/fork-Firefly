import type { ComponentPropsWithRef, ReactNode } from "react";
import { Button, Disclosure } from "@heroui/react";
interface ChainOfThoughtRootProps extends ComponentPropsWithRef<typeof Disclosure> {
    children: ReactNode;
    /** Show shimmer styling on the trigger while reasoning is in progress. */
    isStreaming?: boolean;
}
declare const ChainOfThoughtRoot: ({ children, className, isStreaming, ...props }: ChainOfThoughtRootProps) => import("react/jsx-runtime").JSX.Element;
interface ChainOfThoughtTriggerProps extends ComponentPropsWithRef<typeof Button> {
    children: ReactNode;
}
declare const ChainOfThoughtTrigger: ({ children, className, ...props }: ChainOfThoughtTriggerProps) => import("react/jsx-runtime").JSX.Element;
interface ChainOfThoughtContentProps extends ComponentPropsWithRef<typeof Disclosure.Content> {
    children: ReactNode;
}
declare const ChainOfThoughtContent: ({ children, className, ...props }: ChainOfThoughtContentProps) => import("react/jsx-runtime").JSX.Element;
interface ChainOfThoughtStepsProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const ChainOfThoughtSteps: ({ children, className, ...props }: ChainOfThoughtStepsProps) => import("react/jsx-runtime").JSX.Element;
interface ChainOfThoughtStepProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
    label?: ReactNode;
}
declare const ChainOfThoughtStep: ({ children, className, label, ...props }: ChainOfThoughtStepProps) => import("react/jsx-runtime").JSX.Element;
export { ChainOfThoughtContent, ChainOfThoughtRoot, ChainOfThoughtStep, ChainOfThoughtSteps, ChainOfThoughtTrigger, };
export type { ChainOfThoughtContentProps, ChainOfThoughtRootProps, ChainOfThoughtRootProps as ChainOfThoughtProps, ChainOfThoughtStepProps, ChainOfThoughtStepsProps, ChainOfThoughtTriggerProps, };
