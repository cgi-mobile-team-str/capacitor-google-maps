// swiftlint:disable file_length
import Foundation
import Capacitor
import GoogleMaps
import GoogleMapsUtils

extension GMSMapViewType {
    static func fromString(mapType: String) -> GMSMapViewType {
        switch mapType {
        case "Normal":
            return .normal
        case "Hybrid":
            return .hybrid
        case "Satellite":
            return .satellite
        case "Terrain":
            return .terrain
        case "None":
            return .none
        default:
            print("CapacitorGoogleMaps Warning: unknown mapView type '\(mapType)'.  Defaulting to normal.")
            return .normal
        }
    }
    static func toString(mapType: GMSMapViewType) -> String {
        switch mapType {
        case .normal:
            return "Normal"
        case .hybrid:
            return "Hybrid"
        case .satellite:
            return "Satellite"
        case .terrain:
            return "Terrain"
        case .none:
            return "None"
        default:
            return "Normal"
        }
    }
}

extension CGRect {
    static func fromJSObject(_ jsObject: JSObject) throws -> CGRect {
        guard let width = jsObject["width"] as? Double else {
            throw GoogleMapErrors.invalidArguments("bounds object is missing the required 'width' property")
        }

        guard let height = jsObject["height"] as? Double else {
            throw GoogleMapErrors.invalidArguments("bounds object is missing the required 'height' property")
        }

        guard let x = jsObject["x"] as? Double else {
            throw GoogleMapErrors.invalidArguments("bounds object is missing the required 'x' property")
        }

        guard let y = jsObject["y"] as? Double else {
            throw GoogleMapErrors.invalidArguments("bounds object is missing the required 'y' property")
        }

        return CGRect(x: x, y: y, width: width, height: height)
    }
}

// swiftlint:disable type_body_length
@objc(CapacitorGoogleMapsPlugin)
public class CapacitorGoogleMapsPlugin: CAPPlugin, GMSMapViewDelegate {
    private var maps = [String: Map]()
    private var isInitialized = false
    private var locationManager = CLLocationManager()

    func checkLocationPermission() -> String {
        let locationState: String

        switch self.locationManager.authorizationStatus {
        case .notDetermined:
            locationState = "prompt"
        case .restricted, .denied:
            locationState = "denied"
        case .authorizedAlways, .authorizedWhenInUse:
            locationState = "granted"
        @unknown default:
            locationState = "prompt"
        }

        return locationState
    }

