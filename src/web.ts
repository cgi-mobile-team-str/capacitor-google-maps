/* eslint-disable @typescript-eslint/no-unused-vars */
import { WebPlugin } from '@capacitor/core';
import type { Cluster, onClusterClickHandler } from '@googlemaps/markerclusterer';
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';

import type { Circle, LatLng, Marker, Polygon, Polyline, VisibleRegion } from './definitions';
import { MapType, LatLngBounds } from './definitions';
import type {
  AddMarkerArgs,
  CameraArgs,
  AddMarkersArgs,
  CapacitorGoogleMapsPlugin,
  CreateMapArgs,
  CurrentLocArgs,
  DestroyMapArgs,
  MapTypeArgs,
  PaddingArgs,
  RemoveMarkerArgs,
  TrafficLayerArgs,
  RemoveMarkersArgs,
  MapBoundsContainsArgs,
  EnableClusteringArgs,
  FitBoundsArgs,
  MapBoundsExtendArgs,
  AddPolygonsArgs,
  RemovePolygonsArgs,
  AddCirclesArgs,
  RemoveCirclesArgs,
  AddPolylinesArgs,
  RemovePolylinesArgs,
  EnableCompassArgs,
  MapOptionsArgs,
  MarkerIconArgs,
  MarkerIconAnchorArgs,
  MarkerZIndexArgs,
  MarkerPositionArgs,
  MarkerVisibilityArgs,
  AddPolylineArgs,
  PolylineStrokeColorArgs,
  PolylineStrokeWidthArgs,
  RemovePolylineArgs,
  SetCameraTargetArgs,
  FromPointToLatLngArgs,
  AddCircleArgs,
  RemoveCircleArgs,
  SetCircleCenterArgs,
  EnableToolbarArgs,
  EnableMyLocationArgs,
  EnableAllGesturesArgs,
  EnableTiltGestureArgs,
  CameraBearingArgs,
  SetMapPreferencesArgs,
  EnableTiltRotateGestureArgs,
  AddPolygonArgs,
  RemovePolygonArgs,
} from './implementation';

export class CapacitorGoogleMapsWeb extends WebPlugin implements CapacitorGoogleMapsPlugin {
  private gMapsRef: typeof google.maps | undefined = undefined;
  private AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement | undefined = undefined;
  // private PinElement: typeof google.maps.marker.PinElement | undefined = undefined;
  private maps: {
    [id: string]: {
      element: HTMLElement;
      map: google.maps.Map;
      markers: {
        [id: string]: google.maps.marker.AdvancedMarkerElement;
      };
      polygons: {
        [id: string]: google.maps.Polygon;
      };
      circles: {
        [id: string]: google.maps.Circle;
      };
      polylines: {
        [id: string]: google.maps.Polyline;
      };
      markerClusterer?: MarkerClusterer;
      trafficLayer?: google.maps.TrafficLayer;
    };
  } = {};

  private currMarkerId = 0;
  private currPolygonId = 0;
  private currCircleId = 0;
  private currPolylineId = 0;
  private currMapId = 0;

  private onClusterClickHandler: onClusterClickHandler = (
    _: google.maps.MapMouseEvent,
    cluster: Cluster,
    map: google.maps.Map
  ): void => {
    const mapId = this.getIdFromMap(map);
    const items: any[] = [];

    if (cluster.markers != undefined && this.AdvancedMarkerElement) {
      for (const marker of cluster.markers) {
        if (marker instanceof this.AdvancedMarkerElement) {
          const markerId = this.getIdFromMarker(mapId, marker);
          const position = marker.position as google.maps.LatLngLiteral;

          items.push({
            markerId: markerId,
            latitude: position.lat,
            longitude: position.lng,
            title: marker.title ?? '',
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

  private getIdFromMap(map: google.maps.Map): string {
    for (const id in this.maps) {
      if (this.maps[id].map == map) {
        return id;
      }
    }

    return '';
  }

  private getIdFromMarker(mapId: string, marker: google.maps.marker.AdvancedMarkerElement): string {
    for (const id in this.maps[mapId].markers) {
      if (this.maps[mapId].markers[id] == marker) {
        return id;
      }
    }

    return '';
  }

  private async importGoogleLib(apiKey: string, region?: string, language?: string) {
    if (this.gMapsRef === undefined) {
      const lib = await import('@googlemaps/js-api-loader');
      const loader = new lib.Loader({
        apiKey: apiKey ?? '',
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
      const { AdvancedMarkerElement } = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;
      this.AdvancedMarkerElement = AdvancedMarkerElement;
      // this.PinElement = PinElement;

      console.log('Loaded google maps API');
    }
  }

  async enableTouch(_args: { id: string }): Promise<void> {
    this.maps[_args.id].map.setOptions({ gestureHandling: 'auto' });
  }

  async disableTouch(_args: { id: string }): Promise<void> {
    this.maps[_args.id].map.setOptions({ gestureHandling: 'none' });
  }

  async moveCamera(_args: CameraArgs): Promise<void> {
    // Animation not supported yet...
    this.maps[_args.id].map.moveCamera({
      //TODO UPDATE CENTER
      // center: _args.config.target,
      heading: _args.config.bearing,
      tilt: _args.config.tilt,
      zoom: _args.config.zoom,
    });
  }

  async animateCamera(_args: CameraArgs): Promise<void> {
    // Animation not supported yet...
    this.maps[_args.id].map.moveCamera({
      //TODO UPDATE CENTER
      // center: _args.config.target,
      heading: _args.config.bearing,
      tilt: _args.config.tilt,
      zoom: _args.config.zoom,
    });
  }

  async getMapType(_args: { id: string }): Promise<{ type: string }> {
    let type = this.maps[_args.id].map.getMapTypeId();
    if (type !== undefined) {
      if (type === 'roadmap') {
        type = MapType.Normal;
      }
      return { type: `${type.charAt(0).toUpperCase()}${type.slice(1)}` };
    }
    throw new Error('Map type is undefined');
  }

  async setMapType(_args: MapTypeArgs): Promise<void> {
    let mapType = _args.mapType.toLowerCase();
    if (_args.mapType === MapType.Normal) {
      mapType = 'roadmap';
    }
    this.maps[_args.id].map.setMapTypeId(mapType);
  }

  async enableIndoorMaps(): Promise<void> {
    throw new Error('Method not supported on web.');
  }

  async enableTrafficLayer(_args: TrafficLayerArgs): Promise<void> {
    const trafficLayer = this.maps[_args.id].trafficLayer ?? new google.maps.TrafficLayer();

    if (_args.enabled) {
      trafficLayer.setMap(this.maps[_args.id].map);
      this.maps[_args.id].trafficLayer = trafficLayer;
    } else if (this.maps[_args.id].trafficLayer) {
      trafficLayer.setMap(null);
      this.maps[_args.id].trafficLayer = undefined;
    }
  }

  async enableAccessibilityElements(): Promise<void> {
    throw new Error('Method not supported on web.');
  }

  dispatchMapEvent(): Promise<void> {
    throw new Error('Method not supported on web.');
  }

  async enableCurrentLocation(_args: CurrentLocArgs): Promise<void> {
    if (_args.enabled) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            this.maps[_args.id].map.setCenter(pos);

            this.notifyListeners('onMyLocationButtonClick', {});

            this.notifyListeners('onMyLocationClick', {});
          },
          () => {
            throw new Error('Geolocation not supported on web browser.');
          }
        );
      } else {
        throw new Error('Geolocation not supported on web browser.');
      }
    }
  }

  async setPadding(_args: PaddingArgs): Promise<void> {
    const bounds = this.maps[_args.id].map.getBounds();

    if (bounds !== undefined) {
      this.maps[_args.id].map.fitBounds(bounds, _args.padding);
    }
  }

  async getMapBounds(_args: { id: string }): Promise<LatLngBounds> {
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

  async fitBounds(_args: FitBoundsArgs): Promise<void> {
    const map = this.maps[_args.id].map;
    const bounds = this.getLatLngBounds(_args.bounds);
    map.fitBounds(bounds, _args.padding);
  }

  async removeMarkers(_args: RemoveMarkersArgs): Promise<void> {
    const map = this.maps[_args.id];

    for (const id of _args.markerIds) {
      if (map.markers[id]) {
        map.markers[id].map = null;
        delete map.markers[id];
      }
    }
  }

  async removeMarker(_args: RemoveMarkerArgs): Promise<void> {
    if (this.maps[_args.id].markers[_args.markerId]) {
      this.maps[_args.id].markers[_args.markerId].map = null;
      delete this.maps[_args.id].markers[_args.markerId];
    }
  }

  async addPolygons(_args: AddPolygonsArgs): Promise<{ polygons: (Polygon & { id: string })[] }> {
    const mapObj = this.maps[_args.id];
    if (!mapObj) throw new Error(`Map with id ${_args.id} not found`);

    const polygons: (Polygon & { id: string })[] = [];

    for (const opts of _args.optionsList) {
      const polygon = new google.maps.Polygon(opts);
      polygon.setMap(mapObj.map);

      const id = '' + this.currPolygonId++;
      mapObj.polygons[id] = polygon;

      await this.setPolygonListeners(_args.id, id, polygon);

      polygons.push({ ...opts, shapes: opts.points, id });
    }

    return { polygons };
  }

  async removePolygons(args: RemovePolygonsArgs): Promise<void> {
    const map = this.maps[args.id];

    for (const id of args.polygonIds) {
      map.polygons[id].setMap(null);
      delete map.polygons[id];
    }
  }

  async removeCircles(args: RemoveCirclesArgs): Promise<void> {
    const map = this.maps[args.id];

    for (const id of args.circleIds) {
      map.circles[id].setMap(null);
      delete map.circles[id];
    }
  }

  async removePolylines(args: RemovePolylinesArgs): Promise<void> {
    const map = this.maps[args.id];

    for (const id of args.polylineIds) {
      map.polylines[id].setMap(null);
      delete map.polylines[id];
    }
  }

  async enableClustering(_args: EnableClusteringArgs): Promise<void> {
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];

    for (const id in this.maps[_args.id].markers) {
      markers.push(this.maps[_args.id].markers[id]);
    }

    this.maps[_args.id].markerClusterer = new MarkerClusterer({
      map: this.maps[_args.id].map,
      markers: markers,
      algorithm: new SuperClusterAlgorithm({
        minPoints: _args.minClusterSize ?? 4,
      }),
      onClusterClick: this.onClusterClickHandler,
    });
  }

  async disableClustering(_args: { id: string }): Promise<void> {
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

  async onScroll(): Promise<void> {
    throw new Error('Method not supported on web.');
  }

  async onResize(): Promise<void> {
    throw new Error('Method not supported on web.');
  }

  async onDisplay(): Promise<void> {
    throw new Error('Method not supported on web.');
  }

  async create(_args: CreateMapArgs): Promise<void> {
    console.log(`Create map: ${_args.id}`);
    await this.importGoogleLib(_args.apiKey, _args.region, _args.language);

    // Ensure we have a Map ID for Advanced Markers
    const config = { ..._args.config };
    if (!config.mapId) {
      config.mapId = `capacitor_map_${this.currMapId++}`;
    }

    this.maps[_args.id] = {
      //TODO MODIFY STYLES HERE
      map: new window.google.maps.Map(_args.element, { ...config, styles: [] }),
      element: _args.element,
      markers: {},
      polygons: {},
      circles: {},
      polylines: {},
    };
    this.setMapListeners(_args.id);
  }

  async destroy(_args: DestroyMapArgs): Promise<void> {
    console.log(`Destroy map: ${_args.id}`);
    const mapItem = this.maps[_args.id];
    mapItem.element.innerHTML = '';
    mapItem.map.unbindAll();
    delete this.maps[_args.id];
  }

  async mapBoundsContains(_args: MapBoundsContainsArgs): Promise<{ contains: boolean }> {
    const bounds = this.getLatLngBounds(_args.bounds);
    const point = new google.maps.LatLng(_args.point.lat, _args.point.lng);
    return { contains: bounds.contains(point) };
  }

  async mapBoundsExtend(_args: MapBoundsExtendArgs): Promise<{ bounds: LatLngBounds }> {
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

  private getLatLngBounds(_args: LatLngBounds): google.maps.LatLngBounds {
    return new google.maps.LatLngBounds(
      new google.maps.LatLng(_args.southwest.lat, _args.southwest.lng),
      new google.maps.LatLng(_args.northeast.lat, _args.northeast.lng)
    );
  }

  async setCircleListeners(mapId: string, circleId: string, circle: google.maps.Circle): Promise<void> {
    circle.addListener('click', () => {
      this.notifyListeners('onCircleClick', {
        mapId: mapId,
        circleId: circleId,
        tag: circle.get('tag'),
      });
    });
  }

  async setPolygonListeners(mapId: string, polygonId: string, polygon: google.maps.Polygon): Promise<void> {
    polygon.addListener('click', () => {
      this.notifyListeners('onPolygonClick', {
        mapId: mapId,
        polygonId: polygonId,
        tag: polygon.get('tag'),
      });
    });
  }

  async setPolylineListeners(mapId: string, polylineId: string, polyline: google.maps.Polyline): Promise<void> {
    polyline.addListener('click', () => {
      this.notifyListeners('onPolylineClick', {
        mapId: mapId,
        polylineId: polylineId,
        tag: polyline.get('tag'),
      });
    });
  }

  async setMarkerListeners(
    mapId: string,
    markerId: string,
    marker: google.maps.marker.AdvancedMarkerElement
  ): Promise<void> {
    marker.addListener('click', () => {
      const position = marker.position as google.maps.LatLngLiteral;
      this.notifyListeners('onMarkerClick', {
        mapId: mapId,
        markerId: markerId,
        latitude: position.lat,
        longitude: position.lng,
        title: marker.title ?? '',
        snippet: '',
      });
    });

    if (marker.gmpDraggable) {
      marker.addListener('dragstart', () => {
        const position = marker.position as google.maps.LatLngLiteral;
        this.notifyListeners('onMarkerDragStart', {
          mapId: mapId,
          markerId: markerId,
          latitude: position.lat,
          longitude: position.lng,
          title: marker.title ?? '',
          snippet: '',
        });
      });

      marker.addListener('drag', () => {
        const position = marker.position as google.maps.LatLngLiteral;
        this.notifyListeners('onMarkerDrag', {
          mapId: mapId,
          markerId: markerId,
          latitude: position.lat,
          longitude: position.lng,
          title: marker.title ?? '',
          snippet: '',
        });
      });

      marker.addListener('dragend', () => {
        const position = marker.position as google.maps.LatLngLiteral;
        this.notifyListeners('onMarkerDragEnd', {
          mapId: mapId,
          markerId: markerId,
          latitude: position.lat,
          longitude: position.lng,
          title: marker.title ?? '',
          snippet: '',
        });
      });
    }
  }

  async setMapListeners(mapId: string): Promise<void> {
    const map = this.maps[mapId].map;

    map.addListener('idle', async () => {
      const bounds = await this.getMapBounds({ id: mapId });
      this.notifyListeners('onCameraIdle', {
        mapId: mapId,
        bearing: map.getHeading(),
        bounds: bounds,
        latitude: map.getCenter()?.lat(),
        longitude: map.getCenter()?.lng(),
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
      const bounds = await this.getMapBounds({ id: mapId });
      this.notifyListeners('onBoundsChanged', {
        mapId: mapId,
        bearing: map.getHeading(),
        bounds: bounds,
        latitude: map.getCenter()?.lat(),
        longitude: map.getCenter()?.lng(),
        tilt: map.getTilt(),
        zoom: map.getZoom(),
      });
    });

    map.addListener('click', (e: google.maps.MapMouseEvent | google.maps.IconMouseEvent) => {
      this.notifyListeners('onMapClick', {
        mapId: mapId,
        latitude: e.latLng?.lat(),
        longitude: e.latLng?.lng(),
      });
    });

    this.notifyListeners('onMapReady', {
      mapId: mapId,
    });
  }

  async getVisibleRegion(_args: { id: string }): Promise<VisibleRegion> {
    const map = this.maps[_args.id].map;
    const bounds = map.getBounds();
    if (!bounds) throw new Error('Map bounds not available');

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const projection = map.getProjection();
    if (!projection) throw new Error('Projection not available');

    return {
      nearLeft: { lat: sw.lat(), lng: sw.lng() },
      nearRight: { lat: sw.lat(), lng: ne.lng() },
      farLeft: { lat: ne.lat(), lng: sw.lng() },
      farRight: { lat: ne.lat(), lng: ne.lng() },
      southwest: { lat: sw.lat(), lng: sw.lng() },
      northeast: { lat: ne.lat(), lng: ne.lng() },
    };
  }

  async enableCompass(_args: EnableCompassArgs): Promise<void> {
    this.maps[_args.id].map.setOptions({
      rotateControl: _args.enabled,
    });
  }

  async enableToolbar(_args: EnableToolbarArgs): Promise<void> {
    this.maps[_args.id].map.setOptions({
      zoomControl: _args.isEnabled,
      mapTypeControl: _args.isEnabled,
    });
  }

  async enableMyLocation(_args: EnableMyLocationArgs): Promise<void> {
    if (_args.isEnabled && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        this.maps[_args.id].map.setCenter(latLng);
      });
    }
  }

  async enableAllGestures(_args: EnableAllGesturesArgs): Promise<void> {
    this.maps[_args.id].map.setOptions({
      gestureHandling: _args.isEnabled ? 'auto' : 'none',
    });
  }

  async enableTiltGesture(_args: EnableTiltGestureArgs): Promise<void> {
    this.maps[_args.id].map.setOptions({
      tilt: _args.isEnabled ? 45 : 0,
    });
  }

  async enableTiltRotateGesture(_args: EnableTiltRotateGestureArgs): Promise<void> {
    this.maps[_args.id].map.setOptions({
      rotateControl: _args.isEnabled,
      tilt: _args.isEnabled ? 45 : 0,
    });
  }

  async setMapPreferences(_args: SetMapPreferencesArgs): Promise<void> {
    this.maps[_args.id].map.setOptions({
      styles: [],
      mapTypeControl: true,
      fullscreenControl: true,
    });
    const bounds = this.maps[_args.id].map.getBounds();
    if (_args.padding && bounds != null) {
      this.maps[_args.id].map.fitBounds(bounds, _args.padding );
    }

    if (_args.building !== undefined) {
      this.maps[_args.id].map.setOptions({ isFractionalZoomEnabled: _args.building });
    }
  }

  async setCameraBearing(_args: CameraBearingArgs): Promise<void> {
    this.maps[_args.id].map.setOptions({
      heading: _args.bearing,
    });
  }

  async setOptions(_args: MapOptionsArgs): Promise<void> {
    this.maps[_args.id].map.setOptions(_args.config);
  }

  async getCameraZoom(_args: { id: string }): Promise<{ cameraZoom: number }> {
    return { cameraZoom: this.maps[_args.id].map.getZoom() ?? 0 };
  }

  async addMarker(_args: AddMarkerArgs): Promise<Marker & { id: string }> {
    if (!this.AdvancedMarkerElement) throw new Error('AdvancedMarkerElement not loaded');

    const marker = new this.AdvancedMarkerElement({
      position: _args.options.position,
      map: this.maps[_args.id].map,
      title: _args.options.title,
      gmpDraggable: _args.options.draggable,
    });

    const id = '' + this.currMarkerId++;
    this.maps[_args.id].markers[id] = marker;
    await this.setMarkerListeners(_args.id, id, marker);

    return {..._args.options, coordinate: _args.options.position,  id };
  }

  async addMarkers(_args: AddMarkersArgs): Promise<{ markers: (Marker & { id: string })[] }> {
    const results: (Marker & { id: string })[] = [];
    for (const options of _args.optionsList) {
      const added = await this.addMarker({ id: _args.id, options });
      results.push(added);
    }
    return { markers: results };
  }

  async setMarkerIcon(_args: MarkerIconArgs): Promise<void> {
    const marker = this.maps[_args.id].markers[_args.markerId];
    if (!marker) return;

    const img = document.createElement('img');
    img.src = _args.url ?? '';
    if (_args.size) {
      img.style.width = `${_args.size.width}px`;
      img.style.height = `${_args.size.height}px`;
    }
    marker.content = img;
  }

  async setMarkerIconAnchor(_args: MarkerIconAnchorArgs): Promise<void> {
    // Google Maps AdvancedMarker doesn’t support anchor directly, so this is a no-op
  }

  async setMarkerZIndex(_args: MarkerZIndexArgs): Promise<void> {
    const marker = this.maps[_args.id].markers[_args.markerId];
    if (marker) marker.zIndex = _args.zIndex;
  }

  async setMarkerVisibility(_args: MarkerVisibilityArgs): Promise<void> {
    const marker = this.maps[_args.id].markers[_args.markerId];
    if (marker) marker.map = _args.isVisible ? this.maps[_args.id].map : null;
  }

  async getMarkerPosition(_args: MarkerPositionArgs): Promise<{ position: LatLng }> {
    const marker = this.maps[_args.id].markers[_args.markerId];
    if (!marker) throw new Error('Marker not found');
    const pos = marker.position as google.maps.LatLngLiteral;
    return { position: { lat: pos.lat, lng: pos.lng } };
  }

  async addPolyline(_args: AddPolylineArgs): Promise<Polyline & { id: string }> {
    const polyline = new google.maps.Polyline(_args.options);
    polyline.setMap(this.maps[_args.id].map);

    const id = '' + this.currPolylineId++;
    this.maps[_args.id].polylines[id] = polyline;
    await this.setPolylineListeners(_args.id, id, polyline);

    return { ..._args.options, id };
  }

  async setPolylineStrokeColor(_args: PolylineStrokeColorArgs): Promise<void> {
    const polyline = this.maps[_args.id].polylines[_args.polylineId];
    if (polyline) polyline.setOptions({ strokeColor: _args.strokeColor });
  }

  async setPolylineStrokeWidth(_args: PolylineStrokeWidthArgs): Promise<void> {
    const polyline = this.maps[_args.id].polylines[_args.polylineId];
    if (polyline) polyline.setOptions({ strokeWeight: _args.strokeWidth });
  }

  async removePolyline(_args: RemovePolylineArgs): Promise<void> {
    const polyline = this.maps[_args.id].polylines[_args.polylineId];
    if (polyline) {
      polyline.setMap(null);
      delete this.maps[_args.id].polylines[_args.polylineId];
    }
  }

  async addCircles(_args: AddCirclesArgs): Promise<{ circles: (Circle & { id: string })[] }> {
    const results: (Circle & { id: string })[] = [];
    for (const circle of _args.optionsList) {
      const added = await this.addCircle({ id: _args.id, options: circle });
      results.push(added);
    }
    return { circles: results };
  }

  async addCircle(_args: AddCircleArgs): Promise<Circle & { id: string }> {
    const circle = new google.maps.Circle(_args.options);
    circle.setMap(this.maps[_args.id].map);

    const id = '' + this.currCircleId++;
    this.maps[_args.id].circles[id] = circle;

    await this.setCircleListeners(_args.id, id, circle);

    return { ..._args.options, id };
  }

  async setCircleCenter(_args: SetCircleCenterArgs): Promise<void> {
    const circle = this.maps[_args.id].circles[_args.circleId];
    if (circle) circle.setCenter(_args.center);
  }

  async removeCircle(_args: RemoveCircleArgs): Promise<void> {
    const circle = this.maps[_args.id].circles[_args.circleId];
    if (circle) {
      circle.setMap(null);
      delete this.maps[_args.id].circles[_args.circleId];
    }
  }

  async setCameraTarget(_args: SetCameraTargetArgs): Promise<void> {
    const map = this.maps[_args.id].map;
    if (Array.isArray(_args.target)) {
      const bounds = new google.maps.LatLngBounds();
      _args.target.forEach((t) => bounds.extend(t));
      map.fitBounds(bounds);
    } else {
      map.setCenter(_args.target);
    }
  }

  async getCameraTarget(_args: { id: string }): Promise<{ cameraTarget: LatLng }> {
    const center = this.maps[_args.id].map.getCenter();
    if (!center) throw new Error('Center not available');
    return { cameraTarget: { lat: center.lat(), lng: center.lng() } };
  }

  async fromPointToLatLng(_args: FromPointToLatLngArgs): Promise<{ latLng: LatLng }> {
    const map = this.maps[_args.id].map;
    const projection = map.getProjection();
    if (!projection) throw new Error('Projection not ready');

    const point = new google.maps.Point(_args.points[0], _args.points[1]);
    const latLng = projection.fromPointToLatLng(point);
    if (!latLng) throw new Error('Failed to project point');

    return { latLng: { lat: latLng.lat(), lng: latLng.lng() } };
  }

  async addPolylines(_args: AddPolylinesArgs): Promise<{ polylines: (Polyline & { id: string })[] }> {
    const mapObj = this.maps[_args.id];
    if (!mapObj) throw new Error(`Map with id ${_args.id} not found`);

    const polylines: (Polyline & { id: string })[] = [];

    for (const opts of _args.optionsList) {
      const polyline = new google.maps.Polyline(opts);
      polyline.setMap(mapObj.map);

      const id = '' + this.currPolylineId++;
      mapObj.polylines[id] = polyline;

      await this.setPolylineListeners(_args.id, id, polyline);

      polylines.push({ ...opts, id });
    }

    return { polylines };
  }

  async addPolygon(_args: AddPolygonArgs): Promise<Polygon & { id: string; }> {
    const polygon = new google.maps.Polygon(_args.options);
    polygon.setMap(this.maps[_args.id].map);

    const id = '' + this.currPolygonId++;
    this.maps[_args.id].polygons[id] = polygon;
    await this.setPolygonListeners(_args.id, id, polygon);

    return { ..._args.options, shapes:_args.options.points, id };
  }

  async removePolygon(_args: RemovePolygonArgs): Promise<void> {
    const polygon = this.maps[_args.id].polygons[_args.polygonId];
    if (polygon) {
      polygon.setMap(null);
      delete this.maps[_args.id].polygons[_args.polygonId];
    }
  }
}
