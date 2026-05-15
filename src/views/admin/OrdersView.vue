<template>
  <div class="admin-orders">
    <h1>Orders Management</h1>
    <div class="orders-filter">
      <button v-for="s in statuses" :key="s.value"
        class="filter-btn" :class="{ active: filter === s.value }"
        @click="filter = s.value">
        {{ s.label }}
        <span class="filter-count" v-if="s.value !== 'all'">
          {{ orderStore.orders.filter(o => o.status === s.value).length }}
        </span>
      </button>
    </div>
    <div v-if="filteredOrders.length" class="orders-grid">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card card">
        <div class="order-card-header">
          <div>
            <div class="order-id">#{{ order.id.slice(-8).toUpperCase() }}</div>
            <div class="order-time">{{ formatDate(order.createdAt) }}</div>
          </div>
          <div class="status-dropdown" v-click-outside="() => closeDropdown(order.id)">
            <button class="status-btn" :class="order.status" @click="toggleDropdown(order.id)">
              <span>{{ order.status }}</span>
              <ChevronDownIcon class="chevron-icon" :class="{ open: openDropdown === order.id }" />
            </button>
            <div class="status-menu" v-if="openDropdown === order.id">
              <button
                v-for="s in statusOptions" :key="s"
                class="status-menu-item" :class="{ active: order.status === s }"
                @click="selectStatus(order.id, s)">
                <CheckIcon class="check-icon" v-if="order.status === s" />
                <span v-else class="check-spacer" />
                {{ s }}
              </button>
            </div>
          </div>
        </div>
        <div class="order-customer">
          <span class="meta-item">
            <UserIcon class="meta-icon" />
            {{ order.userName }}
          </span>
          <span class="meta-item">
            <PhoneIcon class="meta-icon" />
            {{ order.userPhone }}
          </span>
        </div>
        <div class="order-address">
          <MapPinIcon class="meta-icon" />
          {{ order.address }}
        </div>
        <div class="order-items-list">
          <div v-for="item in order.items" :key="item.id" class="order-item-row">
            <span>{{ item.name }}</span>
            <span class="item-qty">×{{ item.qty }}</span>
            <span>₱{{ (item.price * item.qty).toFixed(2) }}</span>
          </div>
        </div>
        <div class="order-card-footer">
          <span class="pay-method">
            <CreditCardIcon class="meta-icon" />
            {{ order.payment?.toUpperCase() }}
          </span>
          <span class="order-total">Total: ₱{{ order.total?.toFixed(2) }}</span>
        </div>
        <div class="order-notes" v-if="order.notes">
          <ChatBubbleLeftIcon class="meta-icon" />
          {{ order.notes }}
        </div>

        <!-- Live tracking control -->
        <div class="track-row" v-if="canTrack(order)">
          <button
            class="map-btn"
            @click="openMap(order)"
          >
            <MapIcon class="track-icon" />
            View Map
            <span v-if="order.driverLocation" class="live-pill-sm">
              <span class="live-dot-sm" /> LIVE
            </span>
            <span v-else-if="!order.deliveryLocation" class="no-pin-pill">No pin</span>
          </button>
          <template v-if="order.deliveryLocation">
            <button
              v-if="trackingId !== order.id"
              class="track-btn"
              @click="startTracking(order)"
            >
              <SignalIcon class="track-icon" />
              Share Live Location
            </button>
            <button
              v-else
              class="track-btn active"
              @click="stopTracking"
            >
              <span class="track-pulse" />
              Stop Sharing ({{ trackingFix }})
            </button>
          </template>
          <span v-if="order.driverLocation" class="track-status">
            <MapPinIcon class="meta-icon" />
            Last update: {{ formatRelative(order.driverLocationUpdatedAt) }}
          </span>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>No {{ filter !== 'all' ? filter : '' }} orders</p>
    </div>

    <!-- Map modal -->
    <teleport to="body">
      <div v-if="mapOrder" class="map-overlay" @click.self="closeMap">
        <div class="map-modal">

          <div class="map-modal-header">
            <div class="map-modal-title">
              <MapIcon class="map-modal-title-icon" />
              <div>
                <div class="map-modal-h">Delivery Location</div>
                <div class="map-modal-sub">
                  Order #{{ mapOrder.id.slice(-8).toUpperCase() }} ·
                  {{ mapOrder.userName }}
                </div>
              </div>
            </div>
            <button class="map-close" @click="closeMap" aria-label="Close">
              <XMarkIcon class="map-close-icon" />
            </button>
          </div>

          <div class="map-modal-body">
            <div v-if="!mapOrder.deliveryLocation && !pickDeliveryMode" class="no-pin-banner">
              <ExclamationTriangleIcon class="no-pin-icon" />
              <div>
                <div class="no-pin-title">No delivery pin saved</div>
                <div class="no-pin-sub">
                  Customer didn't pin a location. You can set it manually based on the address:
                  <strong>{{ mapOrder.address || '—' }}</strong>
                </div>
              </div>
              <button class="no-pin-btn" @click="startPickDelivery">
                <MapPinIcon class="map-action-icon" /> Set Delivery Pin
              </button>
            </div>
            <DeliveryMap
              :store-location="storePoint"
              :delivery-location="mapOrder.deliveryLocation"
              :driver-location="mapOrder.driverLocation"
              :driver-picker="manualMode"
              :picker="pickDeliveryMode"
              :initial-center="storePoint || { lat: 14.5995, lng: 120.9842 }"
              height="100%"
              :interactive="true"
              :auto-fit="true"
              :show-recenter="true"
              @pick-driver="onPickDriver"
              @pick="onPickDelivery"
            />
          </div>

          <div class="map-modal-footer">

            <!-- Customer address -->
            <div class="map-info">
              <div class="map-info-row">
                <MapPinIcon class="map-info-icon" />
                <div>
                  <div class="map-info-label">Deliver to</div>
                  <div class="map-info-value">{{ mapOrder.address }}</div>
                </div>
              </div>
              <div class="map-info-row">
                <PhoneIcon class="map-info-icon" />
                <div>
                  <div class="map-info-label">Customer</div>
                  <div class="map-info-value">{{ mapOrder.userName }} · {{ mapOrder.userPhone }}</div>
                </div>
              </div>
              <div class="map-info-row" v-if="distanceKm !== null">
                <SignalIcon class="map-info-icon" />
                <div>
                  <div class="map-info-label">Distance</div>
                  <div class="map-info-value">
                    {{ distanceKm.toFixed(2) }} km · ~{{ etaMin }} min
                    <span v-if="mapOrder.driverLocation" class="from-tag">from driver</span>
                    <span v-else class="from-tag">from store</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="map-actions">
              <button
                v-if="pickDeliveryMode"
                class="map-manual-btn active"
                @click="cancelPickDelivery"
              >
                <XMarkIcon class="map-action-icon" />
                Cancel Pin
              </button>
              <button
                v-else-if="mapOrder.deliveryLocation"
                class="map-manual-btn"
                @click="startPickDelivery"
                title="Re-pin the delivery location"
              >
                <MapPinIcon class="map-action-icon" />
                Edit Delivery Pin
              </button>

              <template v-if="mapOrder.deliveryLocation && !pickDeliveryMode">
                <button
                  class="map-manual-btn"
                  :class="{ active: manualMode }"
                  @click="toggleManual(mapOrder)"
                  :title="manualMode ? 'Click map to place pin' : 'Set driver location manually'"
                >
                  <PencilSquareIcon class="map-action-icon" />
                  {{ manualMode ? 'Tap map to set driver…' : 'Set Driver Manually' }}
                </button>
                <a
                  :href="googleMapsUrl(mapOrder.deliveryLocation)"
                  target="_blank"
                  rel="noopener"
                  class="map-action-link"
                >
                  <ArrowTopRightOnSquareIcon class="map-action-icon" />
                  Google Maps
                </a>
                <button
                  v-if="trackingId !== mapOrder.id"
                  class="map-share-btn"
                  @click="startTracking(mapOrder)"
                >
                  <SignalIcon class="track-icon" />
                  Share Live Location
                </button>
                <button
                  v-else
                  class="map-share-btn active"
                  @click="stopTracking"
                >
                  <span class="track-pulse" />
                  Stop Sharing ({{ trackingFix }})
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import { useOrderStore } from '@/stores/orders'
import { useSettingsStore } from '@/stores/settings'
import { useToastStore } from '@/stores/toast'
import DeliveryMap from '@/components/DeliveryMap.vue'
import {
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  MapIcon,
  CreditCardIcon,
  ChatBubbleLeftIcon,
  ChevronDownIcon,
  CheckIcon,
  SignalIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

const orderStore = useOrderStore()
const settingsStore = useSettingsStore()
const toast = useToastStore()
const filter = ref('all')
const openDropdown = ref(null)

const mapOrderId = ref(null)
const mapOrder = computed(() => {
  if (!mapOrderId.value) return null
  return orderStore.orders.find(o => o.id === mapOrderId.value) || null
})
const storePoint = computed(() => {
  if (mapOrder.value?.storeLocation?.lat) return mapOrder.value.storeLocation
  if (settingsStore.store?.lat) return settingsStore.store
  return null
})

const manualMode = ref(false)
const pickDeliveryMode = ref(false)

const openMap = (order) => {
  mapOrderId.value = order.id
  manualMode.value = false
  pickDeliveryMode.value = false
}
const closeMap = () => {
  mapOrderId.value = null
  manualMode.value = false
  pickDeliveryMode.value = false
}

const toggleManual = (order) => {
  // Manual override conflicts with auto GPS sharing — stop sharing first
  if (trackingId.value === order.id) {
    stopTracking()
  }
  pickDeliveryMode.value = false
  manualMode.value = !manualMode.value
}

const startPickDelivery = () => {
  manualMode.value = false
  pickDeliveryMode.value = true
}
const cancelPickDelivery = () => {
  pickDeliveryMode.value = false
}

const onPickDriver = async ({ lat, lng }) => {
  if (!mapOrder.value) return
  try {
    await orderStore.updateDriverLocation(mapOrder.value.id, lat, lng)
    toast.success('Driver location set')
  } catch {
    toast.error('Failed to update location')
  }
}

const onPickDelivery = async ({ lat, lng }) => {
  if (!mapOrder.value) return
  try {
    await orderStore.updateDeliveryLocation(mapOrder.value.id, lat, lng)
    pickDeliveryMode.value = false
    toast.success('Delivery pin saved')
  } catch {
    toast.error('Failed to save delivery pin')
  }
}

const haversine = (a, b) => {
  if (!a || !b) return null
  const R = 6371
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat)
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const distanceKm = computed(() => {
  if (!mapOrder.value?.deliveryLocation) return null
  const from = mapOrder.value.driverLocation || storePoint.value
  if (!from) return null
  return haversine(from, mapOrder.value.deliveryLocation)
})
const etaMin = computed(() => {
  if (distanceKm.value === null) return '—'
  return Math.max(1, Math.round((distanceKm.value / 25) * 60))
})

const googleMapsUrl = (loc) =>
  `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`

onMounted(() => settingsStore.fetchStore())

const toggleDropdown = (id) => {
  openDropdown.value = openDropdown.value === id ? null : id
}
const closeDropdown = (id) => {
  if (openDropdown.value === id) openDropdown.value = null
}
const selectStatus = async (id, status) => {
  openDropdown.value = null
  try {
    await orderStore.updateOrderStatus(id, status)
    toast.success('Order status updated')
  } catch {
    toast.error('Failed to update status')
  }
}

const statuses = [
  { value: 'all',       label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready',     label: 'Ready' },
  { value: 'delivered', label: 'Delivered' },
]
const statusOptions = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']

const filteredOrders = computed(() =>
  filter.value === 'all'
    ? orderStore.orders
    : orderStore.orders.filter(o => o.status === filter.value)
)

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

const formatRelative = (d) => {
  if (!d) return '—'
  const diff = Date.now() - new Date(d).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 5)    return 'just now'
  if (s < 60)   return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60)   return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)   return `${h}h ago`
  return new Date(d).toLocaleDateString('en-PH')
}

