import type { ComponentProps } from "react";
import { ItemCardGroupDescription, ItemCardGroupHeader, ItemCardGroupRoot, ItemCardGroupTitle } from "./item-card-group";
export declare const ItemCardGroup: (({ children, className, columns, layout, style, variant, ...props }: import("./item-card-group").ItemCardGroupRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Description: ({ children, className, ...props }: import("./item-card-group").ItemCardGroupDescriptionProps) => import("react/jsx-runtime").JSX.Element;
    Header: ({ children, className, ...props }: import("./item-card-group").ItemCardGroupHeaderProps) => import("react/jsx-runtime").JSX.Element;
    Root: ({ children, className, columns, layout, style, variant, ...props }: import("./item-card-group").ItemCardGroupRootProps) => import("react/jsx-runtime").JSX.Element;
    Title: ({ children, className, ...props }: import("./item-card-group").ItemCardGroupTitleProps) => import("react/jsx-runtime").JSX.Element;
};
export type ItemCardGroup = {
    DescriptionProps: ComponentProps<typeof ItemCardGroupDescription>;
    HeaderProps: ComponentProps<typeof ItemCardGroupHeader>;
    Props: ComponentProps<typeof ItemCardGroupRoot>;
    RootProps: ComponentProps<typeof ItemCardGroupRoot>;
    TitleProps: ComponentProps<typeof ItemCardGroupTitle>;
};
export { ItemCardGroupDescription, ItemCardGroupHeader, ItemCardGroupRoot, ItemCardGroupTitle };
export type { ItemCardGroupRootProps, ItemCardGroupRootProps as ItemCardGroupProps, ItemCardGroupDescriptionProps, ItemCardGroupHeaderProps, ItemCardGroupTitleProps, } from "./item-card-group";
export { itemCardGroupVariants } from "./item-card-group.styles";
export type { ItemCardGroupVariants } from "./item-card-group.styles";
