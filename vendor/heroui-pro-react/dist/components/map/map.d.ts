import type { MarkerOptions, PopupOptions } from "maplibre-gl";
import type { ComponentPropsWithRef, ReactNode, Ref } from "react";
import { Button as HeroUIButton, ButtonGroup as HeroUIButtonGroup } from "@heroui/react";
import MapLibreGL from "maplibre-gl";
type Theme = "light" | "dark";
type MapStyleOption = string | MapLibreGL.StyleSpecification;
declare function useMap(): {
    isLoaded: boolean;
    map: MapLibreGL.Map | null;
};
type MapViewport = {
    bearing: number;
    center: [number, number];
    pitch: number;
    zoom: number;
};
type MapRef = MapLibreGL.Map;
type MapContainerProps = Pick<ComponentPropsWithRef<"div">, "className" | "id" | "role" | "style" | "tabIndex"> & {
    "aria-describedby"?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
};
interface MapRootProps extends MapContainerProps, Omit<MapLibreGL.MapOptions, "container" | "style"> {
    children?: ReactNode;
    /** Controlled loading veil shown over the map. */
    isLoading?: boolean;
    /** Single MapLibre-compatible style URL/object. Overrides `styles` when provided. */
    mapStyle?: MapStyleOption;
    /** Map projection. Use `{type: "globe"}` for globe maps. */
    projection?: MapLibreGL.ProjectionSpecification;
    /** Ref exposing the underlying MapLibre map instance. */
    ref?: Ref<MapRef | null>;
    /** Theme-aware MapLibre-compatible styles. Provide these from your app or map provider. */
    styles?: {
        dark?: MapStyleOption;
        light?: MapStyleOption;
    };
    /** Force a map theme. If omitted, the document class/system preference is used. */
    theme?: Theme;
    /** Controlled viewport. Pair with `onViewportChange` to drive the map from React state. */
    viewport?: Partial<MapViewport>;
    /** Fired as the map moves. Used standalone or with `viewport` for controlled mode. */
    onViewportChange?: (viewport: MapViewport) => void;
}
declare const MapRoot: ({ "aria-describedby": ariaDescribedBy, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, children, className, id, isLoading, mapStyle, onViewportChange, projection, ref, role, style, styles, tabIndex, theme: themeProp, viewport, ...mapOptions }: MapRootProps) => import("react/jsx-runtime").JSX.Element;
interface MapMarkerProps extends Omit<MarkerOptions, "element"> {
    children?: ReactNode;
    latitude: number;
    longitude: number;
    onClick?: (event: MouseEvent) => void;
    onDrag?: (lngLat: {
        lat: number;
        lng: number;
    }) => void;
    onDragEnd?: (lngLat: {
        lat: number;
        lng: number;
    }) => void;
    onDragStart?: (lngLat: {
        lat: number;
        lng: number;
    }) => void;
    onMouseEnter?: (event: MouseEvent) => void;
    onMouseLeave?: (event: MouseEvent) => void;
}
declare const MapMarker: ({ children, draggable, latitude, longitude, onClick, onDrag, onDragEnd, onDragStart, onMouseEnter, onMouseLeave, ...markerOptions }: MapMarkerProps) => import("react/jsx-runtime").JSX.Element | null;
interface MarkerContentProps {
    children?: ReactNode;
    className?: string;
}
declare const MarkerContent: ({ children, className }: MarkerContentProps) => import("react").ReactPortal;
interface MarkerDotProps extends ComponentPropsWithRef<"span"> {
    color?: string;
    ringColor?: string;
}
declare const MarkerDot: ({ className, color, ringColor, style, ...props }: MarkerDotProps) => import("react/jsx-runtime").JSX.Element;
interface MarkerLabelProps extends ComponentPropsWithRef<"div"> {
    position?: "bottom" | "top";
}
declare const MarkerLabel: ({ children, className, position, ...props }: MarkerLabelProps) => import("react/jsx-runtime").JSX.Element;
interface MarkerPopupProps extends Omit<PopupOptions, "className" | "closeButton"> {
    children: ReactNode;
    className?: string;
    closeButton?: boolean;
}
declare const MarkerPopup: ({ children, className, closeButton, ...popupOptions }: MarkerPopupProps) => import("react").ReactPortal | null;
interface MarkerTooltipProps extends Omit<PopupOptions, "className" | "closeButton" | "closeOnClick"> {
    children: ReactNode;
    className?: string;
}
declare const MarkerTooltip: ({ children, className, ...popupOptions }: MarkerTooltipProps) => import("react").ReactPortal | null;
interface MapPopupProps extends Omit<PopupOptions, "className" | "closeButton"> {
    children: ReactNode;
    className?: string;
    closeButton?: boolean;
    latitude: number;
    longitude: number;
    onClose?: () => void;
}
declare const MapPopup: ({ children, className, closeButton, latitude, longitude, onClose, ...popupOptions }: MapPopupProps) => import("react").ReactPortal | null;
type MapControlsPosition = "bottom-left" | "bottom-right" | "top-left" | "top-right";
interface MapControlsProps extends ComponentPropsWithRef<"div"> {
    position?: MapControlsPosition;
}
declare const MapControls: ({ children, className, position, ...props }: MapControlsProps) => import("react/jsx-runtime").JSX.Element;
interface MapControlGroupProps extends ComponentPropsWithRef<typeof HeroUIButtonGroup> {
}
declare const MapControlGroup: ({ children, className, orientation, size, variant, ...props }: MapControlGroupProps) => import("react/jsx-runtime").JSX.Element;
interface MapControlSeparatorProps extends ComponentPropsWithRef<typeof HeroUIButtonGroup.Separator> {
}
declare const MapControlSeparator: ({ className, ...props }: MapControlSeparatorProps) => import("react/jsx-runtime").JSX.Element;
interface MapControlButtonProps extends Omit<ComponentPropsWithRef<typeof HeroUIButton>, "aria-label" | "children" | "isIconOnly"> {
    children?: ReactNode;
    label: string;
}
declare const MapControlButton: ({ children, className, label, type, ...props }: MapControlButtonProps) => import("react/jsx-runtime").JSX.Element;
interface MapZoomControlProps extends Omit<MapControlGroupProps, "children"> {
    duration?: number;
    step?: number;
}
declare const MapZoomControl: ({ className, duration, step, ...props }: MapZoomControlProps) => import("react/jsx-runtime").JSX.Element;
interface MapCompassControlProps extends Omit<MapControlGroupProps, "children"> {
    duration?: number;
}
declare const MapCompassControl: ({ className, duration, ...props }: MapCompassControlProps) => import("react/jsx-runtime").JSX.Element;
interface MapLocateControlProps extends Omit<MapControlGroupProps, "children"> {
    duration?: number;
    onLocate?: (coords: {
        latitude: number;
        longitude: number;
    }) => void;
    onLocateError?: (error: GeolocationPositionError) => void;
    zoom?: number;
}
declare const MapLocateControl: ({ className, duration, onLocate, onLocateError, zoom, ...props }: MapLocateControlProps) => import("react/jsx-runtime").JSX.Element;
interface MapFullscreenControlProps extends Omit<MapControlGroupProps, "children"> {
    onFullscreenError?: (error: unknown) => void;
}
declare const MapFullscreenControl: ({ className, isDisabled, onFullscreenError, ...props }: MapFullscreenControlProps) => import("react/jsx-runtime").JSX.Element;
interface MapRouteProps {
    color?: string;
    coordinates: [number, number][];
    dashArray?: [number, number];
    id?: string;
    interactive?: boolean;
    opacity?: number;
    width?: number;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}
