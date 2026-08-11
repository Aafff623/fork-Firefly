import type { FileTreeVariants } from "./file-tree.styles";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { TreeHeader as TreeHeaderPrimitive, TreeItem as TreeItemPrimitive, Tree as TreePrimitive, TreeSection as TreeSectionPrimitive } from "react-aria-components/Tree";
import { ChevronRight } from "../icons";
interface FileTreeRootProps<T extends object> extends ComponentPropsWithRef<typeof TreePrimitive<T>> {
    /** Whether to show indent guide lines. `true` = always, `false` = never, `"hover"` = on tree hover only. @default true */
    showGuideLines?: boolean | "hover";
    /** Whether to disable expand/collapse animations. Also respects the user's reduced-motion preference. @default false */
    reduceMotion?: boolean;
    /** Size variant. @default "md" */
    size?: FileTreeVariants["size"];
}
declare const FileTreeRoot: <T extends object>({ children, className, reduceMotion, showGuideLines, size, ...props }: FileTreeRootProps<T>) => import("react/jsx-runtime").JSX.Element;
interface FileTreeIndicatorProps extends ComponentPropsWithRef<typeof ChevronRight> {
    className?: string;
}
declare const FileTreeIndicator: ({ children, className, ...props }: FileTreeIndicatorProps) => import("react/jsx-runtime").JSX.Element;
interface FileTreeItemRenderProps {
    isExpanded: boolean;
    hasChildItems: boolean;
    allowsDragging: boolean;
}
interface FileTreeItemProps extends Partial<ComponentPropsWithRef<typeof TreeItemPrimitive>> {
    /** Icon rendered before the label. Accepts a ReactNode or a function receiving `{ isExpanded, hasChildItems, allowsDragging }`. */
    icon?: ReactNode | ((props: FileTreeItemRenderProps) => ReactNode);
    /** Drag handle icon shown when dragging is allowed. Pass `false` to hide, or a ReactNode to replace the default grip icon. @default <GripVertical /> */
    dragIcon?: ReactNode | false;
    /** Label content rendered as the item text. */
    title: ReactNode;
}
declare const FileTreeItem: ({ children, className, dragIcon, icon, render: renderProp, title, ...props }: FileTreeItemProps) => import("react/jsx-runtime").JSX.Element;
interface FileTreeSectionProps extends ComponentPropsWithRef<typeof TreeSectionPrimitive> {
}
declare const FileTreeSection: ({ children, className, ...props }: FileTreeSectionProps) => import("react/jsx-runtime").JSX.Element;
interface FileTreeHeaderProps extends ComponentPropsWithRef<typeof TreeHeaderPrimitive> {
}
declare const FileTreeHeader: ({ children, className, ...props }: FileTreeHeaderProps) => import("react/jsx-runtime").JSX.Element;
export { FileTreeRoot, FileTreeItem, FileTreeIndicator, FileTreeSection, FileTreeHeader };
export type { FileTreeRootProps, FileTreeItemProps, FileTreeItemRenderProps, FileTreeIndicatorProps, FileTreeSectionProps, FileTreeHeaderProps, };
