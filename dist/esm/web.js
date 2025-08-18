/* eslint-disable @typescript-eslint/no-unused-vars */
import { WebPlugin } from '@capacitor/core';
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import { MapType, LatLngBounds } from './definitions';
export class CapacitorGoogleMapsWeb extends WebPlugin {
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
                type = MapType.Normal;
            }
            return { type: `${type.charAt(0).toUpperCase()}${type.slice(1)}` };
        }
        throw new Error('Map type is undefined');
    }
    async setMapType(_args) {
        let mapType = _args.mapType.toLowerCase();
        if (_args.mapType === MapType.Normal) {
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
        this.maps[_args.id].markerClusterer = new MarkerClusterer({
            map: this.maps[_args.id].map,
            markers: markers,
            algorithm: new SuperClusterAlgorithm({
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
}
//# sourceMappingURL=web.js.map