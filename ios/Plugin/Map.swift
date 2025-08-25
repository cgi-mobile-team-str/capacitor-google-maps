import Foundation
import GoogleMaps
import Capacitor
import GoogleMapsUtils

public struct LatLng: Codable {
    let lat: Double
    let lng: Double
}

class GMViewController: UIViewController {
    var mapViewBounds: [String: Double]!
    var GMapView: GMSMapView!
    var cameraPosition: [String: Double]!
    var minimumClusterSize: Int?
    var mapId: String?

    private var clusterManager: GMUClusterManager?

    var clusteringEnabled: Bool {
        return clusterManager != nil
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        let camera = GMSCameraPosition.camera(withLatitude: cameraPosition["latitude"] ?? 0, longitude: cameraPosition["longitude"] ?? 0, zoom: Float(cameraPosition["zoom"] ?? 12))
        let frame = CGRect(x: mapViewBounds["x"] ?? 0, y: mapViewBounds["y"] ?? 0, width: mapViewBounds["width"] ?? 0, height: mapViewBounds["height"] ?? 0)
        if let id = mapId {
            let gmsId = GMSMapID(identifier: id)
            self.GMapView = GMSMapView(frame: frame, mapID: gmsId, camera: camera)
        } else {
            self.GMapView = GMSMapView(frame: frame, camera: camera)
        }

        self.view = GMapView
    }

    func initClusterManager(_ minClusterSize: Int?) {
        let iconGenerator = GMUDefaultClusterIconGenerator()
        let algorithm = GMUNonHierarchicalDistanceBasedAlgorithm()
        let renderer = GMUDefaultClusterRenderer(mapView: self.GMapView, clusterIconGenerator: iconGenerator)
        self.minimumClusterSize = minClusterSize
        if let minClusterSize = minClusterSize {
            renderer.minimumClusterSize = UInt(minClusterSize)
        }
        self.clusterManager = GMUClusterManager(map: self.GMapView, algorithm: algorithm, renderer: renderer)
    }

    func destroyClusterManager() {
        self.clusterManager = nil
    }

    func addMarkersToCluster(markers: [GMSMarker]) {
        if let clusterManager = clusterManager {
            clusterManager.add(markers)
            clusterManager.cluster()
        }
    }

    func removeMarkersFromCluster(markers: [GMSMarker]) {
        if let clusterManager = clusterManager {
            markers.forEach { marker in
                clusterManager.remove(marker)
            }
            clusterManager.cluster()
        }
    }
}

// swiftlint:disable type_body_length
public class Map {
    var id: String
    var config: GoogleMapConfig
    var mapViewController: GMViewController
    var targetViewController: UIView?
    var markers = [String: GMSMarker]()
    var polygons = [Int: GMSPolygon]()
    var circles = [Int: GMSCircle]()
    var polylines = [Int: GMSPolyline]()
    var markerIcons = [String: UIImage]()

    // swiftlint:disable identifier_name
    public static let MAP_TAG = 99999
    // swiftlint:enable identifier_name

    // swiftlint:disable weak_delegate
    private var delegate: CapacitorGoogleMapsPlugin

    init(id: String, config: GoogleMapConfig, delegate: CapacitorGoogleMapsPlugin) {
        self.id = id
        self.config = config
        self.delegate = delegate
        self.mapViewController = GMViewController()
        self.mapViewController.mapId = config.mapId

        self.render()
    }

    func render() {
        DispatchQueue.main.async {
            let zoom = self.config.camera?.zoom ?? 11.0
            var center = LatLng(lat: 0, lng: 0)
            let target = self.config.camera?.target
            
            if case .point(let targetPoint) = target {
                center = targetPoint
            }

            if case .points(let targetArray) = target {
                var targets: [CLLocationCoordinate2D] = []
               targetArray.forEach { target in
                   let coordinate: CLLocationCoordinate2D = CLLocationCoordinate2D(latitude: target.lat, longitude: target.lng)
                    targets.append(coordinate)
                }
                let bounds = GoogleMapsUtils.createLatLngBoundsFromLatLngArray(targets)
                let centerBound = GoogleMapsUtils.getCenterFromBound(bounds)
                center = LatLng(lat: centerBound.latitude, lng: centerBound.longitude)
            }
            
            self.mapViewController.mapViewBounds = [
                "width": self.config.width,
                "height": self.config.height,
                "x": self.config.x,
                "y": self.config.y
            ]

            self.mapViewController.cameraPosition = [
                "latitude": center.lat,
                "longitude": center.lng,
                "zoom": Double(zoom)
            ]

            self.targetViewController = self.getTargetContainer(refWidth: self.config.width, refHeight: self.config.height)

            if let target = self.targetViewController {
                target.tag = Map.MAP_TAG
                target.removeAllSubview()
                self.mapViewController.view.frame = target.bounds
                target.addSubview(self.mapViewController.view)
                self.mapViewController.GMapView.delegate = self.delegate
            }

            if let styles = self.config.styles {
                do {
                    self.mapViewController.GMapView.mapStyle = try GMSMapStyle(jsonString: styles)
                } catch {
                    CAPLog.print("Invalid Google Maps styles")
                }
            }
            
            setMapSettings(self.config, mapViewController: self.mapViewController)

            self.delegate.notifyListeners("onMapReady", data: [
                "mapId": self.id
            ])
        }
    }

