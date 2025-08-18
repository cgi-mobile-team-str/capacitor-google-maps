import type { Plugin } from '@capacitor/core';
import type { CameraConfig, Circle, CircleOption, GoogleMapConfig, GoogleMapsOptions, LatLng, LatLngBounds, MapPadding, MapType, Marker, MarkerOption, Polygon, PolygonOption, Polyline, PolylineOption, Size, VisibleRegion } from './definitions';
/**
 * An interface containing the options used when creating a map.
 */
export interface CreateMapArgs {
    /**
     * A unique identifier for the map instance.
     */
    id: string;
    /**
     * The Google Maps SDK API Key.
     */
    apiKey: string;
    /**
     * The initial configuration settings for the map.
     */
    config: GoogleMapConfig;
    /**
     * The DOM element that the Google Map View will be mounted on which determines size and positioning.
     */
    element: HTMLElement;
    /**
     * Destroy and re-create the map instance if a map with the supplied id already exists
     * @default false
     */
    forceCreate?: boolean;
    /**
     * The region parameter alters your application to serve different map tiles or bias the application (such as biasing geocoding results towards the region).
     *
     * Only available for web.
     */
    region?: string;
    /**
     * The language parameter affects the names of controls, copyright notices, driving directions, and control labels, as well as the responses to service requests.
     *
     * Only available for web.
     */
    language?: string;
}
export interface DestroyMapArgs {
    id: string;
}
export interface RemoveMarkerArgs {
    id: string;
    markerId: string;
}
export interface RemoveMarkersArgs {
    id: string;
    markerIds: string[];
}
export interface AddMarkerArgs {
    id: string;
    options: MarkerOption;
}
export interface AddPolygonsArgs {
    id: string;
    optionsList: PolygonOption[];
}
export interface AddPolygonArgs {
    id: string;
    options: PolygonOption;
}
export interface RemovePolygonsArgs {
    id: string;
    polygonIds: string[];
}
export interface AddCirclesArgs {
    id: string;
    optionsList: CircleOption[];
}
export interface RemoveCirclesArgs {
    id: string;
    circleIds: string[];
}
export interface AddPolylinesArgs {
    id: string;
    optionsList: PolylineOption[];
}
export interface RemovePolylinesArgs {
    id: string;
    polylineIds: string[];
}
export interface CameraArgs {
    id: string;
    config: CameraConfig;
}
export interface MapTypeArgs {
    id: string;
    mapType: MapType;
}
export interface IndoorMapArgs {
    id: string;
    enabled: boolean;
}
export interface TrafficLayerArgs {
    id: string;
    enabled: boolean;
}
export interface AccElementsArgs {
    id: string;
    enabled: boolean;
}
export interface PaddingArgs {
    id: string;
    padding: MapPadding;
}
export interface CurrentLocArgs {
    id: string;
    enabled: boolean;
}
export interface AddMarkersArgs {
    id: string;
    optionsList: MarkerOption[];
}
export interface MapBoundsArgs {
    id: string;
    mapBounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
export interface MapOptionsArgs {
    id: string;
    config: GoogleMapsOptions;
}
export interface MarkerIconArgs {
    id: string;
    markerId: string;
    url?: string;
    size?: Size;
}
export interface MarkerIconAnchorArgs {
    id: string;
    markerId: string;
    x: number;
    y: number;
}
export interface MarkerZIndexArgs {
    id: string;
    markerId: string;
    zIndex: number;
}
export interface MarkerVisibilityArgs {
    id: string;
    markerId: string;
    isVisible: boolean;
}
export interface MarkerPositionArgs {
    id: string;
    markerId: string;
}
export interface MapBoundsContainsArgs {
    bounds: LatLngBounds;
    point: LatLng;
}
export type MapBoundsExtendArgs = MapBoundsContainsArgs;
export interface EnableClusteringArgs {
    id: string;
    minClusterSize?: number;
}
export interface FitBoundsArgs {
    id: string;
    bounds: LatLngBounds;
    padding?: number;
}
export interface EnableCompassArgs {
    id: string;
    enabled: boolean;
}
export interface EnableToolbarArgs {
    id: string;
    isEnabled: boolean;
}
export interface EnableMyLocationArgs {
    id: string;
    isEnabled: boolean;
}
export interface EnableAllGesturesArgs {
    id: string;
    isEnabled: boolean;
}
export interface EnableTiltGestureArgs {
    id: string;
    isEnabled: boolean;
}
export interface EnableTiltRotateGestureArgs {
    id: string;
    isEnabled: boolean;
}
export interface SetMapPreferencesArgs {
    id: string;
    padding?: MapPadding;
    building?: boolean;
}
export interface CameraBearingArgs {
    id: string;
    bearing: number;
}
export interface AddPolylineArgs {
    id: string;
    options: PolylineOption;
}
export interface PolylineStrokeColorArgs {
    id: string;
    polylineId: string;
    strokeColor: string;
}
export interface PolylineStrokeWidthArgs {
    id: string;
    polylineId: string;
    strokeWidth: number;
}
export interface RemovePolylineArgs {
    id: string;
    polylineId: string;
}
export interface AddCircleArgs {
    id: string;
    options: CircleOption;
}
export interface SetCircleCenterArgs {
    id: string;
    circleId: string;
    center: LatLng;
}
export interface RemoveCircleArgs {
    id: string;
    circleId: string;
}
export interface RemovePolygonArgs {
    id: string;
    polygonId: string;
}
export interface SetCameraTargetArgs {
    id: string;
    target: LatLng | LatLng[];
}
export interface FromPointToLatLngArgs {
    id: string;
    points: number[];
}
export interface CapacitorGoogleMapsPlugin extends Plugin {
    create(options: CreateMapArgs): Promise<void>;
    enableTouch(args: {
        id: string;
    }): Promise<void>;
    disableTouch(args: {
        id: string;
    }): Promise<void>;
    addMarker(args: AddMarkerArgs): Promise<Marker & {
        id: string;
    }>;
    addMarkers(args: AddMarkersArgs): Promise<{
        markers: (Marker & {
            id: string;
        })[];
    }>;
    removeMarker(args: RemoveMarkerArgs): Promise<void>;
    removeMarkers(args: RemoveMarkersArgs): Promise<void>;
    addPolygons(args: AddPolygonsArgs): Promise<{
        polygons: (Polygon & {
            id: string;
        })[];
    }>;
    addPolygon(args: AddPolygonArgs): Promise<Polygon & {
        id: string;
    }>;
    removePolygons(args: RemovePolygonsArgs): Promise<void>;
    removePolygon(args: RemovePolygonArgs): Promise<void>;
    addCircles(args: AddCirclesArgs): Promise<{
        circles: (Circle & {
            id: string;
        })[];
    }>;
    removeCircles(args: RemoveCirclesArgs): Promise<void>;
    addCircle(args: AddCircleArgs): Promise<Circle & {
        id: string;
    }>;
    setCircleCenter(args: SetCircleCenterArgs): Promise<void>;
    removeCircle(args: RemoveCircleArgs): Promise<void>;
    addPolylines(args: AddPolylinesArgs): Promise<{
        polylines: (Polyline & {
            id: string;
        })[];
    }>;
    removePolylines(args: RemovePolylinesArgs): Promise<void>;
    addPolyline(args: AddPolylineArgs): Promise<Polyline & {
        id: string;
    }>;
    setPolylineStrokeColor(args: PolylineStrokeColorArgs): Promise<void>;
    setPolylineStrokeWidth(args: PolylineStrokeWidthArgs): Promise<void>;
    removePolyline(args: RemovePolylineArgs): Promise<void>;
    enableClustering(args: EnableClusteringArgs): Promise<void>;
    disableClustering(args: {
        id: string;
    }): Promise<void>;
    destroy(args: DestroyMapArgs): Promise<void>;
    animateCamera(args: CameraArgs): Promise<void>;
    moveCamera(args: CameraArgs): Promise<void>;
    getMapType(args: {
        id: string;
    }): Promise<{
        type: string;
    }>;
    getCameraZoom(args: {
        id: string;
    }): Promise<{
        cameraZoom: number;
    }>;
    setMapType(args: MapTypeArgs): Promise<void>;
    enableIndoorMaps(args: IndoorMapArgs): Promise<void>;
    enableTrafficLayer(args: TrafficLayerArgs): Promise<void>;
    enableAccessibilityElements(args: AccElementsArgs): Promise<void>;
    enableCurrentLocation(args: CurrentLocArgs): Promise<void>;
    setPadding(args: PaddingArgs): Promise<void>;
    onScroll(args: MapBoundsArgs): Promise<void>;
    onResize(args: MapBoundsArgs): Promise<void>;
    onDisplay(args: MapBoundsArgs): Promise<void>;
    dispatchMapEvent(args: {
        id: string;
        focus: boolean;
    }): Promise<void>;
    getMapBounds(args: {
        id: string;
    }): Promise<LatLngBounds>;
    fitBounds(args: FitBoundsArgs): Promise<void>;
    mapBoundsContains(args: MapBoundsContainsArgs): Promise<{
        contains: boolean;
    }>;
    mapBoundsExtend(args: MapBoundsExtendArgs): Promise<{
        bounds: LatLngBounds;
    }>;
    getVisibleRegion(args: {
        id: string;
    }): Promise<VisibleRegion>;
    enableCompass(args: EnableCompassArgs): Promise<void>;
    enableToolbar(args: EnableToolbarArgs): Promise<void>;
    enableMyLocation(args: EnableMyLocationArgs): Promise<void>;
    enableAllGestures(args: EnableAllGesturesArgs): Promise<void>;
    enableTiltGesture(args: EnableTiltGestureArgs): Promise<void>;
    enableTiltRotateGesture(args: EnableTiltRotateGestureArgs): Promise<void>;
    setMapPreferences(args: SetMapPreferencesArgs): Promise<void>;
    setCameraBearing(args: CameraBearingArgs): Promise<void>;
    setOptions(args: MapOptionsArgs): Promise<void>;
    setMarkerIcon(args: MarkerIconArgs): Promise<void>;
    setMarkerIconAnchor(args: MarkerIconAnchorArgs): Promise<void>;
    setMarkerZIndex(args: MarkerZIndexArgs): Promise<void>;
    setMarkerVisibility(args: MarkerVisibilityArgs): Promise<void>;
    getMarkerPosition(args: MarkerPositionArgs): Promise<{
        position: LatLng;
    }>;
    setCameraTarget(args: SetCameraTargetArgs): Promise<void>;
    getCameraTarget(args: {
        id: string;
    }): Promise<{
        cameraTarget: LatLng;
    }>;
    fromPointToLatLng(args: FromPointToLatLngArgs): Promise<{
        latLng: LatLng;
    }>;
}
declare const CapacitorGoogleMaps: CapacitorGoogleMapsPlugin;
export { CapacitorGoogleMaps };