const canTrack = (o) =>
  !['delivered', 'cancelled'].includes(o.status)

const trackingId   = ref(null)
const trackingFix  = ref('locating...')
let watchHandle = null

const startTracking = (order) => {
  if (!navigator.geolocation) {
    toast.error('Geolocation not supported by this browser')
    return
  }
  if (watchHandle !== null) {
    navigator.geolocation.clearWatch(watchHandle)
    watchHandle = null
  }
  trackingId.value = order.id
  trackingFix.value = 'locating...'

  watchHandle = navigator.geolocation.watchPosition(
    async (pos) => {
      const { latitude, longitude, accuracy } = pos.coords
      trackingFix.value = `±${Math.round(accuracy)}m`
      try {
        await orderStore.updateDriverLocation(order.id, latitude, longitude)
      } catch {
        toast.error('Failed to push location')
      }
    },
    (err) => {
      toast.error(err.message || 'Location error')
      stopTracking()
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  )
  toast.success('Live tracking started')
}

const stopTracking = async () => {
  if (watchHandle !== null) {
    navigator.geolocation.clearWatch(watchHandle)
    watchHandle = null
  }
  const id = trackingId.value
  trackingId.value = null
  trackingFix.value = 'locating...'
  if (id) {
    try { await orderStore.clearDriverLocation(id) } catch {}
  }
  toast.success('Stopped sharing location')
}

onBeforeUnmount(() => {
  if (watchHandle !== null) navigator.geolocation.clearWatch(watchHandle)
})

// v-click-outside directive (inline, no plugin needed)
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => { if (!el.contains(e.target)) binding.value(e) }
    document.addEventListener('pointerdown', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('pointerdown', el._clickOutside)
  }
}
</script>