    func updateRender(mapBounds: CGRect) {
        DispatchQueue.main.sync {
            let newWidth = round(Double(mapBounds.width))
            let newHeight = round(Double(mapBounds.height))
            let isWidthEqual = round(Double(self.mapViewController.view.bounds.width)) == newWidth
            let isHeightEqual = round(Double(self.mapViewController.view.bounds.height)) == newHeight

            if !isWidthEqual || !isHeightEqual {
                CATransaction.begin()
                CATransaction.setDisableActions(true)
                self.mapViewController.view.frame.size.width = newWidth
                self.mapViewController.view.frame.size.height = newHeight
                CATransaction.commit()
            }
        }
    }

    func rebindTargetContainer(mapBounds: CGRect) {
        DispatchQueue.main.sync {
            if let target = self.getTargetContainer(refWidth: round(Double(mapBounds.width)), refHeight: round(Double(mapBounds.height))) {
                self.targetViewController = target
                target.tag = Map.MAP_TAG
                target.removeAllSubview()
                CATransaction.begin()
                CATransaction.setDisableActions(true)
                self.mapViewController.view.frame.size.width = mapBounds.width
                self.mapViewController.view.frame.size.height = mapBounds.height
                CATransaction.commit()
                target.addSubview(self.mapViewController.view)
            }
        }
    }

    private func getTargetContainer(refWidth: Double, refHeight: Double) -> UIView? {
        if let bridge = self.delegate.bridge {
            for item in bridge.webView!.getAllSubViews() {
                let isScrollView = item.isKind(of: NSClassFromString("WKChildScrollView")!) || item.isKind(of: NSClassFromString("WKScrollView")!)
                let isBridgeScrollView = item.isEqual(bridge.webView?.scrollView)

                if isScrollView && !isBridgeScrollView {
                    (item as? UIScrollView)?.isScrollEnabled = true

                    let height = Double((item as? UIScrollView)?.contentSize.height ?? 0)
                    let width = Double((item as? UIScrollView)?.contentSize.width ?? 0)
                    let actualHeight = round(height / 2)

                    let isWidthEqual = width == self.config.width
                    let isHeightEqual = actualHeight == self.config.height

                    if isWidthEqual && isHeightEqual && item.tag < self.targetViewController?.tag ?? Map.MAP_TAG {
                        return item
                    }
                }
            }
        }

        return nil
    }

    func destroy() {
        DispatchQueue.main.async {
            self.mapViewController.GMapView = nil
            self.targetViewController?.tag = 0
            self.mapViewController.view = nil
            self.enableTouch()
        }
    }

    func enableTouch() {
        DispatchQueue.main.async {
            if let target = self.targetViewController, let itemIndex = WKWebView.disabledTargets.firstIndex(of: target) {
                WKWebView.disabledTargets.remove(at: itemIndex)
            }
        }
    }

    func disableTouch() {
        DispatchQueue.main.async {
            if let target = self.targetViewController, !WKWebView.disabledTargets.contains(target) {
                WKWebView.disabledTargets.append(target)
            }
        }
    }

    func enableClustering(_ minClusterSize: Int?) {
        if !self.mapViewController.clusteringEnabled {
            DispatchQueue.main.sync {
                self.mapViewController.initClusterManager(minClusterSize)

                // add existing markers to the cluster
                if !self.markers.isEmpty {
                    var existingMarkers: [GMSMarker] = []
                    for (_, marker) in self.markers {
                        marker.map = nil
                        existingMarkers.append(marker)
                    }

                    self.mapViewController.addMarkersToCluster(markers: existingMarkers)
                }
            }
        } else if self.mapViewController.minimumClusterSize != minClusterSize {
            self.mapViewController.destroyClusterManager()
            enableClustering(minClusterSize)
        }
    }

    func disableClustering() {
        DispatchQueue.main.sync {
            self.mapViewController.destroyClusterManager()

            // add existing markers back to the map
            if !self.markers.isEmpty {
                for (_, marker) in self.markers {
                    marker.map = self.mapViewController.GMapView
                }
            }
        }
    }

    func animateCamera(config: GoogleMapCameraConfig) throws {
        DispatchQueue.main.sync {
          CATransaction.begin()
          CATransaction.setValue(NSNumber(value: config.duration ?? 1.0), forKey: kCATransactionAnimationDuration)
          let newCamera = setupCameraPosition(config: config)
          CATransaction.setCompletionBlock({
            self.mapViewController.GMapView.animate(to: newCamera)
          })
          CATransaction.commit()
        }
    }
    
    func moveCamera(config: GoogleMapCameraConfig) throws {
        DispatchQueue.main.sync {
            let newCamera = setupCameraPosition(config: config)
            self.mapViewController.GMapView.camera = newCamera        }

    }
    
    func getCameraZoom() -> Float {
        return self.mapViewController.GMapView.camera.zoom
    }
    
    func getCameraTarget() -> LatLng {
        return LatLng(lat:self.mapViewController.GMapView.camera.target.latitude, lng:self.mapViewController.GMapView.camera.target.longitude )
    }

    func getMapType() -> GMSMapViewType {
        return self.mapViewController.GMapView.mapType
    }

