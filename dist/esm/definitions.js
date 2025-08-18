import { CapacitorGoogleMaps } from './implementation';
export class LatLngBounds {
    constructor(bounds) {
        this.southwest = bounds.southwest;
        this.center = bounds.center;
        this.northeast = bounds.northeast;
    }
    async contains(point) {
        const result = await CapacitorGoogleMaps.mapBoundsContains({
            bounds: this,
            point,
        });
        return result['contains'];
    }
    async extend(point) {
        const result = await CapacitorGoogleMaps.mapBoundsExtend({
            bounds: this,
            point,
        });
        this.southwest = result['bounds']['southwest'];
        this.center = result['bounds']['center'];
        this.northeast = result['bounds']['northeast'];
        return this;
    }
}
export class CapacitorPolygon {
    constructor(obj, mapId) {
        this.mapId = mapId;
        this.id = obj.id;
        this.shapes = obj.shapes;
        this.visible = obj.visible;
        this.strokeColor = obj.strokeColor;
        this.fillColor = obj.fillColor;
        this.strokeWidth = obj.strokeWidth;
        this.zIndex = obj.zIndex;
        Object.assign(this, obj);
    }
    async remove() {
        return CapacitorGoogleMaps.removePolygon({ id: this.mapId, polygonId: this.id });
    }
}
export class CapacitorCircle {
    constructor(obj, mapId) {
        var _a;
        this.mapId = mapId;
        this.id = obj.id;
        this.center = obj.center;
        this.visible = obj.visible;
        this.radius = (_a = obj.radius) !== null && _a !== void 0 ? _a : 0;
        this.strokeColor = obj.strokeColor;
        this.strokeWidth = obj.strokeWidth;
        this.zIndex = obj.zIndex;
        this.clickable = obj.clickable;
        Object.assign(this, obj);
    }
    async setCenter(center) {
        this.center = center;
        return CapacitorGoogleMaps.setCircleCenter({ id: this.mapId, circleId: this.id, center: center });
    }
    async remove() {
        return CapacitorGoogleMaps.removeCircle({ id: this.mapId, circleId: this.id });
    }
}
export class CapacitorPolyline {
    constructor(obj, mapId) {
        this.mapId = mapId;
        this.id = obj.id;
        this.points = obj.path;
        this.visible = obj.visible;
        this.geodesic = obj.geodesic;
        this.strokeColor = obj.strokeColor;
        this.strokeWidth = obj.strokeWidth;
        this.zIndex = obj.zIndex;
        this.clickable = obj.clickable;
        Object.assign(this, obj);
    }
    get(key) {
        return this[key];
    }
    set(key, value) {
        this[key] = value;
    }
    async setStrokeColor(color) {
        this.strokeColor = color;
        return CapacitorGoogleMaps.setPolylineStrokeColor({ id: this.mapId, polylineId: this.id, strokeColor: color });
    }
    async setStrokeWidth(width) {
        this.strokeWidth = width;
        return CapacitorGoogleMaps.setPolylineStrokeWidth({ id: this.mapId, polylineId: this.id, strokeWidth: width });
    }
    async remove() {
        return CapacitorGoogleMaps.removePolyline({ id: this.mapId, polylineId: this.id });
    }
}
export var MapType;
(function (MapType) {
    /**
     * Basic map.
     */
    MapType["Normal"] = "Normal";
    /**
     * Satellite imagery with roads and labels.
     */
    MapType["Hybrid"] = "Hybrid";
    /**
     * Satellite imagery with no labels.
     */
    MapType["Satellite"] = "Satellite";
    /**
     * Topographic data.
     */
    MapType["Terrain"] = "Terrain";
    /**
     * No base map tiles.
     */
    MapType["None"] = "None";
})(MapType || (MapType = {}));
export class CapacitorMarker {
    constructor(obj, mapId) {
        this.mapId = mapId;
        this.id = obj.id;
        this.coordinate = obj.coordinate;
        this.opacity = obj.opacity;
        this.title = obj.title;
        this.snippet = obj.snippet;
        this.isFlat = obj.isFlat;
        this.iconUrl = obj.iconUrl;
        this.iconSize = obj.iconSize;
        this.iconOrigin = obj.iconOrigin;
        this.iconAnchor = obj.iconAnchor;
        this.tintColor = obj.tintColor;
        this.draggable = obj.draggable;
        this.zIndex = obj.zIndex;
        this.isVisible = obj.isVisible;
        Object.assign(this, obj);
    }
    get(key) {
        return this[key];
    }
    set(key, value) {
        this[key] = value;
    }
    async setIcon(icon) {
        if (icon.url !== null && icon.url !== undefined) {
            this.iconUrl = icon.url;
        }
        if (icon.size !== null && icon.size !== undefined) {
            this.iconSize = icon.size;
        }
        return CapacitorGoogleMaps.setMarkerIcon({
            id: this.mapId,
            markerId: this.id,
            url: icon.url,
            size: icon.size,
        });
    }
    async setIconAnchor(x, y) {
        this.iconAnchor = { x, y };
        return CapacitorGoogleMaps.setMarkerIconAnchor({ id: this.mapId, markerId: this.id, x, y });
    }
    async setZIndex(zIndex) {
        this.zIndex = zIndex;
        return CapacitorGoogleMaps.setMarkerZIndex({ id: this.mapId, markerId: this.id, zIndex });
    }
    async setVisible(isVisible) {
        this.isVisible = isVisible;
        return CapacitorGoogleMaps.setMarkerVisibility({ id: this.mapId, markerId: this.id, isVisible });
    }
    async getPosition() {
        return (await CapacitorGoogleMaps.getMarkerPosition({ id: this.mapId, markerId: this.id })).position;
    }
}
//# sourceMappingURL=definitions.js.map