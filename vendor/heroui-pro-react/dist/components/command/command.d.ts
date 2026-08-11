import type { CommandVariants } from "./command.styles";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { CloseButton } from "@heroui/react";
import { Dialog as DialogPrimitive } from "react-aria-components/Dialog";
import { Input as InputPrimitive } from "react-aria-components/Input";
import { MenuItem as MenuItemPrimitive, Menu as MenuPrimitive, MenuSection as MenuSectionPrimitive, Separator as SeparatorPrimitive } from "react-aria-components/Menu";
import { ModalOverlay as ModalOverlayPrimitive, Modal as ModalPrimitive } from "react-aria-components/Modal";
import { SearchField as SearchFieldPrimitive } from "react-aria-components/SearchField";
interface CommandRootProps {
    children: ReactNode;
}
declare const CommandRoot: ({ children }: CommandRootProps) => import("react/jsx-runtime").JSX.Element;
interface CommandBackdropProps extends ComponentPropsWithRef<typeof ModalOverlayPrimitive> {
    /** Whether clicking the backdrop closes the palette. @default true */
    isDismissable?: boolean;
    /** Backdrop style variant. @default "opaque" */
    variant?: CommandVariants["variant"];
}
declare const CommandBackdrop: ({ children, className, isDismissable, variant, ...props }: CommandBackdropProps) => import("react/jsx-runtime").JSX.Element;
interface CommandContainerProps extends Omit<ComponentPropsWithRef<typeof ModalPrimitive>, Exclude<keyof CommandBackdropProps, "children" | "className">> {
    size?: CommandVariants["size"];
}
declare const CommandContainer: ({ children, className, size, ...props }: CommandContainerProps) => import("react/jsx-runtime").JSX.Element;
interface CommandDialogProps extends Omit<ComponentPropsWithRef<typeof DialogPrimitive>, "children"> {
    children: ReactNode;
    /** Default input value for the search field (uncontrolled). */
    defaultInputValue?: string;
    /** Custom filter function. Defaults to case-insensitive contains. */
    filter?: (textValue: string, inputValue: string) => boolean;
    /** Controlled input value for the search field. */
    inputValue?: string;
    /** Callback when input value changes. */
    onInputChange?: (value: string) => void;
}
declare const CommandDialog: ({ children, className, defaultInputValue, filter, inputValue, onInputChange, ...props }: CommandDialogProps) => import("react/jsx-runtime").JSX.Element;
interface CommandInputGroupProps extends Omit<ComponentPropsWithRef<typeof SearchFieldPrimitive>, "children"> {
    children: ReactNode;
}
declare const CommandInputGroup: ({ autoFocus, children, className, ...props }: CommandInputGroupProps) => import("react/jsx-runtime").JSX.Element;
interface CommandInputGroupPrefixProps extends ComponentPropsWithRef<"div"> {
}
declare const CommandInputGroupPrefix: ({ children, className, ...props }: CommandInputGroupPrefixProps) => import("react/jsx-runtime").JSX.Element;
interface CommandInputGroupInputProps extends ComponentPropsWithRef<typeof InputPrimitive> {
}
declare const CommandInputGroupInput: ({ className, onKeyDownCapture: onKeyDownCaptureProp, placeholder, ...props }: CommandInputGroupInputProps) => import("react/jsx-runtime").JSX.Element;
interface CommandInputGroupSuffixProps extends ComponentPropsWithRef<"div"> {
}
declare const CommandInputGroupSuffix: ({ children, className, ...props }: CommandInputGroupSuffixProps) => import("react/jsx-runtime").JSX.Element;
interface CommandInputGroupClearButtonProps extends ComponentPropsWithRef<typeof CloseButton> {
}
declare const CommandInputGroupClearButton: ({ className, ...props }: CommandInputGroupClearButtonProps) => import("react/jsx-runtime").JSX.Element;
interface CommandHeaderProps extends ComponentPropsWithRef<"div"> {
}
declare const CommandHeader: ({ children, className, ...props }: CommandHeaderProps) => import("react/jsx-runtime").JSX.Element;
interface CommandListProps<T extends object> extends ComponentPropsWithRef<typeof MenuPrimitive<T>> {
}
declare const CommandList: <T extends object>({ children, className, renderEmptyState, ...props }: CommandListProps<T>) => import("react/jsx-runtime").JSX.Element;
interface CommandItemProps<T extends object> extends ComponentPropsWithRef<typeof MenuItemPrimitive<T>> {
}
declare const CommandItem: <T extends object>({ children, className, ...props }: CommandItemProps<T>) => import("react/jsx-runtime").JSX.Element;
interface CommandGroupProps<T extends object> extends ComponentPropsWithRef<typeof MenuSectionPrimitive<T>> {
    /** Heading label for the group. */
    heading?: ReactNode;
}
declare const CommandGroup: <T extends object>({ children, className, heading, ...props }: CommandGroupProps<T>) => import("react/jsx-runtime").JSX.Element;
interface CommandSeparatorProps extends ComponentPropsWithRef<typeof SeparatorPrimitive> {
}
declare const CommandSeparator: ({ className, ...props }: CommandSeparatorProps) => import("react/jsx-runtime").JSX.Element;
interface CommandFooterProps extends ComponentPropsWithRef<"div"> {
}
declare const CommandFooter: ({ children, className, ...props }: CommandFooterProps) => import("react/jsx-runtime").JSX.Element;
export { CommandRoot, CommandBackdrop, CommandContainer, CommandDialog, CommandHeader, CommandInputGroup, CommandInputGroupPrefix, CommandInputGroupInput, CommandInputGroupClearButton, CommandInputGroupSuffix, CommandList, CommandItem, CommandGroup, CommandSeparator, CommandFooter, };
export type { CommandRootProps, CommandBackdropProps, CommandContainerProps, CommandDialogProps, CommandHeaderProps, CommandInputGroupProps, CommandInputGroupPrefixProps, CommandInputGroupInputProps, CommandInputGroupClearButtonProps, CommandInputGroupSuffixProps, CommandListProps, CommandItemProps, CommandGroupProps, CommandSeparatorProps, CommandFooterProps, };
