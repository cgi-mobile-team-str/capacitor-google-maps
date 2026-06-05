import { CameraConfig, CameraIdleCallbackData, Circle, GoogleMapConfig, LatLng, LatLngBoundsInterface, MapType, Marker, Polygon, Polyline } from './original-plugin/definitions';
export declare class LatLngBounds {
    southwest: LatLng;
    center: LatLng;
    northeast: LatLng;
    constructor(bounds: LatLngBoundsInterface);
    constructor(points: LatLng[]);
}
export declare class LatLngImpl implements LatLng {
    /**
     * Coordinate latitude, in degrees. This value is in the range [-90, 90].
     */
    lat: number;
    /**
     * Coordinate longitude, in degrees. This value is in the range [-180, 180].
     */
    lng: number;
    constructor(lat: number, lng: number);
}
export interface Size {
    width: number;
    height: number;
}
export interface Point {
    x: number;
    y: number;
}
/**
 * For web, all the javascript Polygon options are available as
 * Polygon extends google.maps.PolygonOptions.
 * For iOS and Android only the config options declared on Polygon are available.
 */
export interface IPolygon extends Polygon {
    shapes: LatLng[][];
    strokeWidth?: number;
}
export interface PolygonOptions {
    points: LatLng[][];
    visible?: boolean;
    strokeColor?: string;
    strokeWidth?: number;
    fillColor?: string;
    zIndex?: number;
}
export declare class CapacitorPolygon implements IPolygon {
    mapId: string;
    id: string;
    shapes: LatLng[][];
    visible?: boolean | undefined | null;
    strokeColor?: string;
    strokeWidth?: number;
    fillColor?: string;
    zIndex?: number | undefined | null;
    constructor(obj: IPolygon & {
        id: string;
    }, mapId: string);
    remove(): Promise<void>;
}
/**
 * For web, all the javascript Circle options are available as
 * Polygon extends google.maps.CircleOptions.
 * For iOS and Android only the config options declared on Circle are available.
 */
export interface ICircle extends Circle {
    center: LatLng;
    strokeWidth?: number;
    visible?: boolean;
}
export interface CircleOptions {
    center: LatLng;
    radius: number;
    strokeWidth?: number;
    strokeColor?: string;
    fillColor?: string;
    clickable?: boolean;
    visible?: boolean;
    zIndex?: number;
}
export declare class CapacitorCircle implements ICircle {
    mapId: string;
    id: string;
    center: LatLng;
    radius: number;
    strokeColor?: string;
    fillColor?: string;
    strokeWidth?: number;
    zIndex?: number | undefined | null;
    visible?: boolean | undefined;
    clickable?: boolean;
    constructor(obj: ICircle & {
        id: string;
    }, mapId: string);
    setCenter(center: LatLng): Promise<void>;
    remove(): Promise<void>;
}
/**
 * For web, all the javascript Polyline options are available as
 * Polyline extends google.maps.PolylineOptions.
 * For iOS and Android only the config options declared on Polyline are available.
 */
export interface IPolyline extends Polyline {
    strokeWidth?: number;
    isVisible?: boolean;
    /**
     * Accept own properties
     * You can get the property later using `get()` method.
     */
    [key: string]: any;
}
export interface PolylineOptions {
    points: LatLng[];
    visible?: boolean;
    geodesic?: boolean;
    color?: string;
    width?: number;
    zIndex?: number;
    clickable?: boolean;
    [key: string]: any;
}
export declare class CapacitorPolyline implements IPolyline {
    mapId: string;
    id: string;
    points: LatLng[] | null | undefined;
    visible?: boolean | null;
    geodesic?: boolean;
    strokeColor?: string;
    strokeWidth?: number;
    zIndex?: number | null;
    clickable?: boolean;
    [key: string]: any;
    constructor(obj: IPolyline & {
        id: string;
    }, mapId: string);
    get(key: string): any;
    set(key: string, value: any): void;
    setStrokeColor(color: string): Promise<void>;
    setStrokeWidth(width: number): Promise<void>;
    setZIndex(zIndex: number): Promise<void>;
    isRemoved(): Promise<boolean>;
    remove(): Promise<void>;
}
/**
 * For web, all the javascript Google Maps options are available as
 * GoogleMapConfig extends google.maps.MapOptions.
 * For iOS and Android only the config options declared on GoogleMapConfig are available.
 */
export interface IGoogleMapConfig extends GoogleMapConfig {
    /**
     * Styles to apply to each of the default map types. Note that for
     * satellite, hybrid and terrain modes,
     * these styles will only apply to labels and geometry.
     *
     * @since 4.3.0
     */
    controls?: GoogleMapControls;
    gestures?: GoogleMapGestures;
    camera?: CameraPosition;
    preferences?: GoogleMapPreferences;
}
/**
 * Configuration properties for a Google Map Camera
 */