    func setCameraBearing(bearing: Double) throws {
        let currentCamera = self.mapViewController.GMapView.camera

        let lat = currentCamera.target.latitude
        let lng = currentCamera.target.longitude
        let zoom = currentCamera.zoom
        let angle = currentCamera.viewingAngle

        let newCamera = GMSCameraPosition(latitude: lat, longitude: lng, zoom: zoom, bearing: bearing, viewingAngle: angle)
        
        DispatchQueue.main.sync {
            self.mapViewController.GMapView.animate(to: newCamera)
        }
    }
    
    func setCameraTarget(target: Any) throws {
        let currentCamera = self.mapViewController.GMapView.camera
        
        DispatchQueue.main.sync {
            if let singleTarget = target as? CLLocationCoordinate2D {
                let cameraTarget = singleTarget
                let updatedPosition = GMSCameraPosition.camera(
                    withTarget: cameraTarget,
                    zoom: currentCamera.zoom
                )
                self.mapViewController.GMapView.animate(to: updatedPosition)
            }
            if let targetArray = target as? [CLLocationCoordinate2D] {
                let bounds = GoogleMapsUtils.createLatLngBoundsFromLatLngArray(targetArray)
                let center: CLLocationCoordinate2D = GoogleMapsUtils.getCenterFromBound(bounds)
                let coordinate: CLLocationCoordinate2D = CLLocationCoordinate2D(latitude:  center.latitude, longitude: center.longitude)
                let updatedPosition = GMSCameraPosition.camera(
                    withTarget: coordinate,
                    zoom: currentCamera.zoom
                )
                self.mapViewController.GMapView.animate(to: updatedPosition)
            }
        }
    }
    
    func setMapType(mapType: GMSMapViewType) throws {
        DispatchQueue.main.sync {
            self.mapViewController.GMapView.mapType = mapType
        }
    }
    
    func setOptions(config: GoogleMapsOptions) throws {
        
        DispatchQueue.main.sync {
            if let mapType = config.mapType {
                self.mapViewController.GMapView.mapType = mapType
            }
            
            if let styles = config.styles {
                self.mapViewController.GMapView.mapStyle = styles
            }
            
            if let camera = config.camera {
                let newCamera = setupCameraPosition(config: camera)
                self.mapViewController.GMapView.animate(to: newCamera )
            }
            
            setMapSettings(config, mapViewController: self.mapViewController)
        }
    }

    func enableIndoorMaps(enabled: Bool) throws {
        DispatchQueue.main.sync {
            self.mapViewController.GMapView.isIndoorEnabled = enabled
        }
    }

    func enableTrafficLayer(enabled: Bool) throws {
        DispatchQueue.main.sync {
            self.mapViewController.GMapView.isTrafficEnabled = enabled
        }
    }

    func enableAccessibilityElements(enabled: Bool) throws {
        DispatchQueue.main.sync {
            self.mapViewController.GMapView.accessibilityElementsHidden = enabled
        }
    }

    func enableCurrentLocation(enabled: Bool) throws {
        DispatchQueue.main.sync {
            self.mapViewController.GMapView.isMyLocationEnabled = enabled
        }
    }

    func setPadding(padding: GoogleMapPadding) throws {
        DispatchQueue.main.sync {
            let mapInsets = UIEdgeInsets(top: CGFloat(padding.top ?? 0), left: CGFloat(padding.left ?? 0), bottom: CGFloat(padding.bottom ?? 0), right: CGFloat(padding.right ?? 0))
            self.mapViewController.GMapView.padding = mapInsets
        }
    }

    func removeMarkers(ids: [String]) throws {
        DispatchQueue.main.sync {
            var markers: [GMSMarker] = []
            ids.forEach { id in
                if let marker = self.markers[id] {
                    marker.map = nil
                    self.markers.removeValue(forKey: id)
                    markers.append(marker)
                }
            }

            if self.mapViewController.clusteringEnabled {
                self.mapViewController.removeMarkersFromCluster(markers: markers)
            }
        }
    }

    func getMapLatLngBounds() -> GMSCoordinateBounds? {
        return GMSCoordinateBounds(region: self.mapViewController.GMapView.projection.visibleRegion())
    }

    func fitBounds(bounds: GMSCoordinateBounds, padding: CGFloat) {
        DispatchQueue.main.sync {
            let cameraUpdate = GMSCameraUpdate.fit(bounds, withPadding: padding)
            self.mapViewController.GMapView.animate(with: cameraUpdate)
        }
    }
    
    func getVisibleRegion() -> GMSVisibleRegion? {
        return self.mapViewController.GMapView.projection.visibleRegion()
    }
    
    func enableCompass(enabled: Bool) throws {
        DispatchQueue.main.sync {
            self.mapViewController.GMapView.settings.compassButton = enabled
        }
    }
    
    func enableMyLocation(isEnabled: Bool) throws {
        DispatchQueue.main.sync {
            self.mapViewController.GMapView.isMyLocationEnabled = isEnabled
        }
    }
    
    func enableTiltGesture(isEnabled: Bool) throws {
        DispatchQueue.main.sync {
            self.mapViewController.GMapView.settings.tiltGestures = isEnabled
        }
    }
    
    func enableTiltRotateGesture(isEnabled: Bool) throws {
        DispatchQueue.main.sync {
            self.mapViewController.GMapView.settings.rotateGestures = isEnabled
        }
    }
    
