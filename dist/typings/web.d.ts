import { WebPlugin } from '@capacitor/core';
import type { ICircle, IMarker, IPolygon, IPolyline } from './definitions';
import type { LatLng } from './original-plugin/definitions';
import { LatLngBounds } from './definitions';
import type { AddMarkerArgs, CameraArgs, AddMarkersArgs, CapacitorGoogleMapsPlugin, CreateMapArgs, CurrentLocArgs, DestroyMapArgs, MapTypeArgs, PaddingArgs, RemoveMarkerArgs, TrafficLayerArgs, RemoveMarkersArgs, MapBoundsContainsArgs, EnableClusteringArgs, FitBoundsArgs, MapBoundsExtendArgs, RemovePolygonsArgs, AddCirclesArgs, RemoveCirclesArgs, AddPolylinesArgs, RemovePolylinesArgs, MapOptionsArgs, MarkerIconArgs, MarkerIconAnchorArgs, MarkerZIndexArgs, MarkerPositionArgs, MarkerVisibilityArgs, AddPolylineArgs, PolylineStrokeColorArgs, PolylineStrokeWidthArgs, RemovePolylineArgs, FromPointToLatLngArgs, RemoveCircleArgs, SetCircleCenterArgs, EnableAllGesturesArgs, AddPolygonArgs, RemovePolygonArgs, PolylineZIndexArgs } from './implementation';
export declare class CapacitorGoogleMapsWeb extends WebPlugin implements CapacitorGoogleMapsPlugin {
    private gMapsRef;
    private AdvancedMarkerElement;
    private maps;
    private currMarkerId;
    private currPolygonId;
    private currCircleId;
    private currPolylineId;
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
    setCamera(_args: CameraArgs): Promise<void>;
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
    removePolygons(args: RemovePolygonsArgs): Promise<void>;
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
    enableAllGestures(_args: EnableAllGesturesArgs): Promise<void>;
    setOptions(_args: MapOptionsArgs): Promise<void>;
    getCameraZoom(_args: {
        id: string;
    }): Promise<{
        cameraZoom: number;
    }>;
    addMarker(_args: AddMarkerArgs): Promise<IMarker & {
        id: string;
    }>;
    addMarkers(_args: AddMarkersArgs): Promise<{
        markers: (IMarker & {
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
    addPolyline(_args: AddPolylineArgs): Promise<IPolyline & {
        id: string;
    }>;
    setPolylineStrokeColor(_args: PolylineStrokeColorArgs): Promise<void>;
    setPolylineStrokeWidth(_args: PolylineStrokeWidthArgs): Promise<void>;
    setPolylineZIndex(_args: PolylineZIndexArgs): Promise<void>;
    removePolyline(_args: RemovePolylineArgs): Promise<void>;
    addCircles(_args: AddCirclesArgs): Promise<{
        circles: (ICircle & {
            id: string;
        })[];
    }>;
    setCircleCenter(_args: SetCircleCenterArgs): Promise<void>;
    removeCircle(_args: RemoveCircleArgs): Promise<void>;
    fromPointToLatLng(_args: FromPointToLatLngArgs): Promise<{
        latLng: LatLng;
    }>;
    addPolylines(_args: AddPolylinesArgs): Promise<{
        polylines: (IPolyline & {
            id: string;
        })[];
    }>;
    addPolygon(_args: AddPolygonArgs): Promise<IPolygon & {
        id: string;
    }>;
    removePolygon(_args: RemovePolygonArgs): Promise<void>;
    isMarkerRemoved(_args: {
        id: string;
        markerId: string;
    }): Promise<{
        isRemoved: boolean;
    }>;
    isPolylineRemoved(_args: {
        id: string;
        polylineId: string;
    }): Promise<{
        isRemoved: boolean;
    }>;
}
