export type Dict<T = any> = Record<string, T>;
export declare function isArray<T>(value: any): value is Array<T>;
export declare function isEmptyArray(value: any): boolean;
export declare function isObject(value: any): value is Dict;
export declare function isEmptyObject(value: any): boolean;
export declare function isEmpty(value: any): boolean;
export type Booleanish = boolean | "true" | "false";
export declare const dataAttr: (condition: boolean | undefined) => Booleanish;
export declare const isNumeric: (value?: string | number) => boolean;
