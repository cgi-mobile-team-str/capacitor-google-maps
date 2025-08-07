import Foundation
import Capacitor

public struct MarkerOptions {
    
    let icon: MarkerIcon?
    let title: String?
    let snippet: String?
    let position: LatLng
    let infoWindowAnchor: [Float]?
    let anchor: [Float]?
    let draggable: Bool?
    let flat: Bool?
    let rotation: Float?
    let visible: Bool?
    let animation: String?
    let zIndex: Float?
    let disableAutoPan: Bool?
    let alpha: Float?
    
    init(fromJSObject: JSObject) throws {
        var icon: MarkerIcon?
        var infoWindowAnchor: [Float] = []
        var anchor: [Float] = []

        if let iconObj = fromJSObject["icon"] as? JSObject {
            icon = try MarkerIcon(fromJSObject: iconObj)
        }
        
        guard let latLngObj = fromJSObject["position"] as? JSObject else {
            throw GoogleMapErrors.invalidArguments("Marker object is missing the required 'coordinate' property")
        }

        guard let lat = latLngObj["lat"] as? Double, let lng = latLngObj["lng"] as? Double else {
            throw GoogleMapErrors.invalidArguments("LatLng object is missing the required 'lat' and/or 'lng' property")
        }
        
        if let infoWindowAnchorJSArray = fromJSObject["infoWindowAnchor"] as? JSArray {
            infoWindowAnchorJSArray.forEach { obj in
                if let jsInfoWindowAnchor = obj as? Float {
                    infoWindowAnchor.append(jsInfoWindowAnchor)
                }
            }
        }
        
        if let anchorJSArray = fromJSObject["anchor"] as? JSArray {
             anchorJSArray.forEach { obj in
                if let jsAnchor = obj as? Float {
                    anchor.append(jsAnchor)
                }
            }
        }
        
        self.icon = icon
        self.position = LatLng(lat: lat, lng: lng)
        self.infoWindowAnchor = infoWindowAnchor.count > 0 ? infoWindowAnchor : nil
        self.anchor = anchor.count > 0 ? anchor : nil
        self.title = fromJSObject["title"] as? String
        self.snippet = fromJSObject["snippet"] as? String
        self.draggable = fromJSObject["draggable"] as? Bool ?? false
        self.flat = fromJSObject["flat"] as? Bool ?? false
        self.rotation = fromJSObject["rotation"] as? Float ?? 0
        self.visible = fromJSObject["visible"] as? Bool ?? true
        self.animation = fromJSObject["animation"] as? String
        self.zIndex = fromJSObject["snippet"] as? Float
        self.disableAutoPan = fromJSObject["disableAutoPan"] as? Bool
        self.alpha = fromJSObject["alpha"] as? Float ?? 1
    }
}
