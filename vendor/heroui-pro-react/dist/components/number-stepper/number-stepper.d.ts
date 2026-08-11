import type { NumberStepperVariants } from "./number-stepper.styles";
import type { Format } from "@number-flow/react";
import type { ComponentPropsWithRef } from "react";
import NumberFlow from "@number-flow/react";
import React from "react";
import { Button as ButtonPrimitive } from "react-aria-components/Button";
import { Group as GroupPrimitive } from "react-aria-components/Group";
import { NumberField as NumberFieldPrimitive } from "react-aria-components/NumberField";
interface NumberStepperRootProps extends ComponentPropsWithRef<typeof NumberFieldPrimitive>, NumberStepperVariants {
    formatOptions?: Format;
}
declare const NumberStepperRoot: ({ children, className, formatOptions, size, ...props }: NumberStepperRootProps) => import("react/jsx-runtime").JSX.Element;
interface NumberStepperGroupProps extends ComponentPropsWithRef<typeof GroupPrimitive> {
}
declare const NumberStepperGroup: ({ children, className, ...props }: NumberStepperGroupProps) => import("react/jsx-runtime").JSX.Element;
type NumberStepperValueRenderProps = {
    formatOptions?: Format;
    value: number;
};
interface NumberStepperValueProps extends Omit<ComponentPropsWithRef<typeof NumberFlow>, "value" | "children"> {
    children?: ((props: NumberStepperValueRenderProps) => React.ReactNode) | React.ReactNode;
    value?: number;
}
declare const NumberStepperValue: ({ children, className, format, value, ...props }: NumberStepperValueProps) => import("react/jsx-runtime").JSX.Element;
interface NumberStepperDecrementButtonProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {
}
declare const NumberStepperDecrementButton: ({ children, className, ...props }: NumberStepperDecrementButtonProps) => import("react/jsx-runtime").JSX.Element;
interface NumberStepperIncrementButtonProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {
}
declare const NumberStepperIncrementButton: ({ children, className, ...props }: NumberStepperIncrementButtonProps) => import("react/jsx-runtime").JSX.Element;
export { NumberStepperRoot, NumberStepperGroup, NumberStepperValue, NumberStepperDecrementButton, NumberStepperIncrementButton, };
export type { NumberStepperRootProps, NumberStepperGroupProps, NumberStepperValueProps, NumberStepperValueRenderProps, NumberStepperDecrementButtonProps, NumberStepperIncrementButtonProps, };
