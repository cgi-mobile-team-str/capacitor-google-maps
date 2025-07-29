package com.capacitorjs.plugins.googlemaps

import org.json.JSONObject

class GoogleMapZoomOptions(fromJSONObject: JSONObject) {
    var minZoom: Double? = null
    var maxZoom: Double? = null
    init {
        if (fromJSONObject.has("minZoom")) {
             minZoom = fromJSONObject.getDouble("minZoom")
        }
        if (fromJSONObject.has("maxZoom")) {
            maxZoom = fromJSONObject.getDouble("maxZoom")
        }
    }
}