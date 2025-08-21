# @capacitor/google-maps

Google maps on Capacitor

## Install

```bash
npm install @capacitor/google-maps
npx cap sync
```

## API Keys

To use the Google Maps SDK on any platform, API keys associated with an account _with billing enabled_ are required. These can be obtained from the [Google Cloud Console](https://console.cloud.google.com). This is required for all three platforms, Android, iOS, and Javascript. Additional information about obtaining these API keys can be found in the [Google Maps documentation](https://developers.google.com/maps/documentation/android-sdk/overview) for each platform.

## iOS

The Google Maps SDK supports the use of showing the users current location via `enableCurrentLocation(bool)`. To use this, Apple requires privacy descriptions to be specified in `Info.plist`:

- `NSLocationWhenInUseUsageDescription` (`Privacy - Location When In Use Usage Description`)

Read about [Configuring `Info.plist`](https://capacitorjs.com/docs/ios/configuration#configuring-infoplist) in the [iOS Guide](https://capacitorjs.com/docs/ios) for more information on setting iOS permissions in Xcode.

### Minimum Deployment Target

Version 6 of this plugin has a minimum deployment target of iOS 14.0. You will need to edit `ios/App/Podfile` and change the following line from 13.0 to 14.0:
```
platform :ios, '14.0'
```

Additionally, you will need to open your project in XCode and in the `Build Settings` tab for your `Project` and for each `Target` set the `iOS Deployment Target` to `iOS 14.0` or higher.

### Typescript Configuration

Your project will also need have `skipLibCheck` set to `true` in `tsconfig.json`.

### Migrating from older versions
> The main Google Maps SDK now supports running on simulators on Apple Silicon Macs, but make sure you have the latest version of [Google-Maps-iOS-Utils](https://github.com/googlemaps/google-maps-ios-utils) installed.

If you added the previous workaround for getting the unreleased version, you can delete it now by removing this line from `ios/App/Podfile`:

```
pod 'Google-Maps-iOS-Utils', :git => 'https://github.com/googlemaps/google-maps-ios-utils.git', :commit => '637954e5bcb2a879c11a6f2cead153a6bad5339f'
```

Then run `pod update Google-Maps-iOS-Utils` from the `ios/App/` folder:

```
cd ios/App
pod update Google-Maps-iOS-Utils
```

## Android

The Google Maps SDK for Android requires you to add your API key to the AndroidManifest.xml file in your project.

```xml
<meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_API_KEY_HERE"/>
```

To use certain location features, the SDK requires the following permissions to also be added to your AndroidManifest.xml:

```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### Variables

This plugin will use the following project variables (defined in your app's `variables.gradle` file):

- `googleMapsPlayServicesVersion`: version of `com.google.android.gms:play-services-maps` (default: `18.2.0`)
- `googleMapsUtilsVersion`: version of `com.google.maps.android:android-maps-utils` (default: `3.8.2`)
- `googleMapsKtxVersion`: version of `com.google.maps.android:maps-ktx` (default: `5.0.0`)
- `googleMapsUtilsKtxVersion`: version of `com.google.maps.android:maps-utils-ktx` (default: `5.0.0`)
- `kotlinxCoroutinesVersion`: version of `org.jetbrains.kotlinx:kotlinx-coroutines-android` and `org.jetbrains.kotlinx:kotlinx-coroutines-core` (default: `1.7.3`)
- `androidxCoreKTXVersion`: version of `androidx.core:core-ktx` (default: `1.12.0`)
- `kotlin_version`: version of `org.jetbrains.kotlin:kotlin-stdlib` (default: `1.9.10`)


## Usage

The Google Maps Capacitor plugin ships with a web component that must be used to render the map in your application as it enables us to embed the native view more effectively on iOS. The plugin will automatically register this web component for use in your application.

> For Angular users, you will get an error warning that this web component is unknown to the Angular compiler. This is resolved by modifying the module that declares your component to allow for custom web components.
>
> ```typescript
> import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
>
> @NgModule({
>   schemas: [CUSTOM_ELEMENTS_SCHEMA]
> })
> ```

Include this component in your HTML and assign it an ID so that you can easily query for that element reference later.

```html
<capacitor-google-map id="map"></capacitor-google-map>
```

> On Android, the map is rendered beneath the entire webview, and uses this component to manage its positioning during scrolling events. This means that as the developer, you _must_ ensure that the webview is transparent all the way through the layers to the very bottom. In a typically Ionic application, that means setting transparency on elements such as IonContent and the root HTML tag to ensure that it can be seen. If you can't see your map on Android, this should be the first thing you check.
>
> On iOS, we render the map directly into the webview and so the same transparency effects are not required. We are investigating alternate methods for Android still and hope to resolve this better in a future update.

The Google Map element itself comes unstyled, so you should style it to fit within the layout of your page structure. Because we're rendering a view into this slot, by itself the element has no width or height, so be sure to set those explicitly.

```css
capacitor-google-map {
  display: inline-block;
  width: 275px;
  height: 400px;
}
```

Next, we should create the map reference. This is done by importing the GoogleMap class from the Capacitor plugin and calling the create method, and passing in the required parameters.

```typescript
import { GoogleMap } from '@capacitor/google-maps';

const apiKey = 'YOUR_API_KEY_HERE';

const mapRef = document.getElementById('map');

const newMap = await GoogleMap.create({
  id: 'my-map', // Unique identifier for this map instance
  element: mapRef, // reference to the capacitor-google-map element
  apiKey: apiKey, // Your Google Maps API Key
  config: {
    center: {
      // The initial position to be rendered by the map
      lat: 33.6,
      lng: -117.9,
    },
    zoom: 8, // The initial zoom level to be rendered by the map
  },
});
```

At this point, your map should be created within your application. Using the returned reference to the map, you can easily interact with your map in a number of way, a few of which are shown here.

```typescript
const newMap = await GoogleMap.create({...});

// Add a marker to the map
const markerId = await newMap.addMarker({
  coordinate: {
    lat: 33.6,
    lng: -117.9
  }
});

// Move the map programmatically
await newMap.setCamera({
  coordinate: {
    lat: 33.6,
    lng: -117.9
  }
});

// Enable marker clustering
await newMap.enableClustering();

// Handle marker click
await newMap.setOnMarkerClickListener((event) => {...});

// Clean up map reference
await newMap.destroy();
```

## Full Examples

### Angular

```typescript
import { GoogleMap } from '@capacitor/google-maps';

@Component({
  template: `
    <capacitor-google-map #map></capacitor-google-map>
    <button (click)="createMap()">Create Map</button>
  `,
  styles: [
    `
      capacitor-google-map {
        display: inline-block;
        width: 275px;
        height: 400px;
      }
    `,
  ],
})
export class MyMap {
  @ViewChild('map')
  mapRef: ElementRef<HTMLElement>;
  newMap: GoogleMap;

  async createMap() {
    this.newMap = await GoogleMap.create({
      id: 'my-cool-map',
      element: this.mapRef.nativeElement,
      apiKey: environment.apiKey,
      config: {
        center: {
          lat: 33.6,
          lng: -117.9,
        },
        zoom: 8,
      },
    });
  }
}
```

### React

```jsx
import { GoogleMap } from '@capacitor/google-maps';
import { useRef } from 'react';

const MyMap: React.FC = () => {
  const mapRef = useRef<HTMLElement>();
  let newMap: GoogleMap;

  async function createMap() {
    if (!mapRef.current) return;

    newMap = await GoogleMap.create({
      id: 'my-cool-map',
      element: mapRef.current,
      apiKey: process.env.REACT_APP_YOUR_API_KEY_HERE,
      config: {
        center: {
          lat: 33.6,
          lng: -117.9
        },
        zoom: 8
      }
    })
  }

  return (
    <div className="component-wrapper">
      <capacitor-google-map ref={mapRef} style={{
        display: 'inline-block',
        width: 275,
        height: 400
      }}></capacitor-google-map>

      <button onClick={createMap}>Create Map</button>
    </div>
  )
}

export default MyMap;
```

### Javascript

```html
<capacitor-google-map id="map"></capacitor-google-map>
<button onclick="createMap()">Create Map</button>

<style>
  capacitor-google-map {
    display: inline-block;
    width: 275px;
    height: 400px;
  }
</style>

<script>
  import { GoogleMap } from '@capacitor/google-maps';

  const createMap = async () => {
    const mapRef = document.getElementById('map');

    const newMap = await GoogleMap.create({
      id: 'my-map', // Unique identifier for this map instance
      element: mapRef, // reference to the capacitor-google-map element
      apiKey: 'YOUR_API_KEY_HERE', // Your Google Maps API Key
      config: {
        center: {
          // The initial position to be rendered by the map
          lat: 33.6,
          lng: -117.9,
        },
        zoom: 8, // The initial zoom level to be rendered by the map
      },
    });
  };
</script>
```

## API

<docgen-index>

* [`create(...)`](#create)
* [`enableTouch()`](#enabletouch)
* [`disableTouch()`](#disabletouch)
* [`enableClustering(...)`](#enableclustering)
* [`disableClustering()`](#disableclustering)
* [`addMarker(...)`](#addmarker)
* [`addMarkers(...)`](#addmarkers)
* [`removeMarker(...)`](#removemarker)
* [`removeMarkers(...)`](#removemarkers)
* [`addPolygons(...)`](#addpolygons)
* [`removePolygons(...)`](#removepolygons)
* [`addCircles(...)`](#addcircles)
* [`addCircle(...)`](#addcircle)
* [`removeCircles(...)`](#removecircles)
* [`addPolylines(...)`](#addpolylines)
* [`addPolyline(...)`](#addpolyline)
* [`removePolylines(...)`](#removepolylines)
* [`destroy()`](#destroy)
* [`moveCamera(...)`](#movecamera)
* [`animateCamera(...)`](#animatecamera)
* [`getMapType()`](#getmaptype)
* [`setMapType(...)`](#setmaptype)
* [`enableIndoorMaps(...)`](#enableindoormaps)
* [`enableTrafficLayer(...)`](#enabletrafficlayer)
* [`enableAccessibilityElements(...)`](#enableaccessibilityelements)
* [`enableCurrentLocation(...)`](#enablecurrentlocation)
* [`setPadding(...)`](#setpadding)
* [`getMapBounds()`](#getmapbounds)
* [`fitBounds(...)`](#fitbounds)
* [`setOnBoundsChangedListener(...)`](#setonboundschangedlistener)
* [`setOnCameraIdleListener(...)`](#setoncameraidlelistener)
* [`setOnCameraMoveStartedListener(...)`](#setoncameramovestartedlistener)
* [`setOnCameraMoveListener(...)`](#setoncameramovelistener)
* [`setOnClusterClickListener(...)`](#setonclusterclicklistener)
* [`setOnClusterInfoWindowClickListener(...)`](#setonclusterinfowindowclicklistener)
* [`setOnInfoWindowClickListener(...)`](#setoninfowindowclicklistener)
* [`setOnMapClickListener(...)`](#setonmapclicklistener)
* [`setOnMapReadyListener(...)`](#setonmapreadylistener)
* [`setOnMarkerClickListener(...)`](#setonmarkerclicklistener)
* [`setOnPolygonClickListener(...)`](#setonpolygonclicklistener)
* [`setOnPoiClickListener(...)`](#setonpoiclicklistener)
* [`setOnCircleClickListener(...)`](#setoncircleclicklistener)
* [`setOnPolylineClickListener(...)`](#setonpolylineclicklistener)
* [`setOnMarkerDragStartListener(...)`](#setonmarkerdragstartlistener)
* [`setOnMarkerDragListener(...)`](#setonmarkerdraglistener)
* [`setOnMarkerDragEndListener(...)`](#setonmarkerdragendlistener)
* [`setOnMyLocationButtonClickListener(...)`](#setonmylocationbuttonclicklistener)
* [`setOnMyLocationClickListener(...)`](#setonmylocationclicklistener)
* [`getVisibleRegion()`](#getvisibleregion)
* [`enableCompass(...)`](#enablecompass)
* [`enableToolbar(...)`](#enabletoolbar)
* [`enableMyLocation(...)`](#enablemylocation)
* [`enableAllGestures(...)`](#enableallgestures)
* [`enableTiltGesture(...)`](#enabletiltgesture)
* [`enableTiltRotateGesture(...)`](#enabletiltrotategesture)
* [`setMapPreferences(...)`](#setmappreferences)
* [`setCameraBearing(...)`](#setcamerabearing)
* [`setOptions(...)`](#setoptions)
* [`getCameraZoom()`](#getcamerazoom)
* [`setCameraTarget(...)`](#setcameratarget)
* [`getCameraTarget()`](#getcameratarget)
* [`fromPointToLatLng(...)`](#frompointtolatlng)
* [`on(...)`](#on)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### create(...)

```typescript
create(options: CreateMapArgs, callback?: MapListenerCallback<MapReadyCallbackData> | undefined) => Promise<GoogleMap>
```

| Param          | Type                                                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **`options`**  | <code><a href="#createmapargs">CreateMapArgs</a></code>                                                                             |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#mapreadycallbackdata">MapReadyCallbackData</a>&gt;</code> |

**Returns:** <code>Promise&lt;GoogleMap&gt;</code>

--------------------


### enableTouch()

```typescript
enableTouch() => Promise<void>
```

--------------------


### disableTouch()

```typescript
disableTouch() => Promise<void>
```

--------------------


### enableClustering(...)

```typescript
enableClustering(minClusterSize?: number | undefined) => Promise<void>
```

| Param                | Type                | Description                                                                             |
| -------------------- | ------------------- | --------------------------------------------------------------------------------------- |
| **`minClusterSize`** | <code>number</code> | The minimum number of markers that can be clustered together. The default is 4 markers. |

--------------------


### disableClustering()

```typescript
disableClustering() => Promise<void>
```

--------------------


### addMarker(...)

```typescript
addMarker(options: MarkerOptions) => Promise<CapacitorMarker>
```

| Param         | Type                                                    |
| ------------- | ------------------------------------------------------- |
| **`options`** | <code><a href="#markeroptions">MarkerOptions</a></code> |

**Returns:** <code>Promise&lt;CapacitorMarker&gt;</code>

--------------------


### addMarkers(...)

```typescript
addMarkers(optionsList: MarkerOptions[]) => Promise<CapacitorMarker[]>
```

| Param             | Type                         |
| ----------------- | ---------------------------- |
| **`optionsList`** | <code>MarkerOptions[]</code> |

**Returns:** <code>Promise&lt;CapacitorMarker[]&gt;</code>

--------------------


### removeMarker(...)

```typescript
removeMarker(id: string) => Promise<void>
```

| Param    | Type                |
| -------- | ------------------- |
| **`id`** | <code>string</code> |

--------------------


### removeMarkers(...)

```typescript
removeMarkers(ids: string[]) => Promise<void>
```

| Param     | Type                  |
| --------- | --------------------- |
| **`ids`** | <code>string[]</code> |

--------------------


### addPolygons(...)

```typescript
addPolygons(polygons: Polygon[]) => Promise<string[]>
```

| Param          | Type                   |
| -------------- | ---------------------- |
| **`polygons`** | <code>Polygon[]</code> |

**Returns:** <code>Promise&lt;string[]&gt;</code>

--------------------


### removePolygons(...)

```typescript
removePolygons(ids: string[]) => Promise<void>
```

| Param     | Type                  |
| --------- | --------------------- |
| **`ids`** | <code>string[]</code> |

--------------------


### addCircles(...)

```typescript
addCircles(optionsList: CircleOptions[]) => Promise<CapacitorCircle[]>
```

| Param             | Type                         |
| ----------------- | ---------------------------- |
| **`optionsList`** | <code>CircleOptions[]</code> |

**Returns:** <code>Promise&lt;CapacitorCircle[]&gt;</code>

--------------------


### addCircle(...)

```typescript
addCircle(options: CircleOptions) => Promise<CapacitorCircle>
```

| Param         | Type                                                    |
| ------------- | ------------------------------------------------------- |
| **`options`** | <code><a href="#circleoptions">CircleOptions</a></code> |

**Returns:** <code>Promise&lt;CapacitorCircle&gt;</code>

--------------------


### removeCircles(...)

```typescript
removeCircles(ids: string[]) => Promise<void>
```

| Param     | Type                  |
| --------- | --------------------- |
| **`ids`** | <code>string[]</code> |

--------------------


### addPolylines(...)

```typescript
addPolylines(optionsList: PolylineOptions[]) => Promise<CapacitorPolyline[]>
```

| Param             | Type                           |
| ----------------- | ------------------------------ |
| **`optionsList`** | <code>PolylineOptions[]</code> |

**Returns:** <code>Promise&lt;CapacitorPolyline[]&gt;</code>

--------------------


### addPolyline(...)

```typescript
addPolyline(options: PolylineOptions) => Promise<CapacitorPolyline>
```

| Param         | Type                                                        |
| ------------- | ----------------------------------------------------------- |
| **`options`** | <code><a href="#polylineoptions">PolylineOptions</a></code> |

**Returns:** <code>Promise&lt;CapacitorPolyline&gt;</code>

--------------------


### removePolylines(...)

```typescript
removePolylines(ids: string[]) => Promise<void>
```

| Param     | Type                  |
| --------- | --------------------- |
| **`ids`** | <code>string[]</code> |

--------------------


### destroy()

```typescript
destroy() => Promise<void>
```

--------------------


### moveCamera(...)

```typescript
moveCamera(config: CameraPosition) => Promise<void>
```

| Param        | Type                                                      |
| ------------ | --------------------------------------------------------- |
| **`config`** | <code><a href="#cameraposition">CameraPosition</a></code> |

--------------------


### animateCamera(...)

```typescript
animateCamera(config: CameraPosition) => Promise<void>
```

| Param        | Type                                                      |
| ------------ | --------------------------------------------------------- |
| **`config`** | <code><a href="#cameraposition">CameraPosition</a></code> |

--------------------


### getMapType()

```typescript
getMapType() => Promise<GoogleMapsMapTypeId>
```

Get current map type

**Returns:** <code>Promise&lt;<a href="#googlemapsmaptypeid">GoogleMapsMapTypeId</a>&gt;</code>

--------------------


### setMapType(...)

```typescript
setMapType(mapType: GoogleMapsMapTypeId) => Promise<void>
```

| Param         | Type                                                                |
| ------------- | ------------------------------------------------------------------- |
| **`mapType`** | <code><a href="#googlemapsmaptypeid">GoogleMapsMapTypeId</a></code> |

--------------------


### enableIndoorMaps(...)

```typescript
enableIndoorMaps(enabled: boolean) => Promise<void>
```

| Param         | Type                 |
| ------------- | -------------------- |
| **`enabled`** | <code>boolean</code> |

--------------------


### enableTrafficLayer(...)

```typescript
enableTrafficLayer(enabled: boolean) => Promise<void>
```

| Param         | Type                 |
| ------------- | -------------------- |
| **`enabled`** | <code>boolean</code> |

--------------------


### enableAccessibilityElements(...)

```typescript
enableAccessibilityElements(enabled: boolean) => Promise<void>
```

| Param         | Type                 |
| ------------- | -------------------- |
| **`enabled`** | <code>boolean</code> |

--------------------


### enableCurrentLocation(...)

```typescript
enableCurrentLocation(enabled: boolean) => Promise<void>
```

| Param         | Type                 |
| ------------- | -------------------- |
| **`enabled`** | <code>boolean</code> |

--------------------


### setPadding(...)

```typescript
setPadding(padding: MapPadding) => Promise<void>
```

| Param         | Type                                              |
| ------------- | ------------------------------------------------- |
| **`padding`** | <code><a href="#mappadding">MapPadding</a></code> |

--------------------


### getMapBounds()

```typescript
getMapBounds() => Promise<LatLngBounds>
```

Get the map's current viewport latitude and longitude bounds.

**Returns:** <code>Promise&lt;LatLngBounds&gt;</code>

--------------------


### fitBounds(...)

```typescript
fitBounds(bounds: LatLngBounds, padding?: number | undefined) => Promise<void>
```

Sets the map viewport to contain the given bounds.

| Param         | Type                      | Description                                                                                                               |
| ------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **`bounds`**  | <code>LatLngBounds</code> | The bounds to fit in the viewport.                                                                                        |
| **`padding`** | <code>number</code>       | Optional padding to apply in pixels. The bounds will be fit in the part of the map that remains after padding is removed. |

--------------------


### setOnBoundsChangedListener(...)

```typescript
setOnBoundsChangedListener(callback?: MapListenerCallback<CameraIdleCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#cameraidlecallbackdata">CameraIdleCallbackData</a>&gt;</code> |

--------------------


### setOnCameraIdleListener(...)

```typescript
setOnCameraIdleListener(callback?: MapListenerCallback<CameraIdleCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#cameraidlecallbackdata">CameraIdleCallbackData</a>&gt;</code> |

--------------------


### setOnCameraMoveStartedListener(...)

```typescript
setOnCameraMoveStartedListener(callback?: MapListenerCallback<CameraMoveStartedCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#cameramovestartedcallbackdata">CameraMoveStartedCallbackData</a>&gt;</code> |

--------------------


### setOnCameraMoveListener(...)

```typescript
setOnCameraMoveListener(callback?: MapListenerCallback<CameraMoveCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#cameramovecallbackdata">CameraMoveCallbackData</a>&gt;</code> |

--------------------


### setOnClusterClickListener(...)

```typescript
setOnClusterClickListener(callback?: MapListenerCallback<ClusterClickCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#clusterclickcallbackdata">ClusterClickCallbackData</a>&gt;</code> |

--------------------


### setOnClusterInfoWindowClickListener(...)

```typescript
setOnClusterInfoWindowClickListener(callback?: MapListenerCallback<ClusterClickCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#clusterclickcallbackdata">ClusterClickCallbackData</a>&gt;</code> |

--------------------


### setOnInfoWindowClickListener(...)

```typescript
setOnInfoWindowClickListener(callback?: MapListenerCallback<MarkerClickCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#markerclickcallbackdata">MarkerClickCallbackData</a>&gt;</code> |

--------------------


### setOnMapClickListener(...)

```typescript
setOnMapClickListener(callback?: MapListenerCallback<MapClickCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#mapclickcallbackdata">MapClickCallbackData</a>&gt;</code> |

--------------------


### setOnMapReadyListener(...)

```typescript
setOnMapReadyListener(callback?: MapListenerCallback<MapReadyCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#mapreadycallbackdata">MapReadyCallbackData</a>&gt;</code> |

--------------------


### setOnMarkerClickListener(...)

```typescript
setOnMarkerClickListener(callback?: MapListenerCallback<MarkerClickCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#markerclickcallbackdata">MarkerClickCallbackData</a>&gt;</code> |

--------------------


### setOnPolygonClickListener(...)

```typescript
setOnPolygonClickListener(callback?: MapListenerCallback<PolygonClickCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#polygonclickcallbackdata">PolygonClickCallbackData</a>&gt;</code> |

--------------------


### setOnPoiClickListener(...)

```typescript
setOnPoiClickListener(callback?: MapListenerCallback<PoiClickCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#poiclickcallbackdata">PoiClickCallbackData</a>&gt;</code> |

--------------------


### setOnCircleClickListener(...)

```typescript
setOnCircleClickListener(callback?: MapListenerCallback<CircleClickCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#circleclickcallbackdata">CircleClickCallbackData</a>&gt;</code> |

--------------------


### setOnPolylineClickListener(...)

```typescript
setOnPolylineClickListener(callback?: MapListenerCallback<PolylineCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#polylinecallbackdata">PolylineCallbackData</a>&gt;</code> |

--------------------


### setOnMarkerDragStartListener(...)

```typescript
setOnMarkerDragStartListener(callback?: MapListenerCallback<MarkerClickCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#markerclickcallbackdata">MarkerClickCallbackData</a>&gt;</code> |

--------------------


### setOnMarkerDragListener(...)

```typescript
setOnMarkerDragListener(callback?: MapListenerCallback<MarkerClickCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#markerclickcallbackdata">MarkerClickCallbackData</a>&gt;</code> |

--------------------


### setOnMarkerDragEndListener(...)

```typescript
setOnMarkerDragEndListener(callback?: MapListenerCallback<MarkerClickCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#markerclickcallbackdata">MarkerClickCallbackData</a>&gt;</code> |

--------------------


### setOnMyLocationButtonClickListener(...)

```typescript
setOnMyLocationButtonClickListener(callback?: MapListenerCallback<MyLocationButtonClickCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#mylocationbuttonclickcallbackdata">MyLocationButtonClickCallbackData</a>&gt;</code> |

--------------------


### setOnMyLocationClickListener(...)

```typescript
setOnMyLocationClickListener(callback?: MapListenerCallback<MapClickCallbackData> | undefined) => Promise<void>
```

| Param          | Type                                                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **`callback`** | <code><a href="#maplistenercallback">MapListenerCallback</a>&lt;<a href="#mapclickcallbackdata">MapClickCallbackData</a>&gt;</code> |

--------------------


### getVisibleRegion()

```typescript
getVisibleRegion() => Promise<VisibleRegion>
```

**Returns:** <code>Promise&lt;<a href="#visibleregion">VisibleRegion</a>&gt;</code>

--------------------


### enableCompass(...)

```typescript
enableCompass(enabled: boolean) => Promise<void>
```

| Param         | Type                 |
| ------------- | -------------------- |
| **`enabled`** | <code>boolean</code> |

--------------------


### enableToolbar(...)

```typescript
enableToolbar(isEnabled: boolean) => Promise<void>
```

| Param           | Type                 |
| --------------- | -------------------- |
| **`isEnabled`** | <code>boolean</code> |

--------------------


### enableMyLocation(...)

```typescript
enableMyLocation(isEnabled: boolean) => Promise<void>
```

| Param           | Type                 |
| --------------- | -------------------- |
| **`isEnabled`** | <code>boolean</code> |

--------------------


### enableAllGestures(...)

```typescript
enableAllGestures(isEnabled: boolean) => Promise<void>
```

| Param           | Type                 |
| --------------- | -------------------- |
| **`isEnabled`** | <code>boolean</code> |

--------------------


### enableTiltGesture(...)

```typescript
enableTiltGesture(isEnabled: boolean) => Promise<void>
```

| Param           | Type                 |
| --------------- | -------------------- |
| **`isEnabled`** | <code>boolean</code> |

--------------------


### enableTiltRotateGesture(...)

```typescript
enableTiltRotateGesture(isEnabled: boolean) => Promise<void>
```

| Param           | Type                 |
| --------------- | -------------------- |
| **`isEnabled`** | <code>boolean</code> |

--------------------


### setMapPreferences(...)

```typescript
setMapPreferences(padding?: MapPadding | undefined, building?: boolean | undefined) => Promise<void>
```

| Param          | Type                                              |
| -------------- | ------------------------------------------------- |
| **`padding`**  | <code><a href="#mappadding">MapPadding</a></code> |
| **`building`** | <code>boolean</code>                              |

--------------------


### setCameraBearing(...)

```typescript
setCameraBearing(bearing: number) => Promise<void>
```

| Param         | Type                |
| ------------- | ------------------- |
| **`bearing`** | <code>number</code> |

--------------------


### setOptions(...)

```typescript
setOptions(config: GoogleMapsOptions) => Promise<void>
```

| Param        | Type                                                            |
| ------------ | --------------------------------------------------------------- |
| **`config`** | <code><a href="#googlemapsoptions">GoogleMapsOptions</a></code> |

--------------------


### getCameraZoom()

```typescript
getCameraZoom() => Promise<number>
```

**Returns:** <code>Promise&lt;number&gt;</code>

--------------------


### setCameraTarget(...)

```typescript
setCameraTarget(target: ILatLng | ILatLng[]) => Promise<void>
```

| Param        | Type                                                     |
| ------------ | -------------------------------------------------------- |
| **`target`** | <code><a href="#ilatlng">ILatLng</a> \| ILatLng[]</code> |

--------------------


### getCameraTarget()

```typescript
getCameraTarget() => Promise<ILatLng>
```

**Returns:** <code>Promise&lt;<a href="#ilatlng">ILatLng</a>&gt;</code>

--------------------


### fromPointToLatLng(...)

```typescript
fromPointToLatLng(points: number[]) => Promise<ILatLng>
```

| Param        | Type                  |
| ------------ | --------------------- |
| **`points`** | <code>number[]</code> |

**Returns:** <code>Promise&lt;<a href="#ilatlng">ILatLng</a>&gt;</code>

--------------------


### on(...)

```typescript
on(event: GoogleMapsEvent) => Observable<any>
```

| Param       | Type                                                        |
| ----------- | ----------------------------------------------------------- |
| **`event`** | <code><a href="#googlemapsevent">GoogleMapsEvent</a></code> |

**Returns:** <code>Observable&lt;any&gt;</code>

--------------------


### Interfaces


#### CreateMapArgs

An interface containing the options used when creating a map.

| Prop              | Type                                                        | Description                                                                                                                                                                            | Default            |
| ----------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **`id`**          | <code>string</code>                                         | A unique identifier for the map instance.                                                                                                                                              |                    |
| **`apiKey`**      | <code>string</code>                                         | The Google Maps SDK API Key.                                                                                                                                                           |                    |
| **`config`**      | <code><a href="#googlemapconfig">GoogleMapConfig</a></code> | The initial configuration settings for the map.                                                                                                                                        |                    |
| **`element`**     | <code>HTMLElement</code>                                    | The DOM element that the Google Map View will be mounted on which determines size and positioning.                                                                                     |                    |
| **`forceCreate`** | <code>boolean</code>                                        | Destroy and re-create the map instance if a map with the supplied id already exists                                                                                                    | <code>false</code> |
| **`region`**      | <code>string</code>                                         | The region parameter alters your application to serve different map tiles or bias the application (such as biasing geocoding results towards the region). Only available for web.      |                    |
| **`language`**    | <code>string</code>                                         | The language parameter affects the names of controls, copyright notices, driving directions, and control labels, as well as the responses to service requests. Only available for web. |                    |


#### GoogleMapConfig

For web, all the javascript Google Maps options are available as
GoogleMapConfig extends google.maps.MapOptions.
For iOS and Android only the config options declared on <a href="#googlemapconfig">GoogleMapConfig</a> are available.

| Prop                   | Type                                                                  | Description                                                                                                                                               | Default            | Since |
| ---------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----- |
| **`width`**            | <code>number</code>                                                   | Override width for native map.                                                                                                                            |                    |       |
| **`height`**           | <code>number</code>                                                   | Override height for native map.                                                                                                                           |                    |       |
| **`x`**                | <code>number</code>                                                   | Override absolute x coordinate position for native map.                                                                                                   |                    |       |
| **`y`**                | <code>number</code>                                                   | Override absolute y coordinate position for native map.                                                                                                   |                    |       |
| **`androidLiteMode`**  | <code>boolean</code>                                                  | Enables image-based lite mode on Android.                                                                                                                 | <code>false</code> |       |
| **`devicePixelRatio`** | <code>number</code>                                                   | Override pixel ratio for native map.                                                                                                                      |                    |       |
| **`styles`**           | <code>string \| null</code>                                           | Styles to apply to each of the default map types. Note that for satellite, hybrid and terrain modes, these styles will only apply to labels and geometry. |                    | 4.3.0 |
| **`mapId`**            | <code>string</code>                                                   | A map id associated with a specific map style or feature. [Use Map IDs](https://developers.google.com/maps/documentation/get-map-id) Only for Web.        |                    | 5.4.0 |
| **`androidMapId`**     | <code>string</code>                                                   | A map id associated with a specific map style or feature. [Use Map IDs](https://developers.google.com/maps/documentation/get-map-id) Only for Android.    |                    | 5.4.0 |
| **`iOSMapId`**         | <code>string</code>                                                   | A map id associated with a specific map style or feature. [Use Map IDs](https://developers.google.com/maps/documentation/get-map-id) Only for iOS.        |                    | 5.4.0 |
| **`controls`**         | <code><a href="#googlemapcontrols">GoogleMapControls</a></code>       |                                                                                                                                                           |                    |       |
| **`gestures`**         | <code><a href="#googlemapgestures">GoogleMapGestures</a></code>       |                                                                                                                                                           |                    |       |
| **`camera`**           | <code><a href="#cameraposition">CameraPosition</a></code>             |                                                                                                                                                           |                    |       |
| **`preferences`**      | <code><a href="#googlemappreferences">GoogleMapPreferences</a></code> |                                                                                                                                                           |                    |       |


#### GoogleMapControls

| Prop                   | Type                 |
| ---------------------- | -------------------- |
| **`compass`**          | <code>boolean</code> |
| **`myLocationButton`** | <code>boolean</code> |
| **`myLocation`**       | <code>boolean</code> |
| **`indoorPicker`**     | <code>boolean</code> |
| **`zoom`**             | <code>boolean</code> |
| **`mapToolbar`**       | <code>boolean</code> |


#### GoogleMapGestures

| Prop         | Type                 |
| ------------ | -------------------- |
| **`scroll`** | <code>boolean</code> |
| **`zoom`**   | <code>boolean</code> |
| **`tilt`**   | <code>boolean</code> |
| **`rotate`** | <code>boolean</code> |


#### CameraPosition

Configuration properties for a Google Map Camera

| Prop           | Type                                                     | Description                                                                                                                 | Default        |
| -------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------- |
| **`target`**   | <code><a href="#ilatlng">ILatLng</a> \| ILatLng[]</code> | Location on the Earth towards which the camera points or multiple locations towards which the camera points in the center . |                |
| **`zoom`**     | <code>number</code>                                      | Sets the zoom of the map.                                                                                                   |                |
| **`bearing`**  | <code>number</code>                                      | Bearing of the camera, in degrees clockwise from true north.                                                                | <code>0</code> |
| **`tilt`**     | <code>number</code>                                      | The angle, in degrees, of the camera from the nadir (directly facing the Earth). The only allowed values are 0 and 45.      | <code>0</code> |
| **`duration`** | <code>number</code>                                      | This configuration option is not being used.                                                                                |                |


#### ILatLng

An interface representing a pair of latitude and longitude coordinates.

| Prop      | Type                | Description                                                               |
| --------- | ------------------- | ------------------------------------------------------------------------- |
| **`lat`** | <code>number</code> | Coordinate latitude, in degrees. This value is in the range [-90, 90].    |
| **`lng`** | <code>number</code> | Coordinate longitude, in degrees. This value is in the range [-180, 180]. |


#### GoogleMapPreferences

| Prop                | Type                                                                  |
| ------------------- | --------------------------------------------------------------------- |
| **`padding`**       | <code><a href="#mappadding">MapPadding</a></code>                     |
| **`building`**      | <code>boolean</code>                                                  |
| **`gestureBounds`** | <code>ILatLng[]</code>                                                |
| **`zoom`**          | <code><a href="#googlemapzoomoptions">GoogleMapZoomOptions</a></code> |


#### MapPadding

Controls for setting padding on the 'visible' region of the view.

| Prop         | Type                |
| ------------ | ------------------- |
| **`top`**    | <code>number</code> |
| **`left`**   | <code>number</code> |
| **`right`**  | <code>number</code> |
| **`bottom`** | <code>number</code> |


#### GoogleMapZoomOptions

| Prop          | Type                | Description                        |
| ------------- | ------------------- | ---------------------------------- |
| **`minZoom`** | <code>number</code> | The minimum zoom level of the map. |
| **`maxZoom`** | <code>number</code> | The maximum zoom level of the map. |


#### MapReadyCallbackData

| Prop        | Type                |
| ----------- | ------------------- |
| **`mapId`** | <code>string</code> |


#### MarkerOptions

| Prop                   | Type                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| **`icon`**             | <code>(<a href="#markericon">MarkerIcon</a> & { anchor?: number[]; })</code> |
| **`title`**            | <code>string</code>                                                          |
| **`snippet`**          | <code>string</code>                                                          |
| **`position`**         | <code><a href="#ilatlng">ILatLng</a></code>                                  |
| **`infoWindowAnchor`** | <code>number[]</code>                                                        |
| **`anchor`**           | <code>number[]</code>                                                        |
| **`draggable`**        | <code>boolean</code>                                                         |
| **`flat`**             | <code>boolean</code>                                                         |
| **`rotation`**         | <code>number</code>                                                          |
| **`visible`**          | <code>boolean</code>                                                         |
| **`animation`**        | <code>string</code>                                                          |
| **`zIndex`**           | <code>number</code>                                                          |
| **`disableAutoPan`**   | <code>boolean</code>                                                         |
| **`alpha`**            | <code>number</code>                                                          |


#### MarkerIcon

| Prop       | Type                                  |
| ---------- | ------------------------------------- |
| **`url`**  | <code>string</code>                   |
| **`size`** | <code><a href="#size">Size</a></code> |


#### Size

| Prop         | Type                |
| ------------ | ------------------- |
| **`width`**  | <code>number</code> |
| **`height`** | <code>number</code> |


#### Polygon

<a href="#polygon">Polygon</a> geometry object.
https://tools.ietf.org/html/rfc7946#section-3.1.6

| Prop              | Type                                          | Description                           |
| ----------------- | --------------------------------------------- | ------------------------------------- |
| **`type`**        | <code>'<a href="#polygon">Polygon</a>'</code> | Specifies the type of GeoJSON object. |
| **`coordinates`** | <code>Position[][]</code>                     |                                       |


#### CircleOptions

| Prop              | Type                                        |
| ----------------- | ------------------------------------------- |
| **`center`**      | <code><a href="#ilatlng">ILatLng</a></code> |
| **`radius`**      | <code>number</code>                         |
| **`strokeWidth`** | <code>number</code>                         |
| **`strokeColor`** | <code>string</code>                         |
| **`fillColor`**   | <code>string</code>                         |
| **`clickable`**   | <code>boolean</code>                        |
| **`visible`**     | <code>boolean</code>                        |
| **`zIndex`**      | <code>number</code>                         |


#### PolylineOptions

| Prop            | Type                   |
| --------------- | ---------------------- |
| **`points`**    | <code>ILatLng[]</code> |
| **`visible`**   | <code>boolean</code>   |
| **`geodesic`**  | <code>boolean</code>   |
| **`color`**     | <code>string</code>    |
| **`width`**     | <code>number</code>    |
| **`zIndex`**    | <code>number</code>    |
| **`clickable`** | <code>boolean</code>   |


#### CameraIdleCallbackData

| Prop            | Type                                        |
| --------------- | ------------------------------------------- |
| **`mapId`**     | <code>string</code>                         |
| **`bounds`**    | <code>LatLngBounds</code>                   |
| **`bearing`**   | <code>number</code>                         |
| **`latitude`**  | <code>number</code>                         |
| **`longitude`** | <code>number</code>                         |
| **`tilt`**      | <code>number</code>                         |
| **`zoom`**      | <code>number</code>                         |
| **`nearLeft`**  | <code><a href="#ilatlng">ILatLng</a></code> |
| **`nearRight`** | <code><a href="#ilatlng">ILatLng</a></code> |
| **`farLeft`**   | <code><a href="#ilatlng">ILatLng</a></code> |
| **`farRight`**  | <code><a href="#ilatlng">ILatLng</a></code> |


#### CameraMoveStartedCallbackData

| Prop            | Type                 |
| --------------- | -------------------- |
| **`mapId`**     | <code>string</code>  |
| **`isGesture`** | <code>boolean</code> |


#### CameraMoveCallbackData

| Prop        | Type                |
| ----------- | ------------------- |
| **`mapId`** | <code>string</code> |


#### ClusterClickCallbackData

| Prop            | Type                              |
| --------------- | --------------------------------- |
| **`mapId`**     | <code>string</code>               |
| **`latitude`**  | <code>number</code>               |
| **`longitude`** | <code>number</code>               |
| **`size`**      | <code>number</code>               |
| **`items`**     | <code>MarkerCallbackData[]</code> |


#### MarkerCallbackData

| Prop            | Type                |
| --------------- | ------------------- |
| **`markerId`**  | <code>string</code> |
| **`latitude`**  | <code>number</code> |
| **`longitude`** | <code>number</code> |
| **`title`**     | <code>string</code> |
| **`snippet`**   | <code>string</code> |


#### MarkerClickCallbackData

| Prop        | Type                |
| ----------- | ------------------- |
| **`mapId`** | <code>string</code> |


#### MapClickCallbackData

| Prop            | Type                |
| --------------- | ------------------- |
| **`mapId`**     | <code>string</code> |
| **`latitude`**  | <code>number</code> |
| **`longitude`** | <code>number</code> |


#### PolygonClickCallbackData

| Prop            | Type                |
| --------------- | ------------------- |
| **`mapId`**     | <code>string</code> |
| **`polygonId`** | <code>string</code> |
| **`tag`**       | <code>string</code> |


#### PoiClickCallbackData

| Prop            | Type                |
| --------------- | ------------------- |
| **`mapId`**     | <code>string</code> |
| **`poiId`**     | <code>string</code> |
| **`latitude`**  | <code>number</code> |
| **`longitude`** | <code>number</code> |


#### CircleClickCallbackData

| Prop           | Type                |
| -------------- | ------------------- |
| **`mapId`**    | <code>string</code> |
| **`circleId`** | <code>string</code> |
| **`tag`**      | <code>string</code> |


#### PolylineCallbackData

| Prop             | Type                |
| ---------------- | ------------------- |
| **`polylineId`** | <code>string</code> |
| **`tag`**        | <code>string</code> |


#### MyLocationButtonClickCallbackData

| Prop        | Type                |
| ----------- | ------------------- |
| **`mapId`** | <code>string</code> |


#### VisibleRegion

| Prop            | Type                                        |
| --------------- | ------------------------------------------- |
| **`nearLeft`**  | <code><a href="#ilatlng">ILatLng</a></code> |
| **`nearRight`** | <code><a href="#ilatlng">ILatLng</a></code> |
| **`farLeft`**   | <code><a href="#ilatlng">ILatLng</a></code> |
| **`farRight`**  | <code><a href="#ilatlng">ILatLng</a></code> |
| **`southwest`** | <code><a href="#ilatlng">ILatLng</a></code> |
| **`northeast`** | <code><a href="#ilatlng">ILatLng</a></code> |


#### GoogleMapsOptions

| Prop              | Type                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| **`mapType`**     | <code><a href="#googlemapsmaptypeid">GoogleMapsMapTypeId</a></code>   |
| **`controls`**    | <code><a href="#googlemapcontrols">GoogleMapControls</a></code>       |
| **`gestures`**    | <code><a href="#googlemapgestures">GoogleMapGestures</a></code>       |
| **`styles`**      | <code>any[]</code>                                                    |
| **`camera`**      | <code><a href="#cameraposition">CameraPosition</a></code>             |
| **`preferences`** | <code><a href="#googlemappreferences">GoogleMapPreferences</a></code> |


### Type Aliases


#### MapListenerCallback

The callback function to be called when map events are emitted.

<code>(data: T): void</code>


#### Position

A <a href="#position">Position</a> is an array of coordinates.
https://tools.ietf.org/html/rfc7946#section-3.1.1
Array should contain between two and three elements.
The previous GeoJSON specification allowed more elements (e.g., which could be used to represent M values),
but the current specification only allows X, Y, and (optionally) Z to be defined.

Note: the type will not be narrowed down to `[number, number] | [number, number, number]` due to
marginal benefits and the large impact of breaking change.

See previous discussions on the type narrowing:
- {@link https://github.com/DefinitelyTyped/DefinitelyTyped/pull/21590|Nov 2017}
- {@link https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/67773|Dec 2023}
- {@link https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/71441| Dec 2024}

One can use a
{@link https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates|user-defined type guard that returns a type predicate}
to determine if a position is a 2D or 3D position.

<code>number[]</code>


### Enums


#### GoogleMapsMapTypeId

| Members         | Value                    | Description                              |
| --------------- | ------------------------ | ---------------------------------------- |
| **`Normal`**    | <code>'Normal'</code>    | Basic map.                               |
| **`Hybrid`**    | <code>'Hybrid'</code>    | Satellite imagery with roads and labels. |
| **`Satellite`** | <code>'Satellite'</code> | Satellite imagery with no labels.        |
| **`Terrain`**   | <code>'Terrain'</code>   | Topographic data.                        |
| **`None`**      | <code>'None'</code>      | No base map tiles.                       |


#### GoogleMapsEvent

| Members               | Value                              |
| --------------------- | ---------------------------------- |
| **`MAP_READY`**       | <code>'onMapReady'</code>          |
| **`MAP_CLICK`**       | <code>'onMapClick'</code>          |
| **`POI_CLICK`**       | <code>'onPoiClick'</code>          |
| **`CAMERA_MOVE_END`** | <code>'onCameraIdle'</code>        |
| **`MARKER_CLICK`**    | <code>'onMarkerClick'</code>       |
| **`MAP_DRAG`**        | <code>'onCameraMove'</code>        |
| **`MAP_DRAG_START`**  | <code>'onCameraMoveStarted'</code> |

</docgen-api>
