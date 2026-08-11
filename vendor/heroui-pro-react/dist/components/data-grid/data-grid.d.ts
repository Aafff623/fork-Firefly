import type { ReactNode } from "react";
import type { Selection, SortDescriptor, SortDirection } from "react-aria-components/Table";
import type { DragAndDropHooks } from "react-aria-components/useDragAndDrop";
import React from "react";
/** All possible sizes a column can be assigned (matches RAC ColumnSize). */
type ColumnSize = number | `${number}` | `${number}%` | `${number}fr`;
export interface DataGridColumn<T> {
    /** Unique column identifier, used as the sort key and for RAC column id. */
    id: string;
    /** Column header content — string or render function receiving sort info. */
    header: ReactNode | ((info: {
        sortDirection?: SortDirection;
    }) => ReactNode);
    /** Key on `T` to read the cell value from. Used for default rendering and sorting. */
    accessorKey?: keyof T & string;
    /** Custom cell renderer. Receives the row item and column definition. */
    cell?: (item: T, column: DataGridColumn<T>) => ReactNode;
    /** Mark this column as the row header (for accessibility). */
    isRowHeader?: boolean;
    /** Allow this column to be sorted. */
    allowsSorting?: boolean;
    /** Custom sort comparator. Falls back to locale-aware string comparison. */
    sortFn?: (a: T, b: T) => number;
    /** Allow this column to be resized. Only effective when `allowsColumnResize` is true. */
    allowsResizing?: boolean;
    /** Initial/controlled column width (px, %, or fr). */
    width?: ColumnSize;
    /** Minimum column width when resizing. */
    minWidth?: number;
    /** Maximum column width when resizing. */
    maxWidth?: number;
    /** Cell text alignment. @default "start" */
    align?: "start" | "center" | "end";
    /** Additional className appended to every <th> for this column. */
    headerClassName?: string;
    /** Additional className appended to every <td> for this column. */
    cellClassName?: string;
    /**
     * Pin this column so it stays visible during horizontal scroll.
     * Uses logical directions: `"start"` pins to the inline-start edge
     * (left in LTR, right in RTL), `"end"` pins to the inline-end edge.
     * Pinned columns must have a numeric `width` or `minWidth`.
     */
    pinned?: "start" | "end";
}
export interface DataGridReorderEvent<T> {
    /** The keys that were moved. */
    keys: Set<string | number>;
    /** The target row key and drop position. */
    target: {
        key: string | number;
        dropPosition: "before" | "after";
    };
    /** Convenience: the full reordered data array after applying the move. */
    reorderedData: T[];
}
export interface DataGridProps<T extends object> {
    /** Row data array. */
    data: T[];
    /** Column definitions. */
    columns: DataGridColumn<T>[];
    /** Extracts a unique key from each row item. */
    getRowId: (item: T) => string | number;
    /** Visual variant passed to the underlying Table. @default "primary" */
    variant?: "primary" | "secondary";
    /** Accessible label for the table. */
    "aria-label": string;
    /** Additional className for the root wrapper. */
    className?: string;
    /** Additional className for the inner `<table>` element (e.g. `min-w-[1200px]` for horizontal scroll). */
    contentClassName?: string;
    /** Additional className for the scroll container (e.g. `max-h-[400px] overflow-y-auto` for constrained scroll). */
    scrollContainerClassName?: string;
    /** Vertical alignment of cell content within each row. @default "middle" */
    verticalAlign?: "top" | "middle" | "bottom";
    /** Row selection mode. @default "none" */
    selectionMode?: "none" | "single" | "multiple";
    /** Controlled selected row keys. */
    selectedKeys?: Selection;
    /** Default selected row keys (uncontrolled). */
    defaultSelectedKeys?: Selection;
    /** Callback when selection changes. */
    onSelectionChange?: (keys: Selection) => void;
    /** Selection interaction model. @default "toggle" */
    selectionBehavior?: "toggle" | "replace";
    /** Auto-prepend a checkbox column for selection. @default false */
    showSelectionCheckboxes?: boolean;
    /** Controlled sort descriptor. When provided, sorting is controlled externally. */
    sortDescriptor?: SortDescriptor;
    /** Default sort descriptor (uncontrolled). */
    defaultSortDescriptor?: SortDescriptor;
    /** Callback when sort changes. Fires in both controlled and uncontrolled modes. */
    onSortChange?: (descriptor: SortDescriptor) => void;
    /** Enable column resizing on columns that opt in. @default false */
    allowsColumnResize?: boolean;
    /** Callback during column resize. */
    onColumnResize?: (widths: Map<string | number, ColumnSize>) => void;
    /** Callback when resize ends. */
    onColumnResizeEnd?: (widths: Map<string | number, ColumnSize>) => void;
    /**
     * Convenience callback for row reorder. When provided, enables built-in
     * drag-and-drop row reorder. The callback receives the moved keys, target info,
     * and the full reordered data array. Mutually exclusive with `dragAndDropHooks`.
     */
    onReorder?: (event: DataGridReorderEvent<T>) => void;
    /**
     * Advanced: RAC drag-and-drop hooks for custom DnD scenarios (cross-list, etc.).
     * When provided, `onReorder` is ignored and the hooks are passed directly to the Table.
     */
    dragAndDropHooks?: DragAndDropHooks;
    /** Callback when a row is actioned (e.g. double-click or Enter). */
    onRowAction?: (key: string | number) => void;
    /** Render function for the empty state when `data` is empty. */
    renderEmptyState?: () => ReactNode;
    /** Callback when the load-more sentinel scrolls into view. */
    onLoadMore?: () => void;
    /** Whether more data is currently being fetched. */
    isLoadingMore?: boolean;
    /** Content to show inside the load-more sentinel row (e.g. a Spinner). */
    loadMoreContent?: ReactNode;
    /** Keys of rows that should be disabled. */
    disabledKeys?: Iterable<string | number>;
    /**
     * Enable row virtualization for large datasets. Only visible rows are rendered
     * to the DOM. Requires `rowHeight` and `headingHeight` to be set.
     * @default false
     */
    virtualized?: boolean;
    /** Fixed row height in pixels. Required when `virtualized` is true. @default 42 */
    rowHeight?: number;
    /** Header row height in pixels. Required when `virtualized` is true. @default 36 */
    headingHeight?: number;
    /**
     * Returns the child rows for a given item. Providing this enables expandable
     * (tree) rows: the `treeColumn` cell renders a chevron toggle and the grid
     * recursively renders children via RAC's `Table.Collection`.
     */
    getChildren?: (item: T) => T[] | undefined;
    /**
     * Column id that displays the hierarchy chevron. Defaults to the first
     * `isRowHeader` column, falling back to the first column.
     */
    treeColumn?: string;
    /** Controlled set of expanded row keys. */
    expandedKeys?: Selection;
    /** Default expanded row keys (uncontrolled). */
    defaultExpandedKeys?: Selection;
    /** Callback fired when the expanded rows change. */
    onExpandedChange?: (keys: Selection) => void;
    /**
     * Pixels of inline-start padding added per nested level on the tree column
     * cell. Set to `0` to disable automatic indentation.
     * @default 20
     */
    treeIndent?: number;
}
export declare const DataGrid: <T extends object>(props: DataGridProps<T>) => React.JSX.Element;
export type { ColumnSize, Selection, SortDescriptor, SortDirection };
