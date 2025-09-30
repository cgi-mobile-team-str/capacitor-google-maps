import { CameraPosition, MapPadding, MapListenerCallback, MapReadyCallbackData, CameraIdleCallbackData, CameraMoveStartedCallbackData, ClusterClickCallbackData, MapClickCallbackData, MarkerClickCallbackData, MyLocationButtonClickCallbackData, Polygon, PolygonClickCallbackData, CircleClickCallbackData, PolylineCallbackData, VisibleRegion, GoogleMapsOptions, CapacitorMarker, MarkerOptions, PolylineOptions, CapacitorPolyline, ILatLng, CircleOptions, CapacitorCircle, PolygonOptions, CapacitorPolygon, PoiClickCallbackData, CameraMoveCallbackData, GoogleMapsEvent } from './definitions';
import { LatLngBounds, GoogleMapsMapTypeId } from './definitions';
import { CreateMapArgs } from './implementation';
import { Observable } from 'rxjs';
export interface GoogleMapInterface {
    create(options: CreateMapArgs, callback?: MapListenerCallback<MapReadyCallbackData>): Promise<GoogleMap>;
    enableTouch(): Promise<void>;
    disableTouch(): Promise<void>;
    enableClustering(
    /**
     * The minimum number of markers that can be clustered together. The default is 4 markers.
     */
    minClusterSize?: number): Promise<void>;
    disableClustering(): Promise<void>;
    addMarker(options: MarkerOptions): Promise<CapacitorMarker>;
    addMarkers(optionsList: MarkerOptions[]): Promise<CapacitorMarker[]>;
    removeMarker(id: string): Promise<void>;
    removeMarkers(ids: string[]): Promise<void>;
    addPolygons(polygons: Polygon[]): Promise<string[]>;
    removePolygons(ids: string[]): Promise<void>;
    addCircles(optionsList: CircleOptions[]): Promise<CapacitorCircle[]>;
    addCircle(options: CircleOptions): Promise<CapacitorCircle>;
    removeCircles(ids: string[]): Promise<void>;
    addPolylines(optionsList: PolylineOptions[]): Promise<CapacitorPolyline[]>;
    addPolyline(options: PolylineOptions): Promise<CapacitorPolyline>;
    removePolylines(ids: string[]): Promise<void>;
    destroy(): Promise<void>;
    moveCamera(config: CameraPosition): Promise<void>;
    animateCamera(config: CameraPosition): Promise<void>;
    /**
     * Get current map type
     */
    getMapType(): Promise<GoogleMapsMapTypeId>;
    setMapType(mapType: GoogleMapsMapTypeId): Promise<void>;
    enableIndoorMaps(enabled: boolean): Promise<void>;
    enableTrafficLayer(enabled: boolean): Promise<void>;
    enableAccessibilityElements(enabled: boolean): Promise<void>;
    enableCurrentLocation(enabled: boolean): Promise<void>;
    setPadding(padding: MapPadding): Promise<void>;
    /**
     * Get the map's current viewport latitude and longitude bounds.
     *
     * @returns {LatLngBounds}
     */
    getMapBounds(): Promise<LatLngBounds>;
    /**
     * Sets the map viewport to contain the given bounds.
     * @param bounds The bounds to fit in the viewport.
     * @param padding Optional padding to apply in pixels. The bounds will be fit in the part of the map that remains after padding is removed.
     */
    fitBounds(bounds: LatLngBounds, padding?: number): Promise<void>;
    setOnBoundsChangedListener(callback?: MapListenerCallback<CameraIdleCallbackData>): Promise<void>;
    setOnCameraIdleListener(callback?: MapListenerCallback<CameraIdleCallbackData>): Promise<void>;
    setOnCameraMoveStartedListener(callback?: MapListenerCallback<CameraMoveStartedCallbackData>): Promise<void>;
    setOnCameraMoveListener(callback?: MapListenerCallback<CameraMoveCallbackData>): Promise<void>;
    setOnClusterClickListener(callback?: MapListenerCallback<ClusterClickCallbackData>): Promise<void>;
    setOnClusterInfoWindowClickListener(callback?: MapListenerCallback<ClusterClickCallbackData>): Promise<void>;
    setOnInfoWindowClickListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void>;
    setOnMapClickListener(callback?: MapListenerCallback<MapClickCallbackData>): Promise<void>;
    setOnMapReadyListener(callback?: MapListenerCallback<MapReadyCallbackData>): Promise<void>;
    setOnMarkerClickListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void>;
    setOnPolygonClickListener(callback?: MapListenerCallback<PolygonClickCallbackData>): Promise<void>;
    setOnPoiClickListener(callback?: MapListenerCallback<PoiClickCallbackData>): Promise<void>;
    setOnCircleClickListener(callback?: MapListenerCallback<CircleClickCallbackData>): Promise<void>;
    setOnPolylineClickListener(callback?: MapListenerCallback<PolylineCallbackData>): Promise<void>;
    setOnMarkerDragStartListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void>;
    setOnMarkerDragListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void>;
    setOnMarkerDragEndListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void>;
    setOnMyLocationButtonClickListener(callback?: MapListenerCallback<MyLocationButtonClickCallbackData>): Promise<void>;
    setOnMyLocationClickListener(callback?: MapListenerCallback<MapClickCallbackData>): Promise<void>;
    getVisibleRegion(): Promise<VisibleRegion>;
    enableCompass(enabled: boolean): Promise<void>;
    enableToolbar(isEnabled: boolean): Promise<void>;
    enableMyLocation(isEnabled: boolean): Promise<void>;
    enableAllGestures(isEnabled: boolean): Promise<void>;
    enableTiltGesture(isEnabled: boolean): Promise<void>;
    enableTiltRotateGesture(isEnabled: boolean): Promise<void>;
    setMapPreferences(padding?: MapPadding, building?: boolean): Promise<void>;
    setCameraBearing(bearing: number): Promise<void>;
    setOptions(config: GoogleMapsOptions): Promise<void>;
    getCameraZoom(): Promise<number>;
    setCameraTarget(target: ILatLng | ILatLng[]): Promise<void>;
    getCameraTarget(): Promise<ILatLng>;
    fromPointToLatLng(points: number[]): Promise<ILatLng>;
    on(event: GoogleMapsEvent): Observable<any>;
}
export declare class GoogleMap {
    private id;
    private element;
    private resizeObserver;
    private onBoundsChangedListener?;
    private onCameraIdleListener?;
    private onCameraMoveStartedListener?;
    private onCameraMoveListener?;
    private onClusterClickListener?;
    private onClusterInfoWindowClickListener?;
    private onInfoWindowClickListener?;
    private onMapClickListener?;
    private onMapReadyListener?;
    private onPolylineClickListener?;
    private onMarkerClickListener?;
    private onPolygonClickListener?;
    private onPoiClickListener?;
    private onCircleClickListener?;
    private onMarkerDragStartListener?;
    private onMarkerDragListener?;
    private onMarkerDragEndListener?;
    private onMyLocationButtonClickListener?;
    private onMyLocationClickListener?;
    private constructor();
    /**
     * Creates a new instance of a Google Map
     * @param options
     * @param callback
     * @returns GoogleMap
     */
    static create(options: CreateMapArgs, callback?: MapListenerCallback<MapReadyCallbackData>): Promise<GoogleMap>;
    private static getElementBounds;
    /**
     * Enable touch events on native map
     *
     * @returns void
     */
    enableTouch(): Promise<void>;
    /**
     * Disable touch events on native map
     *
     * @returns void
     */
    disableTouch(): Promise<void>;
    /**
     * Enable marker clustering
     *
     * @param minClusterSize - The minimum number of markers that can be clustered together.
     * @defaultValue 4
     *
     * @returns void
     */
    enableClustering(minClusterSize?: number): Promise<void>;
    /**
     * Disable marker clustering
     *
     * @returns void
     */
    disableClustering(): Promise<void>;
    /**
     * Adds a marker to the map
     *
     * @param marker
     * @returns created marker id
     */
    addMarker(options: MarkerOptions): Promise<CapacitorMarker>;
    /**
     * Adds multiple markers to the map
     *
     * @param markers
     * @returns array of created marker IDs
     */
    addMarkers(optionsList: MarkerOptions[]): Promise<CapacitorMarker[]>;
    /**
     * Remove marker from the map
     *
     * @param id id of the marker to remove from the map
     * @returns
     */
    removeMarker(id: string): Promise<void>;
    /**
     * Remove markers from the map
     *
     * @param ids array of ids to remove from the map
     * @returns
     */
    removeMarkers(ids: string[]): Promise<void>;
    clearMarkers(): Promise<void>;
    addPolygons(optionsList: PolygonOptions[]): Promise<CapacitorPolygon[]>;
    addPolygon(options: PolygonOptions): Promise<CapacitorPolygon>;
    addPolylines(optionsList: PolylineOptions[]): Promise<CapacitorPolyline[]>;
    addPolyline(options: PolylineOptions): Promise<CapacitorPolyline>;
    removePolygons(ids: string[]): Promise<void>;
    addCircles(optionsList: CircleOptions[]): Promise<CapacitorCircle[]>;
    addCircle(options: CircleOptions): Promise<CapacitorCircle>;
    removeCircles(ids: string[]): Promise<void>;
    removePolylines(ids: string[]): Promise<void>;
    /**
     * Destroy the current instance of the map
     */
    destroy(): Promise<void>;
    /**
     * Update the map camera configuration with animation
     *
     * @param config
     * @returns
     */
    animateCamera(config: CameraPosition): Promise<void>;
    /**
     * Update the map camera configuration without animation
     *
     * @param config
     * @returns
     */
    moveCamera(config: CameraPosition): Promise<void>;
    /**
     * Update the map camera bearing
     *
     * @param bearing
     * @returns
     */
    setCameraBearing(bearing: number): Promise<void>;
    setCameraTarget(target: ILatLng | ILatLng[]): Promise<void>;
    setOptions(config: GoogleMapsOptions): Promise<void>;
    getMapType(): Promise<GoogleMapsMapTypeId>;
    getCameraZoom(): Promise<number>;
    getCameraTarget(): Promise<ILatLng>;
    fromPointToLatLng(points: number[]): Promise<ILatLng>;
    /**
     * Sets the type of map tiles that should be displayed.
     *
     * @param mapType
     * @returns
     */
    setMapType(mapType: GoogleMapsMapTypeId): Promise<void>;
    /**
     * Sets whether indoor maps are shown, where available.
     *
     * @param enabled
     * @returns
     */
    enableIndoorMaps(enabled: boolean): Promise<void>;
    /**
     * Controls whether the map is drawing traffic data, if available.
     *
     * @param enabled
     * @returns
     */
    enableTrafficLayer(enabled: boolean): Promise<void>;
    /**
     * Show accessibility elements for overlay objects, such as Marker and Polyline.
     *
     * Only available on iOS.
     *
     * @param enabled
     * @returns
     */
    enableAccessibilityElements(enabled: boolean): Promise<void>;
    /**
     * Set whether the My Location dot and accuracy circle is enabled.
     *
     * @param enabled
     * @returns
     */
    enableCurrentLocation(enabled: boolean): Promise<void>;
    /**
     * Set padding on the 'visible' region of the view.
     *
     * @param padding
     * @returns
     */
    setPadding(padding: MapPadding): Promise<void>;
    /**
     * Get the map's current viewport latitude and longitude bounds.
     *
     * @returns {LatLngBounds}
     */
    getMapBounds(): Promise<LatLngBounds>;
    /**
     * Get the current Viewport
     *
     * @returns {VisibleRegion}
     */
    getVisibleRegion(): Promise<VisibleRegion>;
    /**
     * Enable or disable the compass
     *
     * @returns
     */
    enableCompass(enabled: boolean): Promise<void>;
    enableToolbar(isEnabled: boolean): Promise<void>;
    enableMyLocation(isEnabled: boolean): Promise<void>;
    enableAllGestures(isEnabled: boolean): Promise<void>;
    enableTiltGesture(isEnabled: boolean): Promise<void>;
    enableTiltRotateGesture(isEnabled: boolean): Promise<void>;
    setMapPreferences(padding?: MapPadding, building?: boolean): Promise<void>;
    fitBounds(bounds: LatLngBounds, padding?: number): Promise<void>;
    initScrolling(): void;
    disableScrolling(): void;
    handleScrollEvent: () => void;
    private updateMapBounds;
    /**
     * Set the event listener on the map for 'onCameraIdle' events.
     *
     * @param callback
     * @returns
     */
    setOnCameraIdleListener(callback?: MapListenerCallback<CameraIdleCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onBoundsChanged' events.
     *
     * @param callback
     * @returns
     */
    setOnBoundsChangedListener(callback?: MapListenerCallback<CameraIdleCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onCameraMoveStarted' events.
     *
     * @param callback
     * @returns
     */
    setOnCameraMoveStartedListener(callback?: MapListenerCallback<CameraMoveStartedCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onCameraMove' events.
     *
     * @param callback
     * @returns
     */
    setOnCameraMoveListener(callback?: MapListenerCallback<CameraMoveCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onClusterClick' events.
     *
     * @param callback
     * @returns
     */
    setOnClusterClickListener(callback?: MapListenerCallback<ClusterClickCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onClusterInfoWindowClick' events.
     *
     * @param callback
     * @returns
     */
    setOnClusterInfoWindowClickListener(callback?: MapListenerCallback<ClusterClickCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onInfoWindowClick' events.
     *
     * @param callback
     * @returns
     */
    setOnInfoWindowClickListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onMapClick' events.
     *
     * @param callback
     * @returns
     */
    setOnMapClickListener(callback?: MapListenerCallback<MapClickCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onMapReady' events.
     *
     * @param callback
     * @returns
     */
    setOnMapReadyListener(callback?: MapListenerCallback<MapReadyCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onPolygonClick' events.
     *
     * @param callback
     * @returns
     */
    setOnPolygonClickListener(callback?: MapListenerCallback<PolygonClickCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onPoiClick' events.
     *
     * @param callback
     * @returns
     */
    setOnPoiClickListener(callback?: MapListenerCallback<PoiClickCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onCircleClick' events.
     *
     * @param callback
     * @returns
     */
    setOnCircleClickListener(callback?: MapListenerCallback<CircleClickCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onMarkerClick' events.
     *
     * @param callback
     * @returns
     */
    setOnMarkerClickListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onPolylineClick' events.
     *
     * @param callback
     * @returns
     */
    setOnPolylineClickListener(callback?: MapListenerCallback<PolylineCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onMarkerDragStart' events.
     *
     * @param callback
     * @returns
     */
    setOnMarkerDragStartListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onMarkerDrag' events.
     *
     * @param callback
     * @returns
     */
    setOnMarkerDragListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onMarkerDragEnd' events.
     *
     * @param callback
     * @returns
     */
    setOnMarkerDragEndListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onMyLocationButtonClick' events.
     *
     * @param callback
     * @returns
     */
    setOnMyLocationButtonClickListener(callback?: MapListenerCallback<MyLocationButtonClickCallbackData>): Promise<void>;
    /**
     * Set the event listener on the map for 'onMyLocationClick' events.
     *
     * @param callback
     * @returns
     */
    setOnMyLocationClickListener(callback?: MapListenerCallback<MapClickCallbackData>): Promise<void>;
    /**
     * Remove all event listeners on the map.
     *
     * @param callback
     * @returns
     */
    removeAllMapListeners(): Promise<void>;
    on(event: GoogleMapsEvent): Observable<any>;
    private onPromise;
    private generateCallback;
}
