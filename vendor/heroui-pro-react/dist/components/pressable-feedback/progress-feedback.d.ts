import type { CSSProperties, ReactNode } from "react";
export type ProgressFeedbackSweep = "down" | "left" | "right" | "up";
export interface ProgressFeedbackProps {
    /** Whether to automatically reset after completing. @default true */
    autoReset?: boolean;
    children?: ReactNode;
    className?: string;
    /** Progress duration in ms before the action is confirmed. @default 2000 */
    duration?: number;
    /** Whether the progress feedback is disabled. */
    isDisabled?: boolean;
    /** Fired when the progress reaches the full duration. */
    onComplete?: () => void;
    /** Fired when the overlay resets back to idle. */
    onReset?: () => void;
    /** Duration in ms for the snap-back animation on reset. @default 300 */
    releaseDuration?: number;
    /** Delay in ms before resetting after completion. @default 1500 */
    resetDelay?: number;
    /** Additional inline styles. */
    style?: CSSProperties;
    /** Which edge the clip-path reveal sweeps toward. @default "right" */
    sweep?: ProgressFeedbackSweep;
}
export declare const ProgressFeedback: ({ autoReset, children, className, duration, isDisabled, onComplete, onReset, releaseDuration, resetDelay, style, sweep, }: ProgressFeedbackProps) => import("react/jsx-runtime").JSX.Element;
