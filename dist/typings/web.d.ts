import { WebPlugin } from '@capacitor/core';
import type { LatLng, MapPadding, Marker, Polyline, VisibleRegion } from './definitions';
import { LatLngBounds } from './definitions';
import type { AddMarkerArgs, CameraArgs, AddMarkersArgs, CapacitorGoogleMapsPlugin, CreateMapArgs, CurrentLocArgs, DestroyMapArgs, MapTypeArgs, PaddingArgs, RemoveMarkerArgs, TrafficLayerArgs, RemoveMarkersArgs, MapBoundsContainsArgs, EnableClusteringArgs, FitBoundsArgs, MapBoundsExtendArgs, AddPolygonsArgs, RemovePolygonsArgs, AddCirclesArgs, RemoveCirclesArgs, AddPolylinesArgs, RemovePolylinesArgs, EnableCompassArgs, MapOptionsArgs, MarkerIconArgs, MarkerIconAnchorArgs, MarkerZIndexArgs, MarkerPositionArgs, MarkerVisibilityArgs, AddPolylineArgs, PolylineStrokeColorArgs, PolylineStrokeWidthArgs, RemovePolylineArgs, SetCameraTargetArgs } from './implementation';
export declare class CapacitorGoogleMapsWeb extends WebPlugin implements CapacitorGoogleMapsPlugin {
    private gMapsRef;
    private AdvancedMarkerElement;
    private maps;
    private currPolygonId;
    private currCircleId;
    private currMapId;
    private onClusterClickHandler;
    private getIdFromMap;
    private getIdFromMarker;
    private importGoogleLib;
    enableTouch(_args: {
        id: string;
    }): Promise<void>;
    disableTouch(_args: {
        id: string;
    }): Promise<void>;
    moveCamera(_args: CameraArgs): Promise<void>;
    animateCamera(_args: CameraArgs): Promise<void>;
    getMapType(_args: {
        id: string;
    }): Promise<{
        type: string;
    }>;
    setMapType(_args: MapTypeArgs): Promise<void>;
    enableIndoorMaps(): Promise<void>;
    enableTrafficLayer(_args: TrafficLayerArgs): Promise<void>;
    enableAccessibilityElements(): Promise<void>;
    dispatchMapEvent(): Promise<void>;
    enableCurrentLocation(_args: CurrentLocArgs): Promise<void>;
    setPadding(_args: PaddingArgs): Promise<void>;
    getMapBounds(_args: {
        id: string;
    }): Promise<LatLngBounds>;
    fitBounds(_args: FitBoundsArgs): Promise<void>;
    removeMarkers(_args: RemoveMarkersArgs): Promise<void>;
    removeMarker(_args: RemoveMarkerArgs): Promise<void>;
    addPolygons(args: AddPolygonsArgs): Promise<{
        ids: string[];
    }>;
    removePolygons(args: RemovePolygonsArgs): Promise<void>;
    addCircles(args: AddCirclesArgs): Promise<{
        ids: string[];
    }>;
    removeCircles(args: RemoveCirclesArgs): Promise<void>;
    removePolylines(args: RemovePolylinesArgs): Promise<void>;
    enableClustering(_args: EnableClusteringArgs): Promise<void>;
    disableClustering(_args: {
        id: string;
    }): Promise<void>;
    onScroll(): Promise<void>;
    onResize(): Promise<void>;
    onDisplay(): Promise<void>;
    create(_args: CreateMapArgs): Promise<void>;
    destroy(_args: DestroyMapArgs): Promise<void>;
    mapBoundsContains(_args: MapBoundsContainsArgs): Promise<{
        contains: boolean;
    }>;
    mapBoundsExtend(_args: MapBoundsExtendArgs): Promise<{
        bounds: LatLngBounds;
    }>;
    private getLatLngBounds;
    setCircleListeners(mapId: string, circleId: string, circle: google.maps.Circle): Promise<void>;
    setPolygonListeners(mapId: string, polygonId: string, polygon: google.maps.Polygon): Promise<void>;
    setPolylineListeners(mapId: string, polylineId: string, polyline: google.maps.Polyline): Promise<void>;
    setMarkerListeners(mapId: string, markerId: string, marker: google.maps.marker.AdvancedMarkerElement): Promise<void>;
    setMapListeners(mapId: string): Promise<void>;
    getVisibleRegion(): Promise<VisibleRegion>;
    enableCompass(_args: EnableCompassArgs): Promise<void>;
    enableToolbar(_args: {
        id: string;
        isEnabled: boolean;
    }): Promise<void>;
    enableMyLocation(_args: {
        id: string;
        isEnabled: boolean;
    }): Promise<void>;
    enableAllGestures(_args: {
        id: string;
        isEnabled: boolean;
    }): Promise<void>;
    enableTiltGesture(_args: {
        id: string;
        isEnabled: boolean;
    }): Promise<void>;
    enableTiltRotateGesture(_args: {
        id: string;
        isEnabled: boolean;
    }): Promise<void>;
    setMapPreferences(_args: {
        id: string;
        padding?: MapPadding;
        isBuildingsEnabled?: boolean;
    }): Promise<void>;
    setCameraBearing(_args: {
        id: string;
        bearing: number;
    }): Promise<void>;
    setOptions(_args: MapOptionsArgs): Promise<void>;
    getCameraZoom(_args: {
        id: string;
    }): Promise<{
        cameraZoom: number;
    }>;
    addMarker(_args: AddMarkerArgs): Promise<Marker & {
        id: string;
    }>;
    addMarkers(_args: AddMarkersArgs): Promise<{
        markers: (Marker & {
            id: string;
        })[];
    }>;
    setMarkerIcon(_args: MarkerIconArgs): Promise<void>;
    setMarkerIconAnchor(_args: MarkerIconAnchorArgs): Promise<void>;
    setMarkerZIndex(_args: MarkerZIndexArgs): Promise<void>;
    setMarkerVisibility(_args: MarkerVisibilityArgs): Promise<void>;
    getMarkerPosition(_args: MarkerPositionArgs): Promise<{
        position: LatLng;
    }>;
    addPolyline(_args: AddPolylineArgs): Promise<Polyline & {
        id: string;
    }>;
    setPolylineStrokeColor(_args: PolylineStrokeColorArgs): Promise<void>;
    setPolylineStrokeWidth(_args: PolylineStrokeWidthArgs): Promise<void>;
    removePolyline(_args: RemovePolylineArgs): Promise<void>;
    addPolylines(_args: AddPolylinesArgs): Promise<{
        polylines: (Polyline & {
            id: string;
        })[];
    }>;
    setCameraTarget(_args: SetCameraTargetArgs): Promise<void>;
}
