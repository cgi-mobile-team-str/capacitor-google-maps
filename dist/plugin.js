var capacitorCapacitorGoogleMaps = (function (exports, core, rxjs, markerclusterer) {
    'use strict';

    const CapacitorGoogleMaps = core.registerPlugin('CapacitorGoogleMaps', {
        web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.CapacitorGoogleMapsWeb()),
    });
    CapacitorGoogleMaps.addListener('isMapInFocus', (data) => {
        var _a;
        const x = data.x;
        const y = data.y;
        const elem = document.elementFromPoint(x, y);
        const internalId = (_a = elem === null || elem === void 0 ? void 0 : elem.dataset) === null || _a === void 0 ? void 0 : _a.internalId;
        const mapInFocus = internalId === data.mapId;
        CapacitorGoogleMaps.dispatchMapEvent({ id: data.mapId, focus: mapInFocus });
    });

    class LatLngBounds {
        constructor(arg) {
            if (Array.isArray(arg)) {
                let minLat = Number.POSITIVE_INFINITY;
                let minLng = Number.POSITIVE_INFINITY;
                let maxLat = Number.NEGATIVE_INFINITY;
                let maxLng = Number.NEGATIVE_INFINITY;
                for (const p of arg) {
                    minLat = Math.min(minLat, p.lat);
                    minLng = Math.min(minLng, p.lng);
                    maxLat = Math.max(maxLat, p.lat);
                    maxLng = Math.max(maxLng, p.lng);
                }
                this.southwest = { lat: minLat, lng: minLng };
                this.northeast = { lat: maxLat, lng: maxLng };
                this.center = {
                    lat: (minLat + maxLat) / 2,
                    lng: (minLng + maxLng) / 2,
                };
            }
            else {
                this.southwest = arg.southwest;
                this.center = arg.center;
                this.northeast = arg.northeast;
            }
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
    class LatLng {
        constructor(lat, lng) {
            this.lat = lat;
            this.lng = lng;
        }
    }
    class CapacitorPolygon {
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
    class CapacitorCircle {
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
    class CapacitorPolyline {
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
        async setZIndex(zIndex) {
            this.zIndex = zIndex;
            return CapacitorGoogleMaps.setPolylineZIndex({ id: this.mapId, polylineId: this.id, zIndex: zIndex });
        }
        async isRemoved() {
            return (await CapacitorGoogleMaps.isPolylineRemoved({ id: this.mapId, polylineId: this.id })).isRemoved;
        }
        async remove() {
            return CapacitorGoogleMaps.removePolyline({ id: this.mapId, polylineId: this.id });
        }
    }
    exports.GoogleMapsMapTypeId = void 0;
    (function (GoogleMapsMapTypeId) {
        /**
         * Basic map.
         */
        GoogleMapsMapTypeId["Normal"] = "Normal";
        /**
         * Satellite imagery with roads and labels.
         */
        GoogleMapsMapTypeId["Hybrid"] = "Hybrid";
        /**
         * Satellite imagery with no labels.
         */
        GoogleMapsMapTypeId["Satellite"] = "Satellite";
        /**
         * Topographic data.
         */
        GoogleMapsMapTypeId["Terrain"] = "Terrain";
        /**
         * No base map tiles.
         */
        GoogleMapsMapTypeId["None"] = "None";
    })(exports.GoogleMapsMapTypeId || (exports.GoogleMapsMapTypeId = {}));
    exports.GoogleMapsEvent = void 0;
    (function (GoogleMapsEvent) {
        GoogleMapsEvent["MAP_READY"] = "onMapReady";
        GoogleMapsEvent["MAP_CLICK"] = "onMapClick";
        GoogleMapsEvent["POI_CLICK"] = "onPoiClick";
        GoogleMapsEvent["CAMERA_MOVE_END"] = "onCameraIdle";
        GoogleMapsEvent["MARKER_CLICK"] = "onMarkerClick";
        GoogleMapsEvent["MAP_DRAG"] = "onCameraMove";
        GoogleMapsEvent["MAP_DRAG_START"] = "onCameraMoveStarted";
    })(exports.GoogleMapsEvent || (exports.GoogleMapsEvent = {}));
    class CapacitorMarker {
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
            this.clickable = obj.clickable;
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
        async isRemoved() {
            return (await CapacitorGoogleMaps.isMarkerRemoved({ id: this.mapId, markerId: this.id })).isRemoved;
        }
        async remove() {
            return CapacitorGoogleMaps.removeMarker({ id: this.mapId, markerId: this.id });
        }
    }

    class MapCustomElement extends HTMLElement {
        constructor() {
            super();
        }
        connectedCallback() {
            this.innerHTML = '';
            if (core.Capacitor.getPlatform() == 'ios') {
                this.style.overflow = 'scroll';
                this.style['-webkit-overflow-scrolling'] = 'touch';
                const overflowDiv = document.createElement('div');
                overflowDiv.style.height = '200%';
                this.appendChild(overflowDiv);
            }
        }
    }
    customElements.define('capacitor-google-map', MapCustomElement);
    class GoogleMap {
        constructor(id) {
            this.element = null;
            this.resizeObserver = null;
            this.handleScrollEvent = () => this.updateMapBounds();
            this.id = id;
        }
        /**
         * Creates a new instance of a Google Map
         * @param options
         * @param callback
         * @returns GoogleMap
         */
        static async create(options, callback) {
            const newMap = new GoogleMap(options.id);
            if (!options.element) {
                throw new Error('container element is required');
            }
            if (options.config.androidLiteMode === undefined) {
                options.config.androidLiteMode = false;
            }
            newMap.element = options.element;
            newMap.element.dataset.internalId = options.id;
            const elementBounds = await GoogleMap.getElementBounds(options.element);
            options.config.width = elementBounds.width;
            options.config.height = elementBounds.height;
            options.config.x = elementBounds.x;
            options.config.y = elementBounds.y;
            options.config.devicePixelRatio = window.devicePixelRatio;
            if (core.Capacitor.getPlatform() == 'android') {
                newMap.initScrolling();
            }
            if (core.Capacitor.isNativePlatform()) {
                options.element = {};
                const getMapBounds = () => {
                    var _a, _b;
                    const mapRect = (_b = (_a = newMap.element) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect()) !== null && _b !== void 0 ? _b : {};
                    return {
                        x: mapRect.x,
                        y: mapRect.y,
                        width: mapRect.width,
                        height: mapRect.height,
                    };
                };
                const onDisplay = () => {
                    CapacitorGoogleMaps.onDisplay({
                        id: newMap.id,
                        mapBounds: getMapBounds(),
                    });
                };
                const onResize = () => {
                    CapacitorGoogleMaps.onResize({
                        id: newMap.id,
                        mapBounds: getMapBounds(),
                    });
                };
                const ionicPage = newMap.element.closest('.ion-page');
                if (core.Capacitor.getPlatform() === 'ios' && ionicPage) {
                    ionicPage.addEventListener('ionViewWillEnter', () => {
                        setTimeout(() => {
                            onDisplay();
                        }, 100);
                    });
                    ionicPage.addEventListener('ionViewDidEnter', () => {
                        setTimeout(() => {
                            onDisplay();
                        }, 100);
                    });
                }
                const lastState = {
                    width: elementBounds.width,
                    height: elementBounds.height,
                    isHidden: false,
                };
                newMap.resizeObserver = new ResizeObserver(() => {
                    if (newMap.element != null) {
                        const mapRect = newMap.element.getBoundingClientRect();
                        const isHidden = mapRect.width === 0 && mapRect.height === 0;
                        if (!isHidden) {
                            if (lastState.isHidden) {
                                if (core.Capacitor.getPlatform() === 'ios' && !ionicPage) {
                                    onDisplay();
                                }
                            }
                            else if (lastState.width !== mapRect.width || lastState.height !== mapRect.height) {
                                onResize();
                            }
                        }
                        lastState.width = mapRect.width;
                        lastState.height = mapRect.height;
                        lastState.isHidden = isHidden;
                    }
                });
                newMap.resizeObserver.observe(newMap.element);
            }
            // small delay to allow for iOS WKWebView to setup corresponding element sub-scroll views ???
            await new Promise((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        await CapacitorGoogleMaps.create(options);
                        resolve(undefined);
                    }
                    catch (err) {
                        reject(err);
                    }
                }, 200);
            });
            if (callback) {
                const onMapReadyListener = await CapacitorGoogleMaps.addListener('onMapReady', (data) => {
                    if (data.mapId == newMap.id) {
                        callback(data);
                        onMapReadyListener.remove();
                    }
                });
            }
            return newMap;
        }
        static async getElementBounds(element) {
            return new Promise((resolve) => {
                let elementBounds = element.getBoundingClientRect();
                if (elementBounds.width == 0) {
                    let retries = 0;
                    const boundsInterval = setInterval(function () {
                        if (elementBounds.width == 0 && retries < 30) {
                            elementBounds = element.getBoundingClientRect();
                            retries++;
                        }
                        else {
                            if (retries == 30) {
                                console.warn('Map size could not be determined');
                            }
                            clearInterval(boundsInterval);
                            resolve(elementBounds);
                        }
                    }, 100);
                }
                else {
                    resolve(elementBounds);
                }
            });
        }
        /**
         * Enable touch events on native map
         *
         * @returns void
         */
        async enableTouch() {
            return CapacitorGoogleMaps.enableTouch({
                id: this.id,
            });
        }
        /**
         * Disable touch events on native map
         *
         * @returns void
         */
        async disableTouch() {
            return CapacitorGoogleMaps.disableTouch({
                id: this.id,
            });
        }
        /**
         * Enable marker clustering
         *
         * @param minClusterSize - The minimum number of markers that can be clustered together.
         * @defaultValue 4
         *
         * @returns void
         */
        async enableClustering(minClusterSize) {
            return CapacitorGoogleMaps.enableClustering({
                id: this.id,
                minClusterSize,
            });
        }
        /**
         * Disable marker clustering
         *
         * @returns void
         */
        async disableClustering() {
            return CapacitorGoogleMaps.disableClustering({
                id: this.id,
            });
        }
        /**
         * Adds a marker to the map
         *
         * @param marker
         * @returns created marker id
         */
        async addMarker(options) {
            const res = await CapacitorGoogleMaps.addMarker({
                id: this.id,
                options,
            });
            const markerObj = new CapacitorMarker(res, this.id);
            return markerObj;
        }
        /**
         * Adds multiple markers to the map
         *
         * @param markers
         * @returns array of created marker IDs
         */
        async addMarkers(optionsList) {
            const res = await CapacitorGoogleMaps.addMarkers({
                id: this.id,
                optionsList,
            });
            const markers = [];
            res.markers.forEach((r) => {
                markers.push(new CapacitorMarker(r, this.id));
            });
            return markers;
        }
        /**
         * Remove marker from the map
         *
         * @param id id of the marker to remove from the map
         * @returns
         */
        async removeMarker(id) {
            return CapacitorGoogleMaps.removeMarker({
                id: this.id,
                markerId: id,
            });
        }
        /**
         * Remove markers from the map
         *
         * @param ids array of ids to remove from the map
         * @returns
         */
        async removeMarkers(ids) {
            return CapacitorGoogleMaps.removeMarkers({
                id: this.id,
                markerIds: ids,
            });
        }
        async clearMarkers() {
            return CapacitorGoogleMaps.clearMarkers({ id: this.id });
        }
        async addPolygons(optionsList) {
            const res = await CapacitorGoogleMaps.addPolygons({
                id: this.id,
                optionsList,
            });
            const polygons = [];
            res.polygons.forEach((r) => {
                polygons.push(new CapacitorPolygon(r, this.id));
            });
            return polygons;
        }
        async addPolygon(options) {
            const res = await CapacitorGoogleMaps.addPolygon({
                id: this.id,
                options,
            });
            const polygonObj = new CapacitorPolygon(res, this.id);
            return polygonObj;
        }
        async addPolylines(optionsList) {
            const res = await CapacitorGoogleMaps.addPolylines({
                id: this.id,
                optionsList,
            });
            const polylines = [];
            res.polylines.forEach((r) => {
                polylines.push(new CapacitorPolyline(r, this.id));
            });
            return polylines;
        }
        async addPolyline(options) {
            const res = await CapacitorGoogleMaps.addPolyline({
                id: this.id,
                options,
            });
            const polylineObj = new CapacitorPolyline(res, this.id);
            return polylineObj;
        }
        async removePolygons(ids) {
            return CapacitorGoogleMaps.removePolygons({
                id: this.id,
                polygonIds: ids,
            });
        }
        async addCircles(optionsList) {
            const res = await CapacitorGoogleMaps.addCircles({
                id: this.id,
                optionsList,
            });
            const circles = [];
            res.circles.forEach((r) => {
                circles.push(new CapacitorCircle(r, this.id));
            });
            return circles;
        }
        async addCircle(options) {
            const res = await CapacitorGoogleMaps.addCircle({
                id: this.id,
                options,
            });
            const circleObj = new CapacitorCircle(res, this.id);
            return circleObj;
        }
        async removeCircles(ids) {
            return CapacitorGoogleMaps.removeCircles({
                id: this.id,
                circleIds: ids,
            });
        }
        async removePolylines(ids) {
            return CapacitorGoogleMaps.removePolylines({
                id: this.id,
                polylineIds: ids,
            });
        }
        /**
         * Destroy the current instance of the map
         */
        async destroy() {
            var _a;
            if (core.Capacitor.getPlatform() == 'android') {
                this.disableScrolling();
            }
            if (core.Capacitor.isNativePlatform()) {
                (_a = this.resizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
            }
            this.removeAllMapListeners();
            return CapacitorGoogleMaps.destroy({
                id: this.id,
            });
        }
        /**
         * Update the map camera configuration with animation
         *
         * @param config
         * @returns
         */
        async animateCamera(config) {
            return CapacitorGoogleMaps.animateCamera({
                id: this.id,
                config,
            });
        }
        /**
         * Update the map camera configuration without animation
         *
         * @param config
         * @returns
         */
        async moveCamera(config) {
            return CapacitorGoogleMaps.moveCamera({
                id: this.id,
                config,
            });
        }
        /**
         * Update the map camera bearing
         *
         * @param bearing
         * @returns
         */
        async setCameraBearing(bearing) {
            return CapacitorGoogleMaps.setCameraBearing({
                id: this.id,
                bearing,
            });
        }
        async setCameraTarget(target) {
            return CapacitorGoogleMaps.setCameraTarget({
                id: this.id,
                target,
            });
        }
        async setOptions(config) {
            return CapacitorGoogleMaps.setOptions({
                id: this.id,
                config,
            });
        }
        async getMapType() {
            const { type } = await CapacitorGoogleMaps.getMapType({ id: this.id });
            return exports.GoogleMapsMapTypeId[type];
        }
        async getCameraZoom() {
            const { cameraZoom } = await CapacitorGoogleMaps.getCameraZoom({ id: this.id });
            return cameraZoom;
        }
        async getCameraTarget() {
            const { cameraTarget } = await CapacitorGoogleMaps.getCameraTarget({ id: this.id });
            return cameraTarget;
        }
        async fromPointToLatLng(points) {
            const { latLng } = await CapacitorGoogleMaps.fromPointToLatLng({ id: this.id, points });
            return latLng;
        }
        /**
         * Sets the type of map tiles that should be displayed.
         *
         * @param mapType
         * @returns
         */
        async setMapType(mapType) {
            return CapacitorGoogleMaps.setMapType({
                id: this.id,
                mapType,
            });
        }
        /**
         * Sets whether indoor maps are shown, where available.
         *
         * @param enabled
         * @returns
         */
        async enableIndoorMaps(enabled) {
            return CapacitorGoogleMaps.enableIndoorMaps({
                id: this.id,
                enabled,
            });
        }
        /**
         * Controls whether the map is drawing traffic data, if available.
         *
         * @param enabled
         * @returns
         */
        async enableTrafficLayer(enabled) {
            return CapacitorGoogleMaps.enableTrafficLayer({
                id: this.id,
                enabled,
            });
        }
        /**
         * Show accessibility elements for overlay objects, such as Marker and Polyline.
         *
         * Only available on iOS.
         *
         * @param enabled
         * @returns
         */
        async enableAccessibilityElements(enabled) {
            return CapacitorGoogleMaps.enableAccessibilityElements({
                id: this.id,
                enabled,
            });
        }
        /**
         * Set whether the My Location dot and accuracy circle is enabled.
         *
         * @param enabled
         * @returns
         */
        async enableCurrentLocation(enabled) {
            return CapacitorGoogleMaps.enableCurrentLocation({
                id: this.id,
                enabled,
            });
        }
        /**
         * Set padding on the 'visible' region of the view.
         *
         * @param padding
         * @returns
         */
        async setPadding(padding) {
            return CapacitorGoogleMaps.setPadding({
                id: this.id,
                padding,
            });
        }
        /**
         * Get the map's current viewport latitude and longitude bounds.
         *
         * @returns {LatLngBounds}
         */
        async getMapBounds() {
            return new LatLngBounds(await CapacitorGoogleMaps.getMapBounds({
                id: this.id,
            }));
        }
        /**
         * Get the current Viewport
         *
         * @returns {VisibleRegion}
         */
        async getVisibleRegion() {
            return CapacitorGoogleMaps.getVisibleRegion({ id: this.id });
        }
        /**
         * Enable or disable the compass
         *
         * @returns
         */
        async enableCompass(enabled) {
            return CapacitorGoogleMaps.enableCompass({ id: this.id, enabled });
        }
        async enableToolbar(isEnabled) {
            return CapacitorGoogleMaps.enableToolbar({ id: this.id, isEnabled });
        }
        async enableMyLocation(isEnabled) {
            return CapacitorGoogleMaps.enableMyLocation({ id: this.id, isEnabled });
        }
        async enableAllGestures(isEnabled) {
            return CapacitorGoogleMaps.enableAllGestures({ id: this.id, isEnabled });
        }
        async enableTiltGesture(isEnabled) {
            return CapacitorGoogleMaps.enableTiltGesture({ id: this.id, isEnabled });
        }
        async enableTiltRotateGesture(isEnabled) {
            return CapacitorGoogleMaps.enableTiltRotateGesture({ id: this.id, isEnabled });
        }
        async setMapPreferences(padding, building) {
            return CapacitorGoogleMaps.setMapPreferences({
                id: this.id,
                padding,
                building,
            });
        }
        async fitBounds(bounds, padding) {
            return CapacitorGoogleMaps.fitBounds({
                id: this.id,
                bounds,
                padding,
            });
        }
        initScrolling() {
            const ionContents = document.getElementsByTagName('ion-content');
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < ionContents.length; i++) {
                ionContents[i].scrollEvents = true;
            }
            window.addEventListener('ionScroll', this.handleScrollEvent);
            window.addEventListener('scroll', this.handleScrollEvent);
            window.addEventListener('resize', this.handleScrollEvent);
            if (screen.orientation) {
                screen.orientation.addEventListener('change', () => {
                    setTimeout(this.updateMapBounds, 500);
                });
            }
            else {
                window.addEventListener('orientationchange', () => {
                    setTimeout(this.updateMapBounds, 500);
                });
            }
        }
        disableScrolling() {
            window.removeEventListener('ionScroll', this.handleScrollEvent);
            window.removeEventListener('scroll', this.handleScrollEvent);
            window.removeEventListener('resize', this.handleScrollEvent);
            if (screen.orientation) {
                screen.orientation.removeEventListener('change', () => {
                    setTimeout(this.updateMapBounds, 1000);
                });
            }
            else {
                window.removeEventListener('orientationchange', () => {
                    setTimeout(this.updateMapBounds, 1000);
                });
            }
        }
        updateMapBounds() {
            if (this.element) {
                const mapRect = this.element.getBoundingClientRect();
                CapacitorGoogleMaps.onScroll({
                    id: this.id,
                    mapBounds: {
                        x: mapRect.x,
                        y: mapRect.y,
                        width: mapRect.width,
                        height: mapRect.height,
                    },
                });
            }
        }
        /*
        private findContainerElement(): HTMLElement | null {
          if (!this.element) {
            return null;
          }
      
          let parentElement = this.element.parentElement;
          while (parentElement !== null) {
            if (window.getComputedStyle(parentElement).overflowY !== 'hidden') {
              return parentElement;
            }
      
            parentElement = parentElement.parentElement;
          }
      
          return null;
        }
        */
        /**
         * Set the event listener on the map for 'onCameraIdle' events.
         *
         * @param callback
         * @returns
         */
        async setOnCameraIdleListener(callback) {
            if (this.onCameraIdleListener) {
                this.onCameraIdleListener.remove();
            }
            if (callback) {
                this.onCameraIdleListener = await CapacitorGoogleMaps.addListener('onCameraIdle', this.generateCallback(callback));
            }
            else {
                this.onCameraIdleListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onBoundsChanged' events.
         *
         * @param callback
         * @returns
         */
        async setOnBoundsChangedListener(callback) {
            if (this.onBoundsChangedListener) {
                this.onBoundsChangedListener.remove();
            }
            if (callback) {
                this.onBoundsChangedListener = await CapacitorGoogleMaps.addListener('onBoundsChanged', this.generateCallback(callback));
            }
            else {
                this.onBoundsChangedListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onCameraMoveStarted' events.
         *
         * @param callback
         * @returns
         */
        async setOnCameraMoveStartedListener(callback) {
            if (this.onCameraMoveStartedListener) {
                this.onCameraMoveStartedListener.remove();
            }
            if (callback) {
                this.onCameraMoveStartedListener = await CapacitorGoogleMaps.addListener('onCameraMoveStarted', this.generateCallback(callback));
            }
            else {
                this.onCameraMoveStartedListener = undefined;
            }
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
        /**
         * Set the event listener on the map for 'onClusterClick' events.
         *
         * @param callback
         * @returns
         */
        async setOnClusterClickListener(callback) {
            if (this.onClusterClickListener) {
                this.onClusterClickListener.remove();
            }
            if (callback) {
                this.onClusterClickListener = await CapacitorGoogleMaps.addListener('onClusterClick', this.generateCallback(callback));
            }
            else {
                this.onClusterClickListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onClusterInfoWindowClick' events.
         *
         * @param callback
         * @returns
         */
        async setOnClusterInfoWindowClickListener(callback) {
            if (this.onClusterInfoWindowClickListener) {
                this.onClusterInfoWindowClickListener.remove();
            }
            if (callback) {
                this.onClusterInfoWindowClickListener = await CapacitorGoogleMaps.addListener('onClusterInfoWindowClick', this.generateCallback(callback));
            }
            else {
                this.onClusterInfoWindowClickListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onInfoWindowClick' events.
         *
         * @param callback
         * @returns
         */
        async setOnInfoWindowClickListener(callback) {
            if (this.onInfoWindowClickListener) {
                this.onInfoWindowClickListener.remove();
            }
            if (callback) {
                this.onInfoWindowClickListener = await CapacitorGoogleMaps.addListener('onInfoWindowClick', this.generateCallback(callback));
            }
            else {
                this.onInfoWindowClickListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onMapClick' events.
         *
         * @param callback
         * @returns
         */
        async setOnMapClickListener(callback) {
            if (this.onMapClickListener) {
                this.onMapClickListener.remove();
            }
            if (callback) {
                this.onMapClickListener = await CapacitorGoogleMaps.addListener('onMapClick', this.generateCallback(callback));
            }
            else {
                this.onMapClickListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onMapReady' events.
         *
         * @param callback
         * @returns
         */
        async setOnMapReadyListener(callback) {
            if (this.onMapReadyListener) {
                this.onMapReadyListener.remove();
            }
            if (callback) {
                this.onMapReadyListener = await CapacitorGoogleMaps.addListener('onMapReady', this.generateCallback(callback));
            }
            else {
                this.onMapReadyListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onPolygonClick' events.
         *
         * @param callback
         * @returns
         */
        async setOnPolygonClickListener(callback) {
            if (this.onPolygonClickListener) {
                this.onPolygonClickListener.remove();
            }
            if (callback) {
                this.onPolygonClickListener = await CapacitorGoogleMaps.addListener('onPolygonClick', this.generateCallback(callback));
            }
            else {
                this.onPolygonClickListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onPoiClick' events.
         *
         * @param callback
         * @returns
         */
        async setOnPoiClickListener(callback) {
            if (this.onPoiClickListener) {
                this.onPoiClickListener.remove();
            }
            if (callback) {
                this.onPoiClickListener = await CapacitorGoogleMaps.addListener('onPoiClick', this.generateCallback(callback));
            }
            else {
                this.onPoiClickListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onCircleClick' events.
         *
         * @param callback
         * @returns
         */
        async setOnCircleClickListener(callback) {
            if (this.onCircleClickListener)
                [this.onCircleClickListener.remove()];
            if (callback) {
                this.onCircleClickListener = await CapacitorGoogleMaps.addListener('onCircleClick', this.generateCallback(callback));
            }
            else {
                this.onCircleClickListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onMarkerClick' events.
         *
         * @param callback
         * @returns
         */
        async setOnMarkerClickListener(callback) {
            if (this.onMarkerClickListener) {
                this.onMarkerClickListener.remove();
            }
            if (callback) {
                this.onMarkerClickListener = await CapacitorGoogleMaps.addListener('onMarkerClick', this.generateCallback(callback));
            }
            else {
                this.onMarkerClickListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onPolylineClick' events.
         *
         * @param callback
         * @returns
         */
        async setOnPolylineClickListener(callback) {
            if (this.onPolylineClickListener) {
                this.onPolylineClickListener.remove();
            }
            if (callback) {
                this.onPolylineClickListener = await CapacitorGoogleMaps.addListener('onPolylineClick', this.generateCallback(callback));
            }
            else {
                this.onPolylineClickListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onMarkerDragStart' events.
         *
         * @param callback
         * @returns
         */
        async setOnMarkerDragStartListener(callback) {
            if (this.onMarkerDragStartListener) {
                this.onMarkerDragStartListener.remove();
            }
            if (callback) {
                this.onMarkerDragStartListener = await CapacitorGoogleMaps.addListener('onMarkerDragStart', this.generateCallback(callback));
            }
            else {
                this.onMarkerDragStartListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onMarkerDrag' events.
         *
         * @param callback
         * @returns
         */
        async setOnMarkerDragListener(callback) {
            if (this.onMarkerDragListener) {
                this.onMarkerDragListener.remove();
            }
            if (callback) {
                this.onMarkerDragListener = await CapacitorGoogleMaps.addListener('onMarkerDrag', this.generateCallback(callback));
            }
            else {
                this.onMarkerDragListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onMarkerDragEnd' events.
         *
         * @param callback
         * @returns
         */
        async setOnMarkerDragEndListener(callback) {
            if (this.onMarkerDragEndListener) {
                this.onMarkerDragEndListener.remove();
            }
            if (callback) {
                this.onMarkerDragEndListener = await CapacitorGoogleMaps.addListener('onMarkerDragEnd', this.generateCallback(callback));
            }
            else {
                this.onMarkerDragEndListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onMyLocationButtonClick' events.
         *
         * @param callback
         * @returns
         */
        async setOnMyLocationButtonClickListener(callback) {
            if (this.onMyLocationButtonClickListener) {
                this.onMyLocationButtonClickListener.remove();
            }
            if (callback) {
                this.onMyLocationButtonClickListener = await CapacitorGoogleMaps.addListener('onMyLocationButtonClick', this.generateCallback(callback));
            }
            else {
                this.onMyLocationButtonClickListener = undefined;
            }
        }
        /**
         * Set the event listener on the map for 'onMyLocationClick' events.
         *
         * @param callback
         * @returns
         */
        async setOnMyLocationClickListener(callback) {
            if (this.onMyLocationClickListener) {
                this.onMyLocationClickListener.remove();
            }
            if (callback) {
                this.onMyLocationClickListener = await CapacitorGoogleMaps.addListener('onMyLocationClick', this.generateCallback(callback));
            }
            else {
                this.onMyLocationClickListener = undefined;
            }
        }
        /**
         * Remove all event listeners on the map.
         *
         * @param callback
         * @returns
         */
        async removeAllMapListeners() {
            if (this.onBoundsChangedListener) {
                this.onBoundsChangedListener.remove();
                this.onBoundsChangedListener = undefined;
            }
            if (this.onCameraIdleListener) {
                this.onCameraIdleListener.remove();
                this.onCameraIdleListener = undefined;
            }
            if (this.onCameraMoveStartedListener) {
                this.onCameraMoveStartedListener.remove();
                this.onCameraMoveStartedListener = undefined;
            }
            if (this.onClusterClickListener) {
                this.onClusterClickListener.remove();
                this.onClusterClickListener = undefined;
            }
            if (this.onClusterInfoWindowClickListener) {
                this.onClusterInfoWindowClickListener.remove();
                this.onClusterInfoWindowClickListener = undefined;
            }
            if (this.onInfoWindowClickListener) {
                this.onInfoWindowClickListener.remove();
                this.onInfoWindowClickListener = undefined;
            }
            if (this.onMapClickListener) {
                this.onMapClickListener.remove();
                this.onMapClickListener = undefined;
            }
            if (this.onPolylineClickListener) {
                this.onPolylineClickListener.remove();
                this.onPolylineClickListener = undefined;
            }
            if (this.onMarkerClickListener) {
                this.onMarkerClickListener.remove();
                this.onMarkerClickListener = undefined;
            }
            if (this.onPolygonClickListener) {
                this.onPolygonClickListener.remove();
                this.onPolygonClickListener = undefined;
            }
            if (this.onPoiClickListener) {
                this.onPoiClickListener.remove();
                this.onPoiClickListener = undefined;
            }
            if (this.onCircleClickListener) {
                this.onCircleClickListener.remove();
                this.onCircleClickListener = undefined;
            }
            if (this.onMarkerDragStartListener) {
                this.onMarkerDragStartListener.remove();
                this.onMarkerDragStartListener = undefined;
            }
            if (this.onMarkerDragListener) {
                this.onMarkerDragListener.remove();
                this.onMarkerDragListener = undefined;
            }
            if (this.onMarkerDragEndListener) {
                this.onMarkerDragEndListener.remove();
                this.onMarkerDragEndListener = undefined;
            }
            if (this.onMyLocationButtonClickListener) {
                this.onMyLocationButtonClickListener.remove();
                this.onMyLocationButtonClickListener = undefined;
            }
            if (this.onMyLocationClickListener) {
                this.onMyLocationClickListener.remove();
                this.onMyLocationClickListener = undefined;
            }
        }
        on(event) {
            return rxjs.fromEventPattern((handler) => this.onPromise(event, handler));
        }
        async onPromise(event, callback) {
            switch (event) {
                case exports.GoogleMapsEvent.MAP_READY:
                    this.setOnMapReadyListener(callback);
                    break;
                case exports.GoogleMapsEvent.MAP_CLICK:
                    this.setOnMapClickListener(callback);
                    break;
                case exports.GoogleMapsEvent.POI_CLICK:
                    this.setOnPoiClickListener(callback);
                    break;
                case exports.GoogleMapsEvent.CAMERA_MOVE_END:
                    this.setOnCameraIdleListener(callback);
                    break;
                case exports.GoogleMapsEvent.MARKER_CLICK:
                    this.setOnMarkerClickListener(callback);
                    break;
                case exports.GoogleMapsEvent.MAP_DRAG:
                    this.setOnCameraMoveListener(callback);
                    break;
                case exports.GoogleMapsEvent.MAP_DRAG_START:
                    this.setOnCameraMoveStartedListener(callback);
                    break;
            }
        }
        generateCallback(callback) {
            const mapId = this.id;
            return (data) => {
                if (data.mapId == mapId) {
                    callback(data);
                }
            };
        }
    }

    /* eslint-disable @typescript-eslint/no-unused-vars */
    class CapacitorGoogleMapsWeb extends core.WebPlugin {
        constructor() {
            super(...arguments);
            this.gMapsRef = undefined;
            this.AdvancedMarkerElement = undefined;
            // private PinElement: typeof google.maps.marker.PinElement | undefined = undefined;
            this.maps = {};
            this.currMarkerId = 0;
            this.currPolygonId = 0;
            this.currCircleId = 0;
            this.currPolylineId = 0;
            this.currMapId = 0;
            this.onClusterClickHandler = (_, cluster, map) => {
                var _a;
                const mapId = this.getIdFromMap(map);
                const items = [];
                if (cluster.markers != undefined && this.AdvancedMarkerElement) {
                    for (const marker of cluster.markers) {
                        if (marker instanceof this.AdvancedMarkerElement) {
                            const markerId = this.getIdFromMarker(mapId, marker);
                            const position = marker.position;
                            items.push({
                                markerId: markerId,
                                latitude: position.lat,
                                longitude: position.lng,
                                title: (_a = marker.title) !== null && _a !== void 0 ? _a : '',
                                snippet: '',
                            });
                        }
                    }
                }
                this.notifyListeners('onClusterClick', {
                    mapId: mapId,
                    latitude: cluster.position.lat,
                    longitude: cluster.position.lng,
                    size: cluster.count,
                    items: items,
                });
            };
        }
        getIdFromMap(map) {
            for (const id in this.maps) {
                if (this.maps[id].map == map) {
                    return id;
                }
            }
            return '';
        }
        getIdFromMarker(mapId, marker) {
            for (const id in this.maps[mapId].markers) {
                if (this.maps[mapId].markers[id] == marker) {
                    return id;
                }
            }
            return '';
        }
        async importGoogleLib(apiKey, region, language) {
            if (this.gMapsRef === undefined) {
                const lib = await import('@googlemaps/js-api-loader');
                const loader = new lib.Loader({
                    apiKey: apiKey !== null && apiKey !== void 0 ? apiKey : '',
                    version: 'weekly',
                    libraries: ['places'],
                    language,
                    region,
                });
                const google = await loader.load();
                this.gMapsRef = google.maps;
                // Import marker library once
                // const { AdvancedMarkerElement, PinElement } = (await google.maps.importLibrary(
                //   'marker'
                // )) as google.maps.MarkerLibrary;
                const { AdvancedMarkerElement } = (await google.maps.importLibrary('marker'));
                this.AdvancedMarkerElement = AdvancedMarkerElement;
                // this.PinElement = PinElement;
                console.log('Loaded google maps API');
            }
        }
        async enableTouch(_args) {
            this.maps[_args.id].map.setOptions({ gestureHandling: 'auto' });
        }
        async disableTouch(_args) {
            this.maps[_args.id].map.setOptions({ gestureHandling: 'none' });
        }
        async moveCamera(_args) {
            // Animation not supported yet...
            this.maps[_args.id].map.moveCamera({
                //TODO UPDATE CENTER
                // center: _args.config.target,
                heading: _args.config.bearing,
                tilt: _args.config.tilt,
                zoom: _args.config.zoom,
            });
        }
        async animateCamera(_args) {
            // Animation not supported yet...
            this.maps[_args.id].map.moveCamera({
                //TODO UPDATE CENTER
                // center: _args.config.target,
                heading: _args.config.bearing,
                tilt: _args.config.tilt,
                zoom: _args.config.zoom,
            });
        }
        async getMapType(_args) {
            let type = this.maps[_args.id].map.getMapTypeId();
            if (type !== undefined) {
                if (type === 'roadmap') {
                    type = exports.GoogleMapsMapTypeId.Normal;
                }
                return { type: `${type.charAt(0).toUpperCase()}${type.slice(1)}` };
            }
            throw new Error('Map type is undefined');
        }
        async setMapType(_args) {
            let mapType = _args.mapType.toLowerCase();
            if (_args.mapType === exports.GoogleMapsMapTypeId.Normal) {
                mapType = 'roadmap';
            }
            this.maps[_args.id].map.setMapTypeId(mapType);
        }
        async enableIndoorMaps() {
            throw new Error('Method not supported on web.');
        }
        async enableTrafficLayer(_args) {
            var _a;
            const trafficLayer = (_a = this.maps[_args.id].trafficLayer) !== null && _a !== void 0 ? _a : new google.maps.TrafficLayer();
            if (_args.enabled) {
                trafficLayer.setMap(this.maps[_args.id].map);
                this.maps[_args.id].trafficLayer = trafficLayer;
            }
            else if (this.maps[_args.id].trafficLayer) {
                trafficLayer.setMap(null);
                this.maps[_args.id].trafficLayer = undefined;
            }
        }
        async enableAccessibilityElements() {
            throw new Error('Method not supported on web.');
        }
        dispatchMapEvent() {
            throw new Error('Method not supported on web.');
        }
        async enableCurrentLocation(_args) {
            if (_args.enabled) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        this.maps[_args.id].map.setCenter(pos);
                        this.notifyListeners('onMyLocationButtonClick', {});
                        this.notifyListeners('onMyLocationClick', {});
                    }, () => {
                        throw new Error('Geolocation not supported on web browser.');
                    });
                }
                else {
                    throw new Error('Geolocation not supported on web browser.');
                }
            }
        }
        async setPadding(_args) {
            const bounds = this.maps[_args.id].map.getBounds();
            if (bounds !== undefined) {
                this.maps[_args.id].map.fitBounds(bounds, _args.padding);
            }
        }
        async getMapBounds(_args) {
            const bounds = this.maps[_args.id].map.getBounds();
            if (!bounds) {
                throw new Error('Google Map Bounds could not be found.');
            }
            return new LatLngBounds({
                southwest: {
                    lat: bounds.getSouthWest().lat(),
                    lng: bounds.getSouthWest().lng(),
                },
                center: {
                    lat: bounds.getCenter().lat(),
                    lng: bounds.getCenter().lng(),
                },
                northeast: {
                    lat: bounds.getNorthEast().lat(),
                    lng: bounds.getNorthEast().lng(),
                },
            });
        }
        async fitBounds(_args) {
            const map = this.maps[_args.id].map;
            const bounds = this.getLatLngBounds(_args.bounds);
            map.fitBounds(bounds, _args.padding);
        }
        async removeMarkers(_args) {
            const map = this.maps[_args.id];
            for (const id of _args.markerIds) {
                if (map.markers[id]) {
                    map.markers[id].map = null;
                    delete map.markers[id];
                }
            }
        }
        async clearMarkers(args) {
            const map = this.maps[args.id];
            for (const id in map.markers) {
                map.markers[id].map = null;
                delete map.markers[id];
            }
        }
        async removeMarker(_args) {
            if (this.maps[_args.id].markers[_args.markerId]) {
                this.maps[_args.id].markers[_args.markerId].map = null;
                delete this.maps[_args.id].markers[_args.markerId];
            }
        }
        async addPolygons(_args) {
            const mapObj = this.maps[_args.id];
            if (!mapObj)
                throw new Error(`Map with id ${_args.id} not found`);
            const polygons = [];
            for (const opts of _args.optionsList) {
                const polygon = new google.maps.Polygon(opts);
                polygon.setMap(mapObj.map);
                const id = '' + this.currPolygonId++;
                mapObj.polygons[id] = polygon;
                await this.setPolygonListeners(_args.id, id, polygon);
                polygons.push(Object.assign(Object.assign({}, opts), { shapes: opts.points, id }));
            }
            return { polygons };
        }
        async removePolygons(args) {
            const map = this.maps[args.id];
            for (const id of args.polygonIds) {
                map.polygons[id].setMap(null);
                delete map.polygons[id];
            }
        }
        async removeCircles(args) {
            const map = this.maps[args.id];
            for (const id of args.circleIds) {
                map.circles[id].setMap(null);
                delete map.circles[id];
            }
        }
        async removePolylines(args) {
            const map = this.maps[args.id];
            for (const id of args.polylineIds) {
                map.polylines[id].setMap(null);
                delete map.polylines[id];
            }
        }
        async enableClustering(_args) {
            var _a;
            const markers = [];
            for (const id in this.maps[_args.id].markers) {
                markers.push(this.maps[_args.id].markers[id]);
            }
            this.maps[_args.id].markerClusterer = new markerclusterer.MarkerClusterer({
                map: this.maps[_args.id].map,
                markers: markers,
                algorithm: new markerclusterer.SuperClusterAlgorithm({
                    minPoints: (_a = _args.minClusterSize) !== null && _a !== void 0 ? _a : 4,
                }),
                onClusterClick: this.onClusterClickHandler,
            });
        }
        async disableClustering(_args) {
            const mapInstance = this.maps[_args.id];
            if (mapInstance.markerClusterer) {
                const markers = Object.values(mapInstance.markers);
                mapInstance.markerClusterer.setMap(null);
                mapInstance.markerClusterer = undefined;
                for (const marker of markers) {
                    marker.map = mapInstance.map;
                }
            }
        }
        async onScroll() {
            throw new Error('Method not supported on web.');
        }
        async onResize() {
            throw new Error('Method not supported on web.');
        }
        async onDisplay() {
            throw new Error('Method not supported on web.');
        }
        async create(_args) {
            console.log(`Create map: ${_args.id}`);
            await this.importGoogleLib(_args.apiKey, _args.region, _args.language);
            // Ensure we have a Map ID for Advanced Markers
            const config = Object.assign({}, _args.config);
            if (!config.mapId) {
                config.mapId = `capacitor_map_${this.currMapId++}`;
            }
            this.maps[_args.id] = {
                //TODO MODIFY STYLES HERE
                map: new window.google.maps.Map(_args.element, Object.assign(Object.assign({}, config), { styles: [] })),
                element: _args.element,
                markers: {},
                polygons: {},
                circles: {},
                polylines: {},
            };
            this.setMapListeners(_args.id);
        }
        async destroy(_args) {
            console.log(`Destroy map: ${_args.id}`);
            const mapItem = this.maps[_args.id];
            mapItem.element.innerHTML = '';
            mapItem.map.unbindAll();
            delete this.maps[_args.id];
        }
        async mapBoundsContains(_args) {
            const bounds = this.getLatLngBounds(_args.bounds);
            const point = new google.maps.LatLng(_args.point.lat, _args.point.lng);
            return { contains: bounds.contains(point) };
        }
        async mapBoundsExtend(_args) {
            const bounds = this.getLatLngBounds(_args.bounds);
            const point = new google.maps.LatLng(_args.point.lat, _args.point.lng);
            bounds.extend(point);
            const result = new LatLngBounds({
                southwest: {
                    lat: bounds.getSouthWest().lat(),
                    lng: bounds.getSouthWest().lng(),
                },
                center: {
                    lat: bounds.getCenter().lat(),
                    lng: bounds.getCenter().lng(),
                },
                northeast: {
                    lat: bounds.getNorthEast().lat(),
                    lng: bounds.getNorthEast().lng(),
                },
            });
            return { bounds: result };
        }
        getLatLngBounds(_args) {
            return new google.maps.LatLngBounds(new google.maps.LatLng(_args.southwest.lat, _args.southwest.lng), new google.maps.LatLng(_args.northeast.lat, _args.northeast.lng));
        }
        async setCircleListeners(mapId, circleId, circle) {
            circle.addListener('click', () => {
                this.notifyListeners('onCircleClick', {
                    mapId: mapId,
                    circleId: circleId,
                    tag: circle.get('tag'),
                });
            });
        }
        async setPolygonListeners(mapId, polygonId, polygon) {
            polygon.addListener('click', () => {
                this.notifyListeners('onPolygonClick', {
                    mapId: mapId,
                    polygonId: polygonId,
                    tag: polygon.get('tag'),
                });
            });
        }
        async setPolylineListeners(mapId, polylineId, polyline) {
            polyline.addListener('click', () => {
                this.notifyListeners('onPolylineClick', {
                    mapId: mapId,
                    polylineId: polylineId,
                    tag: polyline.get('tag'),
                });
            });
        }
        async setMarkerListeners(mapId, markerId, marker) {
            marker.addListener('click', () => {
                var _a;
                const position = marker.position;
                this.notifyListeners('onMarkerClick', {
                    mapId: mapId,
                    markerId: markerId,
                    latitude: position.lat,
                    longitude: position.lng,
                    title: (_a = marker.title) !== null && _a !== void 0 ? _a : '',
                    snippet: '',
                });
            });
            if (marker.gmpDraggable) {
                marker.addListener('dragstart', () => {
                    var _a;
                    const position = marker.position;
                    this.notifyListeners('onMarkerDragStart', {
                        mapId: mapId,
                        markerId: markerId,
                        latitude: position.lat,
                        longitude: position.lng,
                        title: (_a = marker.title) !== null && _a !== void 0 ? _a : '',
                        snippet: '',
                    });
                });
                marker.addListener('drag', () => {
                    var _a;
                    const position = marker.position;
                    this.notifyListeners('onMarkerDrag', {
                        mapId: mapId,
                        markerId: markerId,
                        latitude: position.lat,
                        longitude: position.lng,
                        title: (_a = marker.title) !== null && _a !== void 0 ? _a : '',
                        snippet: '',
                    });
                });
                marker.addListener('dragend', () => {
                    var _a;
                    const position = marker.position;
                    this.notifyListeners('onMarkerDragEnd', {
                        mapId: mapId,
                        markerId: markerId,
                        latitude: position.lat,
                        longitude: position.lng,
                        title: (_a = marker.title) !== null && _a !== void 0 ? _a : '',
                        snippet: '',
                    });
                });
            }
        }
        async setMapListeners(mapId) {
            const map = this.maps[mapId].map;
            map.addListener('idle', async () => {
                var _a, _b;
                const bounds = await this.getMapBounds({ id: mapId });
                this.notifyListeners('onCameraIdle', {
                    mapId: mapId,
                    bearing: map.getHeading(),
                    bounds: bounds,
                    latitude: (_a = map.getCenter()) === null || _a === void 0 ? void 0 : _a.lat(),
                    longitude: (_b = map.getCenter()) === null || _b === void 0 ? void 0 : _b.lng(),
                    tilt: map.getTilt(),
                    zoom: map.getZoom(),
                });
            });
            map.addListener('center_changed', () => {
                this.notifyListeners('onCameraMoveStarted', {
                    mapId: mapId,
                    isGesture: true,
                });
            });
            map.addListener('bounds_changed', async () => {
                var _a, _b;
                const bounds = await this.getMapBounds({ id: mapId });
                this.notifyListeners('onBoundsChanged', {
                    mapId: mapId,
                    bearing: map.getHeading(),
                    bounds: bounds,
                    latitude: (_a = map.getCenter()) === null || _a === void 0 ? void 0 : _a.lat(),
                    longitude: (_b = map.getCenter()) === null || _b === void 0 ? void 0 : _b.lng(),
                    tilt: map.getTilt(),
                    zoom: map.getZoom(),
                });
            });
            map.addListener('click', (e) => {
                var _a, _b;
                this.notifyListeners('onMapClick', {
                    mapId: mapId,
                    latitude: (_a = e.latLng) === null || _a === void 0 ? void 0 : _a.lat(),
                    longitude: (_b = e.latLng) === null || _b === void 0 ? void 0 : _b.lng(),
                });
            });
            this.notifyListeners('onMapReady', {
                mapId: mapId,
            });
        }
        async getVisibleRegion(_args) {
            const map = this.maps[_args.id].map;
            const bounds = map.getBounds();
            if (!bounds)
                throw new Error('Map bounds not available');
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            const projection = map.getProjection();
            if (!projection)
                throw new Error('Projection not available');
            return {
                nearLeft: { lat: sw.lat(), lng: sw.lng() },
                nearRight: { lat: sw.lat(), lng: ne.lng() },
                farLeft: { lat: ne.lat(), lng: sw.lng() },
                farRight: { lat: ne.lat(), lng: ne.lng() },
                southwest: { lat: sw.lat(), lng: sw.lng() },
                northeast: { lat: ne.lat(), lng: ne.lng() },
            };
        }
        async enableCompass(_args) {
            this.maps[_args.id].map.setOptions({
                rotateControl: _args.enabled,
            });
        }
        async enableToolbar(_args) {
            this.maps[_args.id].map.setOptions({
                zoomControl: _args.isEnabled,
                mapTypeControl: _args.isEnabled,
            });
        }
        async enableMyLocation(_args) {
            if (_args.isEnabled && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                    this.maps[_args.id].map.setCenter(latLng);
                });
            }
        }
        async enableAllGestures(_args) {
            this.maps[_args.id].map.setOptions({
                gestureHandling: _args.isEnabled ? 'auto' : 'none',
            });
        }
        async enableTiltGesture(_args) {
            this.maps[_args.id].map.setOptions({
                tilt: _args.isEnabled ? 45 : 0,
            });
        }
        async enableTiltRotateGesture(_args) {
            this.maps[_args.id].map.setOptions({
                rotateControl: _args.isEnabled,
                tilt: _args.isEnabled ? 45 : 0,
            });
        }
        async setMapPreferences(_args) {
            this.maps[_args.id].map.setOptions({
                styles: [],
                mapTypeControl: true,
                fullscreenControl: true,
            });
            const bounds = this.maps[_args.id].map.getBounds();
            if (_args.padding && bounds != null) {
                this.maps[_args.id].map.fitBounds(bounds, _args.padding);
            }
            if (_args.building !== undefined) {
                this.maps[_args.id].map.setOptions({ isFractionalZoomEnabled: _args.building });
            }
        }
        async setCameraBearing(_args) {
            this.maps[_args.id].map.setOptions({
                heading: _args.bearing,
            });
        }
        async setOptions(_args) {
            this.maps[_args.id].map.setOptions(_args.config);
        }
        async getCameraZoom(_args) {
            var _a;
            return { cameraZoom: (_a = this.maps[_args.id].map.getZoom()) !== null && _a !== void 0 ? _a : 0 };
        }
        async addMarker(_args) {
            if (!this.AdvancedMarkerElement)
                throw new Error('AdvancedMarkerElement not loaded');
            const marker = new this.AdvancedMarkerElement({
                position: _args.options.position,
                map: this.maps[_args.id].map,
                title: _args.options.title,
                gmpDraggable: _args.options.draggable,
            });
            const id = '' + this.currMarkerId++;
            this.maps[_args.id].markers[id] = marker;
            await this.setMarkerListeners(_args.id, id, marker);
            return Object.assign(Object.assign({}, _args.options), { coordinate: _args.options.position, id });
        }
        async addMarkers(_args) {
            const results = [];
            for (const options of _args.optionsList) {
                const added = await this.addMarker({ id: _args.id, options });
                results.push(added);
            }
            return { markers: results };
        }
        async setMarkerIcon(_args) {
            var _a;
            const marker = this.maps[_args.id].markers[_args.markerId];
            if (!marker)
                return;
            const img = document.createElement('img');
            img.src = (_a = _args.url) !== null && _a !== void 0 ? _a : '';
            if (_args.size) {
                img.style.width = `${_args.size.width}px`;
                img.style.height = `${_args.size.height}px`;
            }
            marker.content = img;
        }
        async setMarkerIconAnchor(_args) {
            // Google Maps AdvancedMarker doesn’t support anchor directly, so this is a no-op
        }
        async setMarkerZIndex(_args) {
            const marker = this.maps[_args.id].markers[_args.markerId];
            if (marker)
                marker.zIndex = _args.zIndex;
        }
        async setMarkerVisibility(_args) {
            const marker = this.maps[_args.id].markers[_args.markerId];
            if (marker)
                marker.map = _args.isVisible ? this.maps[_args.id].map : null;
        }
        async getMarkerPosition(_args) {
            const marker = this.maps[_args.id].markers[_args.markerId];
            if (!marker)
                throw new Error('Marker not found');
            const pos = marker.position;
            return { position: { lat: pos.lat, lng: pos.lng } };
        }
        async addPolyline(_args) {
            const polyline = new google.maps.Polyline(_args.options);
            polyline.setMap(this.maps[_args.id].map);
            const id = '' + this.currPolylineId++;
            this.maps[_args.id].polylines[id] = polyline;
            await this.setPolylineListeners(_args.id, id, polyline);
            return Object.assign(Object.assign({}, _args.options), { id });
        }
        async setPolylineStrokeColor(_args) {
            const polyline = this.maps[_args.id].polylines[_args.polylineId];
            if (polyline)
                polyline.setOptions({ strokeColor: _args.strokeColor });
        }
        async setPolylineStrokeWidth(_args) {
            const polyline = this.maps[_args.id].polylines[_args.polylineId];
            if (polyline)
                polyline.setOptions({ strokeWeight: _args.strokeWidth });
        }
        async setPolylineZIndex(_args) {
            const polyline = this.maps[_args.id].polylines[_args.polylineId];
            if (polyline)
                polyline.setOptions({ zIndex: _args.zIndex });
        }
        async removePolyline(_args) {
            const polyline = this.maps[_args.id].polylines[_args.polylineId];
            if (polyline) {
                polyline.setMap(null);
                delete this.maps[_args.id].polylines[_args.polylineId];
            }
        }
        async addCircles(_args) {
            const results = [];
            for (const circle of _args.optionsList) {
                const added = await this.addCircle({ id: _args.id, options: circle });
                results.push(added);
            }
            return { circles: results };
        }
        async addCircle(_args) {
            const circle = new google.maps.Circle(_args.options);
            circle.setMap(this.maps[_args.id].map);
            const id = '' + this.currCircleId++;
            this.maps[_args.id].circles[id] = circle;
            await this.setCircleListeners(_args.id, id, circle);
            return Object.assign(Object.assign({}, _args.options), { id });
        }
        async setCircleCenter(_args) {
            const circle = this.maps[_args.id].circles[_args.circleId];
            if (circle)
                circle.setCenter(_args.center);
        }
        async removeCircle(_args) {
            const circle = this.maps[_args.id].circles[_args.circleId];
            if (circle) {
                circle.setMap(null);
                delete this.maps[_args.id].circles[_args.circleId];
            }
        }
        async setCameraTarget(_args) {
            const map = this.maps[_args.id].map;
            if (Array.isArray(_args.target)) {
                const bounds = new google.maps.LatLngBounds();
                _args.target.forEach((t) => bounds.extend(t));
                map.fitBounds(bounds);
            }
            else {
                map.setCenter(_args.target);
            }
        }
        async getCameraTarget(_args) {
            const center = this.maps[_args.id].map.getCenter();
            if (!center)
                throw new Error('Center not available');
            return { cameraTarget: { lat: center.lat(), lng: center.lng() } };
        }
        async fromPointToLatLng(_args) {
            const map = this.maps[_args.id].map;
            const projection = map.getProjection();
            if (!projection)
                throw new Error('Projection not ready');
            const point = new google.maps.Point(_args.points[0], _args.points[1]);
            const latLng = projection.fromPointToLatLng(point);
            if (!latLng)
                throw new Error('Failed to project point');
            return { latLng: { lat: latLng.lat(), lng: latLng.lng() } };
        }
        async addPolylines(_args) {
            const mapObj = this.maps[_args.id];
            if (!mapObj)
                throw new Error(`Map with id ${_args.id} not found`);
            const polylines = [];
            for (const opts of _args.optionsList) {
                const polyline = new google.maps.Polyline(opts);
                polyline.setMap(mapObj.map);
                const id = '' + this.currPolylineId++;
                mapObj.polylines[id] = polyline;
                await this.setPolylineListeners(_args.id, id, polyline);
                polylines.push(Object.assign(Object.assign({}, opts), { id }));
            }
            return { polylines };
        }
        async addPolygon(_args) {
            const polygon = new google.maps.Polygon(_args.options);
            polygon.setMap(this.maps[_args.id].map);
            const id = '' + this.currPolygonId++;
            this.maps[_args.id].polygons[id] = polygon;
            await this.setPolygonListeners(_args.id, id, polygon);
            return Object.assign(Object.assign({}, _args.options), { shapes: _args.options.points, id });
        }
        async removePolygon(_args) {
            const polygon = this.maps[_args.id].polygons[_args.polygonId];
            if (polygon) {
                polygon.setMap(null);
                delete this.maps[_args.id].polygons[_args.polygonId];
            }
        }
        async isMarkerRemoved(_args) {
            return { isRemoved: this.maps[_args.id].markers[_args.markerId] == null };
        }
        async isPolylineRemoved(_args) {
            return { isRemoved: this.maps[_args.id].polylines[_args.polylineId] == null };
        }
    }

    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        CapacitorGoogleMapsWeb: CapacitorGoogleMapsWeb
    });

    exports.CapacitorCircle = CapacitorCircle;
    exports.CapacitorMarker = CapacitorMarker;
    exports.CapacitorPolygon = CapacitorPolygon;
    exports.CapacitorPolyline = CapacitorPolyline;
    exports.GoogleMap = GoogleMap;
    exports.LatLng = LatLng;
    exports.LatLngBounds = LatLngBounds;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, capacitorExports, rxjs, markerclusterer);
//# sourceMappingURL=plugin.js.map
