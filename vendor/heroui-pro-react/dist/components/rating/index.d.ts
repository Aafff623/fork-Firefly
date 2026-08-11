import type { ComponentProps } from "react";
import { RatingItem, RatingRoot } from "./rating";
export declare const Rating: (({ children, className, defaultValue, icon, isReadOnly, onValueChange, size, value, ...props }: import("./rating").RatingRootProps) => import("react/jsx-runtime").JSX.Element) & {
    Item: ({ children, className, value, ...props }: import("./rating").RatingItemProps) => import("react/jsx-runtime").JSX.Element;
    Root: ({ children, className, defaultValue, icon, isReadOnly, onValueChange, size, value, ...props }: import("./rating").RatingRootProps) => import("react/jsx-runtime").JSX.Element;
};
export type Rating = {
    Props: ComponentProps<typeof RatingRoot>;
    RootProps: ComponentProps<typeof RatingRoot>;
    ItemProps: ComponentProps<typeof RatingItem>;
};
export { RatingRoot, RatingItem, RatingStarIcon } from "./rating";
export type { RatingRootProps, RatingRootProps as RatingProps, RatingItemProps, RatingItemRenderProps, } from "./rating";
export { ratingVariants } from "./rating.styles";
export type { RatingVariants } from "./rating.styles";
