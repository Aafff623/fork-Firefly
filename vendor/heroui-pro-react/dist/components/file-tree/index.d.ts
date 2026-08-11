import type { ComponentProps } from "react";
import { FileTreeHeader, FileTreeIndicator, FileTreeItem, FileTreeRoot, FileTreeSection } from "./file-tree";
export declare const FileTree: (<T extends object>({ children, className, reduceMotion, showGuideLines, size, ...props }: import("./file-tree").FileTreeRootProps<T>) => import("react/jsx-runtime").JSX.Element) & {
    Header: ({ children, className, ...props }: import("./file-tree").FileTreeHeaderProps) => import("react/jsx-runtime").JSX.Element;
    Indicator: ({ children, className, ...props }: import("./file-tree").FileTreeIndicatorProps) => import("react/jsx-runtime").JSX.Element;
    Item: ({ children, className, dragIcon, icon, render: renderProp, title, ...props }: import("./file-tree").FileTreeItemProps) => import("react/jsx-runtime").JSX.Element;
    Root: <T extends object>({ children, className, reduceMotion, showGuideLines, size, ...props }: import("./file-tree").FileTreeRootProps<T>) => import("react/jsx-runtime").JSX.Element;
    Section: ({ children, className, ...props }: import("./file-tree").FileTreeSectionProps) => import("react/jsx-runtime").JSX.Element;
};
export type FileTree<T extends object = object> = {
    Props: ComponentProps<typeof FileTreeRoot<T>>;
    RootProps: ComponentProps<typeof FileTreeRoot<T>>;
    ItemProps: ComponentProps<typeof FileTreeItem>;
    IndicatorProps: ComponentProps<typeof FileTreeIndicator>;
    SectionProps: ComponentProps<typeof FileTreeSection>;
    HeaderProps: ComponentProps<typeof FileTreeHeader>;
};
export { FileTreeRoot, FileTreeItem, FileTreeIndicator, FileTreeSection, FileTreeHeader };
export type { FileTreeRootProps, FileTreeRootProps as FileTreeProps, FileTreeItemProps, FileTreeItemRenderProps, FileTreeIndicatorProps, FileTreeSectionProps, FileTreeHeaderProps, } from "./file-tree";
export { fileTreeVariants } from "./file-tree.styles";
export type { FileTreeVariants } from "./file-tree.styles";
export { useFileTree } from "./use-file-tree";
export type { TreeNode, UseFileTreeOptions, UseFileTreeReturn } from "./use-file-tree";
export { useFileTreeDrag } from "./use-file-tree-drag";
export type { UseFileTreeDragOptions, TreeDataManager } from "./use-file-tree-drag";
