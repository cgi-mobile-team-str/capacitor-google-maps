package com.capacitorjs.plugins.googlemaps

import com.google.android.gms.maps.model.LatLng
import org.json.JSONObject

class CapacitorPolygonOptions(fromJSONObject: JSONObject) {
    var points:MutableList<MutableList<LatLng>> = mutableListOf<MutableList<LatLng>>()
    var visible: Boolean? = true
    var strokeColor: String? = ""
    var strokeWidth: Float? = 1.0f
    var fillColor: String? = "null"
    var zIndex: Float =  0.00f

    init {

        if(!fromJSONObject.has("points")) {
            throw InvalidArgumentsError("Polyline options object is missing the required 'points' property")
        }
        val pointsJSONArray = fromJSONObject.getJSONArray("points")
        for (i in 0 until pointsJSONArray.length()) {
            val arr = pointsJSONArray.optJSONArray(i)
            if (arr == null) {
                // is a single shape
                val shape = CapacitorGoogleMapsUtils.processShape(pointsJSONArray)
                this.points.add(shape)
                break
            } else {
                val shape = CapacitorGoogleMapsUtils.processShape(arr)
                this.points.add(shape)
            }
        }
        visible = fromJSONObject.optBoolean("visible", true)
        strokeColor = fromJSONObject.optString("strokeColor", "")
        fillColor = fromJSONObject.optString("fillColor", "")
        zIndex = fromJSONObject.optDouble("zIndex", 0.0).toFloat()
        strokeWidth = fromJSONObject.optDouble("strokeWidth", 0.0).toFloat()
    }
}