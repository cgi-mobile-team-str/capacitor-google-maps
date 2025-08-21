import Foundation
import Capacitor

public struct GoogleMapControls: Codable {
    let compass: Bool?
    let myLocationButton: Bool?
    let myLocation: Bool?
    let indoorPicker: Bool?

    init(fromJSObject: JSObject) throws {
        compass = fromJSObject["compass"] as? Bool
        myLocationButton = fromJSObject["myLocationButton"] as? Bool
        myLocation = fromJSObject["myLocation"] as? Bool
        indoorPicker = fromJSObject["indoorPicker"] as? Bool
    }
}
