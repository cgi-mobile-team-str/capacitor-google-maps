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
export class MarkerClass {
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
    }
    async setIcon(icon) {
        return CapacitorGoogleMaps.setMarkerIcon({
            id: this.mapId,
            markerId: this.id,
            url: icon.url,
            size: icon.size,
        });
    }
    async setIconAnchor(x, y) {
        return CapacitorGoogleMaps.setMarkerIconAnchor({ id: this.mapId, markerId: this.id, x, y });
    }
    async setZIndex(zIndex) {
        return CapacitorGoogleMaps.setMarkerZIndex({ id: this.mapId, markerId: this.id, zIndex });
    }
}
//# sourceMappingURL=definitions.js.map