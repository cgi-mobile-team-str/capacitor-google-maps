import { ILatLngBounds, LatLngBounds, GoogleMapsMapTypeId, GoogleMapsEvent, Marker, MarkerOptions, CapacitorMarker, Polygon, PolygonOptions, CapacitorPolygon, Circle, CircleOptions, CapacitorCircle, Polyline, PolylineOptions, CapacitorPolyline, StyleSpan, VisibleRegion, GoogleMapsOptions, GoogleMapControls, GoogleMapZoomOptions, GoogleMapGestures, GoogleMapPreferences, LatLng, ILatLng, CameraPosition } from './definitions';
import { GoogleMap } from './map';
export { GoogleMap, ILatLngBounds, LatLngBounds, GoogleMapsMapTypeId, GoogleMapsEvent, Marker, MarkerOptions, CapacitorMarker, Polygon, PolygonOptions, CapacitorPolygon, Circle, CircleOptions, CapacitorCircle, Polyline, PolylineOptions, CapacitorPolyline, StyleSpan, VisibleRegion, GoogleMapsOptions, GoogleMapControls, GoogleMapZoomOptions, GoogleMapGestures, GoogleMapPreferences, LatLng, ILatLng, CameraPosition };
declare global {
    export namespace JSX {
        interface IntrinsicElements {
            'capacitor-google-map': any;
        }
    }
}
