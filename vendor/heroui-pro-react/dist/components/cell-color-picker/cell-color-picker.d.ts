import type { CellColorPickerVariants } from "./cell-color-picker.styles";
import type { ColorPickerPopoverProps } from "@heroui/react";
import type { ComponentProps, ComponentPropsWithRef, ReactNode } from "react";
import type { ColorPickerProps as ColorPickerPrimitiveProps } from "react-aria-components/ColorPicker";
import { ColorSwatch } from "@heroui/react";
import { Button as ButtonPrimitive } from "react-aria-components/Button";
interface CellColorPickerRootProps extends Omit<ColorPickerPrimitiveProps, "children"> {
    children: ReactNode;
    className?: string;
    /** Visual variant. @default "default" */
    variant?: CellColorPickerVariants["variant"];
}
declare const CellColorPickerRoot: ({ children, className, variant, ...props }: CellColorPickerRootProps) => import("react/jsx-runtime").JSX.Element;
interface CellColorPickerTriggerProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {
}
declare const CellColorPickerTrigger: ({ children, className, ...props }: CellColorPickerTriggerProps) => import("react/jsx-runtime").JSX.Element;
interface CellColorPickerLabelProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const CellColorPickerLabel: ({ children, className, ...props }: CellColorPickerLabelProps) => import("react/jsx-runtime").JSX.Element;
interface CellColorPickerValueDisplayProps extends ComponentPropsWithRef<"span"> {
}
declare const CellColorPickerValueDisplay: ({ children, className, ...props }: CellColorPickerValueDisplayProps) => import("react/jsx-runtime").JSX.Element;
interface CellColorPickerSwatchProps extends ComponentProps<typeof ColorSwatch> {
}
declare const CellColorPickerSwatch: ({ className, ...props }: CellColorPickerSwatchProps) => import("react/jsx-runtime").JSX.Element;
interface CellColorPickerPopoverProps extends ColorPickerPopoverProps {
}
declare const CellColorPickerPopover: ({ children, className, placement, ...props }: CellColorPickerPopoverProps) => import("react/jsx-runtime").JSX.Element;
export { CellColorPickerLabel, CellColorPickerPopover, CellColorPickerRoot, CellColorPickerSwatch, CellColorPickerTrigger, CellColorPickerValueDisplay, };
export type { CellColorPickerLabelProps, CellColorPickerPopoverProps, CellColorPickerRootProps, CellColorPickerSwatchProps, CellColorPickerTriggerProps, CellColorPickerValueDisplayProps, };
