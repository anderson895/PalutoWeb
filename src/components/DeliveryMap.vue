<template>
  <div class="map-container" :style="{ height: height }">
    <div ref="mapEl" class="delivery-map" />
    <button
      v-if="showRecenter"
      class="recenter-btn"
      type="button"
      @click="recenter"
      title="Recenter on driver"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
      </svg>
    </button>
    <div v-if="driverPicker" class="picker-banner">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
      Tap anywhere on the map to set the driver location
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  height: { type: String, default: '420px' },
  storeLocation:    { type: Object, default: null }, // { lat, lng, name? }
  deliveryLocation: { type: Object, default: null }, // { lat, lng, label? }
  driverLocation:   { type: Object, default: null }, // { lat, lng }
  interactive:      { type: Boolean, default: true },
  picker:           { type: Boolean, default: false },        // click → emits 'pick' (for delivery)
  driverPicker:     { type: Boolean, default: false },        // click → emits 'pick-driver'
  initialCenter:    { type: Object, default: () => ({ lat: 14.5995, lng: 120.9842 }) },
  initialZoom:      { type: Number, default: 13 },
  autoFit:          { type: Boolean, default: true },
  showRecenter:     { type: Boolean, default: false },
})

const emit = defineEmits(['pick', 'pick-driver', 'ready'])

const mapEl = ref(null)
let map = null
let storeMarker = null
let deliveryMarker = null
let driverMarker = null
let routeLine = null
let pickerMarker = null

// Cached route to avoid re-querying OSRM on every minor update
let lastRouteKey = null    // "from.lat,from.lng->to.lat,to.lng" at low precision
let routeFetchSeq = 0      // monotonic id to ignore stale fetches

// Animation state for driver
let driverAnim = null

const makeDivIcon = (html, size = 36) => L.divIcon({
  className: 'paluto-pin',
  html,
  iconSize: [size, size],
  iconAnchor: [size / 2, size],
  popupAnchor: [0, -size],
})

const storeIcon = () => makeDivIcon(`
  <div class="pin pin-store">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 22V12h6v10"/>
    </svg>
  </div>
`)

const deliveryIcon = () => makeDivIcon(`
  <div class="pin pin-delivery">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  </div>
`)

const driverIcon = () => makeDivIcon(`
  <div class="pin pin-driver">
    <span class="pulse"></span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
      <path d="M2 17h3M9 17h6M19 17h3"/>
      <path d="M5 17V8a1 1 0 0 1 1-1h7l4 5h2a1 1 0 0 1 1 1v4"/>
    </svg>
  </div>
`, 42)

const initMap = () => {
  const start = props.driverLocation || props.deliveryLocation || props.storeLocation || props.initialCenter
  map = L.map(mapEl.value, {
    zoomControl: props.interactive,
    dragging: props.interactive,
    scrollWheelZoom: props.interactive,
    doubleClickZoom: props.interactive,
    boxZoom: props.interactive,
    keyboard: props.interactive,
    touchZoom: props.interactive,
    tap: props.interactive,
  }).setView([start.lat, start.lng], props.initialZoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  map.on('click', (e) => {
    const { lat, lng } = e.latlng
    if (props.driverPicker) {
      emit('pick-driver', { lat, lng })
      return
    }
    if (props.picker) {
      placePicker(lat, lng)
      emit('pick', { lat, lng })
    }
  })

  refreshLayers(true)
  emit('ready', map)
}

const placePicker = (lat, lng) => {
  if (!map) return
  if (pickerMarker) {
    pickerMarker.setLatLng([lat, lng])
  } else {
    pickerMarker = L.marker([lat, lng], { icon: deliveryIcon(), draggable: true }).addTo(map)
    pickerMarker.on('dragend', (e) => {
      const p = e.target.getLatLng()
      emit('pick', { lat: p.lat, lng: p.lng })
    })
  }
}

const animateMarker = (marker, fromLatLng, toLatLng, duration = 800) => {
  if (driverAnim) cancelAnimationFrame(driverAnim)
  const start = performance.now()
  const fromLat = fromLatLng.lat, fromLng = fromLatLng.lng
  const toLat = toLatLng.lat, toLng = toLatLng.lng
  const step = (t) => {
    const elapsed = t - start
    const p = Math.min(1, elapsed / duration)
    // ease-out-cubic
    const eased = 1 - Math.pow(1 - p, 3)
    const lat = fromLat + (toLat - fromLat) * eased
    const lng = fromLng + (toLng - fromLng) * eased
    marker.setLatLng([lat, lng])
    if (p < 1) driverAnim = requestAnimationFrame(step)
    else driverAnim = null
  }
  driverAnim = requestAnimationFrame(step)
}

let hasFittedOnce = false

/* Draw or update the route polyline. Falls back to a straight dashed line
   while we fetch the road-following geometry from OSRM. */
const drawRoute = (latlngs, { dashed = false } = {}) => {
  if (!map) return
  if (routeLine) {
    routeLine.setLatLngs(latlngs)
    routeLine.setStyle({
      color: '#e8462a',
      weight: 5,
      opacity: 0.85,
      dashArray: dashed ? '8 8' : null,
      lineJoin: 'round',
      lineCap: 'round',
    })
  } else {
    routeLine = L.polyline(latlngs, {
      color: '#e8462a',
      weight: 5,
      opacity: 0.85,
      dashArray: dashed ? '8 8' : null,
      lineJoin: 'round',
      lineCap: 'round',
    }).addTo(map)
  }
}

/* Round to ~30m precision so trivial driver-location wobble doesn't refetch. */
const routeKey = (from, to) => {
  const r = (n) => n.toFixed(4)
  return `${r(from.lat)},${r(from.lng)}->${r(to.lat)},${r(to.lng)}`
}

const fetchRoadRoute = async (from, to) => {
  const url = `https://router.project-osrm.org/route/v1/driving/`
    + `${from.lng},${from.lat};${to.lng},${to.lat}`
    + `?overview=full&geometries=geojson`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`OSRM ${res.status}`)
  const data = await res.json()
  const coords = data?.routes?.[0]?.geometry?.coordinates
  if (!coords?.length) throw new Error('No route geometry')
  // GeoJSON is [lng, lat] — Leaflet wants [lat, lng]
  return coords.map(([lng, lat]) => [lat, lng])
}

const updateRoute = (from, to) => {
  const key = routeKey(from, to)
  if (key === lastRouteKey && routeLine) return // already drawn for this pair

  // Show straight dashed line immediately as a placeholder while OSRM responds
  if (!routeLine) drawRoute([[from.lat, from.lng], [to.lat, to.lng]], { dashed: true })

  lastRouteKey = key
  const seq = ++routeFetchSeq
  fetchRoadRoute(from, to)
    .then((latlngs) => {
      // Ignore stale responses (a newer fetch has started)
      if (seq !== routeFetchSeq) return
      drawRoute(latlngs, { dashed: false })
    })
    .catch(() => {
      // Fall back to straight dashed line on failure
      if (seq !== routeFetchSeq) return
      drawRoute([[from.lat, from.lng], [to.lat, to.lng]], { dashed: true })
    })
}

const refreshLayers = (isInit = false) => {
  if (!map) return

  // Store
  if (props.storeLocation) {
    if (storeMarker) storeMarker.setLatLng([props.storeLocation.lat, props.storeLocation.lng])
    else storeMarker = L.marker([props.storeLocation.lat, props.storeLocation.lng], { icon: storeIcon() })
      .addTo(map).bindPopup(`<b>${props.storeLocation.name || 'Store'}</b>`)
  } else if (storeMarker) {
    storeMarker.remove(); storeMarker = null
  }

  // Delivery (skip when in delivery-picker mode; we use pickerMarker instead)
  if (props.deliveryLocation && !props.picker) {
    if (deliveryMarker) deliveryMarker.setLatLng([props.deliveryLocation.lat, props.deliveryLocation.lng])
    else deliveryMarker = L.marker([props.deliveryLocation.lat, props.deliveryLocation.lng], { icon: deliveryIcon() })
      .addTo(map).bindPopup(`<b>${props.deliveryLocation.label || 'Delivery Address'}</b>`)
  } else if (deliveryMarker) {
    deliveryMarker.remove(); deliveryMarker = null
  }

  // Driver — animate position transitions for smooth realtime updates
  if (props.driverLocation) {
    if (driverMarker) {
      const cur = driverMarker.getLatLng()
      const next = props.driverLocation
      if (cur.lat !== next.lat || cur.lng !== next.lng) {
        animateMarker(driverMarker, cur, next, 800)
      }
    } else {
      driverMarker = L.marker([props.driverLocation.lat, props.driverLocation.lng], { icon: driverIcon(), zIndexOffset: 1000 })
        .addTo(map).bindPopup('<b>Driver</b>')
    }
  } else if (driverMarker) {
    driverMarker.remove(); driverMarker = null
  }

  // Route: driver → delivery, or store → delivery if no driver
  const from = props.driverLocation || props.storeLocation
  const to   = props.deliveryLocation
  if (from && to) {
    updateRoute(from, to)
  } else if (routeLine) {
    routeLine.remove(); routeLine = null
    lastRouteKey = null
  }

  // Auto-fit ONCE on initial setup (or when no fit has happened yet).
  // Driver-location updates don't trigger another zoom — keeps the user's pan/zoom intact.
  if (props.autoFit && !hasFittedOnce) {
    const fitted = fitBounds()
    if (fitted) hasFittedOnce = true
  }
}

const fitBounds = () => {
  if (!map) return false
  const pts = []
  if (props.storeLocation)    pts.push([props.storeLocation.lat, props.storeLocation.lng])
  if (props.deliveryLocation) pts.push([props.deliveryLocation.lat, props.deliveryLocation.lng])
  if (props.driverLocation)   pts.push([props.driverLocation.lat, props.driverLocation.lng])
  if (pts.length >= 2) {
    map.fitBounds(pts, { padding: [50, 50], maxZoom: 16 })
    return true
  } else if (pts.length === 1) {
    map.setView(pts[0], 15)
    return true
  }
  return false
}

const recenter = () => {
  // Re-fit to all visible markers
  fitBounds()
}

watch(
  () => [props.storeLocation, props.deliveryLocation, props.driverLocation],
  () => refreshLayers(),
  { deep: true }
)

// If driver-picker turns off, ensure nothing else changes
watch(() => props.driverPicker, () => { /* mode change only */ })

onMounted(() => {
  initMap()
  setTimeout(() => map && map.invalidateSize(), 250)
})

onBeforeUnmount(() => {
  if (driverAnim) cancelAnimationFrame(driverAnim)
  if (map) { map.remove(); map = null }
})

defineExpose({
  invalidateSize: () => map && map.invalidateSize(),
  setView: (lat, lng, zoom) => map && map.setView([lat, lng], zoom ?? map.getZoom()),
  placePicker,
  recenter,
  panTo: (lat, lng) => map && map.panTo([lat, lng]),
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #1a1a1a;
}
.delivery-map {
  width: 100%; height: 100%;
  z-index: 0;
}
.recenter-btn {
  position: absolute;
  right: 14px; bottom: 14px;
  z-index: 500;
  width: 38px; height: 38px;
  border-radius: 10px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  color: #f5f0e8;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  transition: all 0.15s;
}
.recenter-btn:hover { border-color: #e8462a; color: #ff6b47; }

.picker-banner {
  position: absolute;
  top: 12px; left: 50%; transform: translateX(-50%);
  z-index: 500;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 100px;
  background: rgba(232,70,42,0.95); color: white;
  font-size: 12px; font-weight: 600;
  box-shadow: 0 4px 14px rgba(0,0,0,0.4);
  pointer-events: none;
}
</style>

<style>
/* Global so divIcon can use them */
.paluto-pin .pin {
  position: relative;
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  color: white;
  box-shadow: 0 6px 14px rgba(0,0,0,0.35);
}
.paluto-pin .pin svg {
  width: 55%; height: 55%;
  transform: rotate(45deg);
}
.paluto-pin .pin-store    { background: #2ecc71; border: 2px solid #1f8c4d; }
.paluto-pin .pin-delivery { background: #e8462a; border: 2px solid #a52d18; }
.paluto-pin .pin-driver {
  background: #3b82f6;
  border: 2px solid #1d4ed8;
  border-radius: 50%;
  transform: none;
}
.paluto-pin .pin-driver svg { transform: none; }

.paluto-pin .pin-driver .pulse {
  position: absolute;
  top: -8px; left: -8px;
  width: calc(100% + 16px); height: calc(100% + 16px);
  border-radius: 50%;
  background: rgba(59,130,246,0.4);
  animation: paluto-pulse 1.6s ease-out infinite;
  z-index: -1;
}
@keyframes paluto-pulse {
  0%   { transform: scale(0.6); opacity: 0.8; }
  100% { transform: scale(1.4); opacity: 0; }
}

/* Leaflet popups in dark theme */
.leaflet-popup-content-wrapper {
  background: #1a1a1a !important;
  color: #f5f0e8 !important;
  border-radius: 10px !important;
  box-shadow: 0 6px 20px rgba(0,0,0,0.5) !important;
}
.leaflet-popup-tip { background: #1a1a1a !important; }
.leaflet-popup-content { margin: 8px 14px !important; font-size: 13px; }
.leaflet-container { font-family: inherit; }
</style>
