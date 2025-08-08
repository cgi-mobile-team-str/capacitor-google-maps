import Foundation
import Capacitor

public struct PolylineOptions {
    var points: [LatLng]
    var visible: Bool?
    var geodesic: Bool?
    var color: String?
    var width: Float?
    var zIndex: Float?
    var clickable: Bool?
    
    init(fromJSObject: JSObject) throws {
        var points: [LatLng] = []
        guard let latLngArray = fromJSObject["points"] as? [JSObject] else {
            throw GoogleMapErrors.invalidArguments("Polyline options object is missing the required 'points' property")
        }
        for obj in latLngArray {
            guard let lat = obj["lat"] as? Double,
                  let lng = obj["lng"] as? Double else {
                throw GoogleMapErrors.invalidArguments("Each point in 'points' must have 'lat' and 'lng'")
            }
            points.append(LatLng(lat: lat, lng: lng))
        }
        self.points = points
        
        self.visible = fromJSObject["visible"] as? Bool ?? true
        self.geodesic = fromJSObject["geodesic"] as? Bool ?? false
        self.color = fromJSObject["color"] as? String ?? ""
        self.width = fromJSObject["width"] as? Float ?? 0
        self.zIndex = fromJSObject["zIndex"] as? Float ?? 0
        self.clickable = fromJSObject["clickable"] as? Bool ?? false

    }
}
    