export interface CameraPosition extends CameraConfig {
    /**
     * Location on the Earth towards which the camera points or multiple locations towards which the camera points in the center .
     */
    target?: LatLng | LatLng[];
    /**
     * The angle, in degrees, of the camera from the nadir (directly facing the Earth).
     *
     * The only allowed values are 0 and 45.
     *
     * @default 0
     */
    tilt?: number;
    duration?: number;
}
export declare enum GoogleMapsEvent {
    MAP_READY = "onMapReady",
    MAP_CLICK = "onMapClick",
    POI_CLICK = "onPoiClick",
    CAMERA_MOVE_END = "onCameraIdle",
    MARKER_CLICK = "onMarkerClick",
    MAP_DRAG = "onCameraMove",
    MAP_DRAG_START = "onCameraMoveStarted"
}
/**
 * Controls for setting padding on the 'visible' region of the view.
 */
export interface MapPadding {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
}
/**
 * A marker is an icon placed at a particular point on the map's surface.
 */
export interface IMarker extends Marker {
    isVisible?: boolean;
    clickable?: boolean;
    /**
     * Accept own properties
     * You can get the property later using `get()` method.
     */
    [key: string]: any;
}
export interface MarkerOptions {
    icon?: MarkerIcon & {
        anchor?: number[];
    };
    title?: string;
    snippet?: string;
    position: LatLng;
    infoWindowAnchor?: number[];
    anchor?: number[];
    draggable?: boolean;
    flat?: boolean;
    rotation?: number;
    visible?: boolean;
    animation?: string;
    zIndex?: number;
    disableAutoPan?: boolean;
    alpha?: number;
    clickable?: boolean;
    [key: string]: any;
}
export interface MarkerIcon {
    url?: string;
    size?: Size;
}
export declare class CapacitorMarker implements IMarker {
    mapId: string;
    id: string;
    coordinate: LatLng;
    opacity?: number | undefined;
    title?: string | undefined;
    snippet?: string | undefined;
    isFlat?: boolean | undefined;
    iconUrl?: string | undefined;
    iconSize?: Size | undefined;
    iconOrigin?: Point | undefined;
    iconAnchor?: Point | undefined;
    tintColor?: {
        r: number;
        g: number;
        b: number;
        a: number;
    } | undefined;
    draggable?: boolean | undefined;
    zIndex?: number | undefined;
    isVisible?: boolean | undefined;
    clickable?: boolean;
    [key: string]: any;
    constructor(obj: IMarker & {
        id: string;
    }, mapId: string);
    get(key: string): any;
    set(key: string, value: any): void;
    setIcon(icon: MarkerIcon): Promise<void>;
    setIconAnchor(x: number, y: number): Promise<void>;
    setZIndex(zIndex: number): Promise<void>;
    setVisible(isVisible: boolean): Promise<void>;
    getPosition(): Promise<LatLng>;
    isRemoved(): Promise<boolean>;
    remove(): Promise<void>;
}
export interface ICameraIdleCallbackData extends CameraIdleCallbackData {
    nearLeft: LatLng;
    nearRight: LatLng;
    farLeft: LatLng;
    farRight: LatLng;
}
export interface CameraMoveCallbackData {
    mapId: string;
}
export interface PoiClickCallbackData {
    mapId: string;
    poiId: string;
    latitude: number;
    longitude: number;
}
export interface VisibleRegion {
    nearLeft: LatLng;
    nearRight: LatLng;
    farLeft: LatLng;
    farRight: LatLng;
    southwest: LatLng;
    northeast: LatLng;
}
export interface GoogleMapZoomOptions {
    /**
     * The minimum zoom level of the map.
     */
    minZoom?: number;
    /**
     * The maximum zoom level of the map.
     */
    maxZoom?: number;
}
export interface GoogleMapControls {
    compass?: boolean;
    myLocationButton?: boolean;
    myLocation?: boolean;
    indoorPicker?: boolean;
    zoom?: boolean;
    mapToolbar?: boolean;
}
export interface GoogleMapGestures {
    scroll?: boolean;
    zoom?: boolean;
    tilt?: boolean;
    rotate?: boolean;
}
export interface GoogleMapPreferences {
    padding?: MapPadding;
    building?: boolean;
    gestureBounds?: LatLng[];
    zoom?: GoogleMapZoomOptions;
}
export interface GoogleMapsOptions {
    mapType?: MapType;
    controls?: GoogleMapControls;
    gestures?: GoogleMapGestures;
    styles?: any[];
    camera?: CameraPosition;
    preferences?: GoogleMapPreferences;
}
