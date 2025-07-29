package com.capacitorjs.plugins.googlemaps

import org.json.JSONObject

class GoogleMapGestures(fromJSONObject: JSONObject) {
    var scroll: Boolean? = true
    var tilt: Boolean? = true
    var zoom: Boolean? = true
    var rotate: Boolean? = true

    init {
        if (fromJSONObject.has("scroll")) {
            scroll = fromJSONObject.getBoolean("scroll")
        }
        if (fromJSONObject.has("tilt")) {
            tilt = fromJSONObject.getBoolean("tilt")
        }
        if (fromJSONObject.has("rotate")) {
            rotate = fromJSONObject.getBoolean("rotate")
        }
        if (fromJSONObject.has("zoom")) {
            zoom = fromJSONObject.getBoolean("zoom")
        }
    }
}