import Foundation
import Capacitor

public struct Marker {
    let coordinate: LatLng
    let opacity: Float?
    let title: String?
    let snippet: String?
    let isFlat: Bool?
    let iconUrl: String?
    let iconSize: CGSize?
    let iconAnchor: CGPoint?
    let draggable: Bool?
    let color: UIColor?
    let zIndex: Int32
    let isVisible: Bool?

    init(fromJSObject: JSObject) throws {
        guard let latLngObj = fromJSObject["coordinate"] as? JSObject else {
            throw GoogleMapErrors.invalidArguments("Marker object is missing the required 'coordinate' property")
        }

        guard let lat = latLngObj["lat"] as? Double, let lng = latLngObj["lng"] as? Double else {
            throw GoogleMapErrors.invalidArguments("LatLng object is missing the required 'lat' and/or 'lng' property")
        }

        var iconSize: CGSize?
        if let sizeObj = fromJSObject["iconSize"] as? JSObject {
            if let width = sizeObj["width"] as? Double, let height = sizeObj["height"] as? Double {
                iconSize = CGSize(width: width, height: height)
            }
        }

        var iconAnchor: CGPoint?
        if let anchorObject = fromJSObject["iconAnchor"] as? JSObject {
            if let x = anchorObject["x"] as? Double, let y = anchorObject["y"] as? Double {
                if let size = iconSize {
                    let u = x / size.width
                    let v = y / size.height

                    iconAnchor = CGPoint(x: u, y: v)
                }
            }
        }

        var tintColor: UIColor?
        if let rgbObject = fromJSObject["tintColor"] as? JSObject {
            if let r = rgbObject["r"] as? Double, let g = rgbObject["g"] as? Double, let b = rgbObject["b"] as? Double, let a = rgbObject["a"] as? Double {

                let uiColorR = CGFloat(r / 255).clamp(min: 0, max: 255)
                let uiColorG = CGFloat(g / 255).clamp(min: 0, max: 255)
                let uiColorB = CGFloat(b / 255).clamp(min: 0, max: 255)
                tintColor = UIColor(red: uiColorR, green: uiColorG, blue: uiColorB, alpha: CGFloat(a))
            }
        }

        self.coordinate = LatLng(lat: lat, lng: lng)
        self.opacity = fromJSObject["opacity"] as? Float
        self.title = fromJSObject["title"] as? String
        self.snippet = fromJSObject["snippet"] as? String
        self.isFlat = fromJSObject["isFlat"] as? Bool
        self.iconUrl = fromJSObject["iconUrl"] as? String
        self.draggable = fromJSObject["draggable"] as? Bool
        self.iconSize = iconSize
        self.iconAnchor = iconAnchor
        self.color = tintColor
        self.zIndex = Int32((fromJSObject["zIndex"] as? Int) ?? 0)
        self.isVisible = fromJSObject["isVisible"] as? Bool ?? true
    }
    
    init (options:MarkerOptions) {
        var iconAnchor: CGPoint?
        self.coordinate = options.position
        self.opacity = options.alpha ?? 1
        self.title = options.title ?? ""
        self.snippet = options.snippet ?? ""
        self.zIndex = Int32(options.zIndex ?? 0)
        self.isFlat = options.flat ?? false
        self.iconUrl = options.icon?.url
        self.iconSize = options.icon?.size
        if let x = options.anchor?[0] as? Double, let y = options.anchor?[1] as? Double {
            iconAnchor = CGPoint(x: x, y: y)
        }
        self.iconAnchor = iconAnchor
        self.draggable = options.draggable ?? false
        self.isVisible = options.visible ?? true
        self.color = nil
    }
    
}

extension CGFloat {
    func clamp(min: CGFloat, max: CGFloat) -> CGFloat {
        if self < min {
            return min
        }
        if self > max {
            return max
        }
        return self
    }
}