<style scoped>
/* ── Base layout ── */
.admin-orders { max-width: 1200px; padding: 0 16px; }
h1 { font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 20px; }

/* ── Filter bar — horizontally scrollable on mobile ── */
.orders-filter {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
  margin-bottom: 20px;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.orders-filter::-webkit-scrollbar { display: none; }

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.filter-btn:hover  { border-color: var(--accent); color: var(--accent); }
.filter-btn.active { background: var(--accent); border-color: var(--accent); color: white; }
.filter-count {
  background: rgba(255,255,255,0.2);
  border-radius: 100px;
  padding: 1px 7px;
  font-size: 11px;
}

/* ── Grid — 1 col → 2 col → auto-fill ── */
.orders-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

/* ── Card ── */
.order-card { padding: 16px; }

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 8px;
}
.order-id   { font-weight: 700; font-size: 13px; font-family: monospace; letter-spacing: 0.08em; }
.order-time { font-size: 11px; color: var(--text2); margin-top: 3px; }

/* ── Custom status dropdown ── */
.status-dropdown { position: relative; flex-shrink: 0; }

.status-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg3);
  color: var(--text);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-transform: capitalize;
  transition: border-color 0.15s;
  white-space: nowrap;
}
.status-btn:hover { border-color: var(--accent); }

