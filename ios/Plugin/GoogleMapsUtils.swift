import UIKit
import GoogleMaps
import Capacitor

enum ColorType {
    case hex
    case rgb
    case rgba
    case invalid
}

struct GoogleMapsUtils {
    
       static func detectColorType(_ color: String) -> ColorType {
           let trimmed = color.trimmingCharacters(in: .whitespacesAndNewlines)
           
           // HEX check (with or without #)
           let hexPart = trimmed.hasPrefix("#") ? String(trimmed.dropFirst()) : trimmed
           let hexValid = hexPart.allSatisfy { $0.isHexDigit }
           if hexValid && (hexPart.count == 3 || hexPart.count == 6) {
               return .hex
           }
           
           // RGB check
           if trimmed.lowercased().hasPrefix("rgb(") && trimmed.hasSuffix(")") {
               let parts = trimmed.dropFirst(4).dropLast().split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
               if parts.count == 3, parts.allSatisfy({ Int($0) ?? -1 >= 0 && Int($0) ?? -1 <= 255 }) {
                   return .rgb
               }
           }
           
           // RGBA check
           if trimmed.lowercased().hasPrefix("rgba(") && trimmed.hasSuffix(")") {
               let parts = trimmed.dropFirst(5).dropLast().split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
               if parts.count == 4,
                  parts[0...2].allSatisfy({ Int($0) ?? -1 >= 0 && Int($0) ?? -1 <= 255 }),
                  let alpha = Float(parts[3]), alpha >= 0, alpha <= 1 {
                   return .rgba
               }
           }
           
           return .invalid
       }
    
       
       static func parseToUIColor(_ color: String) -> UIColor? {
           switch detectColorType(color) {
           case .rgb:
               let parts = color.dropFirst(4).dropLast().split(separator: ",").compactMap { Int($0.trimmingCharacters(in: .whitespaces)) }
               return UIColor(red: CGFloat(parts[0]) / 255, green: CGFloat(parts[1]) / 255, blue: CGFloat(parts[2]) / 255, alpha: 1)
               
           case .rgba:
               let parts = color.dropFirst(5).dropLast().split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
               guard let r = Int(parts[0]), let g = Int(parts[1]), let b = Int(parts[2]), let a = Float(parts[3]) else { return nil }
               return UIColor(red: CGFloat(r) / 255, green: CGFloat(g) / 255, blue: CGFloat(b) / 255, alpha: CGFloat(a))
               
           case .hex:
               let hex = color.hasPrefix("#") ? String(color.dropFirst()) : color
               var intVal: UInt64 = 0
               Scanner(string: hex).scanHexInt64(&intVal)
               if hex.count == 6 {
                   let r = CGFloat((intVal >> 16) & 0xFF) / 255
                   let g = CGFloat((intVal >> 8) & 0xFF) / 255
                   let b = CGFloat(intVal & 0xFF) / 255
                   return UIColor(red: r, green: g, blue: b, alpha: 1)
               }
               return nil
               
           default:
               return nil
           }
       }
    
    static func hexStringFromColor(color: UIColor) -> String {
        let components = color.cgColor.components
        let r: CGFloat = components?[0] ?? 0.0
        let g: CGFloat = components?[1] ?? 0.0
        let b: CGFloat = components?[2] ?? 0.0

        let hexString = String.init(format: "#%02lX%02lX%02lX", lroundf(Float(r * 255)), lroundf(Float(g * 255)), lroundf(Float(b * 255)))
        print(hexString)
        return hexString
     }

    static func createLatLngBoundsFromLatLngArray(_ coordinates: [CLLocationCoordinate2D]) -> GMSCoordinateBounds {
        var latLngBounds: GMSCoordinateBounds = GMSCoordinateBounds()
        for coordinate in coordinates {
            latLngBounds = latLngBounds.includingCoordinate(coordinate)
        }
        return latLngBounds
    }
    
    static func getCLLocationCoordinate(_ point: JSObject) throws -> CLLocationCoordinate2D {
        guard let lat = point["lat"] as? Double else {
            throw GoogleMapErrors.unhandledError("Point lat property not formatted properly.")
        }

        guard let lng = point["lng"] as? Double else {
            throw GoogleMapErrors.unhandledError("Point lng property not formatted properly.")
        }

        return CLLocationCoordinate2D(latitude: lat, longitude: lng)
    }
    
    static func getCenterFromBound(_ bounds: GMSCoordinateBounds) -> CLLocationCoordinate2D {
        let centerLatitude = (bounds.southWest.latitude + bounds.northEast.latitude) / 2.0
        let centerLongitude = (bounds.southWest.longitude + bounds.northEast.longitude) / 2.0
        
        return CLLocationCoordinate2D(latitude: centerLatitude, longitude: centerLongitude)
    }
    
    static func processShape(_ shapeArr: JSArray) throws -> [LatLng] {
        var shape: [LatLng] = []

        try shapeArr.forEach { obj in
            guard let jsCoord = obj as? JSObject else {
                throw GoogleMapErrors.invalidArguments("LatLng object is missing the required 'lat' and/or 'lng' property")
            }

            guard let lat = jsCoord["lat"] as? Double, let lng = jsCoord["lng"] as? Double else {
                throw GoogleMapErrors.invalidArguments("LatLng object is missing the required 'lat' and/or 'lng' property")
            }

            shape.append(LatLng(lat: lat, lng: lng))
        }

        return shape
    }
    
    static func buildIconAnchorPoint(x: Double, y: Double, iconSize: CGSize) -> CGPoint {
        let u = x / iconSize.width
        let v = y / iconSize.height

        let iconAnchor = CGPoint(x: u, y: v)
        return iconAnchor
    }
    
    static func safeJSONValue(_ value: Any?) -> Any? {
        guard let value = value else { return nil }

        if value is String || value is Int || value is Double || value is Float || value is Bool {
            return value
        }

        if let dict = value as? [String: Any] {
            return dict.mapValues { safeJSONValue($0) }
        }

        if let array = value as? [Any] {
            return array.compactMap { safeJSONValue($0) }
        }

        // Fallback: force to string so it won't crash
        return String(describing: value)
    }
}
