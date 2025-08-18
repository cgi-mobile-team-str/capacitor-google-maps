import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

import {
  CameraConfig,
  MapPadding,
  MapListenerCallback,
  MapReadyCallbackData,
  CameraIdleCallbackData,
  CameraMoveStartedCallbackData,
  ClusterClickCallbackData,
  MapClickCallbackData,
  MarkerClickCallbackData,
  MyLocationButtonClickCallbackData,
  Polygon,
  PolygonClickCallbackData,
  CircleClickCallbackData,
  PolylineCallbackData,
  VisibleRegion,
  GoogleMapsOptions,
  CapacitorMarker,
  MarkerOption,
  PolylineOption,
  CapacitorPolyline,
  LatLng,
  CircleOption,
  CapacitorCircle,
  PolygonOption,
  CapacitorPolygon,
} from './definitions';
import { LatLngBounds, MapType } from './definitions';
import type { CreateMapArgs } from './implementation';
import { CapacitorGoogleMaps } from './implementation';

export interface GoogleMapInterface {
  create(options: CreateMapArgs, callback?: MapListenerCallback<MapReadyCallbackData>): Promise<GoogleMap>;
  enableTouch(): Promise<void>;
  disableTouch(): Promise<void>;
  enableClustering(
    /**
     * The minimum number of markers that can be clustered together. The default is 4 markers.
     */
    minClusterSize?: number
  ): Promise<void>;
  disableClustering(): Promise<void>;
  addMarker(options: MarkerOption): Promise<CapacitorMarker>;
  addMarkers(optionsList: MarkerOption[]): Promise<CapacitorMarker[]>;
  removeMarker(id: string): Promise<void>;
  removeMarkers(ids: string[]): Promise<void>;
  addPolygons(polygons: Polygon[]): Promise<string[]>;
  removePolygons(ids: string[]): Promise<void>;
  addCircles(optionsList: CircleOption[]): Promise<CapacitorCircle[]>;
  addCircle(options: CircleOption): Promise<CapacitorCircle>;
  removeCircles(ids: string[]): Promise<void>;
  addPolylines(optionsList: PolylineOption[]): Promise<CapacitorPolyline[]>;
  addPolyline(options: PolylineOption): Promise<CapacitorPolyline>;
  removePolylines(ids: string[]): Promise<void>;
  destroy(): Promise<void>;
  moveCamera(config: CameraConfig): Promise<void>;
  animateCamera(config: CameraConfig): Promise<void>;

