package com.capacitorjs.plugins.googlemaps

import android.graphics.Color
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.Polygon
import org.json.JSONArray
import org.json.JSONObject

class CapacitorGoogleMapsPolygon() {
    var shapes: MutableList<MutableList<LatLng>> = mutableListOf<MutableList<LatLng>>()
    var strokeWidth: Float = 1.0f
    var strokeColor: Int = Color.BLUE
    var fillColor: Int = Color.BLUE
    var clickable: Boolean = false
    var geodesic: Boolean = false
    var zIndex: Float = 0.00f
    var tag: String = ""
    var googleMapsPolygon: Polygon? = null
    var visible: Boolean? = true

    constructor(fromJSONObject: JSONObject): this() {
        if (!fromJSONObject.has("paths")) {
            throw InvalidArgumentsError("Polygon object is missing the required 'paths' property")
        }

        val pathsArray = fromJSONObject.getJSONArray("paths")
        for (i in 0 until pathsArray.length()) {
            val arr = pathsArray.optJSONArray(i)
            if (arr == null) {
                // is a single shape
                val shape = CapacitorGoogleMapsUtils.processShape(pathsArray)
                this.shapes.add(shape)
                break
            } else {
                val shape = CapacitorGoogleMapsUtils.processShape(arr)
                this.shapes.add(shape)
            }
        }

        val strokeOpacity = fromJSONObject.optDouble("strokeOpacity", 1.0)
        strokeColor = CapacitorGoogleMapsUtils.processColor(fromJSONObject.getString("strokeColor"), strokeOpacity)

        val fillOpacity = fromJSONObject.optDouble("fillOpacity", 1.0)
        fillColor = CapacitorGoogleMapsUtils.processColor(fromJSONObject.getString("fillColor"), fillOpacity)

        strokeWidth = fromJSONObject.optDouble("strokeWeight", 1.0).toFloat()
        clickable = fromJSONObject.optBoolean("clickable", false)
        geodesic = fromJSONObject.optBoolean("geodesic", false)
        zIndex = fromJSONObject.optDouble("zIndex", 1.0).toFloat()
        tag = fromJSONObject.optString("tag", "")
    }

    constructor(options: CapacitorPolygonOptions): this() {
        shapes = options.points
        strokeWidth = options.strokeWidth ?: 1.0f
        if(!options.strokeColor.isNullOrEmpty()) {
            strokeColor = CapacitorGoogleMapsUtils.processColor(options.strokeColor!!, 1.0)
        }
        if(!options.fillColor.isNullOrEmpty()) {
            fillColor = CapacitorGoogleMapsUtils.processColor(options.fillColor!!, 1.0)
        }
        zIndex = options.zIndex
        visible = options.visible != false
        clickable = false
        geodesic = false
    }
}