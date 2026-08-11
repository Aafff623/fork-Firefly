import type { PromptSuggestionVariants } from "./prompt-suggestion.styles";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { Card } from "@heroui/react";
import { Button as ButtonPrimitive } from "react-aria-components/Button";
interface PromptSuggestionRootProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
    /** Visual variant. @default "pill" */
    variant?: PromptSuggestionVariants["variant"];
}
declare const PromptSuggestionRoot: ({ children, className, variant, ...props }: PromptSuggestionRootProps) => import("react/jsx-runtime").JSX.Element;
interface PromptSuggestionHeaderProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const PromptSuggestionHeader: ({ children, className, ...props }: PromptSuggestionHeaderProps) => import("react/jsx-runtime").JSX.Element;
interface PromptSuggestionTitleProps extends ComponentPropsWithRef<"h2"> {
    children: ReactNode;
}
declare const PromptSuggestionTitle: ({ children, className, ...props }: PromptSuggestionTitleProps) => import("react/jsx-runtime").JSX.Element;
interface PromptSuggestionDescriptionProps extends ComponentPropsWithRef<"p"> {
    children: ReactNode;
}
declare const PromptSuggestionDescription: ({ children, className, ...props }: PromptSuggestionDescriptionProps) => import("react/jsx-runtime").JSX.Element;
interface PromptSuggestionGroupProps extends ComponentPropsWithRef<"section"> {
    children: ReactNode;
    description?: ReactNode;
    label?: ReactNode;
}
declare const PromptSuggestionGroup: ({ children, className, description, label, ...props }: PromptSuggestionGroupProps) => import("react/jsx-runtime").JSX.Element;
interface PromptSuggestionItemsProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const PromptSuggestionItems: ({ children, className, ...props }: PromptSuggestionItemsProps) => import("react/jsx-runtime").JSX.Element;
interface PromptSuggestionItemProps extends Omit<ComponentPropsWithRef<typeof ButtonPrimitive>, "className"> {
    children: ReactNode;
    className?: string;
    /** Show the hover arrow on pill items. @default true */
    showEndIcon?: boolean;
}
declare const PromptSuggestionItem: ({ children, className, showEndIcon, ...props }: PromptSuggestionItemProps) => import("react/jsx-runtime").JSX.Element;
interface PromptSuggestionItemTitleProps extends ComponentPropsWithRef<typeof Card.Title> {
    children: ReactNode;
}
declare const PromptSuggestionItemTitle: ({ children, className, ...props }: PromptSuggestionItemTitleProps) => import("react/jsx-runtime").JSX.Element;
interface PromptSuggestionItemDescriptionProps extends ComponentPropsWithRef<typeof Card.Description> {
    children: ReactNode;
}
declare const PromptSuggestionItemDescription: ({ children, className, ...props }: PromptSuggestionItemDescriptionProps) => import("react/jsx-runtime").JSX.Element;
interface PromptSuggestionItemFooterProps extends ComponentPropsWithRef<typeof Card.Footer> {
    children: ReactNode;
}
declare const PromptSuggestionItemFooter: ({ children, className, ...props }: PromptSuggestionItemFooterProps) => import("react/jsx-runtime").JSX.Element;
interface PromptSuggestionItemTagsProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const PromptSuggestionItemTags: ({ children, className, ...props }: PromptSuggestionItemTagsProps) => import("react/jsx-runtime").JSX.Element;
interface PromptSuggestionItemMetaProps extends ComponentPropsWithRef<"span"> {
    children: ReactNode;
}
declare const PromptSuggestionItemMeta: ({ children, className, ...props }: PromptSuggestionItemMetaProps) => import("react/jsx-runtime").JSX.Element;
export { PromptSuggestionDescription, PromptSuggestionGroup, PromptSuggestionHeader, PromptSuggestionItem, PromptSuggestionItemDescription, PromptSuggestionItemFooter, PromptSuggestionItemMeta, PromptSuggestionItems, PromptSuggestionItemTags, PromptSuggestionItemTitle, PromptSuggestionRoot, PromptSuggestionTitle, };
export type { PromptSuggestionDescriptionProps, PromptSuggestionGroupProps, PromptSuggestionHeaderProps, PromptSuggestionItemDescriptionProps, PromptSuggestionItemFooterProps, PromptSuggestionItemMetaProps, PromptSuggestionItemProps, PromptSuggestionItemsProps, PromptSuggestionItemTagsProps, PromptSuggestionItemTitleProps, PromptSuggestionRootProps, PromptSuggestionRootProps as PromptSuggestionProps, PromptSuggestionTitleProps, };
