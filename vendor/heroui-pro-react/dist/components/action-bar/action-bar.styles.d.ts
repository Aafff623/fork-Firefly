import type { VariantProps } from "tailwind-variants";
export declare const actionBarVariants: import("tailwind-variants").TVReturnType<{
    [key: string]: {
        [key: string]: import("tailwind-merge").ClassNameValue | {
            base?: import("tailwind-merge").ClassNameValue;
            content?: import("tailwind-merge").ClassNameValue;
            prefix?: import("tailwind-merge").ClassNameValue;
            label?: import("tailwind-merge").ClassNameValue;
            suffix?: import("tailwind-merge").ClassNameValue;
            wrapper?: import("tailwind-merge").ClassNameValue;
        };
    };
} | {
    [x: string]: {
        [x: string]: import("tailwind-merge").ClassNameValue | {
            base?: import("tailwind-merge").ClassNameValue;
            content?: import("tailwind-merge").ClassNameValue;
            prefix?: import("tailwind-merge").ClassNameValue;
            label?: import("tailwind-merge").ClassNameValue;
            suffix?: import("tailwind-merge").ClassNameValue;
            wrapper?: import("tailwind-merge").ClassNameValue;
        };
    };
} | {}, {
    base: string;
    content: string;
    label: string;
    prefix: string;
    suffix: string;
    wrapper: string;
}, undefined, {
    [key: string]: {
        [key: string]: import("tailwind-merge").ClassNameValue | {
            base?: import("tailwind-merge").ClassNameValue;
            content?: import("tailwind-merge").ClassNameValue;
            prefix?: import("tailwind-merge").ClassNameValue;
            label?: import("tailwind-merge").ClassNameValue;
            suffix?: import("tailwind-merge").ClassNameValue;
            wrapper?: import("tailwind-merge").ClassNameValue;
        };
    };
} | {}, {
    base: string;
    content: string;
    label: string;
    prefix: string;
    suffix: string;
    wrapper: string;
}, import("tailwind-variants").TVReturnType<unknown, {
    base: string;
    content: string;
    label: string;
    prefix: string;
    suffix: string;
    wrapper: string;
}, undefined, unknown, unknown, undefined>>;
export type ActionBarVariants = VariantProps<typeof actionBarVariants>;
