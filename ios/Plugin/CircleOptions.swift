import Foundation
import Capacitor

public struct CircleOptions {
    var center: LatLng
    var radius: Double
    var visible: Bool?
    var strokeColor: String?
    var fillColor: String?
    var strokeWidth: Float?
    var zIndex: Float?
    var clickable: Bool?

    init(fromJSObject: JSObject) throws {
        var center: LatLng = LatLng(lat: 0, lng: 0)
        
        guard let latLngObj = fromJSObject["center"] as? JSObject else {
            throw GoogleMapErrors.invalidArguments("Circle options object is missing the required 'center' property")
        }
        guard let lat = latLngObj["lat"] as? Double,
              let lng = latLngObj["lng"] as? Double else {
            throw GoogleMapErrors.invalidArguments("center must have 'lat' and 'lng'")
        }
        center = LatLng(lat: lat, lng: lng)
        self.center = center
        
        guard let radius = fromJSObject["radius"] as? Double  else {
            throw GoogleMapErrors.invalidArguments("Circle options object is missing the required 'radius' property")
        }
        
        self.radius = radius
        self.visible = fromJSObject["visible"] as? Bool ?? true
        self.strokeColor = fromJSObject["strokeColor"] as? String ?? ""
        self.fillColor = fromJSObject["fillColor"] as? String ?? ""
        self.strokeWidth = fromJSObject["strokeWidth"] as? Float ?? 0
        self.zIndex = fromJSObject["zIndex"] as? Float ?? 0
    }
}
