import type { ComponentPropsWithRef, ReactNode } from "react";
import { Button } from "@heroui/react";
type QueueActionsVisibility = "always" | "hover";
interface PromptInputQueueProps extends ComponentPropsWithRef<"div"> {
    /** When queue row actions are shown. @default "hover" */
    actionsVisibility?: QueueActionsVisibility;
    children: ReactNode;
}
interface PromptInputQueueListProps<T = unknown> extends Omit<ComponentPropsWithRef<"ul">, "children" | "onDrag" | "onDragEnd" | "onDragStart"> {
    /** Axis for reordering. @default "y" */
    axis?: "x" | "y";
    children: ReactNode;
    /** Called when items are reordered via drag and drop. */
    onReorder?: (values: T[]) => void;
    /** Controlled queue values. Pass with `onReorder` to enable Motion reordering. */
    values?: T[];
}
declare const PromptInputQueueList: <T>({ axis, children, className, onReorder, values, ...props }: PromptInputQueueListProps<T>) => import("react/jsx-runtime").JSX.Element;
interface PromptInputQueueItemProps<T = unknown> extends Omit<ComponentPropsWithRef<"li">, "onDrag" | "onDragEnd" | "onDragStart" | "value"> {
    children: ReactNode;
    /** Item value from `PromptInput.Queue.List` `values`. Required when reordering is enabled. */
    value?: T;
}
type PromptInputQueueItemHandleProps = ComponentPropsWithRef<typeof Button>;
declare const PromptInputQueueItemHandle: ({ children, className, onPointerDown, ...props }: PromptInputQueueItemHandleProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputQueueItemIconProps extends ComponentPropsWithRef<"span"> {
    children?: ReactNode;
}
declare const PromptInputQueueItemIcon: ({ children, className, ...props }: PromptInputQueueItemIconProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputQueueItemBodyProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const PromptInputQueueItemBody: ({ children, className, ...props }: PromptInputQueueItemBodyProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputQueueItemContentProps extends ComponentPropsWithRef<"p"> {
    children: ReactNode;
}
declare const PromptInputQueueItemContent: ({ children, className, ...props }: PromptInputQueueItemContentProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputQueueItemDescriptionProps extends ComponentPropsWithRef<"p"> {
    children: ReactNode;
}
declare const PromptInputQueueItemDescription: ({ children, className, ...props }: PromptInputQueueItemDescriptionProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputQueueItemActionsProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const PromptInputQueueItemActions: ({ children, className, ...props }: PromptInputQueueItemActionsProps) => import("react/jsx-runtime").JSX.Element;
type PromptInputQueueItemActionProps = ComponentPropsWithRef<typeof Button>;
declare const PromptInputQueueItemAction: ({ children, className, isIconOnly, ...props }: PromptInputQueueItemActionProps) => import("react/jsx-runtime").JSX.Element;
type PromptInputQueueItemSteerProps = ComponentPropsWithRef<typeof Button>;
declare const PromptInputQueueItemSteer: ({ children, className, ...props }: PromptInputQueueItemSteerProps) => import("react/jsx-runtime").JSX.Element;
type PromptInputQueueItemRemoveProps = ComponentPropsWithRef<typeof Button>;
declare const PromptInputQueueItemRemove: ({ children, className, ...props }: PromptInputQueueItemRemoveProps) => import("react/jsx-runtime").JSX.Element;
type PromptInputQueueItemMoreProps = ComponentPropsWithRef<typeof Button>;
declare const PromptInputQueueItemMore: ({ children, className, ...props }: PromptInputQueueItemMoreProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputQueueItemAttachmentsProps extends ComponentPropsWithRef<"div"> {
    children: ReactNode;
}
declare const PromptInputQueueItemAttachments: ({ children, className, ...props }: PromptInputQueueItemAttachmentsProps) => import("react/jsx-runtime").JSX.Element;
interface PromptInputQueueItemAttachmentsOverflowProps extends ComponentPropsWithRef<"span"> {
    /** Number of attachments hidden beyond the visible previews. */
    hiddenCount: number;
    /** Noun used in the overflow label. @default "files" */
    noun?: string;
}
declare const PromptInputQueueItemAttachmentsOverflow: ({ className, hiddenCount, noun, ...props }: PromptInputQueueItemAttachmentsOverflowProps) => import("react/jsx-runtime").JSX.Element | null;
declare const PromptInputQueueItemCompound: (<T>({ children, className, value, ...props }: PromptInputQueueItemProps<T>) => import("react/jsx-runtime").JSX.Element) & {
    Action: ({ children, className, isIconOnly, ...props }: PromptInputQueueItemActionProps) => import("react/jsx-runtime").JSX.Element;
    Actions: ({ children, className, ...props }: PromptInputQueueItemActionsProps) => import("react/jsx-runtime").JSX.Element;
    Attachments: ({ children, className, ...props }: PromptInputQueueItemAttachmentsProps) => import("react/jsx-runtime").JSX.Element;
    AttachmentsOverflow: ({ className, hiddenCount, noun, ...props }: PromptInputQueueItemAttachmentsOverflowProps) => import("react/jsx-runtime").JSX.Element | null;
    Body: ({ children, className, ...props }: PromptInputQueueItemBodyProps) => import("react/jsx-runtime").JSX.Element;
    Content: ({ children, className, ...props }: PromptInputQueueItemContentProps) => import("react/jsx-runtime").JSX.Element;
    Description: ({ children, className, ...props }: PromptInputQueueItemDescriptionProps) => import("react/jsx-runtime").JSX.Element;
    Handle: ({ children, className, onPointerDown, ...props }: PromptInputQueueItemHandleProps) => import("react/jsx-runtime").JSX.Element;
    Icon: ({ children, className, ...props }: PromptInputQueueItemIconProps) => import("react/jsx-runtime").JSX.Element;
    More: ({ children, className, ...props }: PromptInputQueueItemMoreProps) => import("react/jsx-runtime").JSX.Element;
    Remove: ({ children, className, ...props }: PromptInputQueueItemRemoveProps) => import("react/jsx-runtime").JSX.Element;
    Steer: ({ children, className, ...props }: PromptInputQueueItemSteerProps) => import("react/jsx-runtime").JSX.Element;
};
declare const PromptInputQueueCompound: (({ actionsVisibility, children, className, ...props }: PromptInputQueueProps) => import("react/jsx-runtime").JSX.Element) & {
    Item: (<T>({ children, className, value, ...props }: PromptInputQueueItemProps<T>) => import("react/jsx-runtime").JSX.Element) & {
        Action: ({ children, className, isIconOnly, ...props }: PromptInputQueueItemActionProps) => import("react/jsx-runtime").JSX.Element;
        Actions: ({ children, className, ...props }: PromptInputQueueItemActionsProps) => import("react/jsx-runtime").JSX.Element;
        Attachments: ({ children, className, ...props }: PromptInputQueueItemAttachmentsProps) => import("react/jsx-runtime").JSX.Element;
        AttachmentsOverflow: ({ className, hiddenCount, noun, ...props }: PromptInputQueueItemAttachmentsOverflowProps) => import("react/jsx-runtime").JSX.Element | null;
        Body: ({ children, className, ...props }: PromptInputQueueItemBodyProps) => import("react/jsx-runtime").JSX.Element;
        Content: ({ children, className, ...props }: PromptInputQueueItemContentProps) => import("react/jsx-runtime").JSX.Element;
        Description: ({ children, className, ...props }: PromptInputQueueItemDescriptionProps) => import("react/jsx-runtime").JSX.Element;
        Handle: ({ children, className, onPointerDown, ...props }: PromptInputQueueItemHandleProps) => import("react/jsx-runtime").JSX.Element;
        Icon: ({ children, className, ...props }: PromptInputQueueItemIconProps) => import("react/jsx-runtime").JSX.Element;
        More: ({ children, className, ...props }: PromptInputQueueItemMoreProps) => import("react/jsx-runtime").JSX.Element;
        Remove: ({ children, className, ...props }: PromptInputQueueItemRemoveProps) => import("react/jsx-runtime").JSX.Element;
        Steer: ({ children, className, ...props }: PromptInputQueueItemSteerProps) => import("react/jsx-runtime").JSX.Element;
    };
    List: <T>({ axis, children, className, onReorder, values, ...props }: PromptInputQueueListProps<T>) => import("react/jsx-runtime").JSX.Element;
};
export { PromptInputQueueCompound as PromptInputQueue, PromptInputQueueItemAction, PromptInputQueueItemActions, PromptInputQueueItemAttachments, PromptInputQueueItemAttachmentsOverflow, PromptInputQueueItemBody, PromptInputQueueItemCompound as PromptInputQueueItem, PromptInputQueueItemContent, PromptInputQueueItemDescription, PromptInputQueueItemHandle, PromptInputQueueItemIcon, PromptInputQueueItemMore, PromptInputQueueItemRemove, PromptInputQueueItemSteer, PromptInputQueueList, };
export type { PromptInputQueueItemActionProps, PromptInputQueueItemActionsProps, PromptInputQueueItemAttachmentsOverflowProps, PromptInputQueueItemAttachmentsProps, PromptInputQueueItemBodyProps, PromptInputQueueItemContentProps, PromptInputQueueItemDescriptionProps, PromptInputQueueItemHandleProps, PromptInputQueueItemIconProps, PromptInputQueueItemMoreProps, PromptInputQueueItemProps, PromptInputQueueItemRemoveProps, PromptInputQueueItemSteerProps, PromptInputQueueListProps, PromptInputQueueProps, QueueActionsVisibility, };