    @objc func create(_ call: CAPPluginCall) {
        do {
            if !isInitialized {
                guard let apiKey = call.getString("apiKey") else {
                    throw GoogleMapErrors.invalidAPIKey
                }

                GMSServices.provideAPIKey(apiKey)
                isInitialized = true
            }

            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let configObj = call.getObject("config") else {
                throw GoogleMapErrors.invalidArguments("config object is missing")
            }

            let forceCreate = call.getBool("forceCreate", false)

            let config = try GoogleMapConfig(fromJSObject: configObj)

            if self.maps[id] != nil {
                if !forceCreate {
                    call.resolve()
                    return
                }

                let removedMap = self.maps.removeValue(forKey: id)
                removedMap?.destroy()
            }

            DispatchQueue.main.sync {
                let newMap = Map(id: id, config: config, delegate: self)
                self.maps[id] = newMap
            }

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func destroy(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let removedMap = self.maps.removeValue(forKey: id) else {
                throw GoogleMapErrors.mapNotFound
            }

            removedMap.destroy()
            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func enableTouch(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            map.enableTouch()

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func disableTouch(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            map.disableTouch()

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func removeMarkers(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let markerIdStrings = call.getArray("markerIds") as? [String] else {
                throw GoogleMapErrors.invalidArguments("markerIds are invalid or missing")
            }

            if markerIdStrings.isEmpty {
                throw GoogleMapErrors.invalidArguments("markerIds requires at least one marker id")
            }

            let ids: [Int] = try markerIdStrings.map { idString in
                guard let markerId = Int(idString) else {
                    throw GoogleMapErrors.invalidArguments("markerIds are invalid or missing")
                }

                return markerId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.removeMarkers(ids: ids)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func removeMarker(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let markerIdString = call.getString("markerId") else {
                throw GoogleMapErrors.invalidArguments("markerId is invalid or missing")
            }

            guard let markerId = Int(markerIdString) ?? markerIdString.hashValue as Int? else {
                throw GoogleMapErrors.invalidArguments("markerId is invalid")
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.removeMarker(id: markerId)

            call.resolve()

        } catch {
            handleError(call, error: error)
        }
    }

    @objc func animateCamera(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let configObj = call.getObject("config") else {
                throw GoogleMapErrors.invalidArguments("config object is missing")
            }

            let config = try GoogleMapCameraConfig(fromJSObject: configObj)

            try map.animateCamera(config: config)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func moveCamera(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let configObj = call.getObject("config") else {
                throw GoogleMapErrors.invalidArguments("config object is missing")
            }

            let config = try GoogleMapCameraConfig(fromJSObject: configObj)

            try map.moveCamera(config: config)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func getCameraZoom(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            let cameraZoom = map.getCameraZoom()

            call.resolve([
                "cameraZoom": cameraZoom
            ])
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func getCameraTarget(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            let cameraTarget = map.getCameraTarget()

            call.resolve([
                "cameraTarget":  [
                    "lat": cameraTarget.lat,
                    "lng": cameraTarget.lng
                ]
            ])
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func getMapType(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            let mapType = GMSMapViewType.toString(mapType: map.getMapType())

            call.resolve([
                "type": mapType
            ])
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func setCameraBearing(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let bearing = call.getDouble("bearing") else {
                throw GoogleMapErrors.invalidArguments("bearing is missing")
            }
            
            try map.setCameraBearing(bearing: bearing)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func setCameraTarget(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            let targetObj = call.getObject("target")
            let targetArray = call.getArray("target")

            if(targetObj == nil && targetArray == nil) {
                throw GoogleMapErrors.invalidArguments("target is missing")
            }
            
            if(targetObj != nil) {
                let target: CLLocationCoordinate2D = try GoogleMapsUtils.getCLLocationCoordinate(targetObj!)
                try map.setCameraTarget(target: target)
                call.resolve()
            }
            
            if(targetArray != nil) {
                var targets: [CLLocationCoordinate2D] = []
               try targetArray!.forEach { target in
                   let coordinate: CLLocationCoordinate2D = try GoogleMapsUtils.getCLLocationCoordinate(target as! JSObject)
                    targets.append(coordinate)
                }
                try map.setCameraTarget(target: targets)
                call.resolve()
            }
   
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func setOptions(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let configObj = call.getObject("config") else {
                throw GoogleMapErrors.invalidArguments("config object is missing")
            }

            let config = try GoogleMapsOptions(fromJSObject: configObj)

            try map.setOptions(config: config)
            
            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func setMapType(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let mapTypeString = call.getString("mapType") else {
                throw GoogleMapErrors.invalidArguments("mapType is missing")
            }

            let mapType = GMSMapViewType.fromString(mapType: mapTypeString)

            try map.setMapType(mapType: mapType)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func enableIndoorMaps(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let enabled = call.getBool("enabled") else {
                throw GoogleMapErrors.invalidArguments("enabled is missing")
            }

            try map.enableIndoorMaps(enabled: enabled)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func enableTrafficLayer(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let enabled = call.getBool("enabled") else {
                throw GoogleMapErrors.invalidArguments("enabled is missing")
            }

            try map.enableTrafficLayer(enabled: enabled)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func enableAccessibilityElements(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let enabled = call.getBool("enabled") else {
                throw GoogleMapErrors.invalidArguments("enabled is missing")
            }

            try map.enableAccessibilityElements(enabled: enabled)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func setPadding(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let configObj = call.getObject("padding") else {
                throw GoogleMapErrors.invalidArguments("padding is missing")
            }

            let padding = try GoogleMapPadding.init(fromJSObject: configObj)

            try map.setPadding(padding: padding)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func enableCurrentLocation(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let enabled = call.getBool("enabled") else {
                throw GoogleMapErrors.invalidArguments("enabled is missing")
            }

            let locationStatus = checkLocationPermission()

            if enabled &&  !(locationStatus == "granted" || locationStatus == "prompt") {
                throw GoogleMapErrors.permissionsDeniedLocation
            }

            try map.enableCurrentLocation(enabled: enabled)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func enableClustering(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            let minClusterSize = call.getInt("minClusterSize")

            map.enableClustering(minClusterSize)
            call.resolve()

        } catch {
            handleError(call, error: error)
        }
    }

    @objc func disableClustering(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            map.disableClustering()
            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func onScroll(_ call: CAPPluginCall) {
        call.unavailable("not supported on iOS")
    }

    @objc func onResize(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let mapBoundsObj = call.getObject("mapBounds") else {
                throw GoogleMapErrors.invalidArguments("map bounds not set")
            }

            let mapBounds = try CGRect.fromJSObject(mapBoundsObj)

            map.updateRender(mapBounds: mapBounds)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func onDisplay(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let mapBoundsObj = call.getObject("mapBounds") else {
                throw GoogleMapErrors.invalidArguments("map bounds not set")
            }

            let mapBounds = try CGRect.fromJSObject(mapBoundsObj)

            map.rebindTargetContainer(mapBounds: mapBounds)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func getMapBounds(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try DispatchQueue.main.sync {
                guard let bounds = map.getMapLatLngBounds() else {
                    throw GoogleMapErrors.unhandledError("Google Map Bounds could not be found.")
                }

                call.resolve(
                  
                    formatMapBoundsForResponse(
                        bounds: bounds,
                        cameraPosition: map.mapViewController.GMapView.camera
                    )
                )
            }
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func getVisibleRegion(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try DispatchQueue.main.sync {
                guard let bounds = map.getMapLatLngBounds() else {
                    throw GoogleMapErrors.unhandledError("Google Map Bounds could not be found.")
                }
                guard let visibleRegion = map.getVisibleRegion() else {
                    throw GoogleMapErrors.unhandledError("Google Visible Region could not be found.")
                }

                call.resolve(
                    formatVisibleRegionForResponse(
                        visibleRegion: visibleRegion,
                        bounds: bounds
                    )
                )
            }
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func enableCompass(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let enabled = call.getBool("enabled") else {
                throw GoogleMapErrors.invalidArguments("enabled is missing")
            }

            try map.enableCompass(enabled: enabled)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func enableMyLocation(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let isEnabled = call.getBool("isEnabled") else {
                throw GoogleMapErrors.invalidArguments("isEnabled is missing")
            }

            try map.enableMyLocation(isEnabled: isEnabled)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func enableTiltGesture(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let isEnabled = call.getBool("isEnabled") else {
                throw GoogleMapErrors.invalidArguments("isEnabled is missing")
            }

            try map.enableTiltGesture(isEnabled: isEnabled)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func enableTiltRotateGesture(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let isEnabled = call.getBool("isEnabled") else {
                throw GoogleMapErrors.invalidArguments("isEnabled is missing")
            }

            try map.enableTiltRotateGesture(isEnabled: isEnabled)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func setMapPreferences(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            let building = call.getBool("building")
            let paddingObj = call.getObject("padding")
            var padding: GoogleMapPadding? = nil
            if(paddingObj != nil) {
                padding = try GoogleMapPadding.init(fromJSObject: paddingObj!)
            }
            try map.setMapPreferences(padding: padding, building: building)
            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func mapBoundsContains(_ call: CAPPluginCall) {
        do {
            guard let boundsObject = call.getObject("bounds") else {
                throw GoogleMapErrors.invalidArguments("Invalid bounds provided")
            }

            guard let pointObject = call.getObject("point") else {
                throw GoogleMapErrors.invalidArguments("Invalid point provided")
            }

            let bounds = try getGMSCoordinateBounds(boundsObject)
            let point = try GoogleMapsUtils.getCLLocationCoordinate(pointObject)

            call.resolve([
                "contains": bounds.contains(point)
            ])
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func fitBounds(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let boundsObject = call.getObject("bounds") else {
                throw GoogleMapErrors.invalidArguments("Invalid bounds provided")
            }

            let bounds = try getGMSCoordinateBounds(boundsObject)
            let padding = CGFloat(call.getInt("padding", 0))

            map.fitBounds(bounds: bounds, padding: padding)
            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    @objc func mapBoundsExtend(_ call: CAPPluginCall) {
        do {
            guard let boundsObject = call.getObject("bounds") else {
                throw GoogleMapErrors.invalidArguments("Invalid bounds provided")
            }

            guard let pointObject = call.getObject("point") else {
                throw GoogleMapErrors.invalidArguments("Invalid point provided")
            }

            let bounds = try getGMSCoordinateBounds(boundsObject)
            let point = try GoogleMapsUtils.getCLLocationCoordinate(pointObject)

            DispatchQueue.main.sync {
                let newBounds = bounds.includingCoordinate(point)
                call.resolve([
                    "bounds": formatMapBoundsForResponse(newBounds)
                ])
            }
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func fromPointToLatLng(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            guard let pointsArr = call.getArray("points") as? [Double] else {
                throw GoogleMapErrors.invalidArguments("points is missing")
            }
            
            var points: [Double] = []
            
            for point in pointsArr {
                points.append(point)
            }

            let latLng = try map.fromPointToLatLng(points: points)

            call.resolve([
                "latLng": [
                    "lat": latLng.lat,
                    "lng": latLng.lng
                ]
            ])
        } catch {
            handleError(call, error: error)
        }
    }

    private func getGMSCoordinateBounds(_ bounds: JSObject) throws -> GMSCoordinateBounds {
        guard let southwest = bounds["southwest"] as? JSObject else {
            throw GoogleMapErrors.unhandledError("Bounds southwest property not formatted properly.")
        }

        guard let northeast = bounds["northeast"] as? JSObject else {
            throw GoogleMapErrors.unhandledError("Bounds northeast property not formatted properly.")
        }

        return GMSCoordinateBounds(
            coordinate: try GoogleMapsUtils.getCLLocationCoordinate(southwest),
            coordinate: try GoogleMapsUtils.getCLLocationCoordinate(northeast)
        )
    }

    private func formatMapBoundsForResponse(bounds: GMSCoordinateBounds?, cameraPosition: GMSCameraPosition) -> PluginCallResultData {
        return [
            "southwest": [
                "lat": bounds?.southWest.latitude,
                "lng": bounds?.southWest.longitude
            ],
            "center": [
                "lat": cameraPosition.target.latitude,
                "lng": cameraPosition.target.longitude
            ],
            "northeast": [
                "lat": bounds?.northEast.latitude,
                "lng": bounds?.northEast.longitude
            ]
        ]
    }

    private func formatVisibleRegionForResponse(visibleRegion: GMSVisibleRegion?, bounds: GMSCoordinateBounds?) -> PluginCallResultData {
        return [
            "nearLeft": [
                "lat": visibleRegion?.nearLeft.latitude,
                "lng": visibleRegion?.nearLeft.longitude
            ],
            "nearRight": [
                "lat": visibleRegion?.nearRight.latitude,
                "lng": visibleRegion?.nearRight.longitude
            ],
            "farLeft": [
                "lat": visibleRegion?.farLeft.latitude,
                "lng": visibleRegion?.farLeft.longitude
            ],
            "farRight": [
                "lat": visibleRegion?.farRight.latitude,
                "lng": visibleRegion?.farRight.longitude
            ],
            "southwest": [
                "lat": bounds?.southWest.latitude,
                "lng": bounds?.southWest.longitude
            ],
            "northeast": [
                "lat": bounds?.northEast.latitude,
                "lng": bounds?.northEast.longitude
            ]
        ]
    }
    
    private func formatMarkerForResponse(markerId: Int, mapId: String, marker: Marker) -> PluginCallResultData {
        var results: PluginCallResultData = [
            "id": marker.id ?? String(markerId),
            "mapId": mapId,
            "coordinate": [
                "lat": marker.coordinate.lat,
                "lng": marker.coordinate.lng
            ],
            "opacity": marker.opacity,
            "title": marker.title,
            "snippet": marker.snippet,
            "zIndex": marker.zIndex,
            "isFlat": marker.isFlat,
            "iconUrl": marker.iconUrl,
            "iconSize": [
                "width": marker.iconSize?.width,
                "height": marker.iconSize?.height
            ],
            "iconAnchor": [
                "x": marker.iconAnchor?.x,
                "y": marker.iconAnchor?.y
            ],
            "draggable": marker.draggable,
            "colorHue": marker.color,
            "isVisible": marker.isVisible
        ]

        for (key, value) in marker.extras {
            results[key] = value
        }
        
        return results
    }
    
    private func formatPolylineForResponse(polylineId: Int, mapId: String, polyline: Polyline) -> PluginCallResultData {
        let hexColor =  GoogleMapsUtils.hexStringFromColor(color: polyline.strokeColor)
        var points: JSArray = []
        
        for i in 0..<polyline.path.count {
            let coord = polyline.path[i]
            points.append([
                "lat": coord.lat,
                "lng": coord.lng
            ])
        }
        
        var results: PluginCallResultData = [
            "id": String(polylineId),
            "mapId": mapId,
            "path": points,
            "geodesic": polyline.geodesic,
            "visible": polyline.isVisible,
            "clickable": polyline.tappable,
            "strokeWidth": polyline.strokeWidth,
            "strokeColor": hexColor
        ]
        
        
        for (key, value) in polyline.extras {
            results[key] = value
        }
        
        return results
    }
    
    private func formatCircleForResponse(circleId: Int, mapId: String, circle: Circle) -> PluginCallResultData {
        let hexStrokeColor =  GoogleMapsUtils.hexStringFromColor(color: circle.strokeColor)
        let hexFillColor = GoogleMapsUtils.hexStringFromColor(color: circle.fillColor)
        var center: JSObject = JSObject()
        
        center = [
            "lat": circle.center.lat,
            "lng": circle.center.lng
        ]
        
        return [
            "id": String(circleId),
            "mapId": mapId,
            "center": center,
            "radius": circle.radius,
            "strokeColor": hexStrokeColor,
            "fillColor": hexFillColor,
            "strokeWidth": circle.strokeWidth,
            "visible": circle.visible,
            "tappable": circle.tappable,
            "zIndex": circle.zIndex
        ]
    }
    
    private func formatPolygonForResponse(polygonId: Int, mapId: String, polygon: Polygon) -> PluginCallResultData {
        let hexStrokeColor = GoogleMapsUtils.hexStringFromColor(color: polygon.strokeColor)
        let hexFillColor = GoogleMapsUtils.hexStringFromColor(color: polygon.fillColor)

        var points: JSArray = []

        for ring in polygon.shapes {
            var ringArray: JSArray = []
            for coord in ring {
                ringArray.append([
                    "lat": coord.lat,
                    "lng": coord.lng
                ])
            }
            points.append(ringArray)
        }

        return [
            "id": String(polygonId),
            "mapId": mapId,
            "points": points,
            "strokeColor": hexStrokeColor,
            "fillColor": hexFillColor,
            "strokeWidth": polygon.strokeWidth,
            "visible": polygon.visible ?? true,
            "tappable": polygon.tappable ?? false,
            "zIndex": polygon.zIndex
        ]
    }
    
    private func formatMapBoundsForResponse(_ bounds: GMSCoordinateBounds) -> PluginCallResultData {
        return [
            "southwest": [
                "lat": bounds.southWest.latitude,
                "lng": bounds.southWest.longitude
            ],
            "center": [
                "lat": GoogleMapsUtils.getCenterFromBound(bounds).latitude,
                "lng": GoogleMapsUtils.getCenterFromBound(bounds).longitude
            ],
            "northeast": [
                "lat": bounds.northEast.latitude,
                "lng": bounds.northEast.longitude
            ]
        ]
    }

    private func handleError(_ call: CAPPluginCall, error: Error) {
        let errObject = getErrorObject(error)
        call.reject(errObject.message, "\(errObject.code)", error, [:])
    }

    private func findMapIdByMapView(_ mapView: GMSMapView) -> String {
        for (mapId, map) in self.maps {
            if map.mapViewController.GMapView === mapView {
                return mapId
            }
        }
        return ""
    }

    // --- EVENT LISTENERS ---

    // onCameraIdle
    public func mapView(_ mapView: GMSMapView, idleAt cameraPosition: GMSCameraPosition) {
        let mapId = self.findMapIdByMapView(mapView)
        let map = self.maps[mapId]
        let bounds = map?.getMapLatLngBounds()
        let visibleRegion = map?.getVisibleRegion()
        
        let data: PluginCallResultData = [
            "mapId": mapId,
            "bounds": formatMapBoundsForResponse(
                bounds: bounds,
                cameraPosition: cameraPosition
            ),
            "bearing": cameraPosition.bearing,
            "latitude": cameraPosition.target.latitude,
            "longitude": cameraPosition.target.longitude,
            "tilt": cameraPosition.viewingAngle,
            "zoom": cameraPosition.zoom,
            "nearLeft": [
                "lat": visibleRegion?.nearLeft.latitude,
                "lng": visibleRegion?.nearLeft.longitude
            ],
            "nearRight": [
                "lat": visibleRegion?.nearRight.latitude,
                "lng": visibleRegion?.nearRight.longitude
            ],
            "farLeft": [
                "lat": visibleRegion?.farLeft.latitude,
                "lng": visibleRegion?.farLeft.longitude
            ],
            "farRight": [
                "lat": visibleRegion?.farRight.latitude,
                "lng": visibleRegion?.farRight.longitude
            ],
        ]

        self.notifyListeners("onBoundsChanged", data: data)
        self.notifyListeners("onCameraIdle", data: data)
    }

    // onCameraMoveStarted
    public func mapView(_ mapView: GMSMapView, willMove gesture: Bool) {
        self.notifyListeners("onCameraMoveStarted", data: [
            "mapId": self.findMapIdByMapView(mapView),
            "isGesture": gesture
        ])
    }

    // onCameraMove
    public func mapView(_ mapView: GMSMapView, didChange position: GMSCameraPosition) {
        self.notifyListeners("onCameraMove", data: [
            "mapId": self.findMapIdByMapView(mapView),
            "latitude": position.target.latitude,
            "longitude": position.target.longitude,
            "zoom": position.zoom,
            "bearing": position.bearing,
            "tilt": position.viewingAngle
        ])
    }
    
    // onMapClick
    public func mapView(_ mapView: GMSMapView, didTapAt coordinate: CLLocationCoordinate2D) {
        self.notifyListeners("onMapClick", data: [
            "mapId": self.findMapIdByMapView(mapView),
            "latitude": coordinate.latitude,
            "longitude": coordinate.longitude
        ])
    }

    // onPolygonClick, onPolylineClick, onCircleClick
    public func mapView(_ mapView: GMSMapView, didTap overlay: GMSOverlay) {
        if let polygon = overlay as? GMSPolygon {
            self.notifyListeners("onPolygonClick", data: [
                "mapId": self.findMapIdByMapView(mapView),
                "polygonId": String(overlay.hash.hashValue),
                "tag": polygon.userData as? String
            ])
        }

        if let circle = overlay as? GMSCircle {
            self.notifyListeners("onCircleClick", data: [
                "mapId": self.findMapIdByMapView(mapView),
                "circleId": String(overlay.hash.hashValue),
                "tag": circle.userData as? String,
                "latitude": circle.position.latitude,
                "longitude": circle.position.longitude,
                "radius": circle.radius
            ])
        }

        if let polyline = overlay as? GMSPolyline {
            self.notifyListeners("onPolylineClick", data: [
                "mapId": self.findMapIdByMapView(mapView),
                "polylineId": String(overlay.hash.hashValue),
                "tag": polyline.userData as? String
            ])
        }
    }

    // onClusterClick, onMarkerClick
    public func mapView(_ mapView: GMSMapView, didTap marker: GMSMarker) -> Bool {
        if let cluster = marker.userData as? GMUCluster {
            var items: [[String: Any?]] = []

            for item in cluster.items {
                items.append([
                    "markerId": String(item.hash.hashValue),
                    "latitude": item.position.latitude,
                    "longitude": item.position.longitude,
                    "title": item.title ?? "",
                    "snippet": item.snippet ?? ""
                ])
            }

            self.notifyListeners("onClusterClick", data: [
                "mapId": self.findMapIdByMapView(mapView),
                "latitude": cluster.position.latitude,
                "longitude": cluster.position.longitude,
                "size": cluster.count,
                "items": items
            ])
        } else {
            self.notifyListeners("onMarkerClick", data: [
                "mapId": self.findMapIdByMapView(mapView),
                "markerId": String(marker.hash.hashValue),
                "latitude": marker.position.latitude,
                "longitude": marker.position.longitude,
                "title": marker.title ?? "",
                "snippet": marker.snippet ?? ""
            ])
        }
        return false
    }

    // onMarkerDragStart
    public func mapView(_ mapView: GMSMapView, didBeginDragging marker: GMSMarker) {
        self.notifyListeners("onMarkerDragStart", data: [
            "mapId": self.findMapIdByMapView(mapView),
            "markerId": String(marker.hash.hashValue),
            "latitude": marker.position.latitude,
            "longitude": marker.position.longitude,
            "title": marker.title ?? "",
            "snippet": marker.snippet ?? ""
        ])
    }

    // onMarkerDrag
    public func mapView(_ mapView: GMSMapView, didDrag marker: GMSMarker) {
        self.notifyListeners("onMarkerDrag", data: [
            "mapId": self.findMapIdByMapView(mapView),
            "markerId": String(marker.hash.hashValue),
            "latitude": marker.position.latitude,
            "longitude": marker.position.longitude,
            "title": marker.title ?? "",
            "snippet": marker.snippet ?? ""
        ])
    }

    // onMarkerDragEnd
    public func mapView(_ mapView: GMSMapView, didEndDragging marker: GMSMarker) {
        self.notifyListeners("onMarkerDragEnd", data: [
            "mapId": self.findMapIdByMapView(mapView),
            "markerId": String(marker.hash.hashValue),
            "latitude": marker.position.latitude,
            "longitude": marker.position.longitude,
            "title": marker.title ?? "",
            "snippet": marker.snippet ?? ""
        ])
    }

    // onClusterInfoWindowClick, onInfoWindowClick
    public func mapView(_ mapView: GMSMapView, didTapInfoWindowOf marker: GMSMarker) {
        if let cluster = marker.userData as? GMUCluster {
            var items: [[String: Any?]] = []

            for item in cluster.items {
                items.append([
                    "markerId": String(item.hash.hashValue),
                    "latitude": item.position.latitude,
                    "longitude": item.position.longitude,
                    "title": item.title ?? "",
                    "snippet": item.snippet ?? ""
                ])
            }

            self.notifyListeners("onClusterInfoWindowClick", data: [
                "mapId": self.findMapIdByMapView(mapView),
                "latitude": cluster.position.latitude,
                "longitude": cluster.position.longitude,
                "size": cluster.count,
                "items": items
            ])
        } else {
            self.notifyListeners("onInfoWindowClick", data: [
                "mapId": self.findMapIdByMapView(mapView),
                "markerId": String(marker.hash.hashValue),
                "latitude": marker.position.latitude,
                "longitude": marker.position.longitude,
                "title": marker.title ?? "",
                "snippet": marker.snippet ?? ""
            ])
        }
    }

    // onMyLocationButtonClick
    public func didTapMyLocationButtonForMapView(for mapView: GMSMapView) -> Bool {
        self.notifyListeners("onMyLocationButtonClick", data: [
            "mapId": self.findMapIdByMapView(mapView)
        ])
        return false
    }

    // onMyLocationClick
    public func mapView(_ mapView: GMSMapView, didTapMyLocation location: CLLocationCoordinate2D) {
        self.notifyListeners("onMyLocationButtonClick", data: [
            "mapId": self.findMapIdByMapView(mapView),
            "latitude": location.latitude,
            "longitude": location.longitude
        ])
    }
    
    //OnPoiClick
    public func mapView(_ mapView: GMSMapView, didTapPOIWithPlaceID placeID: String,
                        name: String, location: CLLocationCoordinate2D) {
        self.notifyListeners("onPoiClick", data: [
            "mapId": self.findMapIdByMapView(mapView),
            "poiId": placeID,
            "latitude": location.latitude,
            "longitude": location.longitude
        ])
    }
    
    // BEGIN MARKER METHODS
    
    @objc func addMarker(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let optionsObj = call.getObject("options") else {
                throw GoogleMapErrors.invalidArguments("options object is missing")
            }
            
            let options = try MarkerOptions(fromJSObject: optionsObj)

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            let (markerId, addedMarker) = try map.addMarker(options: options)
            call.resolve(formatMarkerForResponse(markerId: markerId, mapId: id, marker: addedMarker))

        } catch {
            handleError(call, error: error)
        }
    }

    @objc func addMarkers(_ call: CAPPluginCall) {
        do {
            var pairsIdMarker: [(Int, Marker)] = []
            
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let optionsListObjs = call.getArray("optionsList") as? [JSObject] else {
                throw GoogleMapErrors.invalidArguments("options array is missing")
            }

            if optionsListObjs.isEmpty {
                throw GoogleMapErrors.invalidArguments("options requires at least one option")
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            var optionsList: [MarkerOptions] = []

            try optionsListObjs.forEach { options in
                let opts = try MarkerOptions(fromJSObject: options)
                optionsList.append(opts)
            }

            pairsIdMarker = try map.addMarkers(optionsList: optionsList)

            call.resolve(["markers": pairsIdMarker.map({ pair in
                return formatMarkerForResponse(markerId: pair.0, mapId: id, marker: pair.1)
            })])

        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func setMarkerIcon(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let markerIdString = call.getString("markerId") else {
                throw GoogleMapErrors.invalidArguments("markerId is invalid or missing")
            }

            guard let markerId = Int(markerIdString) else {
                throw GoogleMapErrors.invalidArguments("markerId is invalid or missing")
            }
            
            let url = call.getString("url")
            var size: CGSize?
            
            if let sizeObj: JSObject = call.getObject("size") {
                size = CGSize.init(width: sizeObj["width"] as? Double ?? 0, height: sizeObj["height"] as? Double  ?? 0)
            }
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.setMarkerIcon(markerId: markerId, url: url, size: size)

            call.resolve()

        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func setMarkerIconAnchor(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let markerIdString = call.getString("markerId") else {
                throw GoogleMapErrors.invalidArguments("markerId is invalid or missing")
            }

            guard let markerId = Int(markerIdString) else {
                throw GoogleMapErrors.invalidArguments("markerId is invalid or missing")
            }
            
            guard let x = call.getDouble("x") else {
                throw GoogleMapErrors.invalidArguments("x is invalid or missing")
            }
            
            guard let y = call.getDouble("y") else {
                throw GoogleMapErrors.invalidArguments("y is invalid or missing")
            }
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.setMarkerIconAnchor(markerId: markerId, x: x, y: y)

            call.resolve()

        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func setMarkerZIndex(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let markerIdString = call.getString("markerId") else {
                throw GoogleMapErrors.invalidArguments("markerId is invalid or missing")
            }

            guard let markerId = Int(markerIdString) else {
                throw GoogleMapErrors.invalidArguments("markerId is invalid or missing")
            }
            
            guard let zIndex = call.getInt("zIndex") else {
                throw GoogleMapErrors.invalidArguments("zIndex is invalid or missing")
            }
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.setMarkerZIndex(markerId: markerId, zIndex: Int32(zIndex))

            call.resolve()

        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func setMarkerVisibility(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let markerIdString = call.getString("markerId") else {
                throw GoogleMapErrors.invalidArguments("markerId is invalid or missing")
            }

            guard let markerId = Int(markerIdString) else {
                throw GoogleMapErrors.invalidArguments("markerId is invalid or missing")
            }
            
            guard let isVisible = call.getBool("isVisible") else {
                throw GoogleMapErrors.invalidArguments("isVisible is invalid or missing")
            }
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.setMarkerVisibility(markerId: markerId, isVisible: isVisible)

            call.resolve()

        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func getMarkerPosition(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let markerIdString = call.getString("markerId") else {
                throw GoogleMapErrors.invalidArguments("markerId is invalid or missing")
            }

            guard let markerId = Int(markerIdString) else {
                throw GoogleMapErrors.invalidArguments("markerId is invalid or missing")
            }
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            let position = try map.getMarkerPosition(markerId: markerId)

            call.resolve([
                "position": [
                    "lat": position.lat,
                    "lng": position.lng
                ]
            ])
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func isMarkerRemoved(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let markerIdString = call.getString("markerId") else {
                throw GoogleMapErrors.invalidArguments("markerId is invalid or missing")
            }

            guard let markerId = Int(markerIdString) ?? markerIdString.hashValue as Int? else {
                throw GoogleMapErrors.invalidArguments("markerId is invalid")
            }
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            let isRemoved = map.isMarkerRemoved(markerId: markerId)

            call.resolve([
                "isRemoved": isRemoved
            ])
        } catch {
            handleError(call, error: error)
        }
    }
    
    // END MARKER METHODS
    
    // BEGIN POLYLINE METHODS
    
    @objc func addPolylines(_ call: CAPPluginCall) {
        do {
            var pairsIdPolyline: [(Int, Polyline)] = []
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let optionsListObjs = call.getArray("optionsList") as? [JSObject] else {
                throw GoogleMapErrors.invalidArguments("options array is missing")
            }

            if optionsListObjs.isEmpty {
                throw GoogleMapErrors.invalidArguments("options requires at least one option")
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            var optionsList: [PolylineOptions] = []

            try optionsListObjs.forEach { options in
                let opts = try PolylineOptions(fromJSObject: options)
                optionsList.append(opts)
            }

            pairsIdPolyline = try map.addPolylines(optionsList: optionsList)

            call.resolve(["polylines": pairsIdPolyline.map({ pair in
                return formatPolylineForResponse(polylineId: pair.0, mapId: id, polyline: pair.1)
            })])
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func addPolyline(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }
            
            guard let optionsObj = call.getObject("options") else {
                throw GoogleMapErrors.invalidArguments("options object is missing")
            }
            
            let options = try PolylineOptions(fromJSObject: optionsObj)
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }
            
            let (polylineId, addedPolyline) = try map.addPolyline(options: options)
            call.resolve(formatPolylineForResponse(polylineId: polylineId, mapId: id, polyline: addedPolyline))
            
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func setPolylineStrokeColor(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let polylineIdString = call.getString("polylineId") else {
                throw GoogleMapErrors.invalidArguments("polylineId is invalid or missing")
            }

            guard let polylineId = Int(polylineIdString) else {
                throw GoogleMapErrors.invalidArguments("polylineId is invalid or missing")
            }
            
            guard let strokeColor = call.getString("strokeColor") else {
                throw GoogleMapErrors.invalidArguments("strokeColor is invalid or missing")
            }
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.setPolylineStrokeColor(polylineId: polylineId, strokeColor: strokeColor)

            call.resolve()

        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func setPolylineZIndex(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let polylineIdString = call.getString("polylineId") else {
                throw GoogleMapErrors.invalidArguments("polylineId is invalid or missing")
            }

            guard let polylineId = Int(polylineIdString) else {
                throw GoogleMapErrors.invalidArguments("polylineId is invalid or missing")
            }
            
            guard let zIndex = call.getFloat("zIndex") else {
                throw GoogleMapErrors.invalidArguments("zIndex is invalid or missing")
            }
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.setPolylineZIndex(polylineId: polylineId, zIndex: zIndex)

            call.resolve()

        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func setPolylineStrokeWidth(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let polylineIdString = call.getString("polylineId") else {
                throw GoogleMapErrors.invalidArguments("polylineId is invalid or missing")
            }

            guard let polylineId = Int(polylineIdString) else {
                throw GoogleMapErrors.invalidArguments("polylineId is invalid or missing")
            }
            
            guard let strokeWidth = call.getFloat("strokeWidth") else {
                throw GoogleMapErrors.invalidArguments("strokeColor is invalid or missing")
            }
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.setPolylineStrokeWidth(polylineId: polylineId, strokeWidth: strokeWidth)

            call.resolve()

        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func removePolyline(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let polylineIdString = call.getString("polylineId") else {
                throw GoogleMapErrors.invalidArguments("polylineId is invalid or missing")
            }

            guard let polylineId = Int(polylineIdString) else {
                throw GoogleMapErrors.invalidArguments("polylineId is invalid or missing")
            }
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.removePolyline(polylineId: polylineId)

            call.resolve()

        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func removePolylines(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let polylineIdsStrings = call.getArray("polylineIds") as? [String] else {
                throw GoogleMapErrors.invalidArguments("polylineIds are invalid or missing")
            }

            if polylineIdsStrings.isEmpty {
                throw GoogleMapErrors.invalidArguments("polylineIds requires at least one polyline id")
            }

            let ids: [Int] = try polylineIdsStrings.map { idString in
                guard let polylineId = Int(idString) else {
                    throw GoogleMapErrors.invalidArguments("polylineIds are invalid or missing")
                }

                return polylineId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.removePolylines(ids: ids)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func isPolylineRemoved(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let polylineIdString = call.getString("polylineId") else {
                throw GoogleMapErrors.invalidArguments("polylineId is invalid or missing")
            }

            guard let polylineId = Int(polylineIdString) else {
                throw GoogleMapErrors.invalidArguments("polylineId is invalid or missing")
            }
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            let isRemoved = map.isPolylineRemoved(polylineId: polylineId)

            call.resolve([
                "isRemoved": isRemoved
            ])
        } catch {
            handleError(call, error: error)
        }
    }
    
    // END POLYLINE METHODS
    
    // BEGIN CIRCLE METHODS
    
    @objc func addCircles(_ call: CAPPluginCall) {
        do {
            var pairsIdCircle: [(Int, Circle)] = []
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let optionsListObjs = call.getArray("optionsList") as? [JSObject] else {
                throw GoogleMapErrors.invalidArguments("options array is missing")
            }

            if optionsListObjs.isEmpty {
                throw GoogleMapErrors.invalidArguments("options requires at least one option")
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            var optionsList: [CircleOptions] = []

            try optionsListObjs.forEach { options in
                let opts = try CircleOptions(fromJSObject: options)
                optionsList.append(opts)
            }

            pairsIdCircle = try map.addCircles(optionsList: optionsList)

            call.resolve(["circles": pairsIdCircle.map({ pair in
                return formatCircleForResponse(circleId: pair.0, mapId: id, circle: pair.1)
            })])
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func addCircle(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }
            
            guard let optionsObj = call.getObject("options") else {
                throw GoogleMapErrors.invalidArguments("options object is missing")
            }
            
            let options = try CircleOptions(fromJSObject: optionsObj)
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }
            
            let (circleId, addedCircle) = try map.addCircle(options: options)
            call.resolve(formatCircleForResponse(circleId: circleId, mapId: id, circle: addedCircle))
            
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func setCircleCenter(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let circleIdString = call.getString("circleId") else {
                throw GoogleMapErrors.invalidArguments("circleId is invalid or missing")
            }

            guard let circleId = Int(circleIdString) else {
                throw GoogleMapErrors.invalidArguments("circleId is invalid or missing")
            }
                        
            guard let centerObj = call.getObject("center") else {
                throw GoogleMapErrors.invalidArguments("center is invalid or missing")
            }
            
            let center = LatLng(lat: centerObj["lat"] as! Double, lng: centerObj["lng"] as! Double)
                        
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.setCircleCenter(circleId: circleId, center: center)

            call.resolve()

        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func removeCircle(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let circleIdString = call.getString("circleId") else {
                throw GoogleMapErrors.invalidArguments("circleId is invalid or missing")
            }

            guard let circleId = Int(circleIdString) else {
                throw GoogleMapErrors.invalidArguments("circleId is invalid or missing")
            }
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.removeCircle(circleId: circleId)

            call.resolve()

        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func removeCircles(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let circleIdsStrings = call.getArray("circleIds") as? [String] else {
                throw GoogleMapErrors.invalidArguments("circleIds are invalid or missing")
            }

            if circleIdsStrings.isEmpty {
                throw GoogleMapErrors.invalidArguments("circleIds requires at least one cicle id")
            }

            let ids: [Int] = try circleIdsStrings.map { idString in
                guard let circleId = Int(idString) else {
                    throw GoogleMapErrors.invalidArguments("circleIds are invalid or missing")
                }

                return circleId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.removeCircles(ids: ids)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }
    
    // END CIRCLE METHODS
    
    // BEGIN POLYGON METHODS
    
    @objc func addPolygons(_ call: CAPPluginCall) {
        do {
            var pairsIdPolygon: [(Int, Polygon)] = []
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let optionsListObjs = call.getArray("optionsList") as? [JSObject] else {
                throw GoogleMapErrors.invalidArguments("options array is missing")
            }

            if optionsListObjs.isEmpty {
                throw GoogleMapErrors.invalidArguments("options requires at least one option")
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            var optionsList: [PolygonOptions] = []

            try optionsListObjs.forEach { options in
                let opts = try PolygonOptions(fromJSObject: options)
                optionsList.append(opts)
            }

            pairsIdPolygon = try map.addPolygons(optionsList: optionsList)

            call.resolve(["polygons": pairsIdPolygon.map({ pair in
                return formatPolygonForResponse(polygonId: pair.0, mapId: id, polygon: pair.1)
            })])
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func addPolygon(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }
            
            guard let optionsObj = call.getObject("options") else {
                throw GoogleMapErrors.invalidArguments("options object is missing")
            }
            
            let options = try PolygonOptions(fromJSObject: optionsObj)
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }
            
            let (polygonId, addedPolygon) = try map.addPolygon(options: options)
            call.resolve(formatPolygonForResponse(polygonId: polygonId, mapId: id, polygon: addedPolygon))
            
        } catch {
            handleError(call, error: error)
        }
    }
    
    @objc func removePolygon(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let polygonIdString = call.getString("polygonId") else {
                throw GoogleMapErrors.invalidArguments("polygonId is invalid or missing")
            }

            guard let polygonId = Int(polygonIdString) else {
                throw GoogleMapErrors.invalidArguments("polygonId is invalid or missing")
            }
            
            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.removePolygon(polygonId: polygonId)

            call.resolve()

        } catch {
            handleError(call, error: error)
        }
    }

    @objc func removePolygons(_ call: CAPPluginCall) {
        do {
            guard let id = call.getString("id") else {
                throw GoogleMapErrors.invalidMapId
            }

            guard let polygonIdsStrings = call.getArray("polygonIds") as? [String] else {
                throw GoogleMapErrors.invalidArguments("polygonIds are invalid or missing")
            }

            if polygonIdsStrings.isEmpty {
                throw GoogleMapErrors.invalidArguments("polygonIds requires at least one polygon id")
            }

            let ids: [Int] = try polygonIdsStrings.map { idString in
                guard let polygonId = Int(idString) else {
                    throw GoogleMapErrors.invalidArguments("polygonIds are invalid or missing")
                }

                return polygonId
            }

            guard let map = self.maps[id] else {
                throw GoogleMapErrors.mapNotFound
            }

            try map.removePolygons(ids: ids)

            call.resolve()
        } catch {
            handleError(call, error: error)
        }
    }

    
    // END POLYGON METHODS
}

// snippet from https://www.hackingwithswift.com/example-code/uicolor/how-to-convert-a-hex-color-to-a-uicolor
extension UIColor {
    public convenience init?(hex: String) {
        let r, g, b, a: CGFloat

        if hex.hasPrefix("#") {
            let start = hex.index(hex.startIndex, offsetBy: 1)
            let hexColor = String(hex[start...])

            let scanner = Scanner(string: hexColor)
            var hexNumber: UInt64 = 0
            if hexColor.count == 8 {
                if scanner.scanHexInt64(&hexNumber) {
                    r = CGFloat((hexNumber & 0xff000000) >> 24) / 255
                    g = CGFloat((hexNumber & 0x00ff0000) >> 16) / 255
                    b = CGFloat((hexNumber & 0x0000ff00) >> 8) / 255
                    a = CGFloat(hexNumber & 0x000000ff) / 255

                    self.init(red: r, green: g, blue: b, alpha: a)
                    return
                }
            } else {
                if scanner.scanHexInt64(&hexNumber) {
                    r = CGFloat((hexNumber & 0xff0000) >> 16) / 255
                    g = CGFloat((hexNumber & 0x00ff00) >> 8) / 255
                    b = CGFloat((hexNumber & 0x0000ff) >> 0) / 255

                    self.init(red: r, green: g, blue: b, alpha: 1)
                    return
                }
            }
        }

        return nil
    }
}
