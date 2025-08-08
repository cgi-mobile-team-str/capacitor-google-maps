/* eslint-disable @typescript-eslint/no-namespace */
import {
  LatLngBounds,
  MapType,
  Marker,
  MarkerOption,
  MarkerClass,
  Polygon,
  Circle,
  Polyline,
  PolylineOption,
  PolylineClass,
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
  MarkerClass,
  Polygon,
  Circle,
  Polyline,
  PolylineOption,
  PolylineClass,
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
