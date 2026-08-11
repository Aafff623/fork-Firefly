import type { ComponentProps } from "react";
import { SheetBackdrop, SheetBody, SheetClose, SheetCloseTrigger, SheetContent, SheetDialog, SheetFooter, SheetHandle, SheetHeader, SheetHeading, SheetNestedRoot, SheetRoot, SheetTrigger } from "./sheet";
export declare const Sheet: typeof SheetRoot & {
    Backdrop: ({ children, className, ref, variant, ...rest }: import("./sheet").SheetBackdropProps) => import("react/jsx-runtime").JSX.Element;
    Body: ({ children, className, ...props }: import("./sheet").SheetBodyProps) => import("react/jsx-runtime").JSX.Element;
    Close: ({ children }: import("./sheet").SheetCloseProps) => import("react").ReactElement<{
        onPress?: () => void;
    }, string | import("react").JSXElementConstructor<any>>;
    CloseTrigger: ({ children, className, ...props }: import("./sheet").SheetCloseTriggerProps) => import("react/jsx-runtime").JSX.Element;
    Content: ({ children, className, ref, style, ...rest }: import("./sheet").SheetContentProps) => import("react/jsx-runtime").JSX.Element;
    Dialog: ({ children, className, ...props }: import("./sheet").SheetDialogProps) => import("react/jsx-runtime").JSX.Element;
    Footer: ({ children, className, ...props }: import("./sheet").SheetFooterProps) => import("react/jsx-runtime").JSX.Element;
    Handle: ({ children, className, preventCycle, ...rest }: import("./sheet").SheetHandleProps) => import("react/jsx-runtime").JSX.Element;
    NestedRoot: typeof SheetNestedRoot;
    Header: ({ children, className, ...props }: import("./sheet").SheetHeaderProps) => import("react/jsx-runtime").JSX.Element;
    Root: typeof SheetRoot;
    Heading: ({ children, className, ...props }: import("./sheet").SheetHeadingProps) => import("react/jsx-runtime").JSX.Element;
    Trigger: ({ children }: import("./sheet").SheetTriggerProps) => import("react").ReactElement<{
        onPress?: () => void;
    }, string | import("react").JSXElementConstructor<any>>;
};
export type Sheet = {
    Props: ComponentProps<typeof SheetRoot>;
    RootProps: ComponentProps<typeof SheetRoot>;
    NestedRootProps: ComponentProps<typeof SheetNestedRoot>;
    TriggerProps: ComponentProps<typeof SheetTrigger>;
    CloseProps: ComponentProps<typeof SheetClose>;
    BackdropProps: ComponentProps<typeof SheetBackdrop>;
    ContentProps: ComponentProps<typeof SheetContent>;
    DialogProps: ComponentProps<typeof SheetDialog>;
    HeaderProps: ComponentProps<typeof SheetHeader>;
    HeadingProps: ComponentProps<typeof SheetHeading>;
    BodyProps: ComponentProps<typeof SheetBody>;
    FooterProps: ComponentProps<typeof SheetFooter>;
    HandleProps: ComponentProps<typeof SheetHandle>;
    CloseTriggerProps: ComponentProps<typeof SheetCloseTrigger>;
};
export { SheetRoot, SheetNestedRoot, SheetTrigger, SheetClose, SheetBackdrop, SheetContent, SheetDialog, SheetHeader, SheetHeading, SheetBody, SheetFooter, SheetHandle, SheetCloseTrigger, };
export type { SheetRootProps, SheetRootProps as SheetProps, SheetTriggerProps, SheetCloseProps, SheetBackdropProps, SheetContentProps, SheetDialogProps, SheetHeaderProps, SheetHeadingProps, SheetBodyProps, SheetFooterProps, SheetHandleProps, SheetCloseTriggerProps, } from "./sheet";
export { sheetVariants } from "./sheet.styles";
export type { SheetVariants } from "./sheet.styles";
