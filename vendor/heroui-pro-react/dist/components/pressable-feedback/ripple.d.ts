import type { CSSProperties } from "react";
export interface RippleProps {
    className?: string;
    /** Duration in ms for the ripple grow animation. @default 150 */
    duration?: number;
    /** Easing function for the ripple animation. */
    easing?: "cubic-bezier(0.2, 0, 0, 1)";
    /** Opacity of the hover state. @default 0.08 */
    hoverOpacity?: number;
    /** Whether the ripple is disabled. */
    isDisabled?: boolean;
    /** Minimum press duration in ms. @default 225 */
    minimumPressDuration?: number;
    /** Opacity of the pressed state. @default 0.12 */
    pressedOpacity?: number;
    /** Additional inline styles. */
    style?: CSSProperties;
    /** Delay in ms before touch ripple starts. @default 150 */
    touchDelay?: number;
}
export declare const Ripple: ({ className, duration, easing, hoverOpacity, isDisabled, minimumPressDuration, pressedOpacity, style, touchDelay, }: RippleProps) => import("react/jsx-runtime").JSX.Element;
