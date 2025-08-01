import Foundation
import Capacitor

public struct GoogleMapZoomOptions{
    let minZoom: Float?
    let maxZoom: Float?
    init(fromJSObject: JSObject) throws  {
        minZoom = fromJSObject["minZoom"] as? Float
        maxZoom = fromJSObject["maxZoom"] as? Float
    }
    init(minZoom: Float? = nil, maxZoom: Float? = nil) {
        self.minZoom = minZoom
        self.maxZoom = maxZoom
    }
}
