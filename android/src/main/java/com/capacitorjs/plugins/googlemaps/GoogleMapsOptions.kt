package com.capacitorjs.plugins.googlemaps

import com.google.android.gms.maps.model.MapStyleOptions
import org.json.JSONObject

class GoogleMapsOptions(fromJSONObject: JSONObject) {

    var mapType: String? = null
    var controls: GoogleMapControls? = null
    var gestures: GoogleMapGestures? = null
    var styles: MapStyleOptions? = null
    var camera: GoogleMapCameraConfig? = null
    var preferences: GoogleMapsPreferences? = null

    init {
        if (fromJSONObject.has("mapType")) {
            mapType = fromJSONObject.getString("mapType")
        }

        if (fromJSONObject.has("controls")) {
            val controlsObject = fromJSONObject.getJSONObject("controls")
            controls = GoogleMapControls(controlsObject)
        }

        if (fromJSONObject.has("gestures")) {
            val gesturesObject = fromJSONObject.getJSONObject("gestures")
            gestures = GoogleMapGestures(gesturesObject)
        }

        if (fromJSONObject.has("styles")) {
            val stylesObj = fromJSONObject.getJSONObject("styles")
            styles = MapStyleOptions(stylesObj.toString())
        }

        if (fromJSONObject.has("camera")) {
            val cameraObject = fromJSONObject.getJSONObject("camera")
            camera = GoogleMapCameraConfig(cameraObject)
        }

        if (fromJSONObject.has("preferences")) {
            val preferencesObject = fromJSONObject.getJSONObject("preferences")
            preferences = GoogleMapsPreferences(preferencesObject)
        }
    }
}