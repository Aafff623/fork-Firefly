import type { EmptyStateVariants } from "./empty-state.styles";
import type { DOMRenderProps } from "@heroui/react";
import type { ComponentPropsWithRef, ReactNode } from "react";
interface EmptyStateRootProps<E extends keyof React.JSX.IntrinsicElements = "div"> extends DOMRenderProps<E, undefined> {
    children: ReactNode;
    className?: string;
    /** Size variant. @default "md" */
    size?: EmptyStateVariants["size"];
}
declare const EmptyStateRoot: <E extends keyof React.JSX.IntrinsicElements = "div">({ children, className, size, ...props }: EmptyStateRootProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof EmptyStateRootProps<E>>) => import("react/jsx-runtime").JSX.Element;
interface EmptyStateHeaderProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const EmptyStateHeader: ({ children, className, ...props }: EmptyStateHeaderProps) => import("react/jsx-runtime").JSX.Element;
interface EmptyStateMediaProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
    /** Media display variant. "icon" adds a circular muted background. @default "default" */
    variant?: "default" | "icon";
}
declare const EmptyStateMedia: ({ children, className, variant, ...props }: EmptyStateMediaProps) => import("react/jsx-runtime").JSX.Element;
interface EmptyStateTitleProps extends ComponentPropsWithRef<"h3"> {
    children: ReactNode;
}
declare const EmptyStateTitle: ({ children, className, ...props }: EmptyStateTitleProps) => import("react/jsx-runtime").JSX.Element;
interface EmptyStateDescriptionProps extends ComponentPropsWithRef<"p"> {
    children: ReactNode;
}
declare const EmptyStateDescription: ({ children, className, ...props }: EmptyStateDescriptionProps) => import("react/jsx-runtime").JSX.Element;
interface EmptyStateContentProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const EmptyStateContent: ({ children, className, ...props }: EmptyStateContentProps) => import("react/jsx-runtime").JSX.Element;
export { EmptyStateContent, EmptyStateDescription, EmptyStateHeader, EmptyStateMedia, EmptyStateRoot, EmptyStateTitle, };
export type { EmptyStateContentProps, EmptyStateDescriptionProps, EmptyStateHeaderProps, EmptyStateMediaProps, EmptyStateRootProps, EmptyStateTitleProps, };
