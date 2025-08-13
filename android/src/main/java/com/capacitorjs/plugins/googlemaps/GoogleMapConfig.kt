package com.capacitorjs.plugins.googlemaps

import com.google.android.gms.maps.GoogleMapOptions
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import org.json.JSONObject

class GoogleMapConfig(fromJSONObject: JSONObject): GoogleMapSettings {
    var width: Int = 0
    var height: Int = 0
    var x: Int = 0
    var y: Int = 0
    var googleMapOptions: GoogleMapOptions? = null
    var liteMode: Boolean = false
    var devicePixelRatio: Float = 1.00f
    var styles: String? = null
    var mapId: String? = null
    override var controls: GoogleMapControls? = null
    override var gestures: GoogleMapGestures? = null
    override var preferences: GoogleMapsPreferences? = null
    var camera: GoogleMapCameraConfig? = null

    init {
        if (!fromJSONObject.has("width")) {
            throw InvalidArgumentsError(
                    "GoogleMapConfig object is missing the required 'width' property"
            )
        }

        if (!fromJSONObject.has("height")) {
            throw InvalidArgumentsError(
                    "GoogleMapConfig object is missing the required 'height' property"
            )
        }

        if (!fromJSONObject.has("x")) {
            throw InvalidArgumentsError(
                    "GoogleMapConfig object is missing the required 'x' property"
            )
        }

        if (!fromJSONObject.has("y")) {
            throw InvalidArgumentsError(
                    "GoogleMapConfig object is missing the required 'y' property"
            )
        }

        if (fromJSONObject.has("devicePixelRatio")) {
            devicePixelRatio = fromJSONObject.getDouble("devicePixelRatio").toFloat()
        }

        liteMode =
                fromJSONObject.has("androidLiteMode") &&
                        fromJSONObject.getBoolean("androidLiteMode")

        width = fromJSONObject.getInt("width")
        height = fromJSONObject.getInt("height")
        x = fromJSONObject.getInt("x")
        y = fromJSONObject.getInt("y")
        if (fromJSONObject.has("camera")) {
            val cameraObject = fromJSONObject.getJSONObject("camera")
            camera = GoogleMapCameraConfig(cameraObject)
        }

        val zoom = camera?.zoom ?: 11.0
        var center = LatLng(0.0, 0.0)
        val target = camera?.target
        if(target != null) {
            if (target is LatLng) {
                center = target
            }

            if(target is Array<*> && target.isArrayOf<LatLng>()) {
                val latlngBounds = CapacitorGoogleMapsUtils.createLatLngBoundsFromLatLngArray(target as Array<LatLng>)
                center = latlngBounds.center
            }
        }
        val cameraPosition = CameraPosition(center, zoom.toFloat(), 0.0F, 0.0F)

        styles = fromJSONObject.getString("styles")

        mapId = fromJSONObject.getString("androidMapId")

        googleMapOptions = GoogleMapOptions().camera(cameraPosition).liteMode(liteMode)
        if (mapId != null) {
            googleMapOptions?.mapId(mapId!!)
        }

        if (fromJSONObject.has("controls")) {
            val controlsObject = fromJSONObject.getJSONObject("controls")
            controls = GoogleMapControls(controlsObject)
        }

        if (fromJSONObject.has("gestures")) {
            val gesturesObject = fromJSONObject.getJSONObject("gestures")
            gestures = GoogleMapGestures(gesturesObject)
        }

        if (fromJSONObject.has("preferences")) {
            val preferencesObject = fromJSONObject.getJSONObject("preferences")
            preferences = GoogleMapsPreferences(preferencesObject)
        }
    }
}
