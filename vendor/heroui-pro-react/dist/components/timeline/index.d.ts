import type { ComponentProps } from "react";
import { TimelineConnector, TimelineContent, TimelineItem, TimelineMarker, TimelineRail, TimelineRoot, useTimelineItem } from "./timeline";
export declare const Timeline: (({ axis, children, className, density, itemAlign, placement, size, ...props }: import("./timeline").TimelineRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Connector: ({ className, force, ...props }: import("./timeline").TimelineConnectorProps) => import("react/jsx-runtime").JSX.Element | null;
    Content: ({ children, className, side: sideProp, ...props }: import("./timeline").TimelineContentProps) => import("react/jsx-runtime").JSX.Element;
    Item: ({ _index: injectedIndex, _isLast: injectedIsLast, _side: injectedSide, align: alignProp, children, className, side: sideProp, status, ...props }: import("./timeline").TimelineItemProps & Partial<{
        _index: number;
        _isLast: boolean;
        _side: import("./timeline").TimelineSide;
    }>) => import("react/jsx-runtime").JSX.Element;
    Marker: ({ children, className, status: statusProp, ...props }: import("./timeline").TimelineMarkerProps) => import("react/jsx-runtime").JSX.Element;
    Rail: ({ children, className, ...props }: import("./timeline").TimelineRailProps) => import("react/jsx-runtime").JSX.Element;
    Root: ({ axis, children, className, density, itemAlign, placement, size, ...props }: import("./timeline").TimelineRootProps) => import("react/jsx-runtime").JSX.Element;
    useItem: () => {
        align: import("./timeline").TimelineItemAlign;
        index: number;
        isLast: boolean;
        side: import("./timeline").TimelineSide;
        status: import("./timeline").TimelineStatus;
    };
};
export type Timeline = {
    ConnectorProps: ComponentProps<typeof TimelineConnector>;
    ContentProps: ComponentProps<typeof TimelineContent>;
    ItemProps: ComponentProps<typeof TimelineItem>;
    MarkerProps: ComponentProps<typeof TimelineMarker>;
    Props: ComponentProps<typeof TimelineRoot>;
    RailProps: ComponentProps<typeof TimelineRail>;
    RootProps: ComponentProps<typeof TimelineRoot>;
    useItem: typeof useTimelineItem;
};
export { TimelineRoot, TimelineItem, TimelineRail, TimelineMarker, TimelineConnector, TimelineContent, useTimelineItem, };
export type { TimelineRootProps, TimelineRootProps as TimelineProps, TimelineItemProps, TimelineRailProps, TimelineMarkerProps, TimelineConnectorProps, TimelineContentProps, TimelineAxis, TimelineItemAlign, TimelineSide, TimelinePlacement, TimelineStatus, } from "./timeline";
export { timelineVariants } from "./timeline.styles";
export type { TimelineVariants } from "./timeline.styles";
