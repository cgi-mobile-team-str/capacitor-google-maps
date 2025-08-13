package com.capacitorjs.plugins.googlemaps

import com.google.android.gms.maps.model.LatLng
import org.json.JSONArray
import org.json.JSONObject
import kotlin.jvm.isArrayOf

class GoogleMapCameraConfig(fromJSONObject: JSONObject) {
    var target: Any? = null
    var zoom: Double? = null
    var tilt: Double? = null
    var bearing: Double? = null
    var duration: Double? = null

    init {
        if (fromJSONObject.has("zoom")) {
            zoom = fromJSONObject.getDouble("zoom")
        }

        if(fromJSONObject.has("tilt")) {
            tilt = fromJSONObject.getDouble("tilt")
        }

        if (fromJSONObject.has("bearing")) {
            bearing = fromJSONObject.getDouble("bearing")
        }

        if (fromJSONObject.has("duration")) {
            duration = fromJSONObject.getDouble("duration")
        }

        if (fromJSONObject.has("target")) {
            val targetObject = fromJSONObject.get("target")
            if(targetObject != null && targetObject is JSONObject) {
                if(!targetObject.has("lat") || !targetObject.has("lng")) {
                    throw InvalidArgumentsError("LatLng object is missing the required 'lat' and/or 'lng' property")
                }

                val lat = targetObject.getDouble("lat")
                val lng = targetObject.getDouble("lng")
                target = LatLng(lat, lng)
            }

            if(targetObject != null && targetObject is JSONArray) {
                val list = mutableListOf<LatLng>()
                for (i in 0 until targetObject.length()) {
                    val coordObj = targetObject.getJSONObject(i)
                    if (!coordObj.has("lat") || !coordObj.has("lng")) {
                        throw InvalidArgumentsError("One of the LatLng objects is missing 'lat' and/or 'lng'")
                    }
                    val lat = coordObj.getDouble("lat")
                    val lng = coordObj.getDouble("lng")
                    list.add(LatLng(lat, lng))
                }
                target = list.toTypedArray()
            }
        }
    }


}