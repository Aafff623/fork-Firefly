import type { VariantProps } from "tailwind-variants";
export declare const numberValueVariants: import("tailwind-variants").TVReturnType<{
    [key: string]: {
        [key: string]: import("tailwind-merge").ClassNameValue | {
            base?: import("tailwind-merge").ClassNameValue;
            prefix?: import("tailwind-merge").ClassNameValue;
            value?: import("tailwind-merge").ClassNameValue;
            suffix?: import("tailwind-merge").ClassNameValue;
        };
    };
} | {
    [x: string]: {
        [x: string]: import("tailwind-merge").ClassNameValue | {
            base?: import("tailwind-merge").ClassNameValue;
            prefix?: import("tailwind-merge").ClassNameValue;
            value?: import("tailwind-merge").ClassNameValue;
            suffix?: import("tailwind-merge").ClassNameValue;
        };
    };
} | {}, {
    base: string;
    prefix: string;
    suffix: string;
    value: string;
}, undefined, {
    [key: string]: {
        [key: string]: import("tailwind-merge").ClassNameValue | {
            base?: import("tailwind-merge").ClassNameValue;
            prefix?: import("tailwind-merge").ClassNameValue;
            value?: import("tailwind-merge").ClassNameValue;
            suffix?: import("tailwind-merge").ClassNameValue;
        };
    };
} | {}, {
    base: string;
    prefix: string;
    suffix: string;
    value: string;
}, import("tailwind-variants").TVReturnType<unknown, {
    base: string;
    prefix: string;
    suffix: string;
    value: string;
}, undefined, unknown, unknown, undefined>>;
export type NumberValueVariants = VariantProps<typeof numberValueVariants>;
