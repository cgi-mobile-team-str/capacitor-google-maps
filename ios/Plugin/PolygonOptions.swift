import Foundation
import Capacitor

public struct PolygonOptions {
    var points: [[LatLng]]
    var visible: Bool?
    var strokeColor: String?
    var strokeWidth: Float?
    var fillColor: String?
    var zIndex: Float?
    
    init(fromJSObject: JSObject) throws {
        var shapes: [[LatLng]] = []
        guard let pointsArray = fromJSObject["points"] as? JSArray else {
            throw GoogleMapErrors.invalidArguments("Polygon options object is missing the required 'points' property")
        }
        if let obj = pointsArray.first, obj as? JSArray != nil {
            try pointsArray.forEach({ obj in
                if let pointsArr = obj as? JSArray {
                    try shapes.append(GoogleMapsUtils.processShape(pointsArr))
                }
            })
        } else {
            try shapes.append(GoogleMapsUtils.processShape(pointsArray))
        }

        self.points = shapes
        self.visible = fromJSObject["visible"] as? Bool ?? true
        self.strokeColor = fromJSObject["strokeColor"] as? String ?? ""
        self.strokeWidth = fromJSObject["strokeWidth"] as? Float ?? 1.0
        self.fillColor = fromJSObject["fillColor"] as? String ?? "null"
        self.zIndex = fromJSObject["zIndex"] as? Float ?? 0.0
    }
}
