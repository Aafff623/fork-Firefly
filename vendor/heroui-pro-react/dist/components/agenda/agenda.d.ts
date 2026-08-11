import type { agendaVariants } from "./agenda.styles";
import type { AgendaEvent as AgendaEventData, AgendaView, AllDayLayoutItem, DragState, DropPreview, MonthRowLayout } from "./use-agenda";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { CalendarDate, CalendarDateTime } from "@internationalized/date";
import React from "react";
interface AgendaRootProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
    view: AgendaView;
    date: CalendarDate;
    selectedEventId: string | null;
    events: AgendaEventData[];
    startHour: number;
    endHour: number;
    slotDuration: number;
    goToNext: () => void;
    goToPrevious: () => void;
    goToToday: () => void;
    setView: (view: AgendaView) => void;
    setDate: (date: CalendarDate) => void;
    selectEvent: (id: string | null) => void;
    visibleDays: CalendarDate[];
    visibleWeeks: CalendarDate[][];
    allDayEvents: AgendaEventData[];
    allDayLayout: AllDayLayoutItem[];
    allDayCountPerDay: number[];
    isAllDayExpanded: boolean;
    toggleAllDayExpanded: () => void;
    getEventLayout: (eventId: string) => {
        columnIndex: number;
        totalColumns: number;
    };
    getEventsForDay: (date: CalendarDate) => AgendaEventData[];
    getMonthRowLayout: (week: CalendarDate[]) => MonthRowLayout;
    getPerCellEvents: (day: CalendarDate, week: CalendarDate[]) => AgendaEventData[];
    getAllEventsForDay: (date: CalendarDate) => AgendaEventData[];
    heading: string;
    slots: ReturnType<typeof agendaVariants>;
    onEventCreate?: (event: {
        start: CalendarDateTime;
        end: CalendarDateTime;
    }) => void;
    onEventDelete?: (id: string) => void;
    onEventMove?: (id: string, start: CalendarDateTime, end: CalendarDateTime) => void;
    onEventResize?: (id: string, start: CalendarDateTime, end: CalendarDateTime) => void;
    dragState: DragState;
    setDragState: React.Dispatch<React.SetStateAction<DragState>>;
    dropPreview: DropPreview | null;
    setDropPreview: React.Dispatch<React.SetStateAction<DropPreview | null>>;
    timeZone: string;
    locale: string;
}
declare const AgendaRoot: ({ children, className, ref, ...props }: AgendaRootProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaHeaderProps extends ComponentPropsWithRef<"header"> {
    children?: ReactNode;
}
declare const AgendaHeader: ({ children, className, ...props }: AgendaHeaderProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaHeadingProps extends ComponentPropsWithRef<"h2"> {
}
declare const AgendaHeading: ({ className, ...props }: AgendaHeadingProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaNavigationProps extends ComponentPropsWithRef<"div"> {
    children?: ReactNode;
}
declare const AgendaNavigation: ({ children, className, ...props }: AgendaNavigationProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaNavButtonProps {
    slot?: "previous" | "next";
    children?: ReactNode;
    className?: string;
}
declare const AgendaNavButton: ({ children, className, slot }: AgendaNavButtonProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaTodayButtonProps {
    children?: ReactNode;
    className?: string;
}
declare const AgendaTodayButton: ({ children, className }: AgendaTodayButtonProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaViewSelectorProps {
    children?: ReactNode;
    className?: string;
    size?: "sm" | "md" | "lg";
}
declare const AgendaViewSelector: ({ children, className, size }: AgendaViewSelectorProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaBodyProps extends ComponentPropsWithRef<"div"> {
    children?: ReactNode;
}
declare const AgendaBody: ({ children, className, ...props }: AgendaBodyProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaWeekHeaderProps extends ComponentPropsWithRef<"div"> {
    children?: ReactNode;
}
declare const AgendaWeekHeader: ({ children, className, ...props }: AgendaWeekHeaderProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaDayHeaderProps extends ComponentPropsWithRef<"div"> {
    date: CalendarDate;
}
declare const AgendaDayHeader: ({ className, date: dayDate, ...props }: AgendaDayHeaderProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaAllDaySectionProps extends ComponentPropsWithRef<"div"> {
    children?: ReactNode;
    collapsedLabel?: (count: number) => string;
}
declare const AgendaAllDaySection: ({ children, className, collapsedLabel, style, ...props }: AgendaAllDaySectionProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaAllDayLabelProps extends ComponentPropsWithRef<"span"> {
    children?: ReactNode;
}
declare const AgendaAllDayLabel: ({ children, className, ...props }: AgendaAllDayLabelProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaAllDayEventProps extends ComponentPropsWithRef<"div"> {
    event: AgendaEventData;
    colStart: number;
    colSpan: number;
    row: number;
}
declare const AgendaAllDayEvent: ({ children, className, colSpan, colStart, event, row, style, ...props }: AgendaAllDayEventProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaTimeGridProps extends ComponentPropsWithRef<"div"> {
    children?: ReactNode;
}
declare const AgendaTimeGrid: ({ children, className, ...props }: AgendaTimeGridProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaDayColumnProps extends ComponentPropsWithRef<"div"> {
    date: CalendarDate;
    children?: ReactNode;
}
declare const AgendaDayColumn: ({ children, className, date: dayDate, ...props }: AgendaDayColumnProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaEventProps {
    event: AgendaEventData;
    children?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
}
declare const AgendaEvent: ({ children, className, event, style }: AgendaEventProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaEventTitleProps extends ComponentPropsWithRef<"span"> {
    children?: ReactNode;
}
declare const AgendaEventTitle: ({ children, className, ...props }: AgendaEventTitleProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaEventTimeProps extends ComponentPropsWithRef<"span"> {
    event?: AgendaEventData;
}
declare const AgendaEventTime: ({ className, event, ...props }: AgendaEventTimeProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaCurrentTimeIndicatorProps extends ComponentPropsWithRef<"div"> {
}
declare const AgendaCurrentTimeIndicator: ({ className, ...props }: AgendaCurrentTimeIndicatorProps) => import("react/jsx-runtime").JSX.Element | null;
interface AgendaMonthGridProps extends ComponentPropsWithRef<"div"> {
    children?: ReactNode;
}
declare const AgendaMonthGrid: ({ children, className, ...props }: AgendaMonthGridProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaMonthRowProps extends ComponentPropsWithRef<"div"> {
    children?: ReactNode;
    spanningRowCount?: number;
}
declare const AgendaMonthRow: ({ children, className, spanningRowCount: _spanningRowCount, style, ...props }: AgendaMonthRowProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaMonthSpanningEventProps extends ComponentPropsWithRef<"div"> {
    event: AgendaEventData;
    colStart: number;
    colSpan: number;
    row: number;
}
declare const AgendaMonthSpanningEvent: ({ children, className, colSpan, colStart, event, row, style, ...props }: AgendaMonthSpanningEventProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaMonthCellProps extends ComponentPropsWithRef<"div"> {
    date: CalendarDate;
    children?: ReactNode;
    maxEvents?: number;
    moreLabel?: (count: number) => string;
    spanningRowCount?: number;
}
declare const AgendaMonthCell: ({ children, className, date: cellDate, maxEvents, moreLabel, spanningRowCount, style: styleProp, ...props }: AgendaMonthCellProps) => import("react/jsx-runtime").JSX.Element;
interface AgendaMonthEventProps {
    event: AgendaEventData;
    children?: ReactNode;
    className?: string;
}
declare const AgendaMonthEvent: ({ children, className, event }: AgendaMonthEventProps) => import("react/jsx-runtime").JSX.Element;
export { AgendaRoot, AgendaHeader, AgendaHeading, AgendaNavigation, AgendaNavButton, AgendaTodayButton, AgendaViewSelector, AgendaBody, AgendaWeekHeader, AgendaDayHeader, AgendaAllDaySection, AgendaAllDayLabel, AgendaAllDayEvent, AgendaTimeGrid, AgendaDayColumn, AgendaEvent, AgendaEventTitle, AgendaEventTime, AgendaCurrentTimeIndicator, AgendaMonthGrid, AgendaMonthRow, AgendaMonthSpanningEvent, AgendaMonthCell, AgendaMonthEvent, };
export type { AgendaRootProps, AgendaHeaderProps, AgendaHeadingProps, AgendaNavigationProps, AgendaNavButtonProps, AgendaTodayButtonProps, AgendaViewSelectorProps, AgendaBodyProps, AgendaWeekHeaderProps, AgendaDayHeaderProps, AgendaAllDaySectionProps, AgendaAllDayLabelProps, AgendaAllDayEventProps, AgendaTimeGridProps, AgendaDayColumnProps, AgendaEventProps, AgendaEventTitleProps, AgendaEventTimeProps, AgendaCurrentTimeIndicatorProps, AgendaMonthGridProps, AgendaMonthRowProps, AgendaMonthSpanningEventProps, AgendaMonthCellProps, AgendaMonthEventProps, };