    func setMapPreferences(padding: GoogleMapPadding?, building: Bool?) throws {
        DispatchQueue.main.sync {
                let mapInsets = UIEdgeInsets(top: CGFloat(padding?.top ?? 0), left: CGFloat(padding?.left  ?? 0), bottom: CGFloat(padding?.bottom  ?? 0), right: CGFloat(padding?.right  ?? 0))
                self.mapViewController.GMapView.padding = mapInsets
                self.mapViewController.GMapView.isBuildingsEnabled = building ?? false
            
        }
    }
    
    // BEGIN MARKER METHODS
    
    func addMarker(options: MarkerOptions) throws -> (String, Marker) {
        var markerHash = ""
        let marker = Marker(options: options)

        DispatchQueue.main.sync {
            let newMarker = self.buildMarker(marker: marker)
            let idToUse = marker.id ?? String(newMarker.hash.hashValue)
            
            if self.mapViewController.clusteringEnabled {
                self.mapViewController.addMarkersToCluster(markers: [newMarker])
            } else {
                newMarker.map = self.mapViewController.GMapView
            }

            self.markers[idToUse] = newMarker
            
            markerHash = idToUse
        }

        return (markerHash, addedMarker: marker)
    }

    func addMarkers(optionsList: [MarkerOptions]) throws -> [(String, Marker)] {
        var pairsIdMarker: [(String, Marker)] = []

        DispatchQueue.main.sync {
            var googleMapsMarkers: [GMSMarker] = []
            var markers: [Marker] = []
            optionsList.forEach{ options in
                let marker = Marker(options: options)
                markers.append(marker)
            }
            
            markers.forEach { marker in
                let newMarker = self.buildMarker(marker: marker)
                let idToUse = marker.id ?? String(newMarker.hash.hashValue)

                if self.mapViewController.clusteringEnabled {
                    googleMapsMarkers.append(newMarker)
                } else {
                    newMarker.map = self.mapViewController.GMapView
                }

                self.markers[idToUse] = newMarker

                pairsIdMarker.append((idToUse, addedMarker:  marker))
            }

            if self.mapViewController.clusteringEnabled {
                self.mapViewController.addMarkersToCluster(markers: googleMapsMarkers)
            }
        }

        return pairsIdMarker
    }
    
    func setMarkerIcon(markerId: String?, url: String?, size: CGSize?) throws {
        guard let markerIndex = markerId, let marker = self.markers[markerIndex] else {
            throw GoogleMapErrors.markerNotFound
        }
        
        DispatchQueue.main.async {
            if let iconUrl = url {
                if iconUrl.starts(with: "https:") {
                    if let url = URL(string: iconUrl) {
                        URLSession.shared.dataTask(with: url) { (data, _, _) in
                            DispatchQueue.main.async {
                                if let data = data, let iconImage = UIImage(data: data) {
                                    self.markerIcons[iconUrl] = iconImage
                                    if let iconSize = size {
                                        marker.icon = iconImage.resizeImageTo(size: iconSize)
                                    } else {
                                        marker.icon = iconImage
                                    }
                                }
                            }
                        }.resume()
                    }
                } else if iconUrl.starts(with: "data:image") {
                    if let commaIndex = iconUrl.firstIndex(of: ",") {
                        let base64String = String(iconUrl.suffix(from: iconUrl.index(after: commaIndex)))
                        if let imageData = Data(base64Encoded: base64String),
                           let iconImage = UIImage(data: imageData) {
                            self.markerIcons[iconUrl] = iconImage
                            if let iconSize = size {
                                marker.icon = iconImage.resizeImageTo(size: iconSize)
                            } else {
                                marker.icon = iconImage
                            }
                        } else {
                            print("CapacitorGoogleMaps Warning: Invalid base64 image data for '\(iconUrl)'. Using default marker icon.")
                        }
                    }
                } else if let iconImage = UIImage(named: "public/\(iconUrl)") {
                    self.markerIcons[iconUrl] = iconImage
                    if let iconSize = size {
                        marker.icon = iconImage.resizeImageTo(size: iconSize)
                    } else {
                        marker.icon = iconImage
                    }
                } else {
                    var detailedMessage = ""
                    if iconUrl.hasSuffix(".svg") {
                        detailedMessage = "SVG not supported."
                    }
                    print("CapacitorGoogleMaps Warning: could not load image '\(iconUrl)'. \(detailedMessage)  Using default marker icon.")
                }
            }
        }
    }

    func setMarkerIconAnchor(markerId: String, x: Double, y: Double) throws {
        guard let marker = self.markers[markerId] else {
            throw GoogleMapErrors.markerNotFound
        }
        
        DispatchQueue.main.sync {
            if let size = marker.icon?.size {
                let anchorX = (x / size.width)
                let anchorY = (y / size.height)
                marker.groundAnchor = CGPoint(x: anchorX, y: anchorY)
            }
        }
    }
    
    func setMarkerZIndex(markerId: String, zIndex: Int32) throws {
        guard let marker = self.markers[markerId] else {
            throw GoogleMapErrors.markerNotFound
        }
        
        DispatchQueue.main.sync {
            marker.zIndex = zIndex
        }
    }
    
