import Foundation
import Capacitor

public struct GoogleMapGestures {
    var scroll: Bool? = true
    var tilt: Bool? = true
    var zoom: Bool? = true
    var rotate: Bool? = true

    init(fromJSObject: JSObject) throws {
        scroll = fromJSObject["scroll"] as? Bool
        tilt = fromJSObject["tilt"] as? Bool
        zoom = fromJSObject["zoom"] as? Bool
        rotate = fromJSObject["rotate"] as? Bool
    }

}
