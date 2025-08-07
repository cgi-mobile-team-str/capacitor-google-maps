package com.capacitorjs.plugins.googlemaps

import android.util.Size
import org.json.JSONObject

class CapacitorMarkerIcon(fromJSONObject: JSONObject) {
    var url: String? = null
    var size: Size? =  null
    var anchor: Array<Float>? = null

    init {
        url = fromJSONObject.optString("url")
        if (fromJSONObject.has("size")) {
            val sizeObject = fromJSONObject.getJSONObject("size")
            size = Size(
                sizeObject.optInt("width", 0),
                sizeObject.optInt("height", 0)
            )
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
    }
}