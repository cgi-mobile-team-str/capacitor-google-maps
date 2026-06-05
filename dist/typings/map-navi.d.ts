import { MarkerOptions, CapacitorMarker, CircleOptions, CapacitorCircle, PolylineOptions, CapacitorPolyline, CameraMoveCallbackData, GoogleMapsOptions, CapacitorPolygon, PolygonOptions } from './definitions';
import { LatLng, MapListenerCallback, Marker, Circle, Polyline, MapReadyCallbackData } from './original-plugin/definitions';
import { GoogleMap, GoogleMapInterface } from './original-plugin/map';
import type { CreateMapArgs } from './implementation';
export interface GoogleMapInterfaceNavi extends Omit<GoogleMapInterface, 'addMarker' | 'addMarkers' | 'addCircles' | 'addPolylines'> {
    addMarker(marker: Marker): Promise<string>;
    addMarker(options: MarkerOptions): Promise<CapacitorMarker>;
    addMarkers(markers: Marker[]): Promise<string[]>;
    addMarkers(optionsList: MarkerOptions[]): Promise<CapacitorMarker[]>;
    addCircles(circles: Circle[]): Promise<string[]>;
    addCircles(optionsList: CircleOptions[]): Promise<CapacitorCircle[]>;
    addPolylines(polylines: Polyline[]): Promise<string[]>;
    addPolylines(optionsList: PolylineOptions[]): Promise<CapacitorPolyline[]>;
    addPolygon(options: PolygonOptions): Promise<CapacitorPolygon>;
    addPolyline(options: PolylineOptions): Promise<CapacitorPolyline>;
    setOnCameraMoveListener(callback?: MapListenerCallback<CameraMoveCallbackData>): Promise<void>;
    enableAllGestures(isEnabled: boolean): Promise<void>;
    setOptions(config: GoogleMapsOptions): Promise<void>;
    getCameraZoom(): Promise<number>;
    fromPointToLatLng(points: number[]): Promise<LatLng>;
}
export declare class GoogleMapNavi extends GoogleMap {
    private onCameraMoveListener?;
    constructor(id: string);
    static create(options: CreateMapArgs, callback?: MapListenerCallback<MapReadyCallbackData>): Promise<GoogleMapNavi>;
    addMarker(marker: Marker): Promise<string>;
    addMarker(options: MarkerOptions): Promise<CapacitorMarker>;
    /**
     * Adds multiple markers to the map
     *
     * @param markers
     * @returns array of created marker IDs
     */
    addMarkers(markers: Marker[]): Promise<string[]>;
    addMarkers(optionsList: MarkerOptions[]): Promise<CapacitorMarker[]>;
    addPolygon(options: PolygonOptions): Promise<CapacitorPolygon>;
    addPolylines(polylines: Polyline[]): Promise<string[]>;
    addPolylines(optionsList: PolylineOptions[]): Promise<CapacitorPolyline[]>;
    addPolyline(options: PolylineOptions): Promise<CapacitorPolyline>;
    addCircles(circles: Circle[]): Promise<string[]>;
    addCircles(optionsList: CircleOptions[]): Promise<CapacitorCircle[]>;
    setOptions(config: GoogleMapsOptions): Promise<void>;
    getCameraZoom(): Promise<number>;
    fromPointToLatLng(points: number[]): Promise<LatLng>;
    enableAllGestures(isEnabled: boolean): Promise<void>;
    /**
     * Set the event listener on the map for 'onCameraMove' events.
     *
     * @param callback
     * @returns
     */
    setOnCameraMoveListener(callback?: MapListenerCallback<CameraMoveCallbackData>): Promise<void>;
    private markerToOptions;
    private isLegacyMarker;
    private isLegacyCircle;
    private circleToOptions;
    private polylineToOptions;
}
