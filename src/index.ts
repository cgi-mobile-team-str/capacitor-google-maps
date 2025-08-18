/* eslint-disable @typescript-eslint/no-namespace */
import {
  LatLngBounds,
  MapType,
  Marker,
  MarkerOption,
  CapacitorMarker,
  Polygon,
  PolygonOption,
  CapacitorPolygon,
  Circle,
  CircleOption,
  CapacitorCircle,
  Polyline,
  PolylineOption,
  CapacitorPolyline,
  StyleSpan,
  VisibleRegion,
  GoogleMapsOptions,
  GoogleMapControls,
  GoogleMapZoomOptions,
  GoogleMapGestures,
  GoogleMapPreferences,
} from './definitions';
import { GoogleMap } from './map';

export {
  GoogleMap,
  LatLngBounds,
  MapType,
  Marker,
  MarkerOption,
  CapacitorMarker,
  Polygon,
  PolygonOption,
  CapacitorPolygon,
  Circle,
  CircleOption,
  CapacitorCircle,
  Polyline,
  PolylineOption,
  CapacitorPolyline,
  StyleSpan,
  VisibleRegion,
  GoogleMapsOptions,
  GoogleMapControls,
  GoogleMapZoomOptions,
  GoogleMapGestures,
  GoogleMapPreferences,
};

declare global {
  export namespace JSX {
    export interface IntrinsicElements {
      'capacitor-google-map': any;
    }
  }
}