  /**
   * Get current map type
   */
  getMapType(): Promise<MapType>;
  setMapType(mapType: MapType): Promise<void>;
  enableIndoorMaps(enabled: boolean): Promise<void>;
  enableTrafficLayer(enabled: boolean): Promise<void>;
  enableAccessibilityElements(enabled: boolean): Promise<void>;
  enableCurrentLocation(enabled: boolean): Promise<void>;
  setPadding(padding: MapPadding): Promise<void>;
  /**
   * Get the map's current viewport latitude and longitude bounds.
   *
   * @returns {LatLngBounds}
   */
  getMapBounds(): Promise<LatLngBounds>;
  /**
   * Sets the map viewport to contain the given bounds.
   * @param bounds The bounds to fit in the viewport.
   * @param padding Optional padding to apply in pixels. The bounds will be fit in the part of the map that remains after padding is removed.
   */
  fitBounds(bounds: LatLngBounds, padding?: number): Promise<void>;
  setOnBoundsChangedListener(callback?: MapListenerCallback<CameraIdleCallbackData>): Promise<void>;
  setOnCameraIdleListener(callback?: MapListenerCallback<CameraIdleCallbackData>): Promise<void>;
  setOnCameraMoveStartedListener(callback?: MapListenerCallback<CameraMoveStartedCallbackData>): Promise<void>;
  setOnClusterClickListener(callback?: MapListenerCallback<ClusterClickCallbackData>): Promise<void>;
  setOnClusterInfoWindowClickListener(callback?: MapListenerCallback<ClusterClickCallbackData>): Promise<void>;
  setOnInfoWindowClickListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void>;
  setOnMapClickListener(callback?: MapListenerCallback<MapClickCallbackData>): Promise<void>;
  setOnMarkerClickListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void>;
  setOnPolygonClickListener(callback?: MapListenerCallback<PolygonClickCallbackData>): Promise<void>;
  setOnCircleClickListener(callback?: MapListenerCallback<CircleClickCallbackData>): Promise<void>;
  setOnPolylineClickListener(callback?: MapListenerCallback<PolylineCallbackData>): Promise<void>;
  setOnMarkerDragStartListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void>;
  setOnMarkerDragListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void>;
  setOnMarkerDragEndListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void>;
  setOnMyLocationButtonClickListener(callback?: MapListenerCallback<MyLocationButtonClickCallbackData>): Promise<void>;
  setOnMyLocationClickListener(callback?: MapListenerCallback<MapClickCallbackData>): Promise<void>;
  getVisibleRegion(): Promise<VisibleRegion>;
  enableCompass(enabled: boolean): Promise<void>;
  enableToolbar(isEnabled: boolean): Promise<void>;
  enableMyLocation(isEnabled: boolean): Promise<void>;
  enableAllGestures(isEnabled: boolean): Promise<void>;
  enableTiltGesture(isEnabled: boolean): Promise<void>;
  enableTiltRotateGesture(isEnabled: boolean): Promise<void>;
  setMapPreferences(padding?: MapPadding, building?: boolean): Promise<void>;
  setCameraBearing(bearing: number): Promise<void>;
  setOptions(config: GoogleMapsOptions): Promise<void>;
  getCameraZoom(): Promise<number>;
  setCameraTarget(target: LatLng | LatLng[]): Promise<void>;
  getCameraTarget(): Promise<LatLng>;
  fromPointToLatLng(points: number[]): Promise<LatLng>;
}

class MapCustomElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = '';

    if (Capacitor.getPlatform() == 'ios') {
      this.style.overflow = 'scroll';
      (this.style as any)['-webkit-overflow-scrolling'] = 'touch';

      const overflowDiv = document.createElement('div');
      overflowDiv.style.height = '200%';

      this.appendChild(overflowDiv);
    }
  }
}

customElements.define('capacitor-google-map', MapCustomElement);

export class GoogleMap {
  private id: string;
  private element: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private onBoundsChangedListener?: PluginListenerHandle;
  private onCameraIdleListener?: PluginListenerHandle;
  private onCameraMoveStartedListener?: PluginListenerHandle;
  private onClusterClickListener?: PluginListenerHandle;
  private onClusterInfoWindowClickListener?: PluginListenerHandle;
  private onInfoWindowClickListener?: PluginListenerHandle;
  private onMapClickListener?: PluginListenerHandle;
  private onPolylineClickListener?: PluginListenerHandle;
  private onMarkerClickListener?: PluginListenerHandle;
  private onPolygonClickListener?: PluginListenerHandle;
  private onCircleClickListener?: PluginListenerHandle;
  private onMarkerDragStartListener?: PluginListenerHandle;
  private onMarkerDragListener?: PluginListenerHandle;
  private onMarkerDragEndListener?: PluginListenerHandle;
  private onMyLocationButtonClickListener?: PluginListenerHandle;
  private onMyLocationClickListener?: PluginListenerHandle;

  private constructor(id: string) {
    this.id = id;
  }

