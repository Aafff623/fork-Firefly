import type { VariantProps } from "tailwind-variants";
export declare const floatingTocVariants: import("tailwind-variants").TVReturnType<{
    [key: string]: {
        [key: string]: import("tailwind-merge").ClassNameValue | {
            content?: import("tailwind-merge").ClassNameValue;
            trigger?: import("tailwind-merge").ClassNameValue;
            item?: import("tailwind-merge").ClassNameValue;
            bar?: import("tailwind-merge").ClassNameValue;
        };
    };
} | {
    [x: string]: {
        [x: string]: import("tailwind-merge").ClassNameValue | {
            content?: import("tailwind-merge").ClassNameValue;
            trigger?: import("tailwind-merge").ClassNameValue;
            item?: import("tailwind-merge").ClassNameValue;
            bar?: import("tailwind-merge").ClassNameValue;
        };
    };
} | {}, {
    bar: string;
    content: string;
    item: string;
    trigger: string;
}, undefined, {
    [key: string]: {
        [key: string]: import("tailwind-merge").ClassNameValue | {
            content?: import("tailwind-merge").ClassNameValue;
            trigger?: import("tailwind-merge").ClassNameValue;
            item?: import("tailwind-merge").ClassNameValue;
            bar?: import("tailwind-merge").ClassNameValue;
        };
    };
} | {}, {
    bar: string;
    content: string;
    item: string;
    trigger: string;
}, import("tailwind-variants").TVReturnType<unknown, {
    bar: string;
    content: string;
    item: string;
    trigger: string;
}, undefined, unknown, unknown, undefined>>;
export type FloatingTocVariants = VariantProps<typeof floatingTocVariants>;
