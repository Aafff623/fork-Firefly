import type { DOMRenderProps } from "@heroui/react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { ProgressBar } from "@heroui/react";
import { Button as ButtonPrimitive } from "react-aria-components/Button";
import { DropZone as DropZonePrimitive, Text as TextPrimitive } from "react-aria-components/DropZone";
import { m } from "../../libs/motion";
interface DropZoneRootProps<E extends keyof React.JSX.IntrinsicElements = "div"> extends DOMRenderProps<E, undefined> {
    children: ReactNode;
    className?: string;
}
declare const DropZoneRoot: <E extends keyof React.JSX.IntrinsicElements = "div">({ children, className, ...props }: DropZoneRootProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof DropZoneRootProps<E>>) => import("react/jsx-runtime").JSX.Element;
interface DropZoneAreaProps extends ComponentPropsWithRef<typeof DropZonePrimitive> {
}
declare const DropZoneArea: ({ children, className, ...props }: DropZoneAreaProps) => import("react/jsx-runtime").JSX.Element;
interface DropZoneIconProps extends ComponentPropsWithRef<"span"> {
}
declare const DropZoneIcon: ({ children, className, ...props }: DropZoneIconProps) => import("react/jsx-runtime").JSX.Element;
interface DropZoneLabelProps extends ComponentPropsWithRef<typeof TextPrimitive> {
}
declare const DropZoneLabel: ({ children, className, ...props }: DropZoneLabelProps) => import("react/jsx-runtime").JSX.Element;
interface DropZoneDescriptionProps extends ComponentPropsWithRef<"span"> {
}
declare const DropZoneDescription: ({ children, className, ...props }: DropZoneDescriptionProps) => import("react/jsx-runtime").JSX.Element;
interface DropZoneInputProps extends Omit<ComponentPropsWithRef<"input">, "onChange" | "onSelect" | "type"> {
    /** Called when files are selected via the file picker. */
    onSelect?: (files: FileList) => void;
}
declare const DropZoneInput: ({ accept, className, multiple, onSelect, ...props }: DropZoneInputProps) => import("react/jsx-runtime").JSX.Element;
interface DropZoneTriggerProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {
}
declare const DropZoneTrigger: ({ children, className, ...props }: DropZoneTriggerProps) => import("react/jsx-runtime").JSX.Element;
interface DropZoneFileListProps extends ComponentPropsWithRef<"div"> {
}
declare const DropZoneFileList: ({ children, className, ...props }: DropZoneFileListProps) => import("react/jsx-runtime").JSX.Element;
interface DropZoneFileItemProps extends ComponentPropsWithRef<typeof m.div> {
    /** Upload status of this file item. */
    status?: "complete" | "failed" | "uploading";
}
declare const DropZoneFileItem: ({ children, className, status, ...props }: DropZoneFileItemProps) => import("react/jsx-runtime").JSX.Element;
type FileFormatIconColor = "blue" | "gray" | "green" | "orange" | "purple" | "red";
interface DropZoneFileFormatIconProps extends Omit<React.SVGProps<SVGSVGElement>, "children"> {
    /** File format label displayed on the badge (e.g. "PDF", "JPG"). */
    format?: string;
    /** Badge color. */
    color?: FileFormatIconColor;
}
declare const DropZoneFileFormatIcon: ({ className, color, format, ...props }: DropZoneFileFormatIconProps) => import("react/jsx-runtime").JSX.Element;
interface DropZoneFileInfoProps extends ComponentPropsWithRef<"div"> {
}
declare const DropZoneFileInfo: ({ children, className, ...props }: DropZoneFileInfoProps) => import("react/jsx-runtime").JSX.Element;
interface DropZoneFileNameProps extends ComponentPropsWithRef<"span"> {
}
declare const DropZoneFileName: ({ children, className, ...props }: DropZoneFileNameProps) => import("react/jsx-runtime").JSX.Element;
interface DropZoneFileMetaProps extends ComponentPropsWithRef<"span"> {
}
declare const DropZoneFileMeta: ({ children, className, ...props }: DropZoneFileMetaProps) => import("react/jsx-runtime").JSX.Element;
interface DropZoneFileProgressProps extends ComponentPropsWithRef<typeof ProgressBar> {
}
declare const DropZoneFileProgress: ({ children, className, size, ...props }: DropZoneFileProgressProps) => import("react/jsx-runtime").JSX.Element;
interface DropZoneFileProgressTrackProps extends ComponentPropsWithRef<typeof ProgressBar.Track> {
}
declare const DropZoneFileProgressTrack: ({ children, className, ...props }: DropZoneFileProgressTrackProps) => import("react/jsx-runtime").JSX.Element;
interface DropZoneFileProgressFillProps extends ComponentPropsWithRef<typeof ProgressBar.Fill> {
}
declare const DropZoneFileProgressFill: ({ className, ...props }: DropZoneFileProgressFillProps) => import("react/jsx-runtime").JSX.Element;
interface DropZoneFileRetryTriggerProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {
}
declare const DropZoneFileRetryTrigger: ({ children, className, ...props }: DropZoneFileRetryTriggerProps) => import("react/jsx-runtime").JSX.Element;
interface DropZoneFileRemoveTriggerProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {
}
declare const DropZoneFileRemoveTrigger: ({ children, className, ...props }: DropZoneFileRemoveTriggerProps) => import("react/jsx-runtime").JSX.Element;
export { DropZoneArea, DropZoneDescription, DropZoneFileFormatIcon, DropZoneFileInfo, DropZoneFileItem, DropZoneFileList, DropZoneFileMeta, DropZoneFileName, DropZoneFileProgress, DropZoneFileProgressFill, DropZoneFileProgressTrack, DropZoneFileRemoveTrigger, DropZoneFileRetryTrigger, DropZoneIcon, DropZoneInput, DropZoneLabel, DropZoneRoot, DropZoneTrigger, };
export type { DropZoneAreaProps, DropZoneDescriptionProps, DropZoneFileFormatIconProps, DropZoneFileInfoProps, DropZoneFileItemProps, DropZoneFileListProps, DropZoneFileMetaProps, DropZoneFileNameProps, DropZoneFileProgressFillProps, DropZoneFileProgressProps, DropZoneFileProgressTrackProps, DropZoneFileRemoveTriggerProps, DropZoneFileRetryTriggerProps, DropZoneIconProps, DropZoneInputProps, DropZoneLabelProps, DropZoneRootProps, DropZoneTriggerProps, };
