import type { TimelineVariants } from "./timeline.styles";
import type { ComponentPropsWithRef, ReactNode } from "react";
type TimelineAxis = NonNullable<TimelineVariants["axis"]>;
type TimelineItemAlign = NonNullable<TimelineVariants["itemAlign"]>;
type TimelineSide = "end" | "start";
type TimelinePlacement = TimelineSide | "alternate";
type TimelineStatus = "current" | "danger" | "default" | "muted" | "success" | "warning";
type TimelineItemContextValue = {
    align: TimelineItemAlign;
    index: number;
    isLast: boolean;
    side: TimelineSide;
    status: TimelineStatus;
};
declare const useTimelineItem: () => TimelineItemContextValue;
interface TimelineRootProps extends Omit<ComponentPropsWithRef<"ol">, "children"> {
    /** Position of the timeline axis. @default "start" */
    axis?: TimelineVariants["axis"];
    children: ReactNode;
    /** Vertical rhythm between events. @default "comfortable" */
    density?: TimelineVariants["density"];
    /** Default vertical alignment for item content. @default "start" */
    itemAlign?: TimelineVariants["itemAlign"];
    /** Default content side for items. `alternate` alternates start/end by index. @default "end" */
    placement?: TimelinePlacement;
    /** Size variant. @default "md" */
    size?: TimelineVariants["size"];
}
type TimelineItemInternalProps = {
    _index: number;
    _isLast: boolean;
    _side: TimelineSide;
};
declare const TimelineRoot: ({ axis, children, className, density, itemAlign, placement, size, ...props }: TimelineRootProps) => import("react/jsx-runtime").JSX.Element;
interface TimelineItemProps extends Omit<ComponentPropsWithRef<"li">, "align" | "children"> {
    /** Vertical alignment for this item's content. @default inherited */
    align?: TimelineItemAlign;
    children?: ReactNode;
    /** Content side when the root axis is centered. */
    side?: TimelineSide;
    /** Marker tone for this item. @default "default" */
    status?: TimelineStatus;
}
declare const TimelineItem: ({ _index: injectedIndex, _isLast: injectedIsLast, _side: injectedSide, align: alignProp, children, className, side: sideProp, status, ...props }: TimelineItemProps & Partial<TimelineItemInternalProps>) => import("react/jsx-runtime").JSX.Element;
interface TimelineRailProps extends ComponentPropsWithRef<"span"> {
    children?: ReactNode;
}
declare const TimelineRail: ({ children, className, ...props }: TimelineRailProps) => import("react/jsx-runtime").JSX.Element;
interface TimelineMarkerProps extends ComponentPropsWithRef<"span"> {
    children?: ReactNode;
    /** Override the marker tone for this item. */
    status?: TimelineStatus;
}
declare const TimelineMarker: ({ children, className, status: statusProp, ...props }: TimelineMarkerProps) => import("react/jsx-runtime").JSX.Element;
interface TimelineConnectorProps extends ComponentPropsWithRef<"span"> {
    /** Force rendering even for the final item. */
    force?: boolean;
}
declare const TimelineConnector: ({ className, force, ...props }: TimelineConnectorProps) => import("react/jsx-runtime").JSX.Element | null;
interface TimelineContentProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
    /** Place content on the start or end side of a centered timeline. */
    side?: TimelineSide;
}
declare const TimelineContent: ({ children, className, side: sideProp, ...props }: TimelineContentProps) => import("react/jsx-runtime").JSX.Element;
export { TimelineRoot, TimelineItem, TimelineRail, TimelineMarker, TimelineConnector, TimelineContent, useTimelineItem, };
export type { TimelineRootProps, TimelineItemProps, TimelineRailProps, TimelineMarkerProps, TimelineConnectorProps, TimelineContentProps, TimelineAxis, TimelineItemAlign, TimelineSide, TimelinePlacement, TimelineStatus, };
