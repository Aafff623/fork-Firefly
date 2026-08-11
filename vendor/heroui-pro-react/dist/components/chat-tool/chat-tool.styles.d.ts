import type { VariantProps } from "tailwind-variants";
export declare const chatToolVariants: import("tailwind-variants").TVReturnType<{
    state: {
        complete: string;
        error: string;
        requiresAction: string;
        running: string;
        streaming: string;
    };
}, {
    approval: string;
    approvalActions: string;
    args: string;
    argsLabel: string;
    base: string;
    content: string;
    contentBody: string;
    error: string;
    errorLabel: string;
    meta: string;
    result: string;
    resultLabel: string;
    status: string;
    trigger: string;
    triggerLabel: string;
}, undefined, {
    state: {
        complete: string;
        error: string;
        requiresAction: string;
        running: string;
        streaming: string;
    };
}, {
    approval: string;
    approvalActions: string;
    args: string;
    argsLabel: string;
    base: string;
    content: string;
    contentBody: string;
    error: string;
    errorLabel: string;
    meta: string;
    result: string;
    resultLabel: string;
    status: string;
    trigger: string;
    triggerLabel: string;
}, import("tailwind-variants").TVReturnType<{
    state: {
        complete: string;
        error: string;
        requiresAction: string;
        running: string;
        streaming: string;
    };
}, {
    approval: string;
    approvalActions: string;
    args: string;
    argsLabel: string;
    base: string;
    content: string;
    contentBody: string;
    error: string;
    errorLabel: string;
    meta: string;
    result: string;
    resultLabel: string;
    status: string;
    trigger: string;
    triggerLabel: string;
}, undefined, unknown, unknown, undefined>>;
export type ChatToolVariants = VariantProps<typeof chatToolVariants>;
export declare const chatToolGroupVariants: import("tailwind-variants").TVReturnType<{
    [key: string]: {
        [key: string]: import("tailwind-merge").ClassNameValue | {
            base?: import("tailwind-merge").ClassNameValue;
            content?: import("tailwind-merge").ClassNameValue;
            trigger?: import("tailwind-merge").ClassNameValue;
            contentBody?: import("tailwind-merge").ClassNameValue;
            triggerLabel?: import("tailwind-merge").ClassNameValue;
        };
    };
} | {
    [x: string]: {
        [x: string]: import("tailwind-merge").ClassNameValue | {
            base?: import("tailwind-merge").ClassNameValue;
            content?: import("tailwind-merge").ClassNameValue;
            trigger?: import("tailwind-merge").ClassNameValue;
            contentBody?: import("tailwind-merge").ClassNameValue;
            triggerLabel?: import("tailwind-merge").ClassNameValue;
        };
    };
} | {}, {
    base: string;
    content: string;
    contentBody: string;
    trigger: string;
    triggerLabel: string;
}, undefined, {
    [key: string]: {
        [key: string]: import("tailwind-merge").ClassNameValue | {
            base?: import("tailwind-merge").ClassNameValue;
            content?: import("tailwind-merge").ClassNameValue;
            trigger?: import("tailwind-merge").ClassNameValue;
            contentBody?: import("tailwind-merge").ClassNameValue;
            triggerLabel?: import("tailwind-merge").ClassNameValue;
        };
    };
} | {}, {
    base: string;
    content: string;
    contentBody: string;
    trigger: string;
    triggerLabel: string;
}, import("tailwind-variants").TVReturnType<unknown, {
    base: string;
    content: string;
    contentBody: string;
    trigger: string;
    triggerLabel: string;
}, undefined, unknown, unknown, undefined>>;
export type ChatToolGroupVariants = typeof chatToolGroupVariants;
