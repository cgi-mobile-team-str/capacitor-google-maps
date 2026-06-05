import { PluginListenerHandle } from '@capacitor/core';
import {
  MarkerOptions,
  CapacitorMarker,
  CircleOptions,
  CapacitorCircle,
  PolylineOptions,
  CapacitorPolyline,
  CameraMoveCallbackData,
  GoogleMapsOptions,
  CapacitorPolygon,
  PolygonOptions,
} from './definitions';
import { LatLng, MapListenerCallback, Marker, Circle, Polyline, MapReadyCallbackData } from './original-plugin/definitions';
import { GoogleMap, GoogleMapInterface } from './original-plugin/map';
import type { CreateMapArgs } from './implementation';
import { CapacitorGoogleMaps } from './implementation';

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

export class GoogleMapNavi extends GoogleMap {

  private onCameraMoveListener?: PluginListenerHandle;

  constructor(id: string) {
    super(id);
  }

  public static async create(
    options: CreateMapArgs,
    callback?: MapListenerCallback<MapReadyCallbackData>
  ): Promise<GoogleMapNavi> {
    const map = await GoogleMap.create(options, callback);

    // Upgrade runtime prototype so navi-specific overloads/methods are available.
    Object.setPrototypeOf(map, GoogleMapNavi.prototype);

    return map as GoogleMapNavi;
  }

  async addMarker(marker: Marker): Promise<string>;
  async addMarker(options: MarkerOptions): Promise<CapacitorMarker>;
  async addMarker(arg: Marker | MarkerOptions): Promise<string | CapacitorMarker> {
    if (this.isLegacyMarker(arg)) {
      const res = await CapacitorGoogleMaps.addMarker({
        id: this.id,
        options: this.markerToOptions(arg),
      });

      return res.id;
    }

    const res = await CapacitorGoogleMaps.addMarker({
      id: this.id,
      options: arg,
    });

    const markerObj: CapacitorMarker = new CapacitorMarker(res, this.id);
    return markerObj;
  }

  /**
   * Adds multiple markers to the map
   *
   * @param markers
   * @returns array of created marker IDs
   */
  async addMarkers(markers: Marker[]): Promise<string[]>;
  async addMarkers(optionsList: MarkerOptions[]): Promise<CapacitorMarker[]>;
  async addMarkers(args: Marker[] | MarkerOptions[]): Promise<string[] | CapacitorMarker[]> {
    const useLegacyMarkerApi = args.length > 0 && this.isLegacyMarker(args[0]);
    const optionsList = useLegacyMarkerApi
      ? (args as Marker[]).map((marker) => this.markerToOptions(marker))
      : (args as MarkerOptions[]);

    const res = await CapacitorGoogleMaps.addMarkers({
      id: this.id,
      optionsList,
    });

    const markers: CapacitorMarker[] = [];
    res.markers.forEach((r) => {
      markers.push(new CapacitorMarker(r, this.id));
    });

    return useLegacyMarkerApi ? markers.map((marker) => marker.id) : markers;
  }

  async addPolygon(options: PolygonOptions): Promise<CapacitorPolygon> {
    const res = await CapacitorGoogleMaps.addPolygon({
      id: this.id,
      options,
    });

    const polygonObj: CapacitorPolygon = new CapacitorPolygon(res, this.id);
    return polygonObj;
  }

  async addPolylines(polylines: Polyline[]): Promise<string[]>;
  async addPolylines(optionsList: PolylineOptions[]): Promise<CapacitorPolyline[]>;
  async addPolylines(args: Polyline[] | PolylineOptions[]): Promise<string[] | CapacitorPolyline[]> {
    const useLegacyPolylineApi = args.length > 0 && 'path' in args[0];
    const optionsList = useLegacyPolylineApi
      ? (args as Polyline[]).map((polyline) => this.polylineToOptions(polyline))
      : (args as PolylineOptions[]);

    const res = await CapacitorGoogleMaps.addPolylines({
      id: this.id,
      optionsList,
    });

    const polylines: CapacitorPolyline[] = [];
    res.polylines.forEach((r) => {
      polylines.push(new CapacitorPolyline(r, this.id));
    });

    return useLegacyPolylineApi ? polylines.map((polyline) => polyline.id) : polylines;
  }

  async addPolyline(options: PolylineOptions): Promise<CapacitorPolyline> {
    const res = await CapacitorGoogleMaps.addPolyline({
      id: this.id,
      options,
    });

    const polylineObj: CapacitorPolyline = new CapacitorPolyline(res, this.id);
    return polylineObj;
  }

  async addCircles(circles: Circle[]): Promise<string[]>;
  async addCircles(optionsList: CircleOptions[]): Promise<CapacitorCircle[]>;
  async addCircles(args: Circle[] | CircleOptions[]): Promise<string[] | CapacitorCircle[]> {
    const useLegacyCircleApi = args.length > 0 && this.isLegacyCircle(args[0]);
    const optionsList = useLegacyCircleApi
      ? (args as Circle[]).map((circle) => this.circleToOptions(circle))
      : (args as CircleOptions[]);

    const res = await CapacitorGoogleMaps.addCircles({
      id: this.id,
      optionsList,
    });

    const circles: CapacitorCircle[] = [];
    res.circles.forEach((r) => {
      circles.push(new CapacitorCircle(r, this.id));
    });

    return useLegacyCircleApi ? circles.map((circle) => circle.id) : circles;
  }

  async setOptions(config: GoogleMapsOptions): Promise<void> {
    return CapacitorGoogleMaps.setOptions({
      id: this.id,
      config,
    });
  }

  async getCameraZoom(): Promise<number> {
    const { cameraZoom } = await CapacitorGoogleMaps.getCameraZoom({ id: this.id });
    return cameraZoom;
  }

  async fromPointToLatLng(points: number[]): Promise<LatLng> {
    const { latLng } = await CapacitorGoogleMaps.fromPointToLatLng({ id: this.id, points });
    return latLng;
  }

  async enableAllGestures(isEnabled: boolean): Promise<void> {
    return CapacitorGoogleMaps.enableAllGestures({ id: this.id, isEnabled });
  }

  /**
   * Set the event listener on the map for 'onCameraMove' events.
   *
   * @param callback
   * @returns
   */
  async setOnCameraMoveListener(callback?: MapListenerCallback<CameraMoveCallbackData>): Promise<void> {
    if (this.onCameraMoveListener) {
      this.onCameraMoveListener.remove();
    }

    if (callback) {
      this.onCameraMoveListener = await CapacitorGoogleMaps.addListener(
        'onCameraMove',
        this.generateCallback(callback)
      );
    } else {
      this.onCameraMoveListener = undefined;
    }
  }

  private markerToOptions(marker: Marker): MarkerOptions {
    const options: MarkerOptions = {
      position: marker.coordinate,
      title: marker.title,
      snippet: marker.snippet,
      draggable: marker.draggable,
      flat: marker.isFlat,
      zIndex: marker.zIndex,
      alpha: marker.opacity,
    };

    if (marker.iconUrl || marker.iconSize || marker.iconAnchor) {
      options.icon = {
        url: marker.iconUrl,
        size: marker.iconSize,
        anchor: marker.iconAnchor ? [marker.iconAnchor.x, marker.iconAnchor.y] : undefined,
      };
    }

    return options;
  }

  private isLegacyMarker(marker: Marker | MarkerOptions): marker is Marker {
    return 'coordinate' in marker;
  }

  private isLegacyCircle(circle: Circle | CircleOptions): circle is Circle {
    return 'strokeWeight' in circle || 'strokeOpacity' in circle || 'fillOpacity' in circle || 'tag' in circle;
  }

  private circleToOptions(circle: Circle): CircleOptions {
    return {
      center: circle.center as LatLng,
      radius: circle.radius ?? 0,
      strokeWidth: circle.strokeWeight,
      strokeColor: circle.strokeColor,
      fillColor: circle.fillColor,
      clickable: circle.clickable,
      zIndex: circle.zIndex ?? undefined,
      visible: circle.visible ?? undefined,
    };
  }

  private polylineToOptions(polyline: Polyline): PolylineOptions {
    const path = Array.isArray(polyline.path) ? (polyline.path as unknown as LatLng[]) : [];
    return {
      points: path,
      visible: polyline.visible ?? undefined,
      geodesic: polyline.geodesic,
      color: polyline.strokeColor,
      width: polyline.strokeWeight,
      zIndex: polyline.zIndex ?? undefined,
      clickable: polyline.clickable,
    };
  }

}