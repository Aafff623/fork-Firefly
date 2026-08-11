declare function composeTwRenderProps<T>(className: string | ((v: T) => string) | undefined, tailwind?: string | ((v: T) => string | undefined)): string | ((v: T) => string);
declare function composeSlotClassName(slotFn: ((args?: {
    className?: string;
    [key: string]: any;
}) => string) | undefined, className?: string, variants?: Record<string, any>): string | undefined;
export { composeTwRenderProps, composeSlotClassName };
