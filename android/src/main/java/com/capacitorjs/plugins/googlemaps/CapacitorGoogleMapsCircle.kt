package com.capacitorjs.plugins.googlemaps

import android.graphics.Color
import com.capacitorjs.plugins.googlemaps.CapacitorGoogleMapPolyline
import com.google.android.gms.maps.model.Circle
import com.google.android.gms.maps.model.LatLng
import org.json.JSONObject

class CapacitorGoogleMapsCircle() {
    var center: LatLng = LatLng(0.0, 0.0)
    var radius: Float = 0.0f
    var strokeWidth: Float = 1.0f
    var strokeColor: Int = Color.BLUE
    var fillColor: Int = Color.BLUE
    var clickable: Boolean = false
    var zIndex: Float = 0.00f
    var tag: String = ""
    var googleMapsCircle: Circle? = null
    var visible: Boolean? = true

    constructor(fromJSONObject: JSONObject): this() {
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

        val strokeOpacity = fromJSONObject.optDouble("strokeOpacity", 1.0)
        strokeColor = CapacitorGoogleMapsUtils.processColor(fromJSONObject.getString("strokeColor"), strokeOpacity)

        val fillOpacity = fromJSONObject.optDouble("fillOpacity", 1.0)
        fillColor = CapacitorGoogleMapsUtils.processColor(fromJSONObject.getString("fillColor"), fillOpacity)

        strokeWidth = fromJSONObject.optDouble("strokeWeight", 1.0).toFloat()
        clickable = fromJSONObject.optBoolean("clickable", false)
        zIndex = fromJSONObject.optDouble("zIndex", 1.0).toFloat()
        tag = fromJSONObject.optString("tag", "")
        visible = fromJSONObject.optBoolean("visible", true)
    }

    constructor(options: CapacitorCircleOptions): this() {
        center = options.center
        radius = options.radius
        if(!options.strokeColor.isNullOrEmpty()) {
            strokeColor = CapacitorGoogleMapsUtils.processColor(options.strokeColor!!, 1.0)
        }
        if(!options.fillColor.isNullOrEmpty()) {
            fillColor = CapacitorGoogleMapsUtils.processColor(options.fillColor!!, 1.0)
        }
        clickable = options.clickable == true
        zIndex = options.zIndex
        visible = options.visible
    }
}