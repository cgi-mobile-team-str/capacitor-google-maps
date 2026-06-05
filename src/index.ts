/* eslint-disable @typescript-eslint/no-namespace */
import {
  LatLngBounds,
  GoogleMapsEvent,
  IMarker,
  MarkerOptions,
  CapacitorMarker,
  IPolygon,
  PolygonOptions,
  CapacitorPolygon,
  ICircle,
  CircleOptions,
  CapacitorCircle,
  IPolyline,
  PolylineOptions,
  CapacitorPolyline,
  VisibleRegion,
  GoogleMapsOptions,
  GoogleMapControls,
  GoogleMapZoomOptions,
  GoogleMapGestures,
  GoogleMapPreferences,
  LatLngImpl,
  CameraPosition
} from './definitions';
import { MapType, StyleSpan, LatLng, LatLngBoundsInterface } from './original-plugin/definitions'; 
import { GoogleMapNavi as GoogleMap } from './map-navi';

export {
  GoogleMap,
  LatLngBounds,
  MapType,
  GoogleMapsEvent,
  IMarker,
  MarkerOptions,
  CapacitorMarker,
  IPolygon,
  PolygonOptions,
  CapacitorPolygon,
  ICircle,
  CircleOptions,
  CapacitorCircle,
  IPolyline,
  PolylineOptions,
  CapacitorPolyline,
  StyleSpan,
  VisibleRegion,
  GoogleMapsOptions,
  GoogleMapControls,
  GoogleMapZoomOptions,
  GoogleMapGestures,
  GoogleMapPreferences,
  LatLng,
  LatLngImpl,
  CameraPosition,
  LatLngBoundsInterface,
};

declare global {
  export namespace JSX {
    export interface IntrinsicElements {
      'capacitor-google-map': any;
    }
  }
}