  /**
   * Creates a new instance of a Google Map
   * @param options
   * @param callback
   * @returns GoogleMap
   */
  public static async create(
    options: CreateMapArgs,
    callback?: MapListenerCallback<MapReadyCallbackData>
  ): Promise<GoogleMap> {
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

    if (Capacitor.getPlatform() == 'android') {
      newMap.initScrolling();
    }

    if (Capacitor.isNativePlatform()) {
      (options.element as any) = {};

      const getMapBounds = () => {
        const mapRect = newMap.element?.getBoundingClientRect() ?? ({} as DOMRect);
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
      if (Capacitor.getPlatform() === 'ios' && ionicPage) {
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
              if (Capacitor.getPlatform() === 'ios' && !ionicPage) {
                onDisplay();
              }
            } else if (lastState.width !== mapRect.width || lastState.height !== mapRect.height) {
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
        } catch (err) {
          reject(err);
        }
      }, 200);
    });

    if (callback) {
      const onMapReadyListener = await CapacitorGoogleMaps.addListener('onMapReady', (data: MapReadyCallbackData) => {
        if (data.mapId == newMap.id) {
          callback(data);
          onMapReadyListener.remove();
        }
      });
    }

    return newMap;
  }

  private static async getElementBounds(element: HTMLElement): Promise<DOMRect> {
    return new Promise((resolve) => {
      let elementBounds = element.getBoundingClientRect();
      if (elementBounds.width == 0) {
        let retries = 0;
        const boundsInterval = setInterval(function () {
          if (elementBounds.width == 0 && retries < 30) {
            elementBounds = element.getBoundingClientRect();
            retries++;
          } else {
            if (retries == 30) {
              console.warn('Map size could not be determined');
            }
            clearInterval(boundsInterval);
            resolve(elementBounds);
          }
        }, 100);
      } else {
        resolve(elementBounds);
      }
    });
  }

  /**
   * Enable touch events on native map
   *
   * @returns void
   */
  async enableTouch(): Promise<void> {
    return CapacitorGoogleMaps.enableTouch({
      id: this.id,
    });
  }

  /**
   * Disable touch events on native map
   *
   * @returns void
   */
  async disableTouch(): Promise<void> {
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
  async enableClustering(minClusterSize?: number): Promise<void> {
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
  async disableClustering(): Promise<void> {
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
  async addMarker(options: MarkerOption): Promise<CapacitorMarker> {
    const res = await CapacitorGoogleMaps.addMarker({
      id: this.id,
      options,
    });

    const markerObj: CapacitorMarker = new CapacitorMarker(res, this.id);

    return markerObj;
  }

  /**
   * Adds multiple markers to the map
   *
   * @param markers
   * @returns array of created marker IDs
   */
  async addMarkers(optionsList: MarkerOption[]): Promise<CapacitorMarker[]> {
    const res = await CapacitorGoogleMaps.addMarkers({
      id: this.id,
      optionsList,
    });

    const markers: CapacitorMarker[] = [];
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
  async removeMarker(id: string): Promise<void> {
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
  async removeMarkers(ids: string[]): Promise<void> {
    return CapacitorGoogleMaps.removeMarkers({
      id: this.id,
      markerIds: ids,
    });
  }

  async addPolygons(optionsList: PolygonOption[]): Promise<CapacitorPolygon[]> {
    const res = await CapacitorGoogleMaps.addPolygons({
      id: this.id,
      optionsList,
    });

    const polygons: CapacitorPolygon[] = [];
    res.polygons.forEach((r) => {
      polygons.push(new CapacitorPolygon(r, this.id));
    });

    return polygons;
  }

  async addPolygon(options: PolygonOption): Promise<CapacitorPolygon> {
    const res = await CapacitorGoogleMaps.addPolygon({
      id: this.id,
      options,
    });

    const polygonObj: CapacitorPolygon = new CapacitorPolygon(res, this.id);
    return polygonObj;
  }

  async addPolylines(optionsList: PolylineOption[]): Promise<CapacitorPolyline[]> {
    const res = await CapacitorGoogleMaps.addPolylines({
      id: this.id,
      optionsList,
    });

    const polylines: CapacitorPolyline[] = [];
    res.polylines.forEach((r) => {
      polylines.push(new CapacitorPolyline(r, this.id));
    });

    return polylines;
  }

  async addPolyline(options: PolylineOption): Promise<CapacitorPolyline> {
    const res = await CapacitorGoogleMaps.addPolyline({
      id: this.id,
      options,
    });

    const polylineObj: CapacitorPolyline = new CapacitorPolyline(res, this.id);
    return polylineObj;
  }

  async removePolygons(ids: string[]): Promise<void> {
    return CapacitorGoogleMaps.removePolygons({
      id: this.id,
      polygonIds: ids,
    });
  }

  async addCircles(optionsList: CircleOption[]): Promise<CapacitorCircle[]> {
    const res = await CapacitorGoogleMaps.addCircles({
      id: this.id,
      optionsList,
    });

    const circles: CapacitorCircle[] = [];
    res.circles.forEach((r) => {
      circles.push(new CapacitorCircle(r, this.id));
    });

    return circles;
  }

  async addCircle(options: CircleOption): Promise<CapacitorCircle> {
    const res = await CapacitorGoogleMaps.addCircle({
      id: this.id,
      options,
    });

    const circleObj: CapacitorCircle = new CapacitorCircle(res, this.id);
    return circleObj;
  }

  async removeCircles(ids: string[]): Promise<void> {
    return CapacitorGoogleMaps.removeCircles({
      id: this.id,
      circleIds: ids,
    });
  }

  async removePolylines(ids: string[]): Promise<void> {
    return CapacitorGoogleMaps.removePolylines({
      id: this.id,
      polylineIds: ids,
    });
  }

  /**
   * Destroy the current instance of the map
   */
  async destroy(): Promise<void> {
    if (Capacitor.getPlatform() == 'android') {
      this.disableScrolling();
    }

    if (Capacitor.isNativePlatform()) {
      this.resizeObserver?.disconnect();
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
  async animateCamera(config: CameraConfig): Promise<void> {
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
  async moveCamera(config: CameraConfig): Promise<void> {
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
  async setCameraBearing(bearing: number): Promise<void> {
    return CapacitorGoogleMaps.setCameraBearing({
      id: this.id,
      bearing,
    });
  }

  async setCameraTarget(target: LatLng | LatLng[]): Promise<void> {
    return CapacitorGoogleMaps.setCameraTarget({
      id: this.id,
      target,
    });
  }

  async setOptions(config: GoogleMapsOptions): Promise<void> {
    return CapacitorGoogleMaps.setOptions({
      id: this.id,
      config,
    });
  }

  async getMapType(): Promise<MapType> {
    const { type } = await CapacitorGoogleMaps.getMapType({ id: this.id });
    return MapType[type as keyof typeof MapType];
  }

  async getCameraZoom(): Promise<number> {
    const { cameraZoom } = await CapacitorGoogleMaps.getCameraZoom({ id: this.id });
    return cameraZoom;
  }

  async getCameraTarget(): Promise<LatLng> {
    const { cameraTarget } = await CapacitorGoogleMaps.getCameraTarget({ id: this.id });
    return cameraTarget;
  }

  async fromPointToLatLng(points: number[]): Promise<LatLng> {
    const { latLng } = await CapacitorGoogleMaps.fromPointToLatLng({ id: this.id, points });
    return latLng;
  }
  /**
   * Sets the type of map tiles that should be displayed.
   *
   * @param mapType
   * @returns
   */
  async setMapType(mapType: MapType): Promise<void> {
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
  async enableIndoorMaps(enabled: boolean): Promise<void> {
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
  async enableTrafficLayer(enabled: boolean): Promise<void> {
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
  async enableAccessibilityElements(enabled: boolean): Promise<void> {
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
  async enableCurrentLocation(enabled: boolean): Promise<void> {
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
  async setPadding(padding: MapPadding): Promise<void> {
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
  async getMapBounds(): Promise<LatLngBounds> {
    return new LatLngBounds(
      await CapacitorGoogleMaps.getMapBounds({
        id: this.id,
      })
    );
  }

  /**
   * Get the current Viewport
   *
   * @returns {VisibleRegion}
   */
  async getVisibleRegion(): Promise<VisibleRegion> {
    return CapacitorGoogleMaps.getVisibleRegion({ id: this.id });
  }

  /**
   * Enable or disable the compass
   *
   * @returns
   */
  async enableCompass(enabled: boolean): Promise<void> {
    return CapacitorGoogleMaps.enableCompass({ id: this.id, enabled });
  }

  async enableToolbar(isEnabled: boolean): Promise<void> {
    return CapacitorGoogleMaps.enableToolbar({ id: this.id, isEnabled });
  }

  async enableMyLocation(isEnabled: boolean): Promise<void> {
    return CapacitorGoogleMaps.enableMyLocation({ id: this.id, isEnabled });
  }

  async enableAllGestures(isEnabled: boolean): Promise<void> {
    return CapacitorGoogleMaps.enableAllGestures({ id: this.id, isEnabled });
  }

  async enableTiltGesture(isEnabled: boolean): Promise<void> {
    return CapacitorGoogleMaps.enableTiltGesture({ id: this.id, isEnabled });
  }

  async enableTiltRotateGesture(isEnabled: boolean): Promise<void> {
    return CapacitorGoogleMaps.enableTiltRotateGesture({ id: this.id, isEnabled });
  }

  async setMapPreferences(padding?: MapPadding, building?: boolean): Promise<void> {
    return CapacitorGoogleMaps.setMapPreferences({
      id: this.id,
      padding,
      building,
    });
  }

  async fitBounds(bounds: LatLngBounds, padding?: number): Promise<void> {
    return CapacitorGoogleMaps.fitBounds({
      id: this.id,
      bounds,
      padding,
    });
  }

  initScrolling(): void {
    const ionContents = document.getElementsByTagName('ion-content');

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < ionContents.length; i++) {
      (ionContents[i] as any).scrollEvents = true;
    }

    window.addEventListener('ionScroll', this.handleScrollEvent);
    window.addEventListener('scroll', this.handleScrollEvent);
    window.addEventListener('resize', this.handleScrollEvent);
    if (screen.orientation) {
      screen.orientation.addEventListener('change', () => {
        setTimeout(this.updateMapBounds, 500);
      });
    } else {
      window.addEventListener('orientationchange', () => {
        setTimeout(this.updateMapBounds, 500);
      });
    }
  }

  disableScrolling(): void {
    window.removeEventListener('ionScroll', this.handleScrollEvent);
    window.removeEventListener('scroll', this.handleScrollEvent);
    window.removeEventListener('resize', this.handleScrollEvent);
    if (screen.orientation) {
      screen.orientation.removeEventListener('change', () => {
        setTimeout(this.updateMapBounds, 1000);
      });
    } else {
      window.removeEventListener('orientationchange', () => {
        setTimeout(this.updateMapBounds, 1000);
      });
    }
  }

  handleScrollEvent = (): void => this.updateMapBounds();

  private updateMapBounds(): void {
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
  async setOnCameraIdleListener(callback?: MapListenerCallback<CameraIdleCallbackData>): Promise<void> {
    if (this.onCameraIdleListener) {
      this.onCameraIdleListener.remove();
    }

    if (callback) {
      this.onCameraIdleListener = await CapacitorGoogleMaps.addListener(
        'onCameraIdle',
        this.generateCallback(callback)
      );
    } else {
      this.onCameraIdleListener = undefined;
    }
  }

  /**
   * Set the event listener on the map for 'onBoundsChanged' events.
   *
   * @param callback
   * @returns
   */
  async setOnBoundsChangedListener(callback?: MapListenerCallback<CameraIdleCallbackData>): Promise<void> {
    if (this.onBoundsChangedListener) {
      this.onBoundsChangedListener.remove();
    }

    if (callback) {
      this.onBoundsChangedListener = await CapacitorGoogleMaps.addListener(
        'onBoundsChanged',
        this.generateCallback(callback)
      );
    } else {
      this.onBoundsChangedListener = undefined;
    }
  }

  /**
   * Set the event listener on the map for 'onCameraMoveStarted' events.
   *
   * @param callback
   * @returns
   */
  async setOnCameraMoveStartedListener(callback?: MapListenerCallback<CameraMoveStartedCallbackData>): Promise<void> {
    if (this.onCameraMoveStartedListener) {
      this.onCameraMoveStartedListener.remove();
    }

    if (callback) {
      this.onCameraMoveStartedListener = await CapacitorGoogleMaps.addListener(
        'onCameraMoveStarted',
        this.generateCallback(callback)
      );
    } else {
      this.onCameraMoveStartedListener = undefined;
    }
  }

  /**
   * Set the event listener on the map for 'onClusterClick' events.
   *
   * @param callback
   * @returns
   */
  async setOnClusterClickListener(callback?: MapListenerCallback<ClusterClickCallbackData>): Promise<void> {
    if (this.onClusterClickListener) {
      this.onClusterClickListener.remove();
    }

    if (callback) {
      this.onClusterClickListener = await CapacitorGoogleMaps.addListener(
        'onClusterClick',
        this.generateCallback(callback)
      );
    } else {
      this.onClusterClickListener = undefined;
    }
  }

  /**
   * Set the event listener on the map for 'onClusterInfoWindowClick' events.
   *
   * @param callback
   * @returns
   */
  async setOnClusterInfoWindowClickListener(callback?: MapListenerCallback<ClusterClickCallbackData>): Promise<void> {
    if (this.onClusterInfoWindowClickListener) {
      this.onClusterInfoWindowClickListener.remove();
    }

    if (callback) {
      this.onClusterInfoWindowClickListener = await CapacitorGoogleMaps.addListener(
        'onClusterInfoWindowClick',
        this.generateCallback(callback)
      );
    } else {
      this.onClusterInfoWindowClickListener = undefined;
    }
  }

  /**
   * Set the event listener on the map for 'onInfoWindowClick' events.
   *
   * @param callback
   * @returns
   */
  async setOnInfoWindowClickListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void> {
    if (this.onInfoWindowClickListener) {
      this.onInfoWindowClickListener.remove();
    }

    if (callback) {
      this.onInfoWindowClickListener = await CapacitorGoogleMaps.addListener(
        'onInfoWindowClick',
        this.generateCallback(callback)
      );
    } else {
      this.onInfoWindowClickListener = undefined;
    }
  }

  /**
   * Set the event listener on the map for 'onMapClick' events.
   *
   * @param callback
   * @returns
   */
  async setOnMapClickListener(callback?: MapListenerCallback<MapClickCallbackData>): Promise<void> {
    if (this.onMapClickListener) {
      this.onMapClickListener.remove();
    }

    if (callback) {
      this.onMapClickListener = await CapacitorGoogleMaps.addListener('onMapClick', this.generateCallback(callback));
    } else {
      this.onMapClickListener = undefined;
    }
  }

  /**
   * Set the event listener on the map for 'onPolygonClick' events.
   *
   * @param callback
   * @returns
   */
  async setOnPolygonClickListener(callback?: MapListenerCallback<PolygonClickCallbackData>): Promise<void> {
    if (this.onPolygonClickListener) {
      this.onPolygonClickListener.remove();
    }

    if (callback) {
      this.onPolygonClickListener = await CapacitorGoogleMaps.addListener(
        'onPolygonClick',
        this.generateCallback(callback)
      );
    } else {
      this.onPolygonClickListener = undefined;
    }
  }

  /**
   * Set the event listener on the map for 'onCircleClick' events.
   *
   * @param callback
   * @returns
   */
  async setOnCircleClickListener(callback?: MapListenerCallback<CircleClickCallbackData>): Promise<void> {
    if (this.onCircleClickListener) [this.onCircleClickListener.remove()];

    if (callback) {
      this.onCircleClickListener = await CapacitorGoogleMaps.addListener(
        'onCircleClick',
        this.generateCallback(callback)
      );
    } else {
      this.onCircleClickListener = undefined;
    }
  }

  /**
   * Set the event listener on the map for 'onMarkerClick' events.
   *
   * @param callback
   * @returns
   */
  async setOnMarkerClickListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void> {
    if (this.onMarkerClickListener) {
      this.onMarkerClickListener.remove();
    }

    if (callback) {
      this.onMarkerClickListener = await CapacitorGoogleMaps.addListener(
        'onMarkerClick',
        this.generateCallback(callback)
      );
    } else {
      this.onMarkerClickListener = undefined;
    }
  }
  /**
   * Set the event listener on the map for 'onPolylineClick' events.
   *
   * @param callback
   * @returns
   */
  async setOnPolylineClickListener(callback?: MapListenerCallback<PolylineCallbackData>): Promise<void> {
    if (this.onPolylineClickListener) {
      this.onPolylineClickListener.remove();
    }

    if (callback) {
      this.onPolylineClickListener = await CapacitorGoogleMaps.addListener(
        'onPolylineClick',
        this.generateCallback(callback)
      );
    } else {
      this.onPolylineClickListener = undefined;
    }
  }

  /**
   * Set the event listener on the map for 'onMarkerDragStart' events.
   *
   * @param callback
   * @returns
   */
  async setOnMarkerDragStartListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void> {
    if (this.onMarkerDragStartListener) {
      this.onMarkerDragStartListener.remove();
    }

    if (callback) {
      this.onMarkerDragStartListener = await CapacitorGoogleMaps.addListener(
        'onMarkerDragStart',
        this.generateCallback(callback)
      );
    } else {
      this.onMarkerDragStartListener = undefined;
    }
  }

  /**
   * Set the event listener on the map for 'onMarkerDrag' events.
   *
   * @param callback
   * @returns
   */
  async setOnMarkerDragListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void> {
    if (this.onMarkerDragListener) {
      this.onMarkerDragListener.remove();
    }

    if (callback) {
      this.onMarkerDragListener = await CapacitorGoogleMaps.addListener(
        'onMarkerDrag',
        this.generateCallback(callback)
      );
    } else {
      this.onMarkerDragListener = undefined;
    }
  }

  /**
   * Set the event listener on the map for 'onMarkerDragEnd' events.
   *
   * @param callback
   * @returns
   */
  async setOnMarkerDragEndListener(callback?: MapListenerCallback<MarkerClickCallbackData>): Promise<void> {
    if (this.onMarkerDragEndListener) {
      this.onMarkerDragEndListener.remove();
    }

    if (callback) {
      this.onMarkerDragEndListener = await CapacitorGoogleMaps.addListener(
        'onMarkerDragEnd',
        this.generateCallback(callback)
      );
    } else {
      this.onMarkerDragEndListener = undefined;
    }
  }

  /**
   * Set the event listener on the map for 'onMyLocationButtonClick' events.
   *
   * @param callback
   * @returns
   */
  async setOnMyLocationButtonClickListener(
    callback?: MapListenerCallback<MyLocationButtonClickCallbackData>
  ): Promise<void> {
    if (this.onMyLocationButtonClickListener) {
      this.onMyLocationButtonClickListener.remove();
    }

    if (callback) {
      this.onMyLocationButtonClickListener = await CapacitorGoogleMaps.addListener(
        'onMyLocationButtonClick',
        this.generateCallback(callback)
      );
    } else {
      this.onMyLocationButtonClickListener = undefined;
    }
  }

  /**
   * Set the event listener on the map for 'onMyLocationClick' events.
   *
   * @param callback
   * @returns
   */
  async setOnMyLocationClickListener(callback?: MapListenerCallback<MapClickCallbackData>): Promise<void> {
    if (this.onMyLocationClickListener) {
      this.onMyLocationClickListener.remove();
    }

    if (callback) {
      this.onMyLocationClickListener = await CapacitorGoogleMaps.addListener(
        'onMyLocationClick',
        this.generateCallback(callback)
      );
    } else {
      this.onMyLocationClickListener = undefined;
    }
  }

  /**
   * Remove all event listeners on the map.
   *
   * @param callback
   * @returns
   */
  async removeAllMapListeners(): Promise<void> {
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

  private generateCallback(callback: MapListenerCallback<any>): MapListenerCallback<any> {
    const mapId = this.id;
    return (data: any) => {
      if (data.mapId == mapId) {
        callback(data);
      }
    };
  }
}
