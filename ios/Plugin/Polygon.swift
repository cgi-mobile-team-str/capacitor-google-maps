import Foundation
import Capacitor

public struct Polygon {
    let shapes: [[LatLng]]
    let strokeWidth: CGFloat
    let strokeColor: UIColor
    let fillColor: UIColor
    let tappable: Bool?
    let geodesic: Bool?
    let title: String?
    let zIndex: Int32
    let tag: String?
    let visible: Bool?
    
    init(fromJSObject: JSObject) throws {
        var strokeColor = UIColor.blue
        var strokeWidth: CGFloat = 1.0
        var fillColor = UIColor.blue
        var processedShapes: [[LatLng]] = []

        if let width = fromJSObject["strokeWeight"] as? Float {
            strokeWidth = CGFloat(width)
        }

        let strokeOpacity = fromJSObject["strokeOpacity"] as? Double

        if let hexColor = fromJSObject["strokeColor"] as? String {
            strokeColor = UIColor(hex: hexColor) ?? UIColor.blue
        }

        strokeColor = strokeColor.withAlphaComponent(strokeOpacity ?? 1.0)

        let fillOpacity = fromJSObject["fillOpacity"] as? Double

        if let hexColor = fromJSObject["fillColor"] as? String {
            fillColor = UIColor(hex: hexColor) ?? UIColor.blue
        }

        fillColor = fillColor.withAlphaComponent(fillOpacity ?? 1.0)

        guard let shapeJSArray = fromJSObject["paths"] as? JSArray else {
            throw GoogleMapErrors.invalidArguments("Polygon object is missing the required 'paths' property")
        }

        if let obj = shapeJSArray.first, obj as? JSArray != nil {
            try shapeJSArray.forEach({ obj in
                if let shapeArr = obj as? JSArray {
                    try processedShapes.append(GoogleMapsUtils.processShape(shapeArr))
                }
            })
        } else {
            // is a single shape
            try processedShapes.append(GoogleMapsUtils.processShape(shapeJSArray))
        }

        self.shapes = processedShapes
        self.fillColor = fillColor
        self.strokeColor = strokeColor
        self.strokeWidth = strokeWidth
        self.tag = fromJSObject["tag"] as? String
        self.tappable = fromJSObject["clickable"] as? Bool
        self.title = fromJSObject["title"] as? String
        self.geodesic = fromJSObject["geodesic"] as? Bool
        self.zIndex = Int32((fromJSObject["zIndex"] as? Int) ?? 0)
        self.visible = fromJSObject["visible"] as? Bool ?? true
    }
    
    init(options: PolygonOptions) throws {
        var strokeColor: UIColor = UIColor.blue
        var fillColor: UIColor = UIColor.blue
        self.shapes = options.points
        if let strokeColorOption = options.strokeColor {
            strokeColor = GoogleMapsUtils.parseToUIColor(strokeColorOption) ?? UIColor.blue
        }
        if let fillColorOption = options.fillColor {
            fillColor = GoogleMapsUtils.parseToUIColor(fillColorOption) ?? UIColor.blue
        }
        self.strokeColor = strokeColor
        self.fillColor = fillColor
        self.strokeWidth = CGFloat(options.strokeWidth ?? 0)
        self.zIndex = Int32(options.zIndex ?? 0)
        self.tappable = false
        self.geodesic = false
        self.tag = ""
        self.title = ""
        self.visible = options.visible ?? true
    }
}