    func setMarkerVisibility(markerId: String, isVisible: Bool) throws {
        guard let marker = self.markers[markerId] else {
            throw GoogleMapErrors.markerNotFound
        }
        
        DispatchQueue.main.sync {
            marker.map = isVisible ? marker.map : nil
        }
    }
    
    func getMarkerPosition(markerId: String) throws -> LatLng {
        guard let marker = self.markers[markerId] else {
            throw GoogleMapErrors.markerNotFound
        }
        return LatLng(lat: marker.position.latitude, lng: marker.position.longitude)
    }
    
    func removeMarker(id: String) throws {
        if let marker = self.markers[id] {
            DispatchQueue.main.async {
                if self.mapViewController.clusteringEnabled {
                    self.mapViewController.removeMarkersFromCluster(markers: [marker])
                }

                marker.map = nil
                self.markers.removeValue(forKey: id)

            }
        } else {
            throw GoogleMapErrors.markerNotFound
        }
    }
    
    func isMarkerRemoved(markerId: String) -> Bool {
        return self.markers[markerId] == nil
    }
    
    private func resizeImage(image: UIImage, targetSize: CGSize) -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: targetSize)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: targetSize))
        }
    }
    
    // END MARKER METHODS
    
    // BEGIN POLYLINE METHODS
    
    func addPolylines(optionsList: [PolylineOptions]) throws -> [(Int, Polyline)] {
        var pairsIdPolyline: [(Int, Polyline)] = []
        var lines: [Polyline] = []
       try optionsList.forEach{ options in
            let line =  try Polyline(options: options)
            lines.append(line)
        }
        DispatchQueue.main.sync {
            lines.forEach { line in
                let newLine = self.buildPolyline(line: line)
                newLine.map = self.mapViewController.GMapView

                self.polylines[newLine.hash.hashValue] = newLine

                pairsIdPolyline.append((newLine.hash.hashValue, addedPolyline: line))
            }
        }

        return pairsIdPolyline
    }
    
    func addPolyline(options: PolylineOptions) throws -> (Int, Polyline) {
        var polylineHash:Int = 0
        var newLine: GMSPolyline = GMSPolyline()
        let line = try Polyline(options: options)
        
        DispatchQueue.main.sync {
            newLine = self.buildPolyline(line: line)
            newLine.map = self.mapViewController.GMapView

            self.polylines[newLine.hash.hashValue] = newLine
            polylineHash = newLine.hash.hashValue
        }

        return (polylineHash, line)
    }
    
    func setPolylineStrokeColor(polylineId: Int, strokeColor: String) throws {
        guard let line = self.polylines[polylineId] else {
            throw GoogleMapErrors.polylineNotFound
        }
        
        DispatchQueue.main.sync {
            if let color = GoogleMapsUtils.parseToUIColor(strokeColor) {
                line.strokeColor = color
            }
        }
    }
    
    func setPolylineZIndex(polylineId: Int, zIndex: Float) throws {
        guard let line = self.polylines[polylineId] else {
            throw GoogleMapErrors.polylineNotFound
        }
        
        DispatchQueue.main.sync {
            line.zIndex = Int32(zIndex)
        }
    }
    
    func setPolylineStrokeWidth(polylineId: Int, strokeWidth: Float) throws {
        guard let line = self.polylines[polylineId] else {
            throw GoogleMapErrors.polylineNotFound
        }
        
        DispatchQueue.main.sync {
            line.strokeWidth = CGFloat(strokeWidth)
        }
    }
    
    func removePolyline(polylineId: Int) throws {
        if let polyline = self.polylines[polylineId] {
            DispatchQueue.main.async {
                polyline.map = nil
                self.polylines.removeValue(forKey: polylineId)
            }
        } else {
            throw GoogleMapErrors.polylineNotFound
        }
    }
    
    func removePolylines(ids: [Int]) throws {
        DispatchQueue.main.sync {
            ids.forEach { id in
                if let line = self.polylines[id] {
                    line.map = nil
                    self.polylines.removeValue(forKey: id)
                }
            }
        }
    }
    
    func isPolylineRemoved(polylineId: Int) -> Bool {
        return self.polylines[polylineId] == nil
    }
    
    // END POLYLINE METHODS
    
    // BEGIN CIRCLE METHODS
    
    func addCircles(optionsList: [CircleOptions]) throws -> [(Int, Circle)] {
        var pairsIdCircle: [(Int, Circle)] = []
        var circles: [Circle] = []
        try optionsList.forEach{ options in
             let circle =  try Circle(options: options)
            circles.append(circle)
         }
        DispatchQueue.main.sync {
            circles.forEach { circle in
                let newCircle = self.buildCircle(circle: circle)
                newCircle.map = self.mapViewController.GMapView

                self.circles[newCircle.hash.hashValue] = newCircle

                pairsIdCircle.append((newCircle.hash.hashValue, addedCircle: circle))
            }
        }

        return pairsIdCircle
    }
    
    func addCircle(options: CircleOptions) throws -> (Int, Circle) {
        var circleHash:Int = 0
        var newCircle: GMSCircle = GMSCircle()
        let circle = try Circle(options: options)
        
        DispatchQueue.main.sync {
            newCircle = self.buildCircle(circle: circle)
            newCircle.map = self.mapViewController.GMapView

            self.circles[newCircle.hash.hashValue] = newCircle
            circleHash = newCircle.hash.hashValue
        }

        return (circleHash, circle)
    }
    
    func setCircleCenter(circleId: Int, center: LatLng) throws {
        guard let circle = self.circles[circleId] else {
            throw GoogleMapErrors.circleNotFound
        }
        
        DispatchQueue.main.sync {
            circle.position = CLLocationCoordinate2D(latitude: center.lat, longitude: center.lng)
        }
    }
    
    func removeCircles(ids: [Int]) throws {
        DispatchQueue.main.sync {
            ids.forEach { id in
                if let circle = self.circles[id] {
                    circle.map = nil
                    self.circles.removeValue(forKey: id)
                }
            }
        }
    }
    
    func removeCircle(circleId: Int) throws {
        if let circle = self.circles[circleId] {
            DispatchQueue.main.async {
                circle.map = nil
                self.circles.removeValue(forKey: circleId)
            }
        } else {
            throw GoogleMapErrors.circleNotFound
        }
    }
    
    // END CIRCLE METHODS
    
    // BEGIN POLYGON METHODS
    
    func addPolygons(optionsList: [PolygonOptions]) throws -> [(Int, Polygon)] {
        var pairsIdPolygon: [(Int, Polygon)] = []
        var polygons: [Polygon] = []
        try optionsList.forEach{ options in
             let polygon =  try Polygon(options: options)
            polygons.append(polygon)
         }
        DispatchQueue.main.sync {
            polygons.forEach { polygon in
                let newPolygon = self.buildPolygon(polygon: polygon)
                newPolygon.map = self.mapViewController.GMapView

                self.polygons[newPolygon.hash.hashValue] = newPolygon

                pairsIdPolygon.append((newPolygon.hash.hashValue, addedPolygon: polygon))
            }
        }

        return pairsIdPolygon
    }
    
    func addPolygon(options: PolygonOptions) throws -> (Int, Polygon) {
        var polygonHash:Int = 0
        var newPolygon: GMSPolygon = GMSPolygon()
        let polygon = try Polygon(options: options)
        
        DispatchQueue.main.sync {
            newPolygon = self.buildPolygon(polygon:polygon)
            newPolygon.map = self.mapViewController.GMapView

            self.polygons[newPolygon.hash.hashValue] = newPolygon
            polygonHash = newPolygon.hash.hashValue
        }

        return (polygonHash, polygon)
    }
    
    func removePolygon(polygonId: Int) throws {
        if let polygon = self.polygons[polygonId] {
            DispatchQueue.main.async {
                polygon.map = nil
                self.polygons.removeValue(forKey: polygonId)
            }
        } else {
            throw GoogleMapErrors.polygonNotFound
        }
    }
    
    func removePolygons(ids: [Int]) throws {
        DispatchQueue.main.sync {
            ids.forEach { id in
                if let polygon = self.polygons[id] {
                    polygon.map = nil
                    self.polygons.removeValue(forKey: id)
                }
            }
        }
    }
    
    // END POLYGON METHODS

    func fromPointToLatLng(points: [Double]) throws -> LatLng {
        guard points.count == 2 else {
            throw GoogleMapErrors.invalidArguments("Expected exactly 2 elements: [x, y]")
        }
        
        let pointX = CGFloat(points[0])
        let pointY = CGFloat(points[1])
        
        let cgPoint = CGPoint(x: pointX, y: pointY)
        let cllocation = self.mapViewController.GMapView.projection.coordinate(for: cgPoint)
        return LatLng(lat: cllocation.latitude, lng: cllocation.longitude)
    }
    
    private func setupCameraPosition(config: GoogleMapCameraConfig) -> GMSCameraPosition {
        let currentCamera = self.mapViewController.GMapView.camera
        var lat: Double = currentCamera.target.latitude
        var lng: Double = currentCamera.target.longitude
        if case .point(let targetPoint) = config.target {
            lat = targetPoint.lat
            lng = targetPoint.lng
        }

        if case .points(let targetArray) = config.target {
            var locationCoordinates: [CLLocationCoordinate2D] = []
            for coordinate in targetArray{
                locationCoordinates.append(CLLocationCoordinate2D.init(latitude: coordinate.lat, longitude: coordinate.lng))
            }
            let latlngBounds = GoogleMapsUtils.createLatLngBoundsFromLatLngArray(locationCoordinates)
            let center = GoogleMapsUtils.getCenterFromBound(latlngBounds)
            lat = center.latitude
            lng = center.longitude
        }
        
        if case .none = config.target {
            lat = currentCamera.target.latitude
            lng = currentCamera.target.longitude
        }
        
        let zoom = config.zoom ?? currentCamera.zoom
        let bearing = config.bearing ?? Double(currentCamera.bearing)
        let angle = config.angle ?? currentCamera.viewingAngle
        
        let newCamera = GMSCameraPosition(latitude: lat, longitude: lng, zoom: zoom, bearing: bearing, viewingAngle: angle)
        return newCamera
    }
    
    private func getFrameOverflowBounds(frame: CGRect, mapBounds: CGRect) -> [CGRect] {
        var intersections: [CGRect] = []

        // get top overflow
        if mapBounds.origin.y < frame.origin.y {
            let height = frame.origin.y - mapBounds.origin.y
            let width = mapBounds.width
            intersections.append(CGRect(x: 0, y: 0, width: width, height: height))
        }

        // get bottom overflow
        if (mapBounds.origin.y + mapBounds.height) > (frame.origin.y + frame.height) {
            let height = (mapBounds.origin.y + mapBounds.height) - (frame.origin.y + frame.height)
            let width = mapBounds.width
            intersections.append(CGRect(x: 0, y: mapBounds.height, width: width, height: height))
        }

        return intersections
    }

    private func buildCircle(circle: Circle) -> GMSCircle {
        let newCircle = GMSCircle()
        newCircle.title = circle.title
        newCircle.strokeColor = circle.strokeColor
        newCircle.strokeWidth = circle.strokeWidth
        newCircle.fillColor = circle.fillColor
        newCircle.position = CLLocationCoordinate2D(latitude: circle.center.lat, longitude: circle.center.lng)
        newCircle.radius = CLLocationDistance(circle.radius)
        newCircle.isTappable = circle.tappable ?? false
        newCircle.zIndex = circle.zIndex
        if(circle.visible != nil){
            newCircle.map = circle.visible! ? newCircle.map : nil
        }
        newCircle.userData = circle.tag

        return newCircle
    }

    private func buildPolygon(polygon: Polygon) -> GMSPolygon {
        let newPolygon = GMSPolygon()
        newPolygon.title = polygon.title
        newPolygon.strokeColor = polygon.strokeColor
        newPolygon.strokeWidth = polygon.strokeWidth
        newPolygon.fillColor = polygon.fillColor
        newPolygon.isTappable = polygon.tappable ?? false
        newPolygon.geodesic = polygon.geodesic ?? false
        newPolygon.zIndex = polygon.zIndex
        newPolygon.userData = polygon.tag

        var shapeIndex = 0
        let outerShape = GMSMutablePath()
        var holes: [GMSMutablePath] = []

        polygon.shapes.forEach { shape in
            if shapeIndex == 0 {
                shape.forEach { coord in
                    outerShape.add(CLLocationCoordinate2D(latitude: coord.lat, longitude: coord.lng))
                }
            } else {
                let holeShape = GMSMutablePath()
                shape.forEach { coord in
                    holeShape.add(CLLocationCoordinate2D(latitude: coord.lat, longitude: coord.lng))
                }

                holes.append(holeShape)
            }

            shapeIndex += 1
        }

        newPolygon.path = outerShape
        newPolygon.holes = holes

        return newPolygon
    }

    private func buildPolyline(line: Polyline) -> GMSPolyline {
        let newPolyline = GMSPolyline()
        newPolyline.title = line.title
        newPolyline.strokeColor = line.strokeColor
        newPolyline.strokeWidth = line.strokeWidth
        newPolyline.isTappable = line.tappable ?? false
        newPolyline.geodesic = line.geodesic ?? false
        newPolyline.zIndex = line.zIndex
        newPolyline.userData = line.tag

        let path = GMSMutablePath()
        line.path.forEach { coord in
            path.add(CLLocationCoordinate2D(latitude: coord.lat, longitude: coord.lng))
        }

        newPolyline.path = path

        if line.styleSpans.count > 0 {
            var spans: [GMSStyleSpan] = []

            line.styleSpans.forEach { span in
                if let segments = span.segments {
                    spans.append(GMSStyleSpan(color: span.color, segments: segments))
                } else {
                    spans.append(GMSStyleSpan(color: span.color))
                }
            }

            newPolyline.spans = spans
        }

        return newPolyline
    }

    private func buildMarker(marker: Marker) -> GMSMarker {
        let newMarker = GMSMarker()
        newMarker.position = CLLocationCoordinate2D(latitude: marker.coordinate.lat, longitude: marker.coordinate.lng)
        newMarker.title = marker.title
        newMarker.snippet = marker.snippet
        newMarker.isFlat = marker.isFlat ?? false
        newMarker.opacity = marker.opacity ?? 1
        newMarker.isDraggable = marker.draggable ?? false
        newMarker.zIndex = marker.zIndex
        newMarker.map = marker.isVisible != false ? newMarker.map : nil
        //use userdata as marker Id
        newMarker.userData = marker.id
        
        if let iconAnchor = marker.iconAnchor {
            newMarker.groundAnchor = iconAnchor
        }

        if let iconUrl = marker.iconUrl {
            if let iconImage = self.markerIcons[iconUrl] {
                newMarker.icon = getResizedIcon(iconImage, marker)
            } else {
                if iconUrl.starts(with: "https:") {
                    if let url = URL(string: iconUrl) {
                        URLSession.shared.dataTask(with: url) { (data, _, _) in
                            DispatchQueue.main.async {
                                if let data = data, let iconImage = UIImage(data: data) {
                                    self.markerIcons[iconUrl] = iconImage
                                    newMarker.icon = getResizedIcon(iconImage, marker)
                                }
                            }
                        }.resume()
                    }
                } else if iconUrl.starts(with: "data:image") {
                    if let commaIndex = iconUrl.firstIndex(of: ",") {
                        let base64String = String(iconUrl.suffix(from: iconUrl.index(after: commaIndex)))
                        if let imageData = Data(base64Encoded: base64String),
                           let iconImage = UIImage(data: imageData) {
                            self.markerIcons[iconUrl] = iconImage
                            newMarker.icon = getResizedIcon(iconImage, marker)
                        } else {
                            print("CapacitorGoogleMaps Warning: Invalid base64 image data for '\(iconUrl)'. Using default marker icon.")
                        }
                    }
                } else if let iconImage = UIImage(named: "public/\(iconUrl)") {
                    self.markerIcons[iconUrl] = iconImage
                    newMarker.icon = getResizedIcon(iconImage, marker)
                } else {
                    var detailedMessage = ""
                    if iconUrl.hasSuffix(".svg") {
                        detailedMessage = "SVG not supported."
                    }
                    print("CapacitorGoogleMaps Warning: could not load image '\(iconUrl)'. \(detailedMessage)  Using default marker icon.")
                }
            }
        } else {
            if let color = marker.color {
                newMarker.icon = GMSMarker.markerImage(with: color)
            }
        }
        return newMarker
    }
}

