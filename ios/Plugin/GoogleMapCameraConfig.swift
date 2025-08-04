import Foundation
import Capacitor

public struct GoogleMapCameraConfig {
    let coordinate: LatLng?
    let coordinates: [LatLng]?
    let zoom: Float?
    let bearing: Double?
    let angle: Double?
    let duration: Double?

    init(fromJSObject: JSObject) throws {
        zoom = fromJSObject["zoom"] as? Float
        bearing = fromJSObject["bearing"] as? Double
        angle = fromJSObject["angle"] as? Double
        duration = fromJSObject["duration"] as? Double

        if let latLngObj = fromJSObject["coordinate"] as? JSObject {
            guard let lat = latLngObj["lat"] as? Double, let lng = latLngObj["lng"] as? Double else {
                throw GoogleMapErrors.invalidArguments("LatLng object is missing the required 'lat' and/or 'lng' property")
            }

            self.coordinate = LatLng(lat: lat, lng: lng)
        } else {
            self.coordinate = nil
        }
        
        if let coordinatesArray = fromJSObject["coordinates"] as? [JSObject] {
             var parsedCoordinates: [LatLng] = []
             for obj in coordinatesArray {
                 guard let lat = obj["lat"] as? Double,
                       let lng = obj["lng"] as? Double else {
                     throw GoogleMapErrors.invalidArguments("Each coordinate in 'coordinates' must have 'lat' and 'lng'")
                 }
                 parsedCoordinates.append(LatLng(lat: lat, lng: lng))
             }
             self.coordinates = parsedCoordinates
         } else {
             self.coordinates = nil
         }

    }
}