.status-btn.pending   { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,0.08); }
.status-btn.confirmed { border-color: #3b82f6; color: #3b82f6; background: rgba(59,130,246,0.08); }
.status-btn.preparing { border-color: #8b5cf6; color: #8b5cf6; background: rgba(139,92,246,0.08); }
.status-btn.ready     { border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.08); }
.status-btn.delivered { border-color: #6b7280; color: #6b7280; background: rgba(107,114,128,0.08); }
.status-btn.cancelled { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,0.08); }

.chevron-icon { width: 12px; height: 12px; transition: transform 0.2s; flex-shrink: 0; }
.chevron-icon.open { transform: rotate(180deg); }

.status-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 50;
  background: var(--bg2, #1e1e1e);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 4px;
  min-width: 150px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.status-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  text-transform: capitalize;
  cursor: pointer;
  border-radius: 7px;
  transition: background 0.1s;
  text-align: left;
}
.status-menu-item:hover  { background: var(--bg3); }
.status-menu-item.active { color: var(--accent); font-weight: 600; }
.check-icon   { width: 13px; height: 13px; flex-shrink: 0; color: var(--accent); }
.check-spacer { width: 13px; flex-shrink: 0; display: inline-block; }

/* ── Meta rows ── */
.meta-icon { width: 14px; height: 14px; flex-shrink: 0; }
.meta-item { display: inline-flex; align-items: center; gap: 5px; }

.order-customer {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--text2);
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.order-address {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  font-size: 13px;
  color: var(--text2);
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

/* ── Items list ── */
.order-items-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.order-item-row   { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.order-item-row > span:first-child {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-qty { color: var(--text2); flex-shrink: 0; }

/* ── Footer ── */
.order-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 13px;
  gap: 8px;
}
.pay-method {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text2);
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
}
.order-total { font-weight: 700; font-size: 15px; white-space: nowrap; }

.order-notes {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 10px;
  font-size: 13px;
  color: var(--text2);
  font-style: italic;
  background: var(--bg3);
  padding: 8px 12px;
  border-radius: 8px;
}

.empty-state { text-align: center; padding: 60px 20px; color: var(--text2); }

/* Live tracking */
.track-row {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin-top: 12px; padding-top: 12px;
  border-top: 1px solid var(--border);
}
.track-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 7px 14px; border-radius: 8px;
  background: rgba(59,130,246,0.1); color: #3b82f6;
  border: 1px solid rgba(59,130,246,0.3);
  font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
}
.track-btn:hover { background: rgba(59,130,246,0.18); }
.track-btn.active {
  background: rgba(46,204,113,0.1); color: #2ecc71;
  border-color: rgba(46,204,113,0.3);
}
.track-btn.active:hover { background: rgba(239,68,68,0.12); color: #ef4444; border-color: rgba(239,68,68,0.3); }
.track-icon { width: 14px; height: 14px; }
.track-pulse {
  width: 8px; height: 8px; border-radius: 50%;
  background: #2ecc71;
  box-shadow: 0 0 0 0 rgba(46,204,113,0.7);
  animation: track-pulse 1.4s infinite;
}
@keyframes track-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(46,204,113,0.7); }
  70%  { box-shadow: 0 0 0 10px rgba(46,204,113,0); }
  100% { box-shadow: 0 0 0 0 rgba(46,204,113,0); }
}
.track-status {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; color: var(--text2);
}

/* View Map button */
.map-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 7px 14px; border-radius: 8px;
  background: rgba(232,70,42,0.1); color: var(--accent2);
  border: 1px solid rgba(232,70,42,0.3);
  font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
}
.map-btn:hover { background: rgba(232,70,42,0.18); }
.live-pill-sm {
  display: inline-flex; align-items: center; gap: 4px;
  background: #2ecc71; color: white;
  padding: 1px 6px; border-radius: 100px;
  font-size: 9px; font-weight: 800; letter-spacing: 0.08em;
}
.live-pill-sm .live-dot-sm {
  width: 5px; height: 5px; border-radius: 50%;
  background: white; animation: live-pill-pulse 1.4s infinite;
}
.no-pin-pill {
  background: rgba(245,158,11,0.18); color: #f59e0b;
  padding: 1px 7px; border-radius: 100px;
  font-size: 9px; font-weight: 800; letter-spacing: 0.06em;
  text-transform: uppercase;
}
@keyframes live-pill-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

/* Map modal */
.map-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
  z-index: 3000;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.map-modal {
  width: 100%; max-width: 980px; max-height: 92vh;
  background: var(--bg2, #141414);
  border: 1px solid var(--border);
  border-radius: 16px; overflow: hidden;
  display: flex; flex-direction: column;
}
.map-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.map-modal-title { display: flex; align-items: center; gap: 12px; }
.map-modal-title-icon { width: 22px; height: 22px; color: var(--accent2); }
.map-modal-h { font-size: 16px; font-weight: 700; color: var(--text); }
.map-modal-sub { font-size: 12px; color: var(--text2); margin-top: 2px; }
.map-close {
  width: 34px; height: 34px; border-radius: 9px;
  background: var(--bg3); border: 1px solid var(--border);
  color: var(--text2); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.map-close:hover { color: var(--text); border-color: var(--text2); }
.map-close-icon { width: 16px; height: 16px; }

.map-modal-body {
  flex: 1; min-height: 360px;
  padding: 0; position: relative;
}
.map-modal-body :deep(.map-container),
.map-modal-body :deep(.delivery-map) {
  border-radius: 0;
  height: 100% !important;
  min-height: 360px;
}

/* No-pin banner inside the map modal */
.no-pin-banner {
  position: absolute;
  top: 12px; left: 12px; right: 12px;
  z-index: 600;
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 14px; border-radius: 12px;
  background: rgba(20,20,20,0.95);
  border: 1px solid rgba(245,158,11,0.4);
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
}
.no-pin-icon { width: 22px; height: 22px; color: #f59e0b; flex-shrink: 0; margin-top: 1px; }
.no-pin-title { font-size: 13px; font-weight: 700; color: var(--text); }
.no-pin-sub { font-size: 12px; color: var(--text2); margin-top: 3px; line-height: 1.45; }
.no-pin-sub strong { color: var(--text); font-weight: 600; }
.no-pin-banner > div { flex: 1; min-width: 0; }
.no-pin-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 12px; border-radius: 8px;
  background: var(--accent); color: white;
  border: none; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: opacity 0.15s;
  flex-shrink: 0; align-self: center;
}
.no-pin-btn:hover { opacity: 0.9; }

.map-modal-footer {
  display: grid; grid-template-columns: 1fr auto; gap: 16px;
  padding: 14px 20px; border-top: 1px solid var(--border);
  background: var(--bg3);
  align-items: center; flex-shrink: 0;
}
.map-info {
  display: flex; flex-wrap: wrap; gap: 12px 22px;
}
.map-info-row { display: flex; align-items: flex-start; gap: 8px; }
.map-info-icon { width: 16px; height: 16px; color: var(--accent2); flex-shrink: 0; margin-top: 2px; }
.map-info-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--text2);
}
.map-info-value { font-size: 13px; color: var(--text); font-weight: 600; margin-top: 2px; }
.from-tag {
  font-size: 10px; font-weight: 600; color: var(--text2);
  background: var(--bg); padding: 1px 6px; border-radius: 100px;
  margin-left: 6px;
}

