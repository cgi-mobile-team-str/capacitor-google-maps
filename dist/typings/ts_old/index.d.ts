import { LatLngBounds, MapType, Marker, Polygon, Circle, Polyline, StyleSpan, VisibleRegion } from './definitions';
import { GoogleMap } from './map';
export { GoogleMap, LatLngBounds, MapType, Marker, Polygon, Circle, Polyline, StyleSpan, VisibleRegion };
declare global {
    export namespace JSX {
        interface IntrinsicElements {
            'capacitor-google-map': any;
        }
    }
}
