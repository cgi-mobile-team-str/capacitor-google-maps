package com.capacitorjs.plugins.googlemaps

import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MapStyleOptions
import org.json.JSONObject

class  CapacitorMarkerOptions(fromJSONObject: JSONObject) {
    var icon: CapacitorMarkerIcon? = null
    var title: String? = null
    var snippet: String? = null
    var position: LatLng = LatLng(0.0, 0.0)
    var infoWindowAnchor: Array<Float>? = null
    var anchor: Array<Float>? = null
    var draggable: Boolean = false
    var flat: Boolean = false
    var rotation: Float = 0f
    var visible: Boolean = true
    var animation: String? = null
    var zIndex: Float? = null
    var disableAutoPan: Boolean? = null
    var alpha: Float? = 1f
    var extras: MutableMap<String, Any?> = mutableMapOf()

    init {
        val propertyNames = mutableSetOf(
            "icon",
            "title",
            "snippet",
            "position",
            "infoWindowAnchor",
            "anchor",
            "draggable",
            "flat",
            "rotation",
            "visible",
            "animation",
            "zIndex",
            "disableAutoPan",
            "alpha",
            "extras"
        )
        val keys = fromJSONObject.keys()

        if(fromJSONObject.has("icon")) {
            val iconObj = fromJSONObject.getJSONObject("icon")
            icon =  CapacitorMarkerIcon(iconObj)
        }
        title = fromJSONObject.optString("title")
        snippet = fromJSONObject.optString("snippet")
        if(fromJSONObject.has("position")) {
            val latLngObj = fromJSONObject.getJSONObject("position")
            position = LatLng(latLngObj.getDouble("lat"), latLngObj.getDouble("lng"))
        }
        if (fromJSONObject.has("infoWindowAnchor")) {
            val infoWindowAnchorJSONArray = fromJSONObject.getJSONArray("infoWindowAnchor")
            val list = mutableListOf<Float>()
            for (i in 0 until infoWindowAnchorJSONArray.length()) {
                val infoWindowAnchorNumber = infoWindowAnchorJSONArray.getDouble(i).toFloat()
                list.add(infoWindowAnchorNumber)
            }
            infoWindowAnchor = list.toTypedArray()
        }
        if (fromJSONObject.has("anchor")) {
            val anchorJSONArray = fromJSONObject.getJSONArray("anchor")
            val list = mutableListOf<Float>()
            for (i in 0 until anchorJSONArray.length()) {
                val anchorNumber = anchorJSONArray.getDouble(i).toFloat()
                list.add(anchorNumber)
            }
            anchor = list.toTypedArray()
        }
        draggable = fromJSONObject.optBoolean("draggable", false)
        flat = fromJSONObject.optBoolean("flat", false)
        rotation = fromJSONObject.optDouble("rotation", 0.0).toFloat()
        visible = fromJSONObject.optBoolean("visible", true)
        animation = fromJSONObject.optString("animation")
        disableAutoPan = fromJSONObject.optBoolean("disableAutoPan")
        alpha = fromJSONObject.optDouble("alpha", 1.0).toFloat()
        while (keys.hasNext()) {
            val key = keys.next()
            if (key !in propertyNames) {
                extras[key] = fromJSONObject.get(key)
            }
        }
    }
}