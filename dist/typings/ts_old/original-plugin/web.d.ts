import { WebPlugin } from '@capacitor/core';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { LatLngBounds } from './definitions';
import { AddTileOverlayArgs, AddMarkerArgs, CameraArgs, AddMarkersArgs, CapacitorGoogleMapsPlugin, CreateMapArgs, CurrentLocArgs, DestroyMapArgs, MapTypeArgs, PaddingArgs, RemoveMarkerArgs, TrafficLayerArgs, RemoveMarkersArgs, MapBoundsContainsArgs, EnableClusteringArgs, FitBoundsArgs, MapBoundsExtendArgs, RemovePolygonsArgs, AddCirclesArgs, RemoveCirclesArgs, AddPolylinesArgs, RemovePolylinesArgs, RemoveTileOverlayArgs } from './implementation';
export declare class CapacitorGoogleMapsWeb extends WebPlugin implements CapacitorGoogleMapsPlugin {
    protected gMapsRef: typeof google.maps | undefined;
    protected AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement | undefined;
    protected PinElement: typeof google.maps.marker.PinElement | undefined;
    protected maps: {
        [id: string]: {
            element: HTMLElement;
            map: google.maps.Map;
            markers: {
                [id: string]: google.maps.marker.AdvancedMarkerElement;
            };
            tileOverlays: {
                [id: string]: google.maps.ImageMapType;
            };
            polygons: {
                [id: string]: google.maps.Polygon;
            };
            circles: {
                [id: string]: google.maps.Circle;
            };
            polylines: {
                [id: string]: google.maps.Polyline;
            };
            markerClusterer?: MarkerClusterer;
            trafficLayer?: google.maps.TrafficLayer;
        };
    };
    protected currMarkerId: number;
    protected currTileOverlayId: number;
    protected currCircleId: number;
    protected currPolylineId: number;
    protected currMapId: number;
    private onClusterClickHandler;
    private getIdFromMap;
    private getIdFromMarker;
    protected importGoogleLib(apiKey: string, region?: string, language?: string): Promise<void>;
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
    addTileOverlay(_args: AddTileOverlayArgs): Promise<{
        id: string;
    }>;
    removeTileOverlay(_args: RemoveTileOverlayArgs): Promise<void>;
    addMarkers(_args: AddMarkersArgs): Promise<{
        ids: string[];
    }>;
    addMarker(_args: AddMarkerArgs): Promise<{
        id: string;
    }>;
    removeMarkers(_args: RemoveMarkersArgs): Promise<void>;
    removeMarker(_args: RemoveMarkerArgs): Promise<void>;
    removePolygons(args: RemovePolygonsArgs): Promise<void>;
    addCircles(args: AddCirclesArgs): Promise<{
        ids: string[];
    }>;
    removeCircles(args: RemoveCirclesArgs): Promise<void>;
    addPolylines(args: AddPolylinesArgs): Promise<{
        ids: string[];
    }>;
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
    protected getLatLngBounds(_args: LatLngBounds): google.maps.LatLngBounds;
    setCircleListeners(mapId: string, circleId: string, circle: google.maps.Circle): Promise<void>;
    setPolygonListeners(mapId: string, polygonId: string, polygon: google.maps.Polygon): Promise<void>;
    setPolylineListeners(mapId: string, polylineId: string, polyline: google.maps.Polyline): Promise<void>;
    setMarkerListeners(mapId: string, markerId: string, marker: google.maps.marker.AdvancedMarkerElement): Promise<void>;
    setMapListeners(mapId: string): Promise<void>;
    private buildMarkerOpts;
}
