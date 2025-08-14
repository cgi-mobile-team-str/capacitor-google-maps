import Foundation
import Capacitor

public struct GoogleMapConfig: Codable, GoogleMapSettings {
    let width: Double
    let height: Double
    let x: Double
    let y: Double
    let styles: String?
    var mapId: String?
    var controls: GoogleMapControls?
    var gestures: GoogleMapGestures?
    var preferences: GoogleMapsPreferences?
    var camera : GoogleMapCameraConfig?
    
    init(fromJSObject: JSObject) throws {
        guard let width = fromJSObject["width"] as? Double else {
            throw GoogleMapErrors.invalidArguments("GoogleMapConfig object is missing the required 'width' property")
        }

        guard let height = fromJSObject["height"] as? Double else {
            throw GoogleMapErrors.invalidArguments("GoogleMapConfig object is missing the required 'height' property")
        }

        guard let x = fromJSObject["x"] as? Double else {
            throw GoogleMapErrors.invalidArguments("GoogleMapConfig object is missing the required 'x' property")
        }

        guard let y = fromJSObject["y"] as? Double else {
            throw GoogleMapErrors.invalidArguments("GoogleMapConfig object is missing the required 'y' property")
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
        if let preferencesJSObject = fromJSObject["preferences"] as? JSObject {
            self.preferences = try? GoogleMapsPreferences(fromJSObject: preferencesJSObject)
        } else {
            self.preferences = nil
        }
        
        if let cameraJSObject = fromJSObject["camera"] as? JSObject {
            self.camera = try? GoogleMapCameraConfig(fromJSObject: cameraJSObject)
        } else {
            self.camera = nil
        }

        self.width = round(width)
        self.height = round(height)
        self.x = x
        self.y = y

        if let stylesArray = fromJSObject["styles"] as? JSArray, let jsonData = try? JSONSerialization.data(withJSONObject: stylesArray, options: []) {
            self.styles = String(data: jsonData, encoding: .utf8)
        } else {
            self.styles = nil
        }

        self.mapId = fromJSObject["iOSMapId"] as? String
    }
}
