import type { CarouselVariants } from "./carousel.styles";
import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from "embla-carousel";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { Button as HeroUIButton } from "@heroui/react";
import { Button as ButtonPrimitive } from "react-aria-components/Button";
interface CarouselRootProps extends ComponentPropsWithRef<"div"> {
    /** Embla Carousel options. @see https://www.embla-carousel.com/api/options/ */
    opts?: EmblaOptionsType;
    /** Embla Carousel plugins. @see https://www.embla-carousel.com/plugins/ */
    plugins?: EmblaPluginType[];
    /** Callback to receive the Embla API instance. */
    setApi?: (api: EmblaCarouselType) => void;
    /** Carousel type. @default "in-place" */
    type?: CarouselVariants["type"];
}
declare const CarouselRoot: ({ children, className, opts, plugins, setApi, type, ...props }: CarouselRootProps) => import("react/jsx-runtime").JSX.Element;
interface CarouselContentProps extends ComponentPropsWithRef<"div"> {
}
declare const CarouselContent: ({ children, className, ...props }: CarouselContentProps) => import("react/jsx-runtime").JSX.Element;
interface CarouselItemProps extends ComponentPropsWithRef<"div"> {
}
declare const CarouselItem: ({ children, className, ...props }: CarouselItemProps) => import("react/jsx-runtime").JSX.Element;
interface CarouselPreviousProps extends ComponentPropsWithRef<typeof HeroUIButton> {
    /** Custom icon to replace the default chevron. */
    icon?: ReactNode;
}
declare const CarouselPrevious: ({ children, className, icon, ...props }: CarouselPreviousProps) => import("react/jsx-runtime").JSX.Element | null;
interface CarouselNextProps extends ComponentPropsWithRef<typeof HeroUIButton> {
    /** Custom icon to replace the default chevron. */
    icon?: ReactNode;
}
declare const CarouselNext: ({ children, className, icon, ...props }: CarouselNextProps) => import("react/jsx-runtime").JSX.Element | null;
interface CarouselDotsProps extends ComponentPropsWithRef<"div"> {
    /** Render function to customize each dot. Receives index and selected state. */
    renderDot?: (props: {
        index: number;
        isSelected: boolean;
    }) => ReactNode;
}
declare const CarouselDots: ({ className, renderDot, ...props }: CarouselDotsProps) => import("react/jsx-runtime").JSX.Element | null;
interface CarouselThumbnailsProps extends ComponentPropsWithRef<"div"> {
    /** Hide the native scrollbar. @default true */
    hideScrollBar?: boolean;
    /** Size of the scroll shadow gradient in pixels. @default 40 */
    scrollShadowSize?: number;
}
declare const CarouselThumbnails: ({ children, className, hideScrollBar, scrollShadowSize, ...props }: CarouselThumbnailsProps) => import("react/jsx-runtime").JSX.Element;
interface CarouselThumbnailProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {
    /** The slide index this thumbnail navigates to (0-based). */
    index: number;
    /** Alt text for the thumbnail image. */
    alt?: string;
    /** Image source URL. Alternatively, pass children for custom content. */
    src?: string;
}
declare const CarouselThumbnail: ({ alt, children, className, index, src, ...props }: CarouselThumbnailProps) => import("react/jsx-runtime").JSX.Element;
export { CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious, CarouselRoot, CarouselThumbnail, CarouselThumbnails, };
export type { CarouselContentProps, CarouselDotsProps, CarouselItemProps, CarouselNextProps, CarouselPreviousProps, CarouselRootProps, CarouselThumbnailProps, CarouselThumbnailsProps, };