private func setMapSettings(_ config: GoogleMapSettings, mapViewController : GMViewController) {
    if let controls = config.controls {
        if let compass = controls.compass {
            mapViewController.GMapView.settings.compassButton = compass
        }
        if let myLocationButton = controls.myLocationButton {
            mapViewController.GMapView.settings.myLocationButton = myLocationButton
        }
        if let myLocation = controls.myLocation {
            mapViewController.GMapView.isMyLocationEnabled = myLocation
        }
        if let indoorPicker = controls.indoorPicker {
            mapViewController.GMapView.settings.indoorPicker = indoorPicker
        }
    }
    
    if let gestures = config.gestures {
        if let scroll = gestures.scroll {
            mapViewController.GMapView.settings.scrollGestures = scroll
        }
        if let zoom = gestures.zoom {
            mapViewController.GMapView.settings.zoomGestures = zoom
        }
        if let rotate = gestures.rotate {
            mapViewController.GMapView.settings.rotateGestures = rotate
        }
        if let tilt = gestures.tilt {
            mapViewController.GMapView.settings.tiltGestures = tilt
        }
    }
    
    if let preferences = config.preferences {
        if let building = preferences.building {
            mapViewController.GMapView.isBuildingsEnabled = building
        }
        if let zoom = preferences.zoom {
            if let minZoom = zoom.minZoom, let maxZoom = zoom.maxZoom {
                mapViewController.GMapView.setMinZoom(minZoom, maxZoom: maxZoom)
            }
        }
        if let padding = preferences.padding {
            let mapInsets = UIEdgeInsets(top: CGFloat(padding.top ?? 0), left: CGFloat(padding.left ?? 0), bottom: CGFloat(padding.bottom ?? 0), right: CGFloat(padding.right ?? 0))
            mapViewController.GMapView.padding = mapInsets
        }
        if let gestureBounds = preferences.gestureBounds {
            var locationCoordinates: [CLLocationCoordinate2D] = []
            for gestureBound in gestureBounds {
                locationCoordinates.append(CLLocationCoordinate2D.init(latitude: gestureBound.lat, longitude: gestureBound.lng))
            }
            let latlngBounds = GoogleMapsUtils.createLatLngBoundsFromLatLngArray(locationCoordinates)
            mapViewController.GMapView.cameraTargetBounds = latlngBounds
        }
    }
}

