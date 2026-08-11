import type { CellSliderVariants } from "./cell-slider.styles";
import type { ComponentProps, ComponentPropsWithRef, ReactNode } from "react";
import { Slider } from "@heroui/react";
interface CellSliderRootProps extends Omit<ComponentProps<typeof Slider>, "variant" | "orientation"> {
    /** Visual variant. @default "default" */
    variant?: CellSliderVariants["variant"];
}
declare const CellSliderRoot: ({ children, className, variant, ...props }: CellSliderRootProps) => import("react/jsx-runtime").JSX.Element;
interface CellSliderTrackProps extends ComponentProps<typeof Slider.Track> {
}
declare const CellSliderTrack: ({ children, className, ...props }: CellSliderTrackProps) => import("react/jsx-runtime").JSX.Element;
interface CellSliderFillProps extends ComponentProps<typeof Slider.Fill> {
}
declare const CellSliderFill: ({ className, ...props }: CellSliderFillProps) => import("react/jsx-runtime").JSX.Element;
interface CellSliderThumbProps extends ComponentProps<typeof Slider.Thumb> {
}
declare const CellSliderThumb: ({ children, className, ...props }: CellSliderThumbProps) => import("react/jsx-runtime").JSX.Element;
interface CellSliderLabelProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const CellSliderLabel: ({ children, className, ...props }: CellSliderLabelProps) => import("react/jsx-runtime").JSX.Element;
interface CellSliderOutputProps extends ComponentProps<typeof Slider.Output> {
}
declare const CellSliderOutput: ({ children, className, ...props }: CellSliderOutputProps) => import("react/jsx-runtime").JSX.Element;
export { CellSliderFill, CellSliderLabel, CellSliderOutput, CellSliderRoot, CellSliderThumb, CellSliderTrack, };
export type { CellSliderFillProps, CellSliderLabelProps, CellSliderOutputProps, CellSliderRootProps, CellSliderThumbProps, CellSliderTrackProps, };
