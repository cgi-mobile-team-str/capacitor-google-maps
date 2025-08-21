import Foundation
import Capacitor

enum TargetType: Codable {
    case point(LatLng)
    case points([LatLng])
    case none

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let point = try? container.decode(LatLng.self) {
            self = .point(point)
        } else if let points = try? container.decode([LatLng].self) {
            self = .points(points)
        } else {
            self = .none
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .point(let p): try container.encode(p)
        case .points(let arr): try container.encode(arr)
        case .none: try container.encodeNil()
        }
    }
}

public struct GoogleMapCameraConfig: Codable {
    var target: TargetType
    let zoom: Float?
    let bearing: Double?
    let angle: Double?
    let duration: Double?

    init(fromJSObject: JSObject) throws {
        zoom = fromJSObject["zoom"] as? Float
        bearing = fromJSObject["bearing"] as? Double
        angle = fromJSObject["angle"] as? Double
        duration = fromJSObject["duration"] as? Double

        let rawTarget = fromJSObject["target"]

        if let targetObj = rawTarget as? JSObject {
            guard let lat = targetObj["lat"] as? Double,
                  let lng = targetObj["lng"] as? Double else {
                throw GoogleMapErrors.invalidArguments(
                    "targetObj object is missing the required 'lat' and/or 'lng' property"
                )
            }
            self.target = .point(LatLng(lat: lat, lng: lng))

        } else if let targetArr = rawTarget as? [JSObject] {
            var parsedCoordinates: [LatLng] = []
            for obj in targetArr {
                guard let lat = obj["lat"] as? Double,
                      let lng = obj["lng"] as? Double else {
                    throw GoogleMapErrors.invalidArguments(
                        "Each target in 'coordinates' must have 'lat' and 'lng'"
                    )
                }
                parsedCoordinates.append(LatLng(lat: lat, lng: lng))
            }
            self.target = .points(parsedCoordinates)

        } else {
            self.target = .none
        }
    }
}
