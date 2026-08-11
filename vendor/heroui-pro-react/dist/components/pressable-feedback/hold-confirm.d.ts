import type { CSSProperties, ReactNode } from "react";
export type HoldConfirmSweep = "down" | "left" | "right" | "up";
export interface HoldConfirmProps {
    children?: ReactNode;
    className?: string;
    /** Hold duration in ms before the action is confirmed. @default 2000 */
    duration?: number;
    /** Whether the hold confirm is disabled. */
    isDisabled?: boolean;
    /** Fired when the hold reaches the full duration. */
    onComplete?: () => void;
    /** Duration in ms for the snap-back animation on release. @default 200 */
    releaseDuration?: number;
    /** Whether to reset the overlay after the hold completes. @default true */
    resetOnComplete?: boolean;
    /** Which edge the clip-path reveal sweeps toward. @default "right" */
    sweep?: HoldConfirmSweep;
    /** Additional inline styles. */
    style?: CSSProperties;
}
export declare const HoldConfirm: ({ children, className, duration, isDisabled, onComplete, releaseDuration, resetOnComplete, style, sweep, }: HoldConfirmProps) => import("react/jsx-runtime").JSX.Element;
