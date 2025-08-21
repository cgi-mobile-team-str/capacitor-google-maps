/**
 * An interface representing the viewports latitude and longitude bounds.
 */
export interface ILatLngBounds {
    southwest: ILatLng;
    center: ILatLng;
    northeast: ILatLng;
}
export declare class LatLngBounds {
    southwest: ILatLng;
    center: ILatLng;
    northeast: ILatLng;
    constructor(bounds: ILatLngBounds);
    constructor(points: ILatLng[]);
    contains(point: ILatLng): Promise<boolean>;
    extend(point: ILatLng): Promise<LatLngBounds>;
}
/**
 * An interface representing a pair of latitude and longitude coordinates.
 */
export interface ILatLng {
    /**
     * Coordinate latitude, in degrees. This value is in the range [-90, 90].
     */
    lat: number;
    /**
     * Coordinate longitude, in degrees. This value is in the range [-180, 180].
     */
    lng: number;
}
export declare class LatLng implements ILatLng {
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
export interface Polygon extends google.maps.PolygonOptions {
    shapes: ILatLng[][];
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWidth?: number;
    fillColor?: string;
    fillOpacity?: number;
    geodesic?: boolean;
    clickable?: boolean;
    /**
     * Title, a short description of the overlay. Some overlays, such as markers, will display the title on the map. The title is also the default accessibility text.
     *
     * Only available on iOS.
     */
    title?: string;
    tag?: string;
}
export interface PolygonOptions {
    points: ILatLng[][];
    visible?: boolean;
    strokeColor?: string;
    strokeWidth?: number;
    fillColor?: string;
    zIndex?: number;
}
export declare class CapacitorPolygon implements Polygon {
    mapId: string;
    id: string;
    shapes: ILatLng[][];
    visible?: boolean | undefined | null;
    strokeColor?: string;
    strokeWidth?: number;
    fillColor?: string;
    zIndex?: number | undefined | null;
    constructor(obj: Polygon & {
        id: string;
    }, mapId: string);
    remove(): Promise<void>;
}
/**
 * For web, all the javascript Circle options are available as
 * Polygon extends google.maps.CircleOptions.
 * For iOS and Android only the config options declared on Circle are available.
 */
export interface Circle extends google.maps.CircleOptions {
    center: ILatLng;
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWidth?: number;
    geodesic?: boolean;
    clickable?: boolean;
    visible?: boolean;
    /**
     * Title, a short description of the overlay. Some overlays, such as markers, will display the title on the map. The title is also the default accessibility text.
     *
     * Only available on iOS.
     */
    title?: string;
    tag?: string;
}
export interface CircleOptions {
    center: ILatLng;
    radius: number;
    strokeWidth?: number;
    strokeColor?: string;
    fillColor?: string;
    clickable?: boolean;
    visible?: boolean;
    zIndex?: number;
}
export declare class CapacitorCircle implements Circle {
    mapId: string;
    id: string;
    center: ILatLng;
    radius: number;
    strokeColor?: string;
    fillColor?: string;
    strokeWidth?: number;
    zIndex?: number | undefined | null;
    visible?: boolean | undefined;
    clickable?: boolean;
    constructor(obj: Circle & {
        id: string;
    }, mapId: string);
    setCenter(center: ILatLng): Promise<void>;
    remove(): Promise<void>;
}
/**
 * For web, all the javascript Polyline options are available as
 * Polyline extends google.maps.PolylineOptions.
 * For iOS and Android only the config options declared on Polyline are available.
 */
export interface Polyline extends google.maps.PolylineOptions {
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWidth?: number;
    geodesic?: boolean;
    clickable?: boolean;
    isVisible?: boolean;
    tag?: string;
    /**
     * Used to specify the color of one or more segments of a polyline. The styleSpans property is an array of StyleSpan objects.
     * Setting the spans property is the preferred way to change the color of a polyline.
     *
     * Only on iOS and Android.
     */
    styleSpans?: StyleSpan[];
    /**
     * Accept own properties
     * You can get the property later using `get()` method.
     */
    [key: string]: any;
}
export interface PolylineOptions {
    points: ILatLng[];
    visible?: boolean;
    geodesic?: boolean;
    color?: string;
    width?: number;
    zIndex?: number;
    clickable?: boolean;
    [key: string]: any;
}
export declare class CapacitorPolyline implements Polyline {
    mapId: string;
    id: string;
    points: ILatLng[] | null | undefined;
    visible?: boolean | null;
    geodesic?: boolean;
    strokeColor?: string;
    strokeWidth?: number;
    zIndex?: number | null;
    clickable?: boolean;
    [key: string]: any;
    constructor(obj: Polyline & {
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
 * Describes the style for some region of a polyline.
 */
export interface StyleSpan {
    /**
     * The stroke color. All CSS3 colors are supported except for extended named colors.
     */
    color: string;
    /**
     * The length of this span in number of segments.
     */
    segments?: number;
}
/**
 * For web, all the javascript Google Maps options are available as
 * GoogleMapConfig extends google.maps.MapOptions.
 * For iOS and Android only the config options declared on GoogleMapConfig are available.
 */
export interface GoogleMapConfig extends Omit<google.maps.MapOptions, 'styles'> {
    /**
     * Override width for native map.
     */
    width?: number;
    /**
     * Override height for native map.
     */
    height?: number;
    /**
     * Override absolute x coordinate position for native map.
     */
    x?: number;
    /**
     * Override absolute y coordinate position for native map.
     */
    y?: number;
    /**
     * Enables image-based lite mode on Android.
     *
     * @default false
     */
    androidLiteMode?: boolean;
    /**
     * Override pixel ratio for native map.
     */
    devicePixelRatio?: number;
    /**
     * Styles to apply to each of the default map types. Note that for
     * satellite, hybrid and terrain modes,
     * these styles will only apply to labels and geometry.
     *
     * @since 4.3.0
     */
    styles?: string | null;
    /**
     * A map id associated with a specific map style or feature.
     *
     * [Use Map IDs](https://developers.google.com/maps/documentation/get-map-id)
     *
     * Only for Web.
     *
     * @since 5.4.0
     */
    mapId?: string;
    /**
     * A map id associated with a specific map style or feature.
     *
     * [Use Map IDs](https://developers.google.com/maps/documentation/get-map-id)
     *
     * Only for Android.
     *
     * @since 5.4.0
     */
    androidMapId?: string;
    /**
     * A map id associated with a specific map style or feature.
     *
     * [Use Map IDs](https://developers.google.com/maps/documentation/get-map-id)
     *
     * Only for iOS.
     *
     * @since 5.4.0
     */
    iOSMapId?: string;
    controls?: GoogleMapControls;
    gestures?: GoogleMapGestures;
    camera?: CameraPosition;
    preferences?: GoogleMapPreferences;
}
/**
 * Configuration properties for a Google Map Camera
 */
export interface CameraPosition {
    /**
     * Location on the Earth towards which the camera points or multiple locations towards which the camera points in the center .
     */
    target?: ILatLng | ILatLng[];
    /**
     * Sets the zoom of the map.
     */
    zoom?: number;
    /**
     * Bearing of the camera, in degrees clockwise from true north.
     *
     * @default 0
     */
    bearing?: number;
    /**
     * The angle, in degrees, of the camera from the nadir (directly facing the Earth).
     *
     * The only allowed values are 0 and 45.
     *
     * @default 0
     */
    tilt?: number;
    /**
     * This configuration option is not being used.
     */
    duration?: number;
}
export declare enum GoogleMapsMapTypeId {
    /**
     * Basic map.
     */
    Normal = "Normal",
    /**
     * Satellite imagery with roads and labels.
     */
    Hybrid = "Hybrid",
    /**
     * Satellite imagery with no labels.
     */
    Satellite = "Satellite",
    /**
     * Topographic data.
     */
    Terrain = "Terrain",
    /**
     * No base map tiles.
     */
    None = "None"
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
export interface Marker {
    /**
     * Marker position
     */
    coordinate: ILatLng;
    /**
     * Sets the opacity of the marker, between 0 (completely transparent) and 1 inclusive.
     *
     * @default 1
     */
    opacity?: number;
    /**
     * Title, a short description of the overlay.
     */
    title?: string;
    /**
     * Snippet text, shown beneath the title in the info window when selected.
     */
    snippet?: string;
    /**
     * Controls whether this marker should be flat against the Earth's surface or a billboard facing the camera.
     *
     * @default false
     */
    isFlat?: boolean;
    /**
     * Path to a marker icon to render. It can be relative to the web app public directory,
     * or a https url of a remote marker icon.
     *
     * **SVGs are not supported on native platforms.**
     *
     * @usage
     * ```typescript
     * {
     * ...
     *  iconUrl: 'assets/icon/pin.png',
     *  ...
     * }
     * ```
     *
     * @since 4.2.0
     */
    iconUrl?: string;
    /**
     * Controls the scaled size of the marker image set in `iconUrl`.
     *
     * @since 4.2.0
     */
    iconSize?: Size;
    /**
     * The position of the image within a sprite, if any. By default, the origin is located at the top left corner of the image .
     *
     * @since 4.2.0
     */
    iconOrigin?: Point;
    /**
     * The position at which to anchor an image in correspondence to the location of the marker on the map. By default, the anchor is located along the center point of the bottom of the image.
     *
     * @since 4.2.0
     */
    iconAnchor?: Point;
    /**
     * Customizes the color of the default marker image.  Each value must be between 0 and 255.
     *
     * Only for iOS and Android.
     *
     * @since 4.2.0
     */
    tintColor?: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    /**
     * Controls whether this marker can be dragged interactively
     *
     * @default false
     */
    draggable?: boolean;
    /**
     * Specifies the stack order of this marker, relative to other markers on the map.
     * A marker with a high z-index is drawn on top of markers with lower z-indexes
     *
     * @default 0
     */
    zIndex?: number;
    isVisible?: boolean;
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
    position: ILatLng;
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
    [key: string]: any;
}
export interface MarkerIcon {
    url?: string;
    size?: Size;
}
export declare class CapacitorMarker implements Marker {
    mapId: string;
    id: string;
    coordinate: ILatLng;
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
    [key: string]: any;
    constructor(obj: Marker & {
        id: string;
    }, mapId: string);
    get(key: string): any;
    set(key: string, value: any): void;
    setIcon(icon: MarkerIcon): Promise<void>;
    setIconAnchor(x: number, y: number): Promise<void>;
    setZIndex(zIndex: number): Promise<void>;
    setVisible(isVisible: boolean): Promise<void>;
    getPosition(): Promise<ILatLng>;
    isRemoved(): Promise<boolean>;
    remove(): Promise<void>;
}
/**
 * The callback function to be called when map events are emitted.
 */
export type MapListenerCallback<T> = (data: T) => void;
export interface MapReadyCallbackData {
    mapId: string;
}
export interface MarkerCallbackData {
    markerId: string;
    latitude: number;
    longitude: number;
    title: string;
    snippet: string;
}
export interface PolylineCallbackData {
    polylineId: string;
    tag?: string;
}
export interface CameraIdleCallbackData {
    mapId: string;
    bounds: LatLngBounds;
    bearing: number;
    latitude: number;
    longitude: number;
    tilt: number;
    zoom: number;
    nearLeft: ILatLng;
    nearRight: ILatLng;
    farLeft: ILatLng;
    farRight: ILatLng;
}
export interface CameraMoveStartedCallbackData {
    mapId: string;
    isGesture: boolean;
}
export interface CameraMoveCallbackData {
    mapId: string;
}
export interface ClusterClickCallbackData {
    mapId: string;
    latitude: number;
    longitude: number;
    size: number;
    items: MarkerCallbackData[];
}
export interface MapClickCallbackData {
    mapId: string;
    latitude: number;
    longitude: number;
}
export interface MarkerClickCallbackData extends MarkerCallbackData {
    mapId: string;
}
export interface PolygonClickCallbackData {
    mapId: string;
    polygonId: string;
    tag?: string;
}
export interface PoiClickCallbackData {
    mapId: string;
    poiId: string;
    latitude: number;
    longitude: number;
}
export interface CircleClickCallbackData {
    mapId: string;
    circleId: string;
    tag?: string;
}
export interface MyLocationButtonClickCallbackData {
    mapId: string;
}
export interface VisibleRegion {
    nearLeft: ILatLng;
    nearRight: ILatLng;
    farLeft: ILatLng;
    farRight: ILatLng;
    southwest: ILatLng;
    northeast: ILatLng;
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
    gestureBounds?: ILatLng[];
    zoom?: GoogleMapZoomOptions;
}
export interface GoogleMapsOptions {
    mapType?: GoogleMapsMapTypeId;
    controls?: GoogleMapControls;
    gestures?: GoogleMapGestures;
    styles?: any[];
    camera?: CameraPosition;
    preferences?: GoogleMapPreferences;
}
