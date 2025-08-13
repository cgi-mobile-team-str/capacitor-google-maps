package com.capacitorjs.plugins.googlemaps

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.graphics.*
import android.location.Location
import android.util.Base64
import android.util.Log
import android.util.Size
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.annotation.RequiresPermission
import androidx.core.content.ContextCompat
import com.getcapacitor.Bridge
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.google.android.gms.maps.*
import com.google.android.gms.maps.GoogleMap.*
import com.google.android.gms.maps.model.*
import com.google.maps.android.clustering.Cluster
import com.google.maps.android.clustering.ClusterManager
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import java.io.InputStream
import java.net.URL
import androidx.core.graphics.scale


class CapacitorGoogleMap(
        val id: String,
        val config: GoogleMapConfig,
        val delegate: CapacitorGoogleMapsPlugin
) :
        OnCameraIdleListener,
        OnCameraMoveStartedListener,
        OnCameraMoveListener,
        OnMyLocationButtonClickListener,
        OnMyLocationClickListener,
        OnMapReadyCallback,
        OnMapClickListener,
        OnMarkerClickListener,
        OnMarkerDragListener,
        OnInfoWindowClickListener,
        OnCircleClickListener,
        OnPolylineClickListener,
        OnPolygonClickListener {
    private var mapView: MapView
    private var googleMap: GoogleMap? = null
    private val markers = HashMap<String, CapacitorGoogleMapMarker>()
    private val polygons = HashMap<String, CapacitorGoogleMapsPolygon>()
    private val circles = HashMap<String, CapacitorGoogleMapsCircle>()
    private val polylines = HashMap<String, CapacitorGoogleMapPolyline>()        
    private val markerIcons = HashMap<String, Bitmap>()
    private var clusterManager: ClusterManager<CapacitorGoogleMapMarker>? = null

    private val isReadyChannel = Channel<Boolean>()
    private var debounceJob: Job? = null

    init {
        val bridge = delegate.bridge

        mapView = MapView(bridge.context, config.googleMapOptions)
        initMap()
        setListeners()
    }

    private fun initMap() {
        runBlocking {
            val job =
                    CoroutineScope(Dispatchers.Main).launch {
                        mapView.onCreate(null)
                        mapView.onStart()
                        mapView.getMapAsync(this@CapacitorGoogleMap)
                        mapView.setWillNotDraw(false)
                        isReadyChannel.receive()

                        render()
                    }

            job.join()
        }
    }

    private fun render() {
        runBlocking {
            CoroutineScope(Dispatchers.Main).launch {
                val bridge = delegate.bridge
                val mapViewParent = FrameLayout(bridge.context)
                mapViewParent.minimumHeight = bridge.webView.height
                mapViewParent.minimumWidth = bridge.webView.width

                val layoutParams =
                        FrameLayout.LayoutParams(
                                getScaledPixels(bridge, config.width),
                                getScaledPixels(bridge, config.height),
                        )
                layoutParams.leftMargin = getScaledPixels(bridge, config.x)
                layoutParams.topMargin = getScaledPixels(bridge, config.y)

                mapViewParent.tag = id

                mapView.layoutParams = layoutParams
                mapViewParent.addView(mapView)

                ((bridge.webView.parent) as ViewGroup).addView(mapViewParent)

                bridge.webView.bringToFront()
                bridge.webView.setBackgroundColor(Color.TRANSPARENT)
                if (config.styles != null) {
                    googleMap?.setMapStyle(MapStyleOptions(config.styles!!))
                }

                setMapSettings(config)
                if(config.camera != null) {
                    moveGoogleCamera(config.camera!!)
                }
            }
        }
    }

    fun updateRender(updatedBounds: RectF) {
        this.config.x = updatedBounds.left.toInt()
        this.config.y = updatedBounds.top.toInt()
        this.config.width = updatedBounds.width().toInt()
        this.config.height = updatedBounds.height().toInt()

        runBlocking {
            CoroutineScope(Dispatchers.Main).launch {
                val bridge = delegate.bridge
                val mapRect = getScaledRect(bridge, updatedBounds)
                val mapView = this@CapacitorGoogleMap.mapView;
                mapView.x = mapRect.left
                mapView.y = mapRect.top
                if (mapView.layoutParams.width != config.width || mapView.layoutParams.height != config.height) {
                    mapView.layoutParams.width = getScaledPixels(bridge, config.width)
                    mapView.layoutParams.height = getScaledPixels(bridge, config.height)
                    mapView.requestLayout()
                }
            }
        }
    }

    fun dispatchTouchEvent(event: MotionEvent) {
        CoroutineScope(Dispatchers.Main).launch {
            val offsetViewBounds = getMapBounds()

            val relativeTop = offsetViewBounds.top
            val relativeLeft = offsetViewBounds.left

            event.setLocation(event.x - relativeLeft, event.y - relativeTop)
            mapView.dispatchTouchEvent(event)
        }
    }

    fun bringToFront() {
        CoroutineScope(Dispatchers.Main).launch {
            val mapViewParent =
                    ((delegate.bridge.webView.parent) as ViewGroup).findViewWithTag<ViewGroup>(
                            this@CapacitorGoogleMap.id
                    )
            mapViewParent.bringToFront()
        }
    }

    fun destroy() {
        runBlocking {
            val job =
                    CoroutineScope(Dispatchers.Main).launch {
                        val bridge = delegate.bridge

                        val viewToRemove: View? =
                                ((bridge.webView.parent) as ViewGroup).findViewWithTag(id)
                        if (null != viewToRemove) {
                            ((bridge.webView.parent) as ViewGroup).removeView(viewToRemove)
                        }
                        mapView.onDestroy()
                        googleMap = null
                        clusterManager = null
                    }

            job.join()
        }
    }

    fun getVisibleRegion(callback: (region: VisibleRegion?, error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                val visibleRegion = googleMap?.projection?.visibleRegion
                if (visibleRegion != null) {
                    callback(visibleRegion, null)
                } else {
                    callback(null,GoogleMapsError("Visible region is null") )
                }
            }
        } catch (e: GoogleMapsError) {
            callback(null, e)
        }
    }

    fun enableCompass(enabled: Boolean, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                googleMap?.uiSettings?.isCompassEnabled = enabled
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun enableToolbar(isEnabled: Boolean, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                googleMap?.uiSettings?.isMapToolbarEnabled = isEnabled
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    @SuppressLint("MissingPermission")
    fun enableMyLocation(isEnabled: Boolean, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                googleMap?.isMyLocationEnabled = isEnabled
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun enableAllGestures(isEnabled: Boolean, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                googleMap?.uiSettings?.setAllGesturesEnabled(isEnabled)
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun enableTiltGesture(isEnabled: Boolean, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                googleMap?.uiSettings?.isTiltGesturesEnabled = isEnabled
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun enableTiltRotateGesture(isEnabled: Boolean, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                googleMap?.uiSettings?.isRotateGesturesEnabled = isEnabled

                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun setMapPreferences(padding: GoogleMapPadding?, building: Boolean?, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                if(padding != null) {
                    googleMap?.setPadding(padding.left ?: 0, padding.top ?: 0, padding.right ?: 0, padding.bottom ?: 0)
                }
                if(building!= null) {
                    googleMap?.isBuildingsEnabled = building
                }
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }

    }

    fun addPolygons(newPolygons: List<CapacitorGoogleMapsPolygon>, callback: (ids: Result<List<String>>) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            val shapeIds: MutableList<String> = mutableListOf()

            CoroutineScope(Dispatchers.Main).launch {
                newPolygons.forEach {
                    val polygonOptions: Deferred<PolygonOptions> = CoroutineScope(Dispatchers.IO).async {
                        this@CapacitorGoogleMap.buildPolygon(it)
                    }

                    val googleMapsPolygon = googleMap?.addPolygon(polygonOptions.await())
                    googleMapsPolygon?.tag = it.tag

                    it.googleMapsPolygon = googleMapsPolygon

                    polygons[googleMapsPolygon!!.id] = it
                    shapeIds.add(googleMapsPolygon.id)
                }

                callback(Result.success(shapeIds))
            }
        } catch (e: GoogleMapsError) {
            callback(Result.failure(e))
        }
    }

    fun addCircles(newCircles: List<CapacitorGoogleMapsCircle>,callback: (ids: Result<List<String>>) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            val circleIds: MutableList<String> = mutableListOf()

            CoroutineScope(Dispatchers.Main).launch {
                newCircles.forEach {
                    var circleOptions: Deferred<CircleOptions> = CoroutineScope(Dispatchers.IO).async {
                        this@CapacitorGoogleMap.buildCircle(it)
                    }

                    val googleMapsCircle = googleMap?.addCircle(circleOptions.await())
                    googleMapsCircle?.tag = it.tag

                    it.googleMapsCircle = googleMapsCircle

                    circles[googleMapsCircle!!.id] = it
                    circleIds.add(googleMapsCircle.id)
                }

                callback(Result.success(circleIds))
            }
        } catch (e: GoogleMapsError) {
            callback(Result.failure(e))
        }
    }

    private fun setClusterManagerRenderer(minClusterSize: Int?) {
        clusterManager?.renderer = CapacitorClusterManagerRenderer(
            delegate.bridge.context,
            googleMap,
            clusterManager,
            minClusterSize
        )
    }

    @SuppressLint("PotentialBehaviorOverride")
    fun enableClustering(minClusterSize: Int?, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()

            CoroutineScope(Dispatchers.Main).launch {
                if (clusterManager != null) {
                    setClusterManagerRenderer(minClusterSize)
                    callback(null)
                    return@launch
                }

                val bridge = delegate.bridge
                clusterManager = ClusterManager(bridge.context, googleMap)

                setClusterManagerRenderer(minClusterSize)
                setClusterListeners()

                // add existing markers to the cluster
                if (markers.isNotEmpty()) {
                    for ((_, marker) in markers) {
                        marker.googleMapMarker?.remove()
                        // marker.googleMapMarker = null
                    }
                    clusterManager?.addItems(markers.values)
                    clusterManager?.cluster()
                }

                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    @SuppressLint("PotentialBehaviorOverride")
    fun disableClustering(callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()

            CoroutineScope(Dispatchers.Main).launch {
                clusterManager?.clearItems()
                clusterManager?.cluster()
                clusterManager = null

                googleMap?.setOnMarkerClickListener(this@CapacitorGoogleMap)

                // add existing markers back to the map
                if (markers.isNotEmpty()) {
                    for ((_, marker) in markers) {
                        val markerOptions: Deferred<MarkerOptions> =
                                CoroutineScope(Dispatchers.IO).async {
                                    this@CapacitorGoogleMap.buildMarker(marker)
                                }
                        val googleMapMarker = googleMap?.addMarker(markerOptions.await())
                        marker.googleMapMarker = googleMapMarker
                    }
                }

                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun removePolygons(ids: List<String>, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()

            CoroutineScope(Dispatchers.Main).launch {
                ids.forEach {
                    val polygon = polygons[it]
                    if (polygon != null) {
                        polygon.googleMapsPolygon?.remove()
                        polygons.remove(it)
                    }
                }

                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun removeMarker(id: String, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()

            val marker = markers[id]
            marker ?: throw MarkerNotFoundError()

            CoroutineScope(Dispatchers.Main).launch {
                if (clusterManager != null) {
                    clusterManager?.removeItem(marker)
                    clusterManager?.cluster()
                }

                marker.googleMapMarker?.remove()
                markers.remove(id)

                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun removeMarkers(ids: List<String>, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()

            CoroutineScope(Dispatchers.Main).launch {
                val deletedMarkers: MutableList<CapacitorGoogleMapMarker> = mutableListOf()

                ids.forEach {
                    val marker = markers[it]
                    if (marker != null) {
                        marker.googleMapMarker?.remove()
                        markers.remove(it)

                        deletedMarkers.add(marker)
                    }
                }

                if (clusterManager != null) {
                    clusterManager?.removeItems(deletedMarkers)
                    clusterManager?.cluster()
                }

                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun removeCircles(ids: List<String>, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()

            CoroutineScope(Dispatchers.Main).launch {
                ids.forEach {
                    val circle = circles[it]
                    if (circle != null) {
                        circle.googleMapsCircle?.remove()
                        markers.remove(it)
                    }
                }

                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun removePolylines(ids: List<String>, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()

            CoroutineScope(Dispatchers.Main).launch {
                ids.forEach {
                    val polyline = polylines[it]
                    if (polyline != null) {
                        polyline.googleMapsPolyline?.remove()
                        polylines.remove(it)
                    }
                }

                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun animateCamera(config: GoogleMapCameraConfig, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                animateGoogleCamera(config)
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun moveCamera(config: GoogleMapCameraConfig, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                moveGoogleCamera(config)
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    @SuppressLint("MissingPermission")
    fun setOptions(config: GoogleMapsOptions, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                val currentPosition = googleMap!!.cameraPosition
                if(config.mapType != null) {
                    googleMap?.mapType = getMapTypeInt(config.mapType!!)
                }

                setMapSettings(config)

                if(config.styles != null) {
                    googleMap?.setMapStyle(config.styles!!)
                }

                if(config.camera != null) {
                    animateGoogleCamera(config.camera!!)
                }

                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun setCameraBearing(bearing: Double ,callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                val currentPosition = googleMap!!.cameraPosition
                val updatedPosition =
                    CameraPosition.Builder(currentPosition)
                        .bearing(bearing.toFloat())
                        .build()
                googleMap?.animateCamera(CameraUpdateFactory.newCameraPosition(updatedPosition))
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun setCameraTarget(target: Any ,callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                val currentPosition = googleMap!!.cameraPosition
                var cameraTarget: LatLng
                if(target is LatLng) {
                    cameraTarget = target
                    val updatedPosition =
                        CameraPosition.Builder(currentPosition)
                            .target(cameraTarget)
                            .build()
                    googleMap?.animateCamera(CameraUpdateFactory.newCameraPosition(updatedPosition))
                }
                if (target is Array<*> && target.isArrayOf<LatLng>()) {
                    val latlngBounds = CapacitorGoogleMapsUtils.createLatLngBoundsFromLatLngArray(target as Array<LatLng>)
                    val updatedPosition =
                        CameraPosition.Builder(currentPosition)
                            .target(latlngBounds.center)
                            .build()
                    googleMap?.animateCamera(CameraUpdateFactory.newCameraPosition(updatedPosition))
                }
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun getCameraZoom(callback: (cameraZoom: Float, error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                val cameraZoom = googleMap!!.cameraPosition.zoom

                callback(cameraZoom, null)
            }
        } catch (e: GoogleMapsError) {
            callback(-1F, e)
        }
    }

    fun getMapType(callback: (type: String, error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                val mapType: String = when (googleMap?.mapType) {
                    MAP_TYPE_NORMAL -> "Normal"
                    MAP_TYPE_HYBRID -> "Hybrid"
                    MAP_TYPE_SATELLITE -> "Satellite"
                    MAP_TYPE_TERRAIN -> "Terrain"
                    MAP_TYPE_NONE -> "None"
                    else -> {
                        "Normal"
                    }
                }
                callback(mapType, null);
            }
        }  catch (e: GoogleMapsError) {
            callback("", e)
        }
    }

    fun setMapType(mapType: String, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                googleMap?.mapType = getMapTypeInt(mapType)
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun enableIndoorMaps(enabled: Boolean, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                googleMap?.isIndoorEnabled = enabled
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun enableTrafficLayer(enabled: Boolean, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                googleMap?.isTrafficEnabled = enabled
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    @SuppressLint("MissingPermission")
    fun enableCurrentLocation(enabled: Boolean, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                googleMap?.isMyLocationEnabled = enabled
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun setPadding(padding: GoogleMapPadding, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            CoroutineScope(Dispatchers.Main).launch {
                googleMap?.setPadding(padding.left ?: 0, padding.top?: 0, padding.right?: 0, padding.bottom?: 0)
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun getMapBounds(): Rect {
        return Rect(
                getScaledPixels(delegate.bridge, config.x),
                getScaledPixels(delegate.bridge, config.y),
                getScaledPixels(delegate.bridge, config.x + config.width),
                getScaledPixels(delegate.bridge, config.y + config.height)
        )
    }

    fun getLatLngBounds(): LatLngBounds {
        return googleMap?.projection?.visibleRegion?.latLngBounds ?: throw BoundsNotFoundError()
    }

    fun fitBounds(bounds: LatLngBounds, padding: Int) {
        val cameraUpdate = CameraUpdateFactory.newLatLngBounds(bounds, padding)
        googleMap?.animateCamera(cameraUpdate)
    }

    // BEGIN MARKER METHODS

    fun addMarkers(
            optionsList: List<CapacitorMarkerOptions>,
            callback: (pairsIdMarker: Result<List<Pair<String, CapacitorGoogleMapMarker>>>) -> Unit
    ) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            val newMarkers: MutableList<CapacitorGoogleMapMarker> = mutableListOf()
            val idMarkerPairs: MutableList<Pair<String, CapacitorGoogleMapMarker>> = mutableListOf()
            optionsList.forEach {
                val marker = CapacitorGoogleMapMarker(it)
                newMarkers.add(marker)
            }
            CoroutineScope(Dispatchers.Main).launch {
                newMarkers.forEach {
                    val markerOptions: Deferred<MarkerOptions> =
                            CoroutineScope(Dispatchers.IO).async {
                                this@CapacitorGoogleMap.buildMarker(it)
                            }
                    val googleMapMarker = googleMap?.addMarker(markerOptions.await())
                    it.googleMapMarker = googleMapMarker

                    if (googleMapMarker != null) {
                        if (clusterManager != null) {
                            googleMapMarker.remove()
                        }
                        markers[googleMapMarker.id] = it
                        idMarkerPairs.add(Pair(googleMapMarker.id, it))
                    }
                }

                if (clusterManager != null) {
                    clusterManager?.addItems(newMarkers)
                    clusterManager?.cluster()
                }

                callback(Result.success(idMarkerPairs))
            }
        } catch (e: GoogleMapsError) {
            callback(Result.failure(e))
        }
    }

    fun addMarker(options: CapacitorMarkerOptions, callback: (result: Result<Pair<String, CapacitorGoogleMapMarker>>) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()

            var markerId: String

            CoroutineScope(Dispatchers.Main).launch {
                val marker = CapacitorGoogleMapMarker(options)

                val markerOptions: Deferred<MarkerOptions> =
                    CoroutineScope(Dispatchers.IO).async {
                        this@CapacitorGoogleMap.buildMarker(marker)
                    }
                val googleMapMarker = googleMap?.addMarker(markerOptions.await())

                marker.googleMapMarker = googleMapMarker
                marker.googleMapMarker = googleMapMarker

                if (clusterManager != null) {
                    googleMapMarker?.remove()
                    clusterManager?.addItem(marker)
                    clusterManager?.cluster()
                }

                markers[googleMapMarker!!.id] = marker

                markerId = googleMapMarker.id

                callback(Result.success(Pair(markerId, marker)))
            }
        } catch (e: GoogleMapsError) {
            callback(Result.failure(e))
        }
    }

    fun setMarkerIcon(
        markerId: String,
        url: String?,
        size: Size?,
        callback: (error: GoogleMapsError?) -> Unit
    ) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            val marker = markers[markerId]
            marker ?: throw MarkerNotFoundError()
            val context = this@CapacitorGoogleMap.delegate.context
            CoroutineScope(Dispatchers.Main).launch {
                val finalUrl = url ?: marker.iconUrl
                marker.setIcon(finalUrl, size)
                if (finalUrl != null && finalUrl != "") {
                    val inputStream = context.assets.open("public/$finalUrl")
                    val originalBitmap = BitmapFactory.decodeStream(inputStream)
                    val descriptor = if (size != null) {
                        val scaledBitmap = originalBitmap.scale(size.width, size.height, false)
                        BitmapDescriptorFactory.fromBitmap(scaledBitmap)
                    } else {
                        BitmapDescriptorFactory.fromBitmap(originalBitmap)
                    }
                    marker.googleMapMarker?.setIcon(descriptor)
                }
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun setMarkerIconAnchor(
        markerId: String,
        x: Float,
        y: Float,
        callback: (error: GoogleMapsError?) -> Unit
    ) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            val marker = markers[markerId]
            marker ?: throw MarkerNotFoundError()
            var anchorX = (x / marker.iconSize!!.width)
            var anchorY = (y / marker.iconSize!!.height)
            CoroutineScope(Dispatchers.Main).launch {
                marker.iconAnchor = CapacitorGoogleMapsPoint(anchorX ,anchorY)
                marker.googleMapMarker?.setAnchor(anchorX,anchorY)
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun setMarkerZIndex(
        markerId: String,
        zIndex: Float,
        callback: (error: GoogleMapsError?) -> Unit
    ) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            val marker = markers[markerId]
            marker ?: throw MarkerNotFoundError()
            CoroutineScope(Dispatchers.Main).launch {
                marker.zIndex = zIndex
                marker.googleMapMarker?.zIndex = zIndex
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun setMarkerVisibility(
        markerId: String,
        isVisible: Boolean,
        callback: (error: GoogleMapsError?) -> Unit
    ) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            val marker = markers[markerId]
            marker ?: throw MarkerNotFoundError()
            CoroutineScope(Dispatchers.Main).launch {
                marker.isVisible = isVisible
                marker.googleMapMarker?.isVisible = isVisible
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun getMarkerPosition(markerId: String, callback: (position: LatLng?, error: GoogleMapsError?) -> Unit
    ) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            val marker = markers[markerId]
            marker ?: throw MarkerNotFoundError()
            CoroutineScope(Dispatchers.Main).launch {
                callback(marker.googleMapMarker?.position, null)
            }
        } catch (e: GoogleMapsError) {
            callback(null, e)
        }
    }
    // END MARKER METHODS

    // BEGIN POLYLINE METHODS

    fun addPolylines(optionsList: List<CapacitorPolylineOptions>, callback: (pairsIdPolyline: Result<List<Pair<String, CapacitorGoogleMapPolyline>>>) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            val newLines: MutableList<CapacitorGoogleMapPolyline> = mutableListOf()
            val idPolylinePairs: MutableList<Pair<String, CapacitorGoogleMapPolyline>> = mutableListOf()
            optionsList.forEach {
                val line = CapacitorGoogleMapPolyline(it)
                newLines.add(line)
            }
            CoroutineScope(Dispatchers.Main).launch {
                newLines.forEach {
                    val polylineOptions: Deferred<PolylineOptions> = CoroutineScope(Dispatchers.IO).async {
                        this@CapacitorGoogleMap.buildPolyline(it)
                    }
                    val googleMapPolyline = googleMap?.addPolyline(polylineOptions.await())
                    googleMapPolyline?.tag = it.tag

                    it.googleMapsPolyline = googleMapPolyline

                    polylines[googleMapPolyline!!.id] = it
                    if(it.googleMapsPolyline != null) {
                        idPolylinePairs.add(Pair(googleMapPolyline.id, it))
                    }
                }

                callback(Result.success(idPolylinePairs))
            }
        } catch (e: GoogleMapsError) {
            callback(Result.failure(e))
        }
    }

    fun addPolyline(options: CapacitorPolylineOptions, callback: (polyline: Result<Pair<String, CapacitorGoogleMapPolyline>>) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()

            CoroutineScope(Dispatchers.Main).launch {
                val polyline = CapacitorGoogleMapPolyline(options)
                val polylineOptions: Deferred<PolylineOptions> = CoroutineScope(Dispatchers.IO).async {
                    this@CapacitorGoogleMap.buildPolyline(polyline)
                }
                val googleMapPolyline = googleMap?.addPolyline(polylineOptions.await())
                googleMapPolyline?.tag = polyline.tag

                polyline.googleMapsPolyline = googleMapPolyline

                polylines[googleMapPolyline!!.id] = polyline

                callback(Result.success(Pair(googleMapPolyline.id, polyline)))
            }
        } catch (e: GoogleMapsError) {
            callback(Result.failure(e))
        }
    }

    fun setPolylineStrokeColor(polylineId: String, strokeColor: String, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            val polyline = polylines[polylineId]
            polyline ?: throw PolylineNotFound()
            CoroutineScope(Dispatchers.Main).launch {
                val colorInt = CapacitorGoogleMapsUtils.processColor(strokeColor, null)
                polyline.strokeColor = colorInt
                polyline.googleMapsPolyline?.color = colorInt
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun setPolylineStrokeWidth(polylineId: String, strokeWidth: Float, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            val polyline = polylines[polylineId]
            polyline ?: throw PolylineNotFound()
            CoroutineScope(Dispatchers.Main).launch {
                polyline.strokeWidth = strokeWidth
                polyline.googleMapsPolyline?.width = strokeWidth
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }

    fun removePolyline(polylineId: String, callback: (error: GoogleMapsError?) -> Unit) {
        try {
            googleMap ?: throw GoogleMapNotAvailable()
            val polyline = polylines[polylineId]
            polyline ?: throw PolylineNotFound()
            CoroutineScope(Dispatchers.Main).launch {
                polyline.googleMapsPolyline?.remove()
                polylines.remove(polylineId)
                callback(null)
            }
        } catch (e: GoogleMapsError) {
            callback(e)
        }
    }
    // END POLYLINE METHODS

    private fun getMapTypeInt(mapType: String): Int {
        val mapTypeInt: Int =
            when (mapType) {
                "Normal" -> MAP_TYPE_NORMAL
                "Hybrid" -> MAP_TYPE_HYBRID
                "Satellite" -> MAP_TYPE_SATELLITE
                "Terrain" -> MAP_TYPE_TERRAIN
                "None" -> MAP_TYPE_NONE
                else -> {
                    Log.w(
                        "CapacitorGoogleMaps",
                        "unknown mapView type '$mapType'  Defaulting to normal."
                    )
                    MAP_TYPE_NORMAL
                }
            }
        return mapTypeInt
    }

    private fun animateGoogleCamera(config :GoogleMapCameraConfig) {
        val updatedPosition = setUpCameraPosition(config)
        var duration = config.duration
        if (duration == null) {
            duration = 0.0
        }
        googleMap?.animateCamera(CameraUpdateFactory.newCameraPosition(updatedPosition),duration.toInt(), null)
    }

    private fun moveGoogleCamera(config :GoogleMapCameraConfig) {
        val updatedPosition = setUpCameraPosition(config)
        googleMap?.moveCamera(CameraUpdateFactory.newCameraPosition(updatedPosition))
    }

    private fun setUpCameraPosition(config: GoogleMapCameraConfig): CameraPosition {
        val currentPosition = googleMap!!.cameraPosition
        var updatedTarget: LatLng? = null
        val target = config.target

        if (target is LatLng ) {
            updatedTarget = target
        }

        if (target is Array<*> && target.isArrayOf<LatLng>()) {
            val latlngBounds = CapacitorGoogleMapsUtils.createLatLngBoundsFromLatLngArray(target as Array<LatLng>)
            updatedTarget = latlngBounds.center
        }

        if (updatedTarget == null) {
            updatedTarget = currentPosition.target
        }

        var zoom = config.zoom
        if (zoom == null) {
            zoom = currentPosition.zoom.toDouble()
        }

        var bearing = config.bearing
        if (bearing == null) {
            bearing = currentPosition.bearing.toDouble()
        }

        var tilt = config.tilt
        if (tilt == null) {
            tilt = currentPosition.tilt.toDouble()
        }

        val updatedPosition =
            CameraPosition.Builder()
                .target(updatedTarget)
                .zoom(zoom.toFloat())
                .bearing(bearing.toFloat())
                .tilt(tilt.toFloat())
                .build()
        return updatedPosition
    }

    private fun getScaledPixels(bridge: Bridge, pixels: Int): Int {
        // Get the screen's density scale
        val scale = bridge.activity.resources.displayMetrics.density
        // Convert the dps to pixels, based on density scale
        return (pixels * scale + 0.5f).toInt()
    }

    private fun getScaledPixelsF(bridge: Bridge, pixels: Float): Float {
        // Get the screen's density scale
        val scale = bridge.activity.resources.displayMetrics.density
        // Convert the dps to pixels, based on density scale
        return (pixels * scale + 0.5f)
    }

    private fun getScaledRect(bridge: Bridge, rectF: RectF): RectF {
        return RectF(
                getScaledPixelsF(bridge, rectF.left),
                getScaledPixelsF(bridge, rectF.top),
                getScaledPixelsF(bridge, rectF.right),
                getScaledPixelsF(bridge, rectF.bottom)
        )
    }

    private fun buildCircle(circle: CapacitorGoogleMapsCircle): CircleOptions {
        val circleOptions = CircleOptions()
        circleOptions.fillColor(circle.fillColor)
        circleOptions.strokeColor(circle.strokeColor)
        circleOptions.strokeWidth(circle.strokeWidth)
        circleOptions.zIndex(circle.zIndex)
        circleOptions.clickable(circle.clickable)
        circleOptions.radius(circle.radius.toDouble())
        circleOptions.center(circle.center)

        return circleOptions
    }

    private fun buildPolygon(polygon: CapacitorGoogleMapsPolygon): PolygonOptions {
        val polygonOptions = PolygonOptions()
        polygonOptions.fillColor(polygon.fillColor)
        polygonOptions.strokeColor(polygon.strokeColor)
        polygonOptions.strokeWidth(polygon.strokeWidth)
        polygonOptions.zIndex(polygon.zIndex)
        polygonOptions.geodesic(polygon.geodesic)
        polygonOptions.clickable(polygon.clickable)

        var shapeCounter = 0
        polygon.shapes.forEach {
            if (shapeCounter == 0) {
                // outer shape
                it.forEach {
                    polygonOptions.add(it)
                }
            } else {
                polygonOptions.addHole(it)
            }

            shapeCounter += 1
        }

        return polygonOptions
    }
    
    private fun buildPolyline(line: CapacitorGoogleMapPolyline): PolylineOptions {
        val polylineOptions = PolylineOptions()
        polylineOptions.width(line.strokeWidth * this.config.devicePixelRatio)
        polylineOptions.color(line.strokeColor)
        polylineOptions.clickable(line.clickable)
        polylineOptions.zIndex(line.zIndex)
        polylineOptions.geodesic(line.geodesic)
        line.path.forEach {
            polylineOptions.points.add(it)
        }
        line.styleSpans.forEach {
            if (it.segments != null) {
                polylineOptions.addSpan(StyleSpan(it.color, it.segments))
            } else {
                polylineOptions.addSpan(StyleSpan(it.color))
            }
        }

        return polylineOptions
    }

    private fun buildMarker(marker: CapacitorGoogleMapMarker): MarkerOptions {
        val markerOptions = MarkerOptions()
        markerOptions.position(marker.coordinate)
        markerOptions.title(marker.title)
        markerOptions.snippet(marker.snippet)
        markerOptions.alpha(marker.opacity)
        markerOptions.flat(marker.isFlat)
        markerOptions.draggable(marker.draggable)
        markerOptions.zIndex(marker.zIndex)
        markerOptions.visible(marker.isVisible)
        if (marker.iconAnchor != null) {
            markerOptions.anchor(marker.iconAnchor!!.x, marker.iconAnchor!!.y)
        }

        if (!marker.iconUrl.isNullOrEmpty()) {
            if (this.markerIcons.contains(marker.iconUrl)) {
                val cachedBitmap = this.markerIcons[marker.iconUrl]
                markerOptions.icon(getResizedIcon(cachedBitmap!!, marker))
            } else {
                try {
                    val bitmap: Bitmap = when {
                        marker.iconUrl!!.startsWith("https:") -> {
                            val stream = URL(marker.iconUrl).openConnection().getInputStream()
                            BitmapFactory.decodeStream(stream)
                        }
                        marker.iconUrl!!.startsWith("data:image") -> {
                            val base64Data = marker.iconUrl!!.substringAfter(",")
                            val decodedBytes = Base64.decode(base64Data, Base64.DEFAULT)
                            BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                        }
                        else -> {
                            val stream = this.delegate.context.assets.open("public/${marker.iconUrl}")
                            BitmapFactory.decodeStream(stream)
                        }
                    }

                    this.markerIcons[marker.iconUrl!!] = bitmap
                    markerOptions.icon(getResizedIcon(bitmap, marker))

                } catch (e: Exception) {
                    var detailedMessage = "${e.javaClass} - ${e.localizedMessage}"
                    if (marker.iconUrl!!.endsWith(".svg")) {
                        detailedMessage = "SVG not supported"
                    }

                    Log.w(
                        "CapacitorGoogleMaps",
                        "Could not load image '${marker.iconUrl}': ${detailedMessage}. Using default marker icon."
                    )
                }
            }
        } else {
            if (marker.colorHue != null) {
                markerOptions.icon(BitmapDescriptorFactory.defaultMarker(marker.colorHue!!))
            }
        }

        marker.markerOptions = markerOptions

        return markerOptions
    }

    private fun getResizedIcon(
            _bitmap: Bitmap,
            marker: CapacitorGoogleMapMarker
    ): BitmapDescriptor {
        var bitmap = _bitmap
        if (marker.iconSize != null) {
            bitmap =
                    Bitmap.createScaledBitmap(
                            bitmap,
                            (marker.iconSize!!.width * this.config.devicePixelRatio).toInt(),
                            (marker.iconSize!!.height * this.config.devicePixelRatio).toInt(),
                            false
                    )
        }
        return BitmapDescriptorFactory.fromBitmap(bitmap)
    }

    @SuppressLint("MissingPermission")
    private fun setMapSettings (config: GoogleMapSettings) {
        if(config.controls != null) {
            if( config.controls?.compass != null) {
                googleMap?.uiSettings?.isCompassEnabled = config.controls?.compass!!
            }
            if( config.controls?.myLocationButton != null) {
                googleMap?.uiSettings?.isMyLocationButtonEnabled = config.controls?.myLocationButton!!
            }
            if( config.controls?.myLocation != null) {
                val hasFineLocation = ContextCompat.checkSelfPermission(
                    delegate.bridge.context, Manifest.permission.ACCESS_FINE_LOCATION
                ) == PackageManager.PERMISSION_GRANTED

                val hasCoarseLocation = ContextCompat.checkSelfPermission(
                    delegate.bridge.context, Manifest.permission.ACCESS_COARSE_LOCATION
                ) == PackageManager.PERMISSION_GRANTED

                if (hasFineLocation || hasCoarseLocation) {
                    googleMap?.isMyLocationEnabled = config.controls?.myLocation!!
                }
            }
            if( config.controls?.indoorPicker != null) {
                googleMap?.uiSettings?.isIndoorLevelPickerEnabled = config.controls?.indoorPicker!!
            }
            if( config.controls?.mapToolbar != null) {
                googleMap?.uiSettings?.isMapToolbarEnabled = config.controls?.mapToolbar!!
            }
            if( config.controls?.zoom != null) {
                googleMap?.uiSettings?.isZoomControlsEnabled = config.controls?.zoom!!
            }
        }

        if(config.gestures != null) {
            if(config.gestures?.tilt != null) {
                googleMap?.uiSettings?.isTiltGesturesEnabled = config.gestures?.tilt!!
            }
            if(config.gestures?.zoom != null) {
                googleMap?.uiSettings?.isZoomGesturesEnabled = config.gestures?.zoom!!
            }
            if(config.gestures?.rotate != null) {
                googleMap?.uiSettings?.isRotateGesturesEnabled = config.gestures?.rotate!!
            }
            if(config.gestures?.scroll != null) {
                googleMap?.uiSettings?.isScrollGesturesEnabled = config.gestures?.scroll!!
            }
        }

        if(config.preferences != null) {
            if(config.preferences?.building != null) {
                googleMap?.isBuildingsEnabled = config.preferences?.building!!
            }
            if(config.preferences?.zoom != null) {
                if(config.preferences?.zoom?.maxZoom !=null) {
                    googleMap?.setMaxZoomPreference(config.preferences?.zoom?.maxZoom!!.toFloat())
                }
                if(config.preferences?.zoom?.minZoom !=null) {
                    googleMap?.setMinZoomPreference(config.preferences?.zoom?.minZoom!!.toFloat())
                }
            }
            if(config.preferences?.padding != null) {
                googleMap?.setPadding(config.preferences?.padding?.left ?:0,config.preferences?.padding?.top ?:0, config.preferences?.padding?.right ?:0, config.preferences?.padding?.bottom ?:0 )
            }
            if(!config.preferences?.gestureBounds.isNullOrEmpty()) {
                val latlngBounds = CapacitorGoogleMapsUtils.createLatLngBoundsFromLatLngArray(config.preferences?.gestureBounds!!)
                googleMap?.setLatLngBoundsForCameraTarget(latlngBounds)
            }
        }
    }

    fun onStart() {
        mapView.onStart()
    }

    fun onResume() {
        mapView.onResume()
    }

    fun onStop() {
        mapView.onStop()
    }

    fun onPause() {
        mapView.onPause()
    }

    fun onDestroy() {
        mapView.onDestroy()
    }

    override fun onMapReady(map: GoogleMap) {
        runBlocking {
            googleMap = map

            val data = JSObject()
            data.put("mapId", this@CapacitorGoogleMap.id)
            delegate.notify("onMapReady", data)

            isReadyChannel.send(true)
            isReadyChannel.close()
        }
    }

    @SuppressLint("PotentialBehaviorOverride")
    fun setListeners() {
        CoroutineScope(Dispatchers.Main).launch {
            this@CapacitorGoogleMap.googleMap?.setOnCameraIdleListener(this@CapacitorGoogleMap)
            this@CapacitorGoogleMap.googleMap?.setOnCameraMoveStartedListener(
                    this@CapacitorGoogleMap
            )
            this@CapacitorGoogleMap.googleMap?.setOnCameraMoveListener(this@CapacitorGoogleMap)
            this@CapacitorGoogleMap.googleMap?.setOnMarkerClickListener(this@CapacitorGoogleMap)
            this@CapacitorGoogleMap.googleMap?.setOnPolygonClickListener(this@CapacitorGoogleMap)
            this@CapacitorGoogleMap.googleMap?.setOnCircleClickListener(this@CapacitorGoogleMap)
            this@CapacitorGoogleMap.googleMap?.setOnMarkerDragListener(this@CapacitorGoogleMap)
            this@CapacitorGoogleMap.googleMap?.setOnMapClickListener(this@CapacitorGoogleMap)
            this@CapacitorGoogleMap.googleMap?.setOnMyLocationButtonClickListener(
                    this@CapacitorGoogleMap
            )
            this@CapacitorGoogleMap.googleMap?.setOnMyLocationClickListener(this@CapacitorGoogleMap)
            this@CapacitorGoogleMap.googleMap?.setOnInfoWindowClickListener(this@CapacitorGoogleMap)
            this@CapacitorGoogleMap.googleMap?.setOnPolylineClickListener(this@CapacitorGoogleMap)
        }
    }

    fun setClusterListeners() {
        CoroutineScope(Dispatchers.Main).launch {
            clusterManager?.setOnClusterItemClickListener {
                if (null == it.googleMapMarker) false
                else this@CapacitorGoogleMap.onMarkerClick(it.googleMapMarker!!)
            }

            clusterManager?.setOnClusterItemInfoWindowClickListener {
                if (null != it.googleMapMarker) {
                    this@CapacitorGoogleMap.onInfoWindowClick(it.googleMapMarker!!)
                }
            }

            clusterManager?.setOnClusterInfoWindowClickListener {
                val data = this@CapacitorGoogleMap.getClusterData(it)
                delegate.notify("onClusterInfoWindowClick", data)
            }

            clusterManager?.setOnClusterClickListener {
                val data = this@CapacitorGoogleMap.getClusterData(it)
                delegate.notify("onClusterClick", data)
                false
            }
        }
    }

    private fun getClusterData(it: Cluster<CapacitorGoogleMapMarker>): JSObject {
        val data = JSObject()
        data.put("mapId", this.id)
        data.put("latitude", it.position.latitude)
        data.put("longitude", it.position.longitude)
        data.put("size", it.size)

        val items = JSArray()
        for (item in it.items) {
            val marker = item.googleMapMarker

            if (marker != null) {
                val jsItem = JSObject()
                jsItem.put("markerId", marker.id)
                jsItem.put("latitude", marker.position.latitude)
                jsItem.put("longitude", marker.position.longitude)
                jsItem.put("title", marker.title)
                jsItem.put("snippet", marker.snippet)

                items.put(jsItem)
            }
        }

        data.put("items", items)

        return data
    }

    override fun onMapClick(point: LatLng) {
        val data = JSObject()
        data.put("mapId", this@CapacitorGoogleMap.id)
        data.put("latitude", point.latitude)
        data.put("longitude", point.longitude)
        delegate.notify("onMapClick", data)
    }

    override fun onMarkerClick(marker: Marker): Boolean {
        val data = JSObject()
        data.put("mapId", this@CapacitorGoogleMap.id)
        data.put("markerId", marker.id)
        data.put("latitude", marker.position.latitude)
        data.put("longitude", marker.position.longitude)
        data.put("title", marker.title)
        data.put("snippet", marker.snippet)
        delegate.notify("onMarkerClick", data)
        return false
    }

    override fun onPolylineClick(polyline: Polyline) {
        val data = JSObject()
        data.put("mapId", this@CapacitorGoogleMap.id)
        data.put("polylineId", polyline.id)
        data.put("tag", polyline.tag)
        delegate.notify("onPolylineClick", data)
    }

    override fun onMarkerDrag(marker: Marker) {
        val data = JSObject()
        data.put("mapId", this@CapacitorGoogleMap.id)
        data.put("markerId", marker.id)
        data.put("latitude", marker.position.latitude)
        data.put("longitude", marker.position.longitude)
        data.put("title", marker.title)
        data.put("snippet", marker.snippet)
        delegate.notify("onMarkerDrag", data)
    }

    override fun onMarkerDragStart(marker: Marker) {
        val data = JSObject()
        data.put("mapId", this@CapacitorGoogleMap.id)
        data.put("markerId", marker.id)
        data.put("latitude", marker.position.latitude)
        data.put("longitude", marker.position.longitude)
        data.put("title", marker.title)
        data.put("snippet", marker.snippet)
        delegate.notify("onMarkerDragStart", data)
    }

    override fun onMarkerDragEnd(marker: Marker) {
        val data = JSObject()
        data.put("mapId", this@CapacitorGoogleMap.id)
        data.put("markerId", marker.id)
        data.put("latitude", marker.position.latitude)
        data.put("longitude", marker.position.longitude)
        data.put("title", marker.title)
        data.put("snippet", marker.snippet)
        delegate.notify("onMarkerDragEnd", data)
    }

    override fun onMyLocationButtonClick(): Boolean {
        val data = JSObject()
        data.put("mapId", this@CapacitorGoogleMap.id)
        delegate.notify("onMyLocationButtonClick", data)
        return false
    }

    override fun onMyLocationClick(location: Location) {
        val data = JSObject()
        data.put("mapId", this@CapacitorGoogleMap.id)
        data.put("latitude", location.latitude)
        data.put("longitude", location.longitude)
        delegate.notify("onMyLocationClick", data)
    }

    override fun onCameraIdle() {
        val data = JSObject()
        data.put("mapId", this@CapacitorGoogleMap.id)
        data.put("bounds", getLatLngBoundsJSObject(getLatLngBounds()))
        data.put("bearing", this@CapacitorGoogleMap.googleMap?.cameraPosition?.bearing)
        data.put("latitude", this@CapacitorGoogleMap.googleMap?.cameraPosition?.target?.latitude)
        data.put("longitude", this@CapacitorGoogleMap.googleMap?.cameraPosition?.target?.longitude)
        data.put("tilt", this@CapacitorGoogleMap.googleMap?.cameraPosition?.tilt)
        data.put("zoom", this@CapacitorGoogleMap.googleMap?.cameraPosition?.zoom)
        delegate.notify("onCameraIdle", data)
        delegate.notify("onBoundsChanged", data)
    }

    override fun onCameraMoveStarted(reason: Int) {
        val data = JSObject()
        data.put("mapId", this@CapacitorGoogleMap.id)
        data.put("isGesture", reason == 1)
        delegate.notify("onCameraMoveStarted", data)
    }

    override fun onInfoWindowClick(marker: Marker) {
        val data = JSObject()
        data.put("mapId", this@CapacitorGoogleMap.id)
        data.put("markerId", marker.id)
        data.put("latitude", marker.position.latitude)
        data.put("longitude", marker.position.longitude)
        data.put("title", marker.title)
        data.put("snippet", marker.snippet)
        delegate.notify("onInfoWindowClick", data)
    }

    override fun onCameraMove() {
        debounceJob?.cancel()
        debounceJob = CoroutineScope(Dispatchers.Main).launch {
            delay(100)
            clusterManager?.cluster()
        }
    }

    override fun onPolygonClick(polygon: Polygon) {
        val data = JSObject()
        data.put("mapId", this@CapacitorGoogleMap.id)
        data.put("polygonId", polygon.id)
        data.put("tag", polygon.tag)
        delegate.notify("onPolygonClick", data)
    }

    override fun onCircleClick(circle: Circle) {
        val data = JSObject()
        data.put("mapId", this@CapacitorGoogleMap.id)
        data.put("circleId", circle.id)
        data.put("tag", circle.tag)
        data.put("latitude", circle.center.latitude)
        data.put("longitude", circle.center.longitude)
        data.put("radius", circle.radius)

        delegate.notify("onCircleClick", data)
    }

}

fun getLatLngBoundsJSObject(bounds: LatLngBounds): JSObject {
    val data = JSObject()

    val southwestJS = JSObject()
    val centerJS = JSObject()
    val northeastJS = JSObject()

    southwestJS.put("lat", bounds.southwest.latitude)
    southwestJS.put("lng", bounds.southwest.longitude)
    centerJS.put("lat", bounds.center.latitude)
    centerJS.put("lng", bounds.center.longitude)
    northeastJS.put("lat", bounds.northeast.latitude)
    northeastJS.put("lng", bounds.northeast.longitude)

    data.put("southwest", southwestJS)
    data.put("center", centerJS)
    data.put("northeast", northeastJS)

    return data
}