private func getResizedIcon(_ iconImage: UIImage, _ marker: Marker) -> UIImage? {
    if let iconSize = marker.iconSize {
        return iconImage.resizeImageTo(size: iconSize)
    } else {
        return iconImage
    }
}

extension WKWebView {
    static var disabledTargets: [UIView] = []

    override open func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        var hitView = super.hitTest(point, with: event)

        if let tempHitView = hitView, WKWebView.disabledTargets.contains(tempHitView) {
            return nil
        }

        if let typeClass = NSClassFromString("WKChildScrollView"), let tempHitView = hitView, tempHitView.isKind(of: typeClass) {
            for item in tempHitView.subviews.reversed() {
                let convertPoint = item.convert(point, from: self)
                if let hitTestView = item.hitTest(convertPoint, with: event) {
                    hitView = hitTestView
                    break
                }
            }
        }

        return hitView
    }
}

extension UIView {
    private static var allSubviews: [UIView] = []

    private func viewArray(root: UIView) -> [UIView] {
        var index = root.tag
        for view in root.subviews {
            if view.tag == Map.MAP_TAG {
                // view already in use as in map
                continue
            }

            // tag the index depth of the uiview
            view.tag = index

            if view.isKind(of: UIView.self) {
                UIView.allSubviews.append(view)
            }
            _ = viewArray(root: view)

            index += 1
        }
        return UIView.allSubviews
    }

    fileprivate func getAllSubViews() -> [UIView] {
        UIView.allSubviews = []
        return viewArray(root: self).reversed()
    }

    fileprivate func removeAllSubview() {
        subviews.forEach {
            $0.removeFromSuperview()
        }
    }
}

extension UIImage {
    func resizeImageTo(size: CGSize) -> UIImage? {
        UIGraphicsBeginImageContextWithOptions(size, false, 0.0)
        self.draw(in: CGRect(origin: CGPoint.zero, size: size))
        let resizedImage = UIGraphicsGetImageFromCurrentImageContext()!
        UIGraphicsEndImageContext()
        return resizedImage
    }
}
