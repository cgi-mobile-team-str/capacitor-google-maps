import Foundation
import Capacitor

public struct MarkerIcon {
    let url: String?
    let size: CGSize?
    let anchor: [Float]?

    init(fromJSObject: JSObject) throws {
        var size: CGSize?
        var anchor: [Float] = []
        
        if let sizeObj = fromJSObject["size"] as? JSObject {
            if let width = sizeObj["width"] as? Double, let height = sizeObj["height"] as? Double {
                size = CGSize(width: width, height: height)
            }
        }
        
        if let anchorJSArray = fromJSObject["anchor"] as? JSArray {
             anchorJSArray.forEach { obj in
                if let jsAnchor = obj as? Float {
                    anchor.append(jsAnchor)
                }
            }
        }

        self.size = size
        self.anchor = anchor
        self.url = fromJSObject["url"] as? String
    }
}
