package com.capacitorjs.plugins.googlemaps

import com.google.android.gms.maps.model.LatLng
import org.json.JSONObject

class GoogleMapCameraConfig(fromJSONObject: JSONObject) {
    var coordinate: LatLng? = null
    var coordinates: Array<LatLng>? = null
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

        if (fromJSONObject.has("coordinate")) {
            val coordinateJSONObject = fromJSONObject.getJSONObject("coordinate")
            if(!coordinateJSONObject.has("lat") || !coordinateJSONObject.has("lng")) {
                throw InvalidArgumentsError("LatLng object is missing the required 'lat' and/or 'lng' property")
            }

            val lat = coordinateJSONObject.getDouble("lat")
            val lng = coordinateJSONObject.getDouble("lng")
            coordinate = LatLng(lat, lng)
        } else {
            coordinate = null
        }

        if (fromJSONObject.has("coordinates")) {
            val coordinatesJSONArray = fromJSONObject.getJSONArray("coordinates")
            val list = mutableListOf<LatLng>()
            for (i in 0 until coordinatesJSONArray.length()) {
                val coordObj = coordinatesJSONArray.getJSONObject(i)
                if (!coordObj.has("lat") || !coordObj.has("lng")) {
                    throw InvalidArgumentsError("One of the LatLng objects is missing 'lat' and/or 'lng'")
                }
                val lat = coordObj.getDouble("lat")
                val lng = coordObj.getDouble("lng")
                list.add(LatLng(lat, lng))
            }
            coordinates = list.toTypedArray()
        }
        else {
            coordinates = null
        }
    }


}