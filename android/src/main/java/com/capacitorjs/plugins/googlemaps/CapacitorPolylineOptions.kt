package com.capacitorjs.plugins.googlemaps

import com.google.android.gms.maps.model.LatLng
import org.json.JSONObject
import kotlin.collections.mutableListOf

class CapacitorPolylineOptions(fromJSONObject: JSONObject)  {
    var points: MutableList<LatLng> = mutableListOf<LatLng>()
    var visible: Boolean? = true
    var geodesic: Boolean? = false
    var color: String? = null
    var width: Float? = null
    var zIndex: Float? = null
    var clickable: Boolean? = false
    var extras: MutableMap<String, Any?> = mutableMapOf()

    init {
        val propertyNames = mutableSetOf(
            "points",
            "visible",
            "geodesic",
            "color",
            "width",
            "zIndex",
            "clickable",
            "extras"
        )
        val keys = fromJSONObject.keys()

        if(!fromJSONObject.has("points")) {
            throw InvalidArgumentsError("Polyline options object is missing the required 'points' property")
        }
        val pointsJSONArray = fromJSONObject.getJSONArray("points")
        val list = mutableListOf<LatLng>()
        for (i in 0 until pointsJSONArray.length()) {
            val obj = pointsJSONArray.getJSONObject(i)
            if (!obj.has("lat") || !obj.has("lng")) {
                throw InvalidArgumentsError("LatLng object is missing the required 'lat' and/or 'lng' property")
            }

            val lat = obj.getDouble("lat")
            val lng = obj.getDouble("lng")

            list.add(LatLng(lat, lng))
        }
        points = list

        visible = fromJSONObject.optBoolean("visible", true)
        geodesic = fromJSONObject.optBoolean("geodesic", false)
        color = fromJSONObject.optString("color", "")
        width = fromJSONObject.optDouble("width", 0.0).toFloat()
        zIndex = fromJSONObject.optDouble("zIndex", 0.0).toFloat()
        clickable = fromJSONObject.optBoolean("clickable", false)
        while (keys.hasNext()) {
            val key = keys.next()
            if (key !in propertyNames) {
                extras[key] = fromJSONObject.get(key)
            }
        }
    }
}