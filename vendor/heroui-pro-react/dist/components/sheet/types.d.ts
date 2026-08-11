export type SheetPlacement = "top" | "bottom" | "left" | "right";
export interface SnapPoint {
    fraction: number;
    height: number;
}
export type AnyFunction = (...args: any) => any;
