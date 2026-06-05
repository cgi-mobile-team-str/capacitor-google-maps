import { CapacitorMarker, CapacitorCircle, CapacitorPolyline, CapacitorPolygon, } from './definitions';
import { GoogleMap } from './original-plugin/map';
import { CapacitorGoogleMaps } from './implementation';
export class GoogleMapNavi extends GoogleMap {
    constructor(id) {
        super(id);
    }
    static async create(options, callback) {
        const map = await GoogleMap.create(options, callback);
        // Upgrade runtime prototype so navi-specific overloads/methods are available.
        Object.setPrototypeOf(map, GoogleMapNavi.prototype);
        return map;
    }
    async addMarker(arg) {
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
        const markerObj = new CapacitorMarker(res, this.id);
        return markerObj;
    }
    async addMarkers(args) {
        const useLegacyMarkerApi = args.length > 0 && this.isLegacyMarker(args[0]);
        const optionsList = useLegacyMarkerApi
            ? args.map((marker) => this.markerToOptions(marker))
            : args;
        const res = await CapacitorGoogleMaps.addMarkers({
            id: this.id,
            optionsList,
        });
        const markers = [];
        res.markers.forEach((r) => {
            markers.push(new CapacitorMarker(r, this.id));
        });
        return useLegacyMarkerApi ? markers.map((marker) => marker.id) : markers;
    }
    async addPolygon(options) {
        const res = await CapacitorGoogleMaps.addPolygon({
            id: this.id,
            options,
        });
        const polygonObj = new CapacitorPolygon(res, this.id);
        return polygonObj;
    }
    async addPolylines(args) {
        const useLegacyPolylineApi = args.length > 0 && 'path' in args[0];
        const optionsList = useLegacyPolylineApi
            ? args.map((polyline) => this.polylineToOptions(polyline))
            : args;
        const res = await CapacitorGoogleMaps.addPolylines({
            id: this.id,
            optionsList,
        });
        const polylines = [];
        res.polylines.forEach((r) => {
            polylines.push(new CapacitorPolyline(r, this.id));
        });
        return useLegacyPolylineApi ? polylines.map((polyline) => polyline.id) : polylines;
    }
    async addPolyline(options) {
        const res = await CapacitorGoogleMaps.addPolyline({
            id: this.id,
            options,
        });
        const polylineObj = new CapacitorPolyline(res, this.id);
        return polylineObj;
    }
    async addCircles(args) {
        const useLegacyCircleApi = args.length > 0 && this.isLegacyCircle(args[0]);
        const optionsList = useLegacyCircleApi
            ? args.map((circle) => this.circleToOptions(circle))
            : args;
        const res = await CapacitorGoogleMaps.addCircles({
            id: this.id,
            optionsList,
        });
        const circles = [];
        res.circles.forEach((r) => {
            circles.push(new CapacitorCircle(r, this.id));
        });
        return useLegacyCircleApi ? circles.map((circle) => circle.id) : circles;
    }
    async setOptions(config) {
        return CapacitorGoogleMaps.setOptions({
            id: this.id,
            config,
        });
    }
    async getCameraZoom() {
        const { cameraZoom } = await CapacitorGoogleMaps.getCameraZoom({ id: this.id });
        return cameraZoom;
    }
    async fromPointToLatLng(points) {
        const { latLng } = await CapacitorGoogleMaps.fromPointToLatLng({ id: this.id, points });
        return latLng;
    }
    async enableAllGestures(isEnabled) {
        return CapacitorGoogleMaps.enableAllGestures({ id: this.id, isEnabled });
    }
    /**
     * Set the event listener on the map for 'onCameraMove' events.
     *
     * @param callback
     * @returns
     */
    async setOnCameraMoveListener(callback) {
        if (this.onCameraMoveListener) {
            this.onCameraMoveListener.remove();
        }
        if (callback) {
            this.onCameraMoveListener = await CapacitorGoogleMaps.addListener('onCameraMove', this.generateCallback(callback));
        }
        else {
            this.onCameraMoveListener = undefined;
        }
    }
    markerToOptions(marker) {
        const options = {
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
    isLegacyMarker(marker) {
        return 'coordinate' in marker;
    }
    isLegacyCircle(circle) {
        return 'strokeWeight' in circle || 'strokeOpacity' in circle || 'fillOpacity' in circle || 'tag' in circle;
    }
    circleToOptions(circle) {
        var _a, _b, _c;
        return {
            center: circle.center,
            radius: (_a = circle.radius) !== null && _a !== void 0 ? _a : 0,
            strokeWidth: circle.strokeWeight,
            strokeColor: circle.strokeColor,
            fillColor: circle.fillColor,
            clickable: circle.clickable,
            zIndex: (_b = circle.zIndex) !== null && _b !== void 0 ? _b : undefined,
            visible: (_c = circle.visible) !== null && _c !== void 0 ? _c : undefined,
        };
    }
    polylineToOptions(polyline) {
        var _a, _b;
        const path = Array.isArray(polyline.path) ? polyline.path : [];
        return {
            points: path,
            visible: (_a = polyline.visible) !== null && _a !== void 0 ? _a : undefined,
            geodesic: polyline.geodesic,
            color: polyline.strokeColor,
            width: polyline.strokeWeight,
            zIndex: (_b = polyline.zIndex) !== null && _b !== void 0 ? _b : undefined,
            clickable: polyline.clickable,
        };
    }
}
//# sourceMappingURL=map-navi.js.map