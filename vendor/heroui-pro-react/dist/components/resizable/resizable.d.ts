import type { ResizableVariants } from "./resizable.styles";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { GroupImperativeHandle, Layout, LayoutStorage, PanelImperativeHandle, PanelSize, PanelProps as ReactResizablePanelProps } from "react-resizable-panels";
import { resizableVariants } from "./resizable.styles";
type ResizableSize = number | string;
type ResizablePanelGroupResizeBehavior = NonNullable<ReactResizablePanelProps["groupResizeBehavior"]>;
type ResizableContextValue = {
    orientation: NonNullable<ResizableVariants["orientation"]>;
    slots: ReturnType<typeof resizableVariants>;
};
declare const ResizableContext: import("react").Context<ResizableContextValue | null>;
declare const useResizableContext: () => ResizableContextValue;
interface ResizableRootProps extends Omit<ComponentPropsWithRef<"div">, "id"> {
    /**
     * Unique id used to persist panel sizes in storage. When omitted, sizes are
     * kept in memory only.
     */
    autoSaveId?: string;
    children: ReactNode;
    /** Imperative handle for resizing panels programmatically. */
    handleRef?: React.Ref<GroupImperativeHandle>;
    /** Unique identifier for this panel group (required for nested groups). */
    id?: string;
    /** Fires every time the layout changes during resize (including on drag). */
    onLayoutChange?: (layout: Layout) => void;
    /** Layout direction. @default "horizontal" */
    orientation?: ResizableVariants["orientation"];
    /**
     * Custom storage implementation. Defaults to `localStorage` in the browser.
     * Pass a custom `LayoutStorage` for SSR-safe persistence (e.g. cookies).
     * Only used when `autoSaveId` is provided.
     */
    storage?: LayoutStorage;
}
declare const ResizableRoot: ({ autoSaveId, children, className, handleRef, id, onLayoutChange, orientation, storage, style, ...props }: ResizableRootProps) => import("react/jsx-runtime").JSX.Element;
interface ResizablePanelProps {
    children?: ReactNode;
    className?: string;
    /** When collapsible and the panel is dragged smaller than the collapse threshold, this size is applied. */
    collapsedSize?: ResizableSize;
    /** Whether the panel can collapse to `collapsedSize`. Requires `id` when used with a parent `autoSaveId`. */
    collapsible?: boolean;
    /**
     * Initial size. Numbers are treated as percentages (0–100).
     * Strings accept any CSS unit: `"200px"`, `"30%"`, `"10rem"`.
     */
    defaultSize?: ResizableSize;
    /**
     * How this panel behaves when the parent group is resized.
     * @default "preserve-relative-size"
     */
    groupResizeBehavior?: ResizablePanelGroupResizeBehavior;
    /** Imperative handle for programmatic collapse/expand/resize. */
    handleRef?: React.Ref<PanelImperativeHandle>;
    /** Unique id. Required when `collapsible` + `autoSaveId` is set on the parent. */
    id?: string;
    /**
     * Max size. Numbers are treated as percentages (0–100).
     * Strings accept any CSS unit.
     */
    maxSize?: ResizableSize;
    /**
     * Min size. Numbers are treated as percentages (0–100).
     * Strings accept any CSS unit.
     */
    minSize?: ResizableSize;
    /** Fires when the panel collapses. */
    onCollapse?: () => void;
    /** Fires when the panel expands from a collapsed state. */
    onExpand?: () => void;
    /** Fires every time the panel size changes. */
    onResize?: (panelSize: PanelSize, id: string | number | undefined, prevPanelSize: PanelSize | undefined) => void;
    style?: React.CSSProperties;
}
declare const ResizablePanel: ({ children, className, collapsedSize, collapsible, defaultSize, groupResizeBehavior, handleRef, id, maxSize, minSize, onCollapse, onExpand, onResize, style, }: ResizablePanelProps) => import("react/jsx-runtime").JSX.Element;
interface ResizableHandleProps {
    "aria-label"?: string;
    children?: ReactNode;
    className?: string;
    /** Whether the handle is disabled. */
    disabled?: boolean;
    /** Unique identifier for the handle (useful for nested/dynamic groups). */
    id?: string;
    /** Handle affordance. @default "line" */
    type?: ResizableVariants["type"];
    /** Emphasis level (maps to separator tokens). @default "primary" */
    variant?: ResizableVariants["variant"];
    /** Sugar: render a default indicator inside the handle. Auto-enabled when `type` is `"drag"` or `"pill"`. */
    withIndicator?: boolean;
}
declare const ResizableHandle: ({ "aria-label": ariaLabel, children, className, disabled, id, type, variant, withIndicator, }: ResizableHandleProps) => import("react/jsx-runtime").JSX.Element;
interface ResizableIndicatorProps {
    children?: ReactNode;
    className?: string;
    /** Affordance style. @default "pill" */
    type?: "drag" | "pill";
}
declare const ResizableIndicator: ({ children, className, type }: ResizableIndicatorProps) => import("react/jsx-runtime").JSX.Element;
export { ResizableContext, ResizableHandle, ResizableIndicator, ResizablePanel, ResizableRoot, useResizableContext, };
export type { ResizableContextValue, ResizableHandleProps, ResizableIndicatorProps, ResizablePanelGroupResizeBehavior, ResizablePanelProps, ResizableRootProps, ResizableSize, };
