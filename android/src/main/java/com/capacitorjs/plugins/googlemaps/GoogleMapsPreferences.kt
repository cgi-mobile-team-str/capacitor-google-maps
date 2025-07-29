package com.capacitorjs.plugins.googlemaps

import com.google.android.gms.maps.model.LatLng
import org.json.JSONObject

class GoogleMapsPreferences(fromJSONObject: JSONObject) {
        var zoom: GoogleMapZoomOptions? = null
        var padding: GoogleMapPadding? = null
        var building: Boolean? = null
        var gestureBounds: Array<LatLng>? = null

    init {
        if (fromJSONObject.has("zoom")) {
            val zoomObj = fromJSONObject.getJSONObject("zoom")
            zoom = GoogleMapZoomOptions(zoomObj)
        }
        if (fromJSONObject.has("padding")) {
            val paddingObj = fromJSONObject.getJSONObject("padding")
            padding = GoogleMapPadding(paddingObj)
        }
        if (fromJSONObject.has("building")) {
            building = fromJSONObject.getBoolean("building")
        }
        if (fromJSONObject.has("gestureBounds")) {
            val gestureBoundsJSONArray = fromJSONObject.getJSONArray("gestureBounds")
            val list = mutableListOf<LatLng>()
            for (i in 0 until gestureBoundsJSONArray.length()) {
                val gestureBoundObj = gestureBoundsJSONArray.getJSONObject(i)
                if (!gestureBoundObj.has("lat") || !gestureBoundObj.has("lng")) {
                    throw InvalidArgumentsError("One of the LatLng objects is missing 'lat' and/or 'lng'")
                }
                val lat = gestureBoundObj.getDouble("lat")
                val lng = gestureBoundObj.getDouble("lng")
                list.add(LatLng(lat, lng))
            }
            gestureBounds = list.toTypedArray()
        }
    }
}