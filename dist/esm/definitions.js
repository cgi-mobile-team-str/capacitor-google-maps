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
    constructor(marker, markerId, mapId) {
        this.mapId = mapId;
        this.id = markerId;
        this.coordinate = marker.coordinate;
        this.opacity = marker.opacity;
        this.title = marker.title;
        this.snippet = marker.snippet;
        this.isFlat = marker.isFlat;
        this.iconUrl = marker.iconUrl;
        this.iconSize = marker.iconSize;
        this.iconOrigin = marker.iconOrigin;
        this.iconAnchor = marker.iconAnchor;
        this.tintColor = marker.tintColor;
        this.draggable = marker.draggable;
        this.zIndex = marker.zIndex;
    }
    async setIcon(icon) {
        return CapacitorGoogleMaps.setMarkerIcon({
            id: this.mapId,
            markerId: this.id,
            url: icon.url,
            size: icon.size
        });
    }
}
//# sourceMappingURL=definitions.js.map