package com.capacitorjs.plugins.googlemaps

import org.json.JSONObject

class GoogleMapControls(fromJSONObject: JSONObject) {
    var compass: Boolean? = null

    var myLocationButton: Boolean? = null

    var myLocation: Boolean? = null

    var indoorPicker: Boolean? = null

    var mapToolbar: Boolean? = null

    var zoom: Boolean? = null

    init {
        if (fromJSONObject.has("compass")) {
            compass = fromJSONObject.getBoolean("compass")
        }
        if (fromJSONObject.has("myLocationButton")) {
            myLocationButton = fromJSONObject.getBoolean("myLocationButton")
        }
        if (fromJSONObject.has("myLocation")) {
            myLocation = fromJSONObject.getBoolean("myLocation")
        }
        if (fromJSONObject.has("indoorPicker")) {
            indoorPicker = fromJSONObject.getBoolean("indoorPicker")
        }
        if (fromJSONObject.has("mapToolbar")) {
            mapToolbar = fromJSONObject.getBoolean("mapToolbar")
        }
        if (fromJSONObject.has("zoom")) {
            zoom = fromJSONObject.getBoolean("zoom")
        }
    }
}