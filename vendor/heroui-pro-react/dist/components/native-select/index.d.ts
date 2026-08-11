import type { ComponentProps } from "react";
import { NativeSelectIndicator, NativeSelectOptGroup, NativeSelectOption, NativeSelectRoot, NativeSelectTrigger } from "./native-select";
export declare const NativeSelect: (({ children, className, fullWidth, variant, ...props }: import("./native-select").NativeSelectRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Indicator: ({ children, className, ...props }: import("./native-select").NativeSelectIndicatorProps) => import("react/jsx-runtime").JSX.Element;
    OptGroup: ({ children, ...props }: import("./native-select").NativeSelectOptGroupProps) => import("react/jsx-runtime").JSX.Element;
    Option: ({ children, ...props }: import("./native-select").NativeSelectOptionProps) => import("react/jsx-runtime").JSX.Element;
    Root: ({ children, className, fullWidth, variant, ...props }: import("./native-select").NativeSelectRootProps) => import("react/jsx-runtime").JSX.Element;
    Trigger: ({ children, className, wrapperClassName, ...selectProps }: import("./native-select").NativeSelectTriggerProps) => import("react/jsx-runtime").JSX.Element;
};
export type NativeSelect = {
    IndicatorProps: ComponentProps<typeof NativeSelectIndicator>;
    OptGroupProps: ComponentProps<typeof NativeSelectOptGroup>;
    OptionProps: ComponentProps<typeof NativeSelectOption>;
    Props: ComponentProps<typeof NativeSelectRoot>;
    RootProps: ComponentProps<typeof NativeSelectRoot>;
    TriggerProps: ComponentProps<typeof NativeSelectTrigger>;
};
export { NativeSelectIndicator, NativeSelectOptGroup, NativeSelectOption, NativeSelectRoot, NativeSelectTrigger, };
export type { NativeSelectRootProps, NativeSelectRootProps as NativeSelectProps, NativeSelectTriggerProps, NativeSelectIndicatorProps, NativeSelectOptionProps, NativeSelectOptGroupProps, } from "./native-select";
export { nativeSelectVariants } from "./native-select.styles";
export type { NativeSelectVariants } from "./native-select.styles";
