import type { ComponentProps } from "react";
import { NumberStepperDecrementButton, NumberStepperGroup, NumberStepperIncrementButton, NumberStepperRoot, NumberStepperValue } from "./number-stepper";
export declare const NumberStepper: (({ children, className, formatOptions, size, ...props }: import("./number-stepper").NumberStepperRootProps) => import("react/jsx-runtime").JSX.Element) & {
    DecrementButton: ({ children, className, ...props }: import("./number-stepper").NumberStepperDecrementButtonProps) => import("react/jsx-runtime").JSX.Element;
    Group: ({ children, className, ...props }: import("./number-stepper").NumberStepperGroupProps) => import("react/jsx-runtime").JSX.Element;
    IncrementButton: ({ children, className, ...props }: import("./number-stepper").NumberStepperIncrementButtonProps) => import("react/jsx-runtime").JSX.Element;
    Root: ({ children, className, formatOptions, size, ...props }: import("./number-stepper").NumberStepperRootProps) => import("react/jsx-runtime").JSX.Element;
    Value: ({ children, className, format, value, ...props }: import("./number-stepper").NumberStepperValueProps) => import("react/jsx-runtime").JSX.Element;
};
export type NumberStepper = {
    Props: ComponentProps<typeof NumberStepperRoot>;
    RootProps: ComponentProps<typeof NumberStepperRoot>;
    GroupProps: ComponentProps<typeof NumberStepperGroup>;
    ValueProps: ComponentProps<typeof NumberStepperValue>;
    DecrementButtonProps: ComponentProps<typeof NumberStepperDecrementButton>;
    IncrementButtonProps: ComponentProps<typeof NumberStepperIncrementButton>;
};
export { NumberStepperRoot, NumberStepperGroup, NumberStepperValue, NumberStepperDecrementButton, NumberStepperIncrementButton, };
export type { NumberStepperRootProps, NumberStepperRootProps as NumberStepperProps, NumberStepperGroupProps, NumberStepperValueProps, NumberStepperValueRenderProps, NumberStepperDecrementButtonProps, NumberStepperIncrementButtonProps, } from "./number-stepper";
export { numberStepperVariants } from "./number-stepper.styles";
export type { NumberStepperVariants } from "./number-stepper.styles";