.map-actions {
  display: flex; gap: 8px; align-items: center; flex-shrink: 0;
}
.map-action-link {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 14px; border-radius: 9px;
  background: var(--bg); border: 1px solid var(--border);
  color: var(--text2); font-size: 12px; font-weight: 600;
  text-decoration: none; transition: all 0.15s;
}
.map-action-link:hover { color: var(--text); border-color: var(--text2); }
.map-action-icon { width: 14px; height: 14px; }

.map-manual-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 14px; border-radius: 9px;
  background: var(--bg); border: 1px solid var(--border);
  color: var(--text2); font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.map-manual-btn:hover { color: var(--text); border-color: var(--text2); }
.map-manual-btn.active {
  background: rgba(232,70,42,0.12);
  border-color: rgba(232,70,42,0.4);
  color: var(--accent2);
}
.map-share-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 14px; border-radius: 9px;
  background: rgba(59,130,246,0.12); color: #3b82f6;
  border: 1px solid rgba(59,130,246,0.3);
  font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
}
.map-share-btn:hover { background: rgba(59,130,246,0.2); }
.map-share-btn.active {
  background: rgba(46,204,113,0.12); color: #2ecc71;
  border-color: rgba(46,204,113,0.3);
}
.map-share-btn.active:hover {
  background: rgba(239,68,68,0.12); color: #ef4444;
  border-color: rgba(239,68,68,0.3);
}

@media (max-width: 700px) {
  .map-modal-footer { grid-template-columns: 1fr; }
  .map-actions { width: 100%; flex-wrap: wrap; }
  .map-action-link, .map-share-btn { flex: 1; justify-content: center; }
}

/* ── Tablet: 640px+ → 2 columns ── */
@media (min-width: 640px) {
  h1 { font-size: 30px; }
  .orders-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .order-card  { padding: 18px; }
}

/* ── Desktop: 1024px+ → auto-fill ── */
@media (min-width: 1024px) {
  .admin-orders { padding: 0; }
  h1 { font-size: 32px; margin-bottom: 24px; }
  .orders-filter { flex-wrap: wrap; overflow-x: visible; margin-bottom: 24px; }
  .orders-grid { grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
  .order-card  { padding: 20px; }
  .order-id    { font-size: 14px; }
  .order-time  { font-size: 12px; }
  .status-btn  { font-size: 13px; padding: 6px 12px; }
}
</style>