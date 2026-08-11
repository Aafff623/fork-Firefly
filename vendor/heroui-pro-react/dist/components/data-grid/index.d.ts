import type { ComponentProps } from "react";
import { DataGrid } from "./data-grid";
export type DataGrid = {
    Props: ComponentProps<typeof DataGrid>;
};
export { DataGrid };
export type { DataGridProps, DataGridColumn, DataGridReorderEvent, Selection as DataGridSelection, SortDescriptor as DataGridSortDescriptor, SortDirection as DataGridSortDirection, ColumnSize as DataGridColumnSize, } from "./data-grid";
export { dataGridVariants } from "./data-grid.styles";
export type { DataGridVariants } from "./data-grid.styles";
