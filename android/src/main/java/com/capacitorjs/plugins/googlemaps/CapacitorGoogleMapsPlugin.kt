package com.capacitorjs.plugins.googlemaps

import android.Manifest
import android.annotation.SuppressLint
import android.graphics.Color
import android.graphics.RectF
import android.util.Log
import android.util.Size
import android.view.MotionEvent
import android.view.View
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import com.google.android.gms.maps.MapsInitializer
import com.google.android.gms.maps.OnMapsSdkInitializedCallback
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.google.android.gms.maps.model.Polyline
import com.google.android.gms.maps.model.VisibleRegion
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import kotlin.collections.component1
import kotlin.collections.component2

@CapacitorPlugin(
        name = "CapacitorGoogleMaps",
        permissions =
                [
                        Permission(
                                strings = [Manifest.permission.ACCESS_FINE_LOCATION],
                                alias = CapacitorGoogleMapsPlugin.LOCATION
                        ),
                ],
)
class CapacitorGoogleMapsPlugin : Plugin(), OnMapsSdkInitializedCallback {
    private var maps: HashMap<String, CapacitorGoogleMap> = HashMap()
    private var cachedTouchEvents: HashMap<String, MutableList<MotionEvent>> = HashMap()
    private val tag: String = "CAP-GOOGLE-MAPS"
    private var touchEnabled: HashMap<String, Boolean> = HashMap()

    companion object {
        const val LOCATION = "location"
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun load() {
        super.load()

        MapsInitializer.initialize(this.context, MapsInitializer.Renderer.LATEST, this)


        this.bridge.webView.setOnTouchListener(
                object : View.OnTouchListener {
                    override fun onTouch(v: View?, event: MotionEvent?): Boolean {
                        if (event != null) {
                            if (event.source == -1) {
                                return v?.onTouchEvent(event) ?: true
                            }

                            val touchX = event.x
                            val touchY = event.y

                            for ((id, map) in maps) {
                                if (touchEnabled[id] == false) {
                                    continue
                                }
                                val mapRect = map.getMapBounds()
                                if (mapRect.contains(touchX.toInt(), touchY.toInt())) {
                                    if (event.action == MotionEvent.ACTION_DOWN) {
                                        if (cachedTouchEvents[id] == null) {
                                            cachedTouchEvents[id] = mutableListOf<MotionEvent>()
                                        }

                                        cachedTouchEvents[id]?.clear()
                                    }

                                    val motionEvent = MotionEvent.obtain(event)
                                    cachedTouchEvents[id]?.add(motionEvent)

                                    val payload = JSObject()
                                    payload.put("x", touchX / map.config.devicePixelRatio)
                                    payload.put("y", touchY / map.config.devicePixelRatio)
                                    payload.put("mapId", map.id)

                                    notifyListeners("isMapInFocus", payload)
                                    return true
                                }
                            }
                        }

                        return v?.onTouchEvent(event) ?: true
                    }
                }
        )
    }

    override fun onMapsSdkInitialized(renderer: MapsInitializer.Renderer) {
        when (renderer) {
            MapsInitializer.Renderer.LATEST -> Logger.debug("Capacitor Google Maps", "Latest Google Maps renderer enabled")
            MapsInitializer.Renderer.LEGACY -> Logger.debug("Capacitor Google Maps", "Legacy Google Maps renderer enabled - Cloud based map styling and advanced drawing not available")
        }
    }

    override fun handleOnStart() {
        super.handleOnStart()
        maps.forEach { it.value.onStart() }
    }

    override fun handleOnResume() {
        super.handleOnResume()
        maps.forEach { it.value.onResume() }
    }

    override fun handleOnPause() {
        super.handleOnPause()
        maps.forEach { it.value.onPause() }
    }

    override fun handleOnStop() {
        super.handleOnStop()
        maps.forEach { it.value.onStop() }
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        maps.forEach { it.value.onDestroy() }
    }

    @PluginMethod
    fun create(call: PluginCall) {
        try {
            val id = call.getString("id")

            if (null == id || id.isEmpty()) {
                throw InvalidMapIdError()
            }

            val configObject =
                    call.getObject("config")
                            ?: throw InvalidArgumentsError("config object is missing")

            val forceCreate = call.getBoolean("forceCreate", false)!!

            val config = GoogleMapConfig(configObject)

            if (maps.contains(id)) {
                if (!forceCreate) {
                    call.resolve()
                    return
                }

                val oldMap = maps.remove(id)
                oldMap?.destroy()
            }

            val newMap = CapacitorGoogleMap(id, config, this)
            maps[id] = newMap

            call.resolve()
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun destroy(call: PluginCall) {
        try {
            val id = call.getString("id")

            if (null == id || id.isEmpty()) {
                throw InvalidMapIdError()
            }

            val removedMap = maps.remove(id) ?: throw MapNotFoundError()
            removedMap.destroy()

            call.resolve()
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun getVisibleRegion(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.getVisibleRegion() {region, err ->
                if (err != null) {
                    throw err
                }
                val data = JSObject()
                data.put("nearLeft", CapacitorGoogleMapsUtils.latLngToJSObject(region?.nearLeft))
                data.put("nearRight", CapacitorGoogleMapsUtils.latLngToJSObject(region?.nearRight))
                data.put("farLeft", CapacitorGoogleMapsUtils.latLngToJSObject(region?.farLeft))
                data.put("farRight", CapacitorGoogleMapsUtils.latLngToJSObject(region?.farRight))
                data.put("southwest", CapacitorGoogleMapsUtils.latLngToJSObject(region?.latLngBounds?.southwest))
                data.put("northeast", CapacitorGoogleMapsUtils.latLngToJSObject(region?.latLngBounds?.northeast))
                call.resolve(data)
            }
        }
        catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun enableCompass(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val enabled = call.getBoolean("enabled") ?: throw InvalidArgumentsError("enabled arg of enableCompass is missing")

            map.enableCompass(enabled) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }
        }
        catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun enableToolbar(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val isEnabled = call.getBoolean("isEnabled", false)
            isEnabled ?: throw InvalidArgumentsError("isEnabled arg of enableToolbar is missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.enableToolbar(isEnabled) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }
        }
        catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun enableMyLocation(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val isEnabled = call.getBoolean("isEnabled", false)
            isEnabled ?: throw InvalidArgumentsError("isEnabled arg of enableMyLocation is missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.enableMyLocation(isEnabled) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }
        }
        catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun enableAllGestures(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val isEnabled = call.getBoolean("isEnabled", false)
            isEnabled ?: throw InvalidArgumentsError("isEnabled arg of enableAllGestures is missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.enableAllGestures(isEnabled) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }
        }
        catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun enableTiltGesture(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val isEnabled = call.getBoolean("isEnabled", false)
            isEnabled ?: throw InvalidArgumentsError("isEnabled arg of enableTiltGesture is missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.enableTiltGesture(isEnabled) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }
        }
        catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun enableTiltRotateGesture(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val isEnabled = call.getBoolean("isEnabled", false)
            isEnabled ?: throw InvalidArgumentsError("isEnabled arg of enableTiltRotateGesture is missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.enableTiltRotateGesture(isEnabled) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }
        }
        catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun setMapPreferences(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val paddingObj = call.getObject("padding", null)
            val building = call.getBoolean("building", false)

            val map = maps[id]
            map ?: throw MapNotFoundError()

            var padding: GoogleMapPadding? = null
            if(paddingObj != null) {
                 padding = GoogleMapPadding(paddingObj)
            }

            map.setMapPreferences(padding, building) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }
        }
        catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun enableTouch(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()
            touchEnabled[id] = true
            call.resolve()
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun disableTouch(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()
            touchEnabled[id] = false
            call.resolve()
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun enableClustering(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val minClusterSize = call.getInt("minClusterSize")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.enableClustering(minClusterSize,  { err ->
                if (err != null) {
                    throw err
                }

                call.resolve()
            })
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun disableClustering(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.disableClustering { err ->
                if (err != null) {
                    throw err
                }

                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun removeMarker(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val markerId = call.getString("markerId")
            markerId ?: throw InvalidArgumentsError("markerId is invalid or missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.removeMarker(markerId) { err ->
                if (err != null) {
                    throw err
                }

                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun removeMarkers(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val markerIdsArray = call.getArray("markerIds")
            markerIdsArray ?: throw InvalidArgumentsError("markerIds are invalid or missing")

            if (markerIdsArray.length() == 0) {
                throw InvalidArgumentsError("markerIds requires at least one marker id")
            }

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val markerIds: MutableList<String> = mutableListOf()

            for (i in 0 until markerIdsArray.length()) {
                val markerId = markerIdsArray.getString(i)
                markerIds.add(markerId)
            }

            map.removeMarkers(markerIds) { err ->
                if (err != null) {
                    throw err
                }

                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun removePolylines(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val lineIdsArray = call.getArray("polylineIds")
            lineIdsArray ?: throw InvalidArgumentsError("polylineIds are invalid or missing")

            if (lineIdsArray.length() == 0) {
                throw InvalidArgumentsError("polylineIds requires at least one line id")
            }

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val lineIds: MutableList<String> = mutableListOf()

            for (i in 0 until lineIdsArray.length()) {
                val markerId = lineIdsArray.getString(i)
                lineIds.add(markerId)
            }

            map.removePolylines(lineIds) { err ->
                if (err != null) {
                    throw err
                }

                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun animateCamera(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val cameraConfigObject =
                    call.getObject("config")
                            ?: throw InvalidArgumentsError("config object is missing")

            val config = GoogleMapCameraConfig(cameraConfigObject)

            map.animateCamera(config) { err ->
                if (err != null) {
                    throw err
                }

                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun moveCamera(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val cameraConfigObject =
                call.getObject("config")
                    ?: throw InvalidArgumentsError("config object is missing")

            val config = GoogleMapCameraConfig(cameraConfigObject)

            map.moveCamera(config) { err ->
                if (err != null) {
                    throw err
                }

                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun setCameraBearing(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val bearing =
                call.getDouble("bearing")
                    ?: throw InvalidArgumentsError("bearing is missing")

            map.setCameraBearing(bearing) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun setCameraTarget(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val targetArray = call.getArray("target")
            val targetObj = call.getObject("target")

            if(targetObj == null && targetArray == null) {
                throw InvalidArgumentsError("target is missing")
            }

            if (targetArray != null) {
                val targets: MutableList<LatLng> = ArrayList()
                for (i in 0 until targetArray.length()) {
                    val targetObj = targetArray.getJSONObject(i)
                    val target = LatLng(targetObj.getDouble("lat"), targetObj.getDouble("lng"))
                    targets.add(target)
                }
                map.setCameraTarget(targets) { err ->
                    if (err != null) throw err
                    call.resolve()
                }
            }

            if (targetObj != null) {
                val target = LatLng(targetObj.getDouble("lat"), targetObj.getDouble("lng"))
                map.setCameraTarget(target) { err ->
                    if (err != null) throw err
                    call.resolve()
                }
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun setOptions(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val optionsObject =
                call.getObject("config")
                    ?: throw InvalidArgumentsError("config object is missing")

            val config = GoogleMapsOptions(optionsObject)

            map.setOptions(config) { err ->
                if (err != null) {
                    throw err
                }

                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun getCameraZoom(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.getCameraZoom() { cameraZoom, err ->

                if (err != null) {
                    throw err
                }
                val data = JSObject()
                data.put("cameraZoom", cameraZoom)
                call.resolve(data)
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun getCameraTarget(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.getCameraTarget() { cameraTarget, err ->
                if (err != null) {
                    throw err
                }
                val data = JSObject()
                val targetObj = CapacitorGoogleMapsUtils.latLngToJSObject(cameraTarget)
                data.put("cameraTarget", targetObj)
                call.resolve(data)
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }


    @PluginMethod
    fun getMapType(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.getMapType() { type, err ->

                if (err != null) {
                    throw err
                }
                val data = JSObject()
                data.put("type", type)
                call.resolve(data)
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun setMapType(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val mapType =
                    call.getString("mapType") ?: throw InvalidArgumentsError("mapType is missing")

            map.setMapType(mapType) { err ->
                if (err != null) {
                    throw err
                }

                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun enableIndoorMaps(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val enabled =
                    call.getBoolean("enabled") ?: throw InvalidArgumentsError("enabled is missing")

            map.enableIndoorMaps(enabled) { err ->
                if (err != null) {
                    throw err
                }

                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun enableTrafficLayer(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val enabled =
                    call.getBoolean("enabled") ?: throw InvalidArgumentsError("enabled is missing")

            map.enableTrafficLayer(enabled) { err ->
                if (err != null) {
                    throw err
                }

                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun enableCurrentLocation(call: PluginCall) {
        if (getPermissionState(LOCATION) != PermissionState.GRANTED) {
            requestAllPermissions(call, "enableCurrentLocationCallback")
        } else {
            internalEnableCurrentLocation(call)
        }
    }

    @PermissionCallback
    fun enableCurrentLocationCallback(call: PluginCall) {
        if (getPermissionState(LOCATION) == PermissionState.GRANTED) {
            internalEnableCurrentLocation(call)
        } else {
            call.reject("location permission was denied")
        }
    }

    @PluginMethod
    fun setPadding(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val paddingObj =
                    call.getObject("padding") ?: throw InvalidArgumentsError("padding is missing")

            val padding = GoogleMapPadding(paddingObj)

            map.setPadding(padding) { err ->
                if (err != null) {
                    throw err
                }

                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun enableAccessibilityElements(call: PluginCall) {
        call.unavailable("this call is not available on android")
    }

    @PluginMethod
    fun onScroll(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val boundsObj =
                    call.getObject("mapBounds")
                            ?: throw InvalidArgumentsError("mapBounds object is missing")

            val bounds = boundsObjectToRect(boundsObj)

            map.updateRender(bounds)

            call.resolve()
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun onResize(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val boundsObj =
                    call.getObject("mapBounds")
                            ?: throw InvalidArgumentsError("mapBounds object is missing")

            val bounds = boundsObjectToRect(boundsObj)

            map.updateRender(bounds)

            call.resolve()
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun onDisplay(call: PluginCall) {
        call.unavailable("this call is not available on android")
    }

    @PluginMethod
    fun dispatchMapEvent(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val focus = call.getBoolean("focus", false)!!

            val events = cachedTouchEvents[id]
            if (events != null) {
                while(events.size > 0) {
                    val event = events.first()
                    if (focus) {
                        map.dispatchTouchEvent(event)
                    } else {
                        this.bridge.webView.onTouchEvent(event)
                    }
                    events.removeAt(0)
                }
            }

            call.resolve()
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun getMapBounds(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            CoroutineScope(Dispatchers.Main).launch {
                val bounds = map.getLatLngBounds()
                val data = getLatLngBoundsJSObject(bounds)
                call.resolve(data)
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun mapBoundsContains(call: PluginCall) {
        try {
            val boundsObject = call.getObject("bounds")
            val pointObject = call.getObject("point")

            CoroutineScope(Dispatchers.Main).launch {
                val bounds = createLatLngBounds(boundsObject)
                val point = createLatLng(pointObject)
                val contains = bounds.contains(point)
                val data = JSObject()
                data.put("contains", contains)
                call.resolve(data)
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun fitBounds(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val boundsObject =
                call.getObject("bounds") ?: throw InvalidArgumentsError("bounds is missing")

            val padding = call.getInt("padding", 0)!!

            CoroutineScope(Dispatchers.Main).launch {
                val bounds = createLatLngBounds(boundsObject)
                map.fitBounds(bounds, padding)
                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun mapBoundsExtend(call: PluginCall) {
        try {
            val boundsObject = call.getObject("bounds")
            val pointObject = call.getObject("point")

            CoroutineScope(Dispatchers.Main).launch {
                val bounds = createLatLngBounds(boundsObject)
                val point = createLatLng(pointObject)
                val newBounds = bounds.including(point)
                val data = JSObject()
                data.put("bounds", getLatLngBoundsJSObject(newBounds))
                call.resolve(data)
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    // BEGIN MARKER METHODS

    @PluginMethod
    fun addMarker(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val optionsObj = call.getObject("options", null)
            optionsObj ?: throw InvalidArgumentsError("options object is missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val options = CapacitorMarkerOptions(optionsObj)
            map.addMarker(options) { result ->
                val pairIdMarker = result.getOrThrow()
                val res = createMarkerJSObject(pairIdMarker, id)
                call.resolve(res)
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
     fun addMarkers(call: PluginCall) {
         try {
             val id = call.getString("id")
             id ?: throw InvalidMapIdError()

             val optionsArray = call.getArray("optionsList", null)
             optionsArray ?: throw InvalidArgumentsError("options array is missing")

             if (optionsArray.length() == 0) {
                 throw InvalidArgumentsError("options array requires at least one option")
             }

             val map = maps[id]
             map ?: throw MapNotFoundError()

             val optionsList: MutableList<CapacitorMarkerOptions> = mutableListOf()

             for (i in 0 until optionsArray.length()) {
                 val optionObj = optionsArray.getJSONObject(i)
                 val opts = CapacitorMarkerOptions(optionObj)

                 optionsList.add(opts)
             }

             map.addMarkers(optionsList) { result ->
                 val pairsIdMarker = result.getOrThrow()
                 val results = JSONArray()
                 pairsIdMarker.forEach {
                     val pairObj = createMarkerJSObject(it, id)
                     results.put(pairObj)
                 }

                 val res = JSObject()
                 res.put("markers", results)
                 call.resolve(res)
             }
         } catch (e: GoogleMapsError) {
             handleError(call, e)
         } catch (e: Exception) {
             handleError(call, e)
         }
     }

    @PluginMethod
    fun setMarkerIcon(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val markerId = call.getString("markerId")
            markerId ?: throw InvalidArgumentsError("markerId is invalid or missing")

            val url = call.getString("url")

            val sizeObj = call.getObject("size")
            var size: Size? = null
            if(sizeObj != null) {
                size = Size(sizeObj.optInt("width"), sizeObj.optInt("height"))
            }
            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.setMarkerIcon(markerId, url, size) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun setMarkerIconAnchor(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val markerId = call.getString("markerId")
            markerId ?: throw InvalidArgumentsError("markerId is invalid or missing")

            val x = call.getFloat("x")
            x ?: throw InvalidArgumentsError("x is invalid or missing")

            val y = call.getFloat("y")
            y ?: throw InvalidArgumentsError("y is invalid or missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.setMarkerIconAnchor(markerId, x, y) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun setMarkerZIndex(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val markerId = call.getString("markerId")
            markerId ?: throw InvalidArgumentsError("markerId is invalid or missing")

            val zIndex = call.getFloat("zIndex")
            zIndex ?: throw InvalidArgumentsError("zIndex is invalid or missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.setMarkerZIndex(markerId, zIndex) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun setMarkerVisibility(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val markerId = call.getString("markerId")
            markerId ?: throw InvalidArgumentsError("markerId is invalid or missing")

            val isVisible = call.getBoolean("isVisible")
            isVisible ?: throw InvalidArgumentsError("isVisible is invalid or missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.setMarkerVisibility(markerId, isVisible) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }


    @PluginMethod
    fun getMarkerPosition(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val markerId = call.getString("markerId")
            markerId ?: throw InvalidArgumentsError("markerId is invalid or missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.getMarkerPosition(markerId) { position, err ->
                if (err != null) {
                    throw err
                }
                val data = JSObject()
                data.put("position", CapacitorGoogleMapsUtils.latLngToJSObject(position))
                call.resolve(data)
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun isMarkerRemoved(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val markerId = call.getString("markerId")
            markerId ?: throw InvalidArgumentsError("markerId is invalid or missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.isMarkerRemoved(markerId) { isRemoved, err ->
                if (err != null) {
                    throw err
                }
                val data = JSObject()
                data.put("isRemoved", isRemoved)
                call.resolve(data)
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    // END MARKER METHODS

    // BEGIN POLYLINE METHODS

    @PluginMethod
    fun addPolyline(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val optionsObj = call.getObject("options", null)
            optionsObj ?: throw InvalidArgumentsError("options object is missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val options = CapacitorPolylineOptions(optionsObj)
            map.addPolyline(options) { result ->
                val pairIdPolyline = result.getOrThrow()
                val res = createPolylineJSObject(pairIdPolyline,id)
                call.resolve(res)
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
     fun addPolylines(call: PluginCall) {
         try  {
             val id = call.getString("id")
             id ?: throw InvalidMapIdError()

             val optionsArray = call.getArray("optionsList", null)
             optionsArray ?: throw InvalidArgumentsError("options array is missing")

             if (optionsArray.length() == 0) {
                 throw InvalidArgumentsError("options requires at least one option")
             }

             val map = maps[id]
             map ?: throw MapNotFoundError()

             val optionsList: MutableList<CapacitorPolylineOptions> = mutableListOf()

             for (i in 0 until optionsArray.length()) {
                 val optionObj = optionsArray.getJSONObject(i)
                 val opts = CapacitorPolylineOptions(optionObj)

                 optionsList.add(opts)
             }

             map.addPolylines(optionsList) { result ->
                 val pairsIdPolyline = result.getOrThrow()

                 val results = JSONArray()
                 pairsIdPolyline.forEach {
                     val pairObj = createPolylineJSObject(it, id)
                     results.put(pairObj)
                 }

                 val res = JSObject()
                 res.put("polylines", results)
                 call.resolve(res)
             }

         } catch (e: GoogleMapsError) {
             handleError(call, e)
         } catch (e: Exception) {
             handleError(call, e)
         }
     }

    @PluginMethod
    fun setPolylineStrokeColor(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val polylineId = call.getString("polylineId", null)
            polylineId ?: throw InvalidArgumentsError("polylineId is missing or invalid")

            val strokeColor = call.getString("strokeColor", null)
            strokeColor ?: throw InvalidArgumentsError("strokeColor is missing or invalid")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.setPolylineStrokeColor(polylineId, strokeColor) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }

        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun setPolylineStrokeWidth(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val polylineId = call.getString("polylineId", null)
            polylineId ?: throw InvalidArgumentsError("polylineId is missing or invalid")

            val strokeWidth = call.getFloat("strokeWidth", null)
            strokeWidth ?: throw InvalidArgumentsError("strokeWidth is missing or invalid")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.setPolylineStrokeWidth(polylineId, strokeWidth) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }

        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun removePolyline(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val polylineId = call.getString("polylineId")
            polylineId ?: throw InvalidArgumentsError("polylineId is invalid or missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.removePolyline(polylineId) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun isPolylineRemoved(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val polylineId = call.getString("polylineId")
            polylineId ?: throw InvalidArgumentsError("polylineId is invalid or missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.isPolylineRemoved (polylineId) { isRemoved, err ->
                if (err != null) {
                    throw err
                }
                val data = JSObject()
                data.put("isRemoved", isRemoved)
                call.resolve(data)
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    // END POLYLINE METHODS

    // BEGIN CIRCLE METHODS

    @PluginMethod
    fun addCircles(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val optionsArray = call.getArray("optionsList", null)
            optionsArray ?: throw InvalidArgumentsError("options array is missing")

            if (optionsArray.length() == 0) {
                throw InvalidArgumentsError("options requires at least one option")
            }

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val optionsList: MutableList<CapacitorCircleOptions> = mutableListOf()

            for (i in 0 until optionsArray.length()) {
                val optionObj = optionsArray.getJSONObject(i)
                val opts = CapacitorCircleOptions(optionObj)

                optionsList.add(opts)
            }

            map.addCircles(optionsList) { result ->
                val pairsIdCircle = result.getOrThrow()

                val results = JSONArray()
                pairsIdCircle.forEach {
                    val pairObj = createCircleJSObject(it, id)
                    results.put(pairObj)
                }

                val res = JSObject()
                res.put("circles", results)
                call.resolve(res)
            }

        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun removeCircles(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val circleIdsArray = call.getArray("circleIds")
            circleIdsArray ?: throw InvalidArgumentsError("circleIds are invalid or missing")

            if (circleIdsArray.length() == 0) {
                throw InvalidArgumentsError("circleIds requires at least one circle id")
            }

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val circleIds: MutableList<String> = mutableListOf()

            for (i in 0 until circleIdsArray.length()) {
                val circleId = circleIdsArray.getString(i)
                circleIds.add(circleId)
            }

            map.removeCircles(circleIds) { err ->
                if (err != null) {
                    throw err
                }

                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun addCircle(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val optionsObj = call.getObject("options", null)
            optionsObj ?: throw InvalidArgumentsError("options object is missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val options = CapacitorCircleOptions(optionsObj)
            map.addCircle(options) { result ->
                val pairIdCircle = result.getOrThrow()
                val res = createCircleJSObject(pairIdCircle,id)
                call.resolve(res)
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun setCircleCenter(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val circleId = call.getString("circleId", null)
            circleId ?: throw InvalidArgumentsError("circleId is missing or invalid")

            val centerObj = call.getObject("center", null)
            centerObj ?: throw InvalidArgumentsError("center is missing or invalid")
            val center: LatLng = LatLng(centerObj.getDouble("lat"), centerObj.getDouble("lng"))

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.setCircleCenter(circleId, center) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }

        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun removeCircle(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val circleId = call.getString("circleId")
            circleId ?: throw InvalidArgumentsError("circleId is invalid or missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.removeCircle(circleId) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    // END CIRCLE METHODS

    // BEGIN POLYGON METHODS

    @PluginMethod
    fun addPolygons(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val optionsArray = call.getArray("optionsList", null)
            optionsArray ?: throw InvalidArgumentsError("options array is missing")

            if (optionsArray.length() == 0) {
                throw InvalidArgumentsError("options requires at least one option")
            }

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val optionsList: MutableList<CapacitorPolygonOptions> = mutableListOf()

            for (i in 0 until optionsArray.length()) {
                val optionObj = optionsArray.getJSONObject(i)
                val opts = CapacitorPolygonOptions(optionObj)

                optionsList.add(opts)
            }

            map.addPolygons(optionsList) { result ->
                val pairsIdPolygon = result.getOrThrow()

                val results = JSONArray()
                pairsIdPolygon.forEach {
                    val pairObj = createPolygonJSObject(it, id)
                    results.put(pairObj)
                }

                val res = JSObject()
                res.put("polygons", results)
                call.resolve(res)
            }

        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun addPolygon(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val optionsObj = call.getObject("options", null)
            optionsObj ?: throw InvalidArgumentsError("options object is missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val options = CapacitorPolygonOptions(optionsObj)
            map.addPolygon(options) { result ->
                val pairIdPolygon = result.getOrThrow()
                val res = createPolygonJSObject(pairIdPolygon,id)
                call.resolve(res)
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun removePolygons(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val shapeIdsArray = call.getArray("polygonIds")
            shapeIdsArray ?: throw InvalidArgumentsError("polygonIds are invalid or missing")

            if (shapeIdsArray.length() == 0) {
                throw InvalidArgumentsError("polygonIds requires at least one shape id")
            }

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val shapeIds: MutableList<String> = mutableListOf()

            for (i in 0 until shapeIdsArray.length()) {
                val shapeId = shapeIdsArray.getString(i)
                shapeIds.add(shapeId)
            }

            map.removePolygons(shapeIds) { err ->
                if (err != null) {
                    throw err
                }

                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    @PluginMethod
    fun removePolygon(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val polygonId = call.getString("polygonId")
            polygonId ?: throw InvalidArgumentsError("polygonId is invalid or missing")

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.removePolygon(polygonId) { err ->
                if (err != null) {
                    throw err
                }
                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }
    // END POLYGON METHODS

    @PluginMethod
    fun fromPointToLatLng(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val pointsArr = call.getArray("points")
            pointsArr ?: throw InvalidArgumentsError("pointsArr is invalid or missing")

                var points: MutableList<Double> = mutableListOf<Double>()

            for (i in 0 until pointsArr.length()) {
                val pointObj = pointsArr.getDouble(i)
                points.add(pointObj)
            }

            val map = maps[id]
            map ?: throw MapNotFoundError()

            map.fromPointToLatLng (points.toTypedArray()) { latLng, err ->
                if (err != null) {
                    throw err
                }
                val data = JSObject()
                data.put("latLng", CapacitorGoogleMapsUtils.latLngToJSObject(latLng))
                call.resolve(data)
                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    private fun createLatLng(point: JSObject): LatLng {
        return LatLng(
            point.getDouble("lat"),
            point.getDouble("lng")
        )
    }

    private fun createLatLngBounds(boundsObject: JSObject): LatLngBounds {
        val southwestObject = boundsObject.getJSObject("southwest")!!
        val southwestLatLng = createLatLng(southwestObject)

        val northeastObject = boundsObject.getJSObject("northeast")!!
        val northeastLatLng = createLatLng(northeastObject)

        return LatLngBounds(southwestLatLng, northeastLatLng)
    }

    private fun internalEnableCurrentLocation(call: PluginCall) {
        try {
            val id = call.getString("id")
            id ?: throw InvalidMapIdError()

            val map = maps[id]
            map ?: throw MapNotFoundError()

            val enabled =
                    call.getBoolean("enabled") ?: throw InvalidArgumentsError("enabled is missing")

            map.enableCurrentLocation(enabled) { err ->
                if (err != null) {
                    throw err
                }

                call.resolve()
            }
        } catch (e: GoogleMapsError) {
            handleError(call, e)
        } catch (e: Exception) {
            handleError(call, e)
        }
    }

    fun notify(event: String, data: JSObject) {
        notifyListeners(event, data)
    }

    private fun handleError(call: PluginCall, e: Exception) {
        val error: GoogleMapErrorObject = getErrorObject(e)
        Log.w(tag, error.toString())
        call.reject(error.message, error.code.toString(), e)
    }

    private fun handleError(call: PluginCall, e: GoogleMapsError) {
        val error: GoogleMapErrorObject = getErrorObject(e)
        Log.w(tag, error.toString())
        call.reject(error.message, error.code.toString())
    }

    private fun boundsObjectToRect(jsonObject: JSONObject): RectF {
        if (!jsonObject.has("width")) {
            throw InvalidArgumentsError(
                    "GoogleMapConfig object is missing the required 'width' property"
            )
        }

        if (!jsonObject.has("height")) {
            throw InvalidArgumentsError(
                    "GoogleMapConfig object is missing the required 'height' property"
            )
        }

        if (!jsonObject.has("x")) {
            throw InvalidArgumentsError(
                    "GoogleMapConfig object is missing the required 'x' property"
            )
        }

        if (!jsonObject.has("y")) {
            throw InvalidArgumentsError(
                    "GoogleMapConfig object is missing the required 'y' property"
            )
        }

        val width = jsonObject.getDouble("width")
        val height = jsonObject.getDouble("height")
        val x = jsonObject.getDouble("x")
        val y = jsonObject.getDouble("y")

        return RectF(x.toFloat(), y.toFloat(), (x + width).toFloat(), (y + height).toFloat())
    }

    private fun createMarkerJSObject(pairIdMarker: Pair<String, CapacitorGoogleMapMarker>, id: String): JSObject {
        val res = JSObject()
        val sizeObj = JSObject()
        sizeObj.put("width", pairIdMarker.second.iconSize?.width)
        sizeObj.put("height", pairIdMarker.second.iconSize?.height)

        val anchorObj = JSObject()
        anchorObj.put("x", pairIdMarker.second.iconAnchor?.x)
        anchorObj.put("y", pairIdMarker.second.iconAnchor?.y)

        res.put("id", pairIdMarker.first)
        res.put("mapId", id)
        res.put("coordinate",  CapacitorGoogleMapsUtils.latLngToJSObject(pairIdMarker.second.coordinate))
        res.put("opacity", pairIdMarker.second.opacity)
        res.put("title", pairIdMarker.second.title)
        res.put("snippet", pairIdMarker.second.snippet)
        res.put("zIndex", pairIdMarker.second.zIndex)
        res.put("isFlat", pairIdMarker.second.isFlat)
        res.put("iconUrl", pairIdMarker.second.iconUrl)
        res.put("iconSize", sizeObj)
        res.put("iconAnchor", anchorObj)
        res.put("draggable", pairIdMarker.second.draggable)
        res.put("colorHue", pairIdMarker.second.colorHue)
        res.put("isVisible", pairIdMarker.second.isVisible)
        pairIdMarker.second.extras.forEach { (key, value) ->
            res.put(key, value)
        }
        return res
    }

    private fun createPolylineJSObject(pairIdPolyline: Pair<String, CapacitorGoogleMapPolyline>, id: String): JSObject {
        val hexColor = Integer.toString(pairIdPolyline.second.strokeColor, 16)
        val pointsJsonArray = JSONArray()
        val res = JSObject()

        if(!pairIdPolyline.second.path.isNullOrEmpty()) {
            for (i in 0 until pairIdPolyline.second.path.size) {
                pointsJsonArray.put(CapacitorGoogleMapsUtils.latLngToJSObject(pairIdPolyline.second.path.get(i)))
            }
        }
        res.put("id", pairIdPolyline.first)
        res.put("mapId", id)
        res.put("path", pointsJsonArray)
        res.put("geodesic", pairIdPolyline.second.geodesic)
        res.put("visible", pairIdPolyline.second.isVisible)
        res.put("clickable", pairIdPolyline.second.clickable)
        res.put("strokeWidth", pairIdPolyline.second.strokeWidth)
        res.put("strokeColor", hexColor)
        res.put("zIndex", pairIdPolyline.second.zIndex)
        pairIdPolyline.second.extras.forEach { (key, value) ->
            res.put(key, value)
        }
        return res
    }

    private fun createCircleJSObject(pairIdCircle: Pair<String, CapacitorGoogleMapsCircle>, id: String): JSObject {
        val hexStrokeColor = Integer.toString(pairIdCircle.second.strokeColor, 16)
        val hexFillColor = Integer.toString(pairIdCircle.second.fillColor, 16)
        var centerJSObject = JSObject()
        val res = JSObject()

        centerJSObject = CapacitorGoogleMapsUtils.latLngToJSObject(pairIdCircle.second.center)
        res.put("id", pairIdCircle.first)
        res.put("mapId", id)
        res.put("center", centerJSObject)
        res.put("radius", pairIdCircle.second.radius)
        res.put("visible", pairIdCircle.second.visible)
        res.put("clickable", pairIdCircle.second.clickable)
        res.put("strokeWidth", pairIdCircle.second.strokeWidth)
        res.put("strokeColor", hexStrokeColor)
        res.put("fillColor", hexFillColor)
        res.put("zIndex", pairIdCircle.second.zIndex)
        return res
    }

    private fun createPolygonJSObject(pairIdPolygon: Pair<String, CapacitorGoogleMapsPolygon>, id: String): JSObject {
        val hexStrokeColor = Integer.toString(pairIdPolygon.second.strokeColor, 16)
        val hexFillColor = Integer.toString(pairIdPolygon.second.fillColor, 16)
        val shapesJsonArray = JSONArray()
        val res = JSObject()
        if (!pairIdPolygon.second.shapes.isNullOrEmpty()) {
            for (i in 0 until pairIdPolygon.second.shapes.size) {
                val pointsJsonArray = JSONArray()
                for (j in 0 until pairIdPolygon.second.shapes[i].size) {
                    pointsJsonArray.put(
                        CapacitorGoogleMapsUtils.latLngToJSObject(pairIdPolygon.second.shapes[i][j])
                    )
                }
                shapesJsonArray.put(pointsJsonArray)
            }
        }
        res.put("id", pairIdPolygon.first)
        res.put("mapId", id)
        res.put("shapes", shapesJsonArray)
        res.put("geodesic", pairIdPolygon.second.geodesic)
        res.put("visible", pairIdPolygon.second.visible)
        res.put("clickable", pairIdPolygon.second.clickable)
        res.put("strokeWidth", pairIdPolygon.second.strokeWidth)
        res.put("strokeColor", hexStrokeColor)
        res.put("fillColor", hexFillColor)
        res.put("zIndex", pairIdPolygon.second.zIndex)
        return res
    }
}
