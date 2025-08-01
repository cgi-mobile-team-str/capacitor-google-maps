import Foundation
import Capacitor
import GoogleMaps

public struct GoogleMapsOptions {
    let mapType: GMSMapViewType?
    let controls: GoogleMapControls?
    let gestures: GoogleMapGestures?
    let styles: GMSMapStyle?
    let camera: GoogleMapCameraConfig?
    let preferences: GoogleMapsPreferences?

    init(fromJSObject: JSObject) throws {
        if let mapTypeString = fromJSObject["mapType"] as? String {
            self.mapType = GMSMapViewType.fromString(mapType: mapTypeString)
        }
        else {
            self.mapType = nil
        }
        if let controlsJSObject = fromJSObject["controls"] as? JSObject {
            self.controls = try? GoogleMapControls(fromJSObject: controlsJSObject)
        } else {
            self.controls = nil
        }
        if let gesturesJSObject = fromJSObject["gestures"] as? JSObject {
            self.gestures = try? GoogleMapGestures(fromJSObject: gesturesJSObject)
        } else {
            self.gestures = nil
        }
        if let cameraJSObject = fromJSObject["camera"] as? JSObject {
            self.camera = try? GoogleMapCameraConfig(fromJSObject: cameraJSObject)
        } else {
            self.camera = nil
        }
        if let preferencesJSObject = fromJSObject["preferences"] as? JSObject {
            self.preferences = try? GoogleMapsPreferences(fromJSObject: preferencesJSObject)
        } else {
            self.preferences = nil
        }
        if let stylesJSObject = fromJSObject["styles"] as? JSObject {
            do {
                let data = try JSONSerialization.data(withJSONObject: stylesJSObject, options: [.prettyPrinted])
                let stylesString = String(data: data, encoding: .utf8) ?? ""
                self.styles = try GMSMapStyle(jsonString: stylesString)
            } catch {
                print("Failed to parse styles: \(error)")
                self.styles = nil
            }
        } else {
            self.styles = nil
        }
    }
}
