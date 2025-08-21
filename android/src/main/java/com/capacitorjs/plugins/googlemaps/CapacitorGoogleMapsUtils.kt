package com.capacitorjs.plugins.googlemaps

import android.graphics.Color
import android.util.Size
import com.getcapacitor.JSObject
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import org.json.JSONArray

object CapacitorGoogleMapsUtils {
    fun processColor(color: String, opacity: Double?): Int {
        val hexRegex = Regex("^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")
        val rgbRegex = Regex("^rgb\\s*\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*\\)$")
        val rgbaRegex = Regex("^rgba\\s*\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(0|0?\\.\\d+|1(\\.0)?)\\s*\\)$")

        return when {
            hexRegex.matches(color) -> {
                val colorInt = Color.parseColor(color)
                var alpha: Int = 255
                if(opacity != null) {
                     alpha = (opacity * 255.0).toInt()
                }
                val red = android.graphics.Color.red(colorInt)
                val green = android.graphics.Color.green(colorInt)
                val blue = android.graphics.Color.blue(colorInt)

                return Color.argb(alpha, red, green, blue)
            }
            rgbRegex.matches(color) -> {
                val parts = color.removePrefix("rgb(").removeSuffix(")")
                    .split(",").map { it.trim().toInt() }
                val (r, g, b) = parts
                return Color.rgb(r, g, b)
            }
            rgbaRegex.matches(color) -> {
                val parts = color.removePrefix("rgba(").removeSuffix(")")
                    .split(",").map { it.trim() }
                val r = parts[0].toInt()
                val g = parts[1].toInt()
                val b = parts[2].toInt()
                val aFloat = parts[3].toFloat() // 0.0 to 1.0
                val aInt = (aFloat * 255).toInt()
                return Color.argb(aInt, r, g, b)
            }
            else -> return Color.BLUE
        }
    }

    fun createLatLngBoundsFromLatLngArray(latLngArray: Array<LatLng>): LatLngBounds {
        val builder = LatLngBounds.Builder()
        for (latLng in latLngArray) {
            builder.include(latLng)
        }
        return builder.build()
    }

    fun processShape(shapeArr: JSONArray): MutableList<LatLng> {
        var shape = mutableListOf<LatLng>()

        for (i in 0 until shapeArr.length()) {
            val obj = shapeArr.getJSONObject(i)
            if (!obj.has("lat") || !obj.has("lng")) {
                throw InvalidArgumentsError("LatLng object is missing the required 'lat' and/or 'lng' property")
            }

            val lat = obj.getDouble("lat")
            val lng = obj.getDouble("lng")

            shape.add(LatLng(lat, lng))
        }

        return shape
    }

    fun latLngToJSObject(latLng: LatLng?): JSObject {
        val obj = JSObject()
        obj.put("lat", latLng?.latitude)
        obj.put("lng", latLng?.longitude)
        return obj
    }


     fun buildIconAnchorPoint(iconAnchor: CapacitorGoogleMapsPoint, iconSize: Size?): CapacitorGoogleMapsPoint? {
        iconSize ?: return null

        val u: Float = iconAnchor.x / iconSize!!.width
        val v: Float = iconAnchor.y / iconSize!!.height

        return CapacitorGoogleMapsPoint(u, v)
    }
}