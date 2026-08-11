import type { VariantProps } from "tailwind-variants";
export declare const contextMenuVariants: import("tailwind-variants").TVReturnType<{
    [key: string]: {
        [key: string]: import("tailwind-merge").ClassNameValue | {
            menu?: import("tailwind-merge").ClassNameValue;
            separator?: import("tailwind-merge").ClassNameValue;
            popover?: import("tailwind-merge").ClassNameValue;
            trigger?: import("tailwind-merge").ClassNameValue;
        };
    };
} | {
    [x: string]: {
        [x: string]: import("tailwind-merge").ClassNameValue | {
            menu?: import("tailwind-merge").ClassNameValue;
            separator?: import("tailwind-merge").ClassNameValue;
            popover?: import("tailwind-merge").ClassNameValue;
            trigger?: import("tailwind-merge").ClassNameValue;
        };
    };
} | {}, {
    menu: string;
    popover: string;
    separator: string;
    trigger: string;
}, undefined, {
    [key: string]: {
        [key: string]: import("tailwind-merge").ClassNameValue | {
            menu?: import("tailwind-merge").ClassNameValue;
            separator?: import("tailwind-merge").ClassNameValue;
            popover?: import("tailwind-merge").ClassNameValue;
            trigger?: import("tailwind-merge").ClassNameValue;
        };
    };
} | {}, {
    menu: string;
    popover: string;
    separator: string;
    trigger: string;
}, import("tailwind-variants").TVReturnType<unknown, {
    menu: string;
    popover: string;
    separator: string;
    trigger: string;
}, undefined, unknown, unknown, undefined>>;
export type ContextMenuVariants = VariantProps<typeof contextMenuVariants>;
