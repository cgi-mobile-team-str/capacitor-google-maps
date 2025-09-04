package com.capacitorjs.plugins.googlemaps

import android.graphics.Color
import android.util.Size
import androidx.core.math.MathUtils
import com.google.android.gms.maps.model.*
import com.google.maps.android.clustering.ClusterItem
import org.json.JSONObject


class CapacitorGoogleMapMarker(): ClusterItem {
    var id: String? = ""
    var coordinate: LatLng = LatLng(0.0, 0.0)
    var opacity: Float = 1.0f
    private var title: String = ""
    private var snippet: String = ""
    var zIndex: Float = 0.0f
    var isFlat: Boolean = false
    var iconUrl: String? = null
    var iconSize: Size? = null
    var iconAnchor: CapacitorGoogleMapsPoint? = null
    var draggable: Boolean = false
    var googleMapMarker: Marker? = null
    var colorHue: Float? = null
    var markerOptions: MarkerOptions? = null
    var isVisible: Boolean = true
    var extras: MutableMap<String, Any?> = mutableMapOf()
    var clickable: Boolean = true
    var rotation: Float? = 0.0f

    constructor(fromJSONObject: JSONObject): this() {
        if (!fromJSONObject.has("coordinate")) {
            throw InvalidArgumentsError("Marker object is missing the required 'coordinate' property")
        }

        val latLngObj = fromJSONObject.getJSONObject("coordinate")
        if (!latLngObj.has("lat") || !latLngObj.has("lng")) {
            throw InvalidArgumentsError("LatLng object is missing the required 'lat' and/or 'lng' property")
        }

        coordinate = LatLng(latLngObj.getDouble("lat"), latLngObj.getDouble("lng"))
        title = fromJSONObject.optString("title")
        opacity = fromJSONObject.optDouble("opacity", 1.0).toFloat()
        snippet = fromJSONObject.optString("snippet")
        isFlat = fromJSONObject.optBoolean("isFlat", false)
        isVisible = fromJSONObject.optBoolean("isVisible", true)
        iconUrl = fromJSONObject.optString("iconUrl")
        id = fromJSONObject.optString("id")
        if (fromJSONObject.has("iconSize")) {
            val iconSizeObject = fromJSONObject.getJSONObject("iconSize")
            iconSize = Size(iconSizeObject.optInt("width", 0), iconSizeObject.optInt("height", 0))
        }

        if (fromJSONObject.has("iconAnchor")) {
            val inputAnchorPoint = CapacitorGoogleMapsPoint(fromJSONObject.getJSONObject("iconAnchor"))
            iconAnchor = CapacitorGoogleMapsUtils.buildIconAnchorPoint(inputAnchorPoint, iconSize)
        }

        if (fromJSONObject.has("tintColor")) {
            val tintColorObject = fromJSONObject.getJSONObject("tintColor")

            val r = MathUtils.clamp(tintColorObject.optDouble("r", 0.00), 0.00, 255.0)
            val g = MathUtils.clamp(tintColorObject.optDouble("g", 0.00), 0.00, 255.0)
            val b = MathUtils.clamp(tintColorObject.optDouble("b", 0.00), 0.00, 255.0)

            val hsl = FloatArray(3)
            Color.RGBToHSV(r.toInt(), g.toInt(), b.toInt(), hsl)

            colorHue = hsl[0]
        }

        draggable = fromJSONObject.optBoolean("draggable", false)
        zIndex = fromJSONObject.optLong("zIndex").toFloat()
        clickable = fromJSONObject.optBoolean("clickable", true)
        rotation = fromJSONObject.optLong("rotation").toFloat()
    }

    constructor(options: CapacitorMarkerOptions) : this() {
        id = options.id
        coordinate = options.position
        opacity = options.alpha ?: 1.0f
        title = options.title ?: ""
        snippet = options.snippet ?: ""
        zIndex = options.zIndex ?: 0.0f
        isFlat = options.flat
        iconUrl = options.icon?.url
        iconSize = options.icon?.size
        val x = options.icon?.anchor?.get(0) ?: options.anchor?.get(0)
        val y = options.icon?.anchor?.get(1) ?: options.anchor?.get(1)
        if( x != null && y != null) {
            val inputAnchorPoint = CapacitorGoogleMapsPoint(x , y)
            iconAnchor = CapacitorGoogleMapsUtils.buildIconAnchorPoint(inputAnchorPoint, iconSize)
        }
        draggable = options.draggable
        isVisible = options.visible
        extras = options.extras
        clickable = options.clickable
        rotation = options.rotation
    }

    override fun getPosition(): LatLng {
        return LatLng(coordinate.latitude, coordinate.longitude)
    }

    override fun getTitle(): String {
        return title
    }

    override fun getSnippet(): String {
        return snippet
    }

    override fun getZIndex(): Float {
        return zIndex
    }

    fun setIcon(url: String?, size: Size?) {
        if(url != null) {
            this.iconUrl = url
        }
        if(size != null) {
            this.iconSize = size
        }
    }
}