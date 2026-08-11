import { useEffect } from "react";
export declare const useIsomorphicLayoutEffect: typeof useEffect;
interface PreventScrollOptions {
    isDisabled?: boolean;
}
export declare function isScrollable(node: Element): boolean;
export declare function getScrollParent(node: Element): Element;
export declare function usePreventScroll(options?: PreventScrollOptions): void;
export declare function isInput(target: Element): boolean;
export {};
