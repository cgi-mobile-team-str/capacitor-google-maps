import Foundation
import Capacitor

public struct Circle {
    let center: LatLng
    let radius: Double
    let strokeWidth: CGFloat
    let strokeColor: UIColor
    let fillColor: UIColor
    let tappable: Bool?
    let title: String?
    let zIndex: Int32
    let tag: String?
    let visible: Bool?

    init(from jsObject: JSObject) throws {
        var strokeColor = UIColor.blue
        var strokeWidth: CGFloat = 1.0
        var fillColor = UIColor.blue

        guard let centerLatLng = jsObject["center"] as? JSObject else {
            throw GoogleMapErrors.invalidArguments("Circle object is missing the required 'center' property")
        }

        guard let lat = centerLatLng["lat"] as? Double, let lng = centerLatLng["lng"] as? Double else {
            throw GoogleMapErrors.invalidArguments("LatLng object is missing the required 'lat' and/or 'lng' property")
        }

        guard let radius = jsObject["radius"] as? Double else {
            throw GoogleMapErrors.invalidArguments("Circle object is missing the required 'radius' property")
        }

        if let width = jsObject["strokeWeight"] as? Float {
            strokeWidth = CGFloat(width)
        }

        let strokeOpacity = jsObject["strokeOpacity"] as? Double

        if let hexColor = jsObject["strokeColor"] as? String {
            strokeColor = UIColor(hex: hexColor) ?? UIColor.blue
        }

        strokeColor = strokeColor.withAlphaComponent(strokeOpacity ?? 1.0)

        let fillOpacity = jsObject["fillOpacity"] as? Double

        if let hexColor = jsObject["fillColor"] as? String {
            fillColor = UIColor(hex: hexColor) ?? UIColor.blue
        }

        fillColor = fillColor.withAlphaComponent(fillOpacity ?? 1.0)

        self.center = LatLng(lat: lat, lng: lng)
        self.radius = radius
        self.fillColor = fillColor
        self.strokeColor = strokeColor
        self.strokeWidth = strokeWidth
        self.tag = jsObject["tag"] as? String
        self.tappable = jsObject["clickable"] as? Bool
        self.title = jsObject["title"] as? String
        self.zIndex = Int32((jsObject["zIndex"] as? Int) ?? 0)
        self.visible = jsObject["visible"] as? Bool ?? true
    }
    
    init(options: CircleOptions) throws {
        var finalStrokeColor: UIColor = UIColor.blue
        var finalFillColor: UIColor = UIColor.blue
        self.center = options.center
        self.radius = options.radius
        self.visible = options.visible
        self.zIndex = Int32(options.zIndex ?? 0)
        if let strokeColor = options.strokeColor {
            finalStrokeColor = GoogleMapsUtils.parseToUIColor(strokeColor) ?? UIColor.blue
        }
        if let fillColor = options.fillColor {
            finalFillColor = GoogleMapsUtils.parseToUIColor(fillColor) ?? UIColor.blue
        }
        self.strokeColor = finalStrokeColor
        self.fillColor = finalFillColor
        self.strokeWidth = CGFloat(options.strokeWidth ?? 0)
        self.tappable = options.clickable
        self.title = ""
        self.tag = ""
    }
}