declare const MapRoute: ({ color, coordinates, dashArray, id: propId, interactive, onClick, onMouseEnter, onMouseLeave, opacity, width, }: MapRouteProps) => null;
type MapArcDatum = {
    from: [number, number];
    id: number | string;
    to: [number, number];
};
type MapArcEvent<T extends MapArcDatum = MapArcDatum> = {
    arc: T;
    latitude: number;
    longitude: number;
    originalEvent: MapLibreGL.MapMouseEvent;
};
type MapArcLinePaint = NonNullable<MapLibreGL.LineLayerSpecification["paint"]>;
type MapArcLineLayout = NonNullable<MapLibreGL.LineLayerSpecification["layout"]>;
interface MapArcProps<T extends MapArcDatum = MapArcDatum> {
    beforeId?: string;
    curvature?: number;
    data: T[];
    hoverPaint?: MapArcLinePaint;
    id?: string;
    interactive?: boolean;
    layout?: MapArcLineLayout;
    paint?: MapArcLinePaint;
    samples?: number;
    onClick?: (event: MapArcEvent<T>) => void;
    onHover?: (event: MapArcEvent<T> | null) => void;
}
declare const MapArc: <T extends MapArcDatum = MapArcDatum>({ beforeId, curvature, data, hoverPaint, id: propId, interactive, layout, onClick, onHover, paint, samples, }: MapArcProps<T>) => null;
interface MapClusterLayerProps<P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties> {
    clusterColors?: [string, string, string];
    clusterMaxZoom?: number;
    clusterRadius?: number;
    clusterThresholds?: [number, number];
    data: string | GeoJSON.FeatureCollection<GeoJSON.Point, P>;
    id?: string;
    pointColor?: NonNullable<MapLibreGL.CircleLayerSpecification["paint"]>["circle-color"];
    pointPaint?: NonNullable<MapLibreGL.CircleLayerSpecification["paint"]>;
    onClusterClick?: (clusterId: number, coordinates: [number, number], pointCount: number) => void;
    onPointClick?: (feature: GeoJSON.Feature<GeoJSON.Point, P>, coordinates: [number, number]) => void;
}
declare const MapClusterLayer: <P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties>({ clusterColors, clusterMaxZoom, clusterRadius, clusterThresholds, data, id: propId, onClusterClick, onPointClick, pointColor, pointPaint, }: MapClusterLayerProps<P>) => null;
export { MapArc, MapClusterLayer, MapCompassControl, MapControlButton, MapControlGroup, MapControlSeparator, MapControls, MapFullscreenControl, MapLocateControl, MapMarker, MapPopup, MapRoot, MapRoute, MapZoomControl, MarkerContent, MarkerDot, MarkerLabel, MarkerPopup, MarkerTooltip, useMap, };
export type { MapArcDatum, MapArcEvent, MapArcProps, MapClusterLayerProps, MapCompassControlProps, MapControlButtonProps, MapControlGroupProps, MapControlSeparatorProps, MapControlsPosition, MapControlsProps, MapFullscreenControlProps, MapLocateControlProps, MapMarkerProps, MapPopupProps, MapRef, MapRootProps, MapRouteProps, MapStyleOption, MapViewport, MarkerContentProps, MarkerDotProps, MarkerLabelProps, MarkerPopupProps, MarkerTooltipProps, Theme as MapTheme, };
