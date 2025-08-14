import Foundation
import Capacitor

public struct GoogleMapsPreferences: Codable {
        let zoom: GoogleMapZoomOptions?
        let padding: GoogleMapPadding?
        let building: Bool?
        let gestureBounds: [LatLng]?
    
    init(fromJSObject: JSObject) throws {
        building = fromJSObject["building"] as? Bool
        
        if let zoomObj = fromJSObject["zoom"] as? JSObject {
            let minZoom = zoomObj["minZoom"] as? Float
            let maxZoom = zoomObj["maxZoom"] as? Float
            self.zoom = GoogleMapZoomOptions(minZoom:minZoom, maxZoom:maxZoom)
        } else {
            self.zoom = nil
        }
        
        if let paddingObj = fromJSObject["padding"] as? JSObject {
            self.padding = try? GoogleMapPadding(fromJSObject: paddingObj)
        } else {
            self.padding = nil
        }
        
        if let gestureBoundsArray = fromJSObject["gestureBounds"] as? [JSObject] {
             var parsedGestureBounds: [LatLng] = []
             for obj in gestureBoundsArray {
                 guard let lat = obj["lat"] as? Double,
                       let lng = obj["lng"] as? Double else {
                     throw GoogleMapErrors.invalidArguments("Each gestureBound in 'gestureBounds' must have 'lat' and 'lng'")
                 }
                 parsedGestureBounds.append(LatLng(lat: lat, lng: lng))
             }
             self.gestureBounds = parsedGestureBounds
         } else {
             self.gestureBounds = nil
         }

    }
}
