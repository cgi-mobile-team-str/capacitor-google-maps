package com.capacitorjs.plugins.googlemaps

import android.graphics.Color
import com.google.android.gms.maps.model.LatLng
import org.json.JSONObject

class CapacitorCircleOptions(fromJSONObject: JSONObject) {
    var center: LatLng
    var radius: Float
    var strokeWidth: Float? = 1.0f
    var strokeColor: String? = ""
    var fillColor: String? = ""
    var clickable: Boolean? = false
    var visible: Boolean? = true
    var zIndex: Float = 0.00f

    init {
        if (!fromJSONObject.has("center")) {
            throw InvalidArgumentsError("Circle object is missing the required 'center' property")
        }

        if (!fromJSONObject.has("radius")) {
            throw InvalidArgumentsError("Circle object is missing the required 'radius' property")
        }

        val latLng = fromJSONObject.getJSONObject("center")
        if (!latLng.has("lat") || !latLng.has("lng")) {
            throw InvalidArgumentsError("LatLng object is missing the required 'lat' and/or 'lng' property")
        }

        val lat = latLng.getDouble("lat")
        val lng = latLng.getDouble("lng")

        center = LatLng(lat, lng)
        radius = fromJSONObject.getDouble("radius").toFloat()
        strokeColor = fromJSONObject.optString("strokeColor", "")
        fillColor = fromJSONObject.optString("fillColor", "")
        strokeWidth = fromJSONObject.optDouble("strokeWidth", 1.0).toFloat()
        clickable = fromJSONObject.optBoolean("clickable", false)
        zIndex = fromJSONObject.optDouble("zIndex", 1.0).toFloat()
        visible = fromJSONObject.optBoolean("visible", true)
    }
}