<template>
  <div class="track-page container">
    <button class="btn btn-ghost back-btn" @click="$router.back()">
      <ArrowLeftIcon class="btn-icon" /> Back
    </button>

    <div v-if="loading" class="loading-overlay">
      <div class="spinner" />
    </div>

    <div v-else-if="!order" class="empty">
      <ExclamationTriangleIcon class="empty-icon" />
      <h2>Order not found</h2>
      <router-link to="/orders" class="btn btn-primary">My Orders</router-link>
    </div>

    <div v-else class="track-layout">

      <!-- Map -->
      <div class="map-wrap card">
        <DeliveryMap
          :store-location="storePoint"
          :delivery-location="deliveryPoint"
          :driver-location="driverPoint"
          height="540px"
          :interactive="true"
          :auto-fit="true"
          :show-recenter="true"
        />
      </div>

      <!-- Info panel -->
      <aside class="info card">

        <!-- Status banner -->
        <div class="status-banner" :class="`status-${order.status}`">
          <component :is="statusIcon(order.status)" class="status-banner-icon" />
          <div>
            <div class="status-banner-title">{{ statusTitle(order.status) }}</div>
            <div class="status-banner-sub">{{ statusSub(order.status) }}</div>
          </div>
        </div>

        <!-- Distance / ETA -->
        <div class="metric-row" v-if="distanceKm !== null">
          <div class="metric">
            <span class="metric-label">Distance</span>
            <span class="metric-value">{{ distanceKm.toFixed(2) }} km</span>
          </div>
          <div class="metric">
            <span class="metric-label">Est. arrival</span>
            <span class="metric-value">{{ etaLabel }}</span>
          </div>
        </div>

        <!-- Live indicator -->
        <div class="live-row" v-if="driverPoint">
          <span class="live-dot" />
          <span>Driver location · updated {{ relTime(order.driverLocationUpdatedAt) }}</span>
        </div>
        <div class="live-row offline" v-else-if="!deliveryPoint">
          <span class="live-dot off" />
          <span>No delivery pin saved. Live map tracking unavailable for this order.</span>
        </div>
        <div class="live-row offline" v-else>
          <span class="live-dot off" />
          <span>Waiting for driver to start sharing location...</span>
        </div>

        <!-- Order summary -->
        <div class="section">
          <div class="section-title">Order</div>
          <div class="row"><span>Order #</span><span class="mono">{{ order.id.slice(-8).toUpperCase() }}</span></div>
          <div class="row"><span>Items</span><span>{{ totalItems }}</span></div>
          <div class="row"><span>Total</span><span>₱{{ order.total?.toFixed(2) }}</span></div>
          <div class="row"><span>Payment</span><span>{{ order.payment?.toUpperCase() }}</span></div>
        </div>

        <!-- Items list -->
        <div class="section" v-if="order.items?.length">
          <div class="section-title">Items</div>
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <img :src="item.image || 'https://via.placeholder.com/40?text=F'" :alt="item.name" />
              <span class="order-item-name">{{ item.name }}</span>
              <span class="order-item-qty">x{{ item.qty }}</span>
              <span class="order-item-price">₱{{ (item.price * item.qty).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Delivery -->
        <div class="section">
          <div class="section-title">Delivery to</div>
          <div class="address">
            <MapPinIcon class="addr-icon" />
            <div>
              <div class="addr-main">{{ order.address }}</div>
              <div class="addr-sub" v-if="order.userName">{{ order.userName }} · {{ order.userPhone }}</div>
            </div>
          </div>
        </div>

        <!-- Pickup -->
        <div class="section" v-if="storePoint">
          <div class="section-title">From</div>
          <div class="address">
            <BuildingStorefrontIcon class="addr-icon green" />
            <div>
              <div class="addr-main">{{ settingsStore.store?.name || 'Paluto' }}</div>
              <div class="addr-sub" v-if="settingsStore.store?.address">{{ settingsStore.store.address }}</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderStore } from '@/stores/orders'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import DeliveryMap from '@/components/DeliveryMap.vue'

import {
  ArrowLeftIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  FireIcon,
  BellAlertIcon,
  TruckIcon,
  NoSymbolIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const orderStore = useOrderStore()
const settingsStore = useSettingsStore()
const auth = useAuthStore()

const order = ref(null)
const loading = ref(true)
let unsubscribe = null
let tick = null
const now = ref(Date.now())

const storePoint = computed(() => {
  if (order.value?.storeLocation?.lat) return order.value.storeLocation
  if (settingsStore.store?.lat) return settingsStore.store
  return null
})
const deliveryPoint = computed(() => order.value?.deliveryLocation || null)
const driverPoint   = computed(() => order.value?.driverLocation || null)

const totalItems = computed(() =>
  order.value?.items?.reduce((sum, it) => sum + (it.qty || 0), 0) || 0
)

/* Haversine distance in km */
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
  if (driverPoint.value && deliveryPoint.value) {
    return haversine(driverPoint.value, deliveryPoint.value)
  }
  if (storePoint.value && deliveryPoint.value) {
    return haversine(storePoint.value, deliveryPoint.value)
  }
  return null
})

// Assume 25 km/h average for delivery riders
const etaLabel = computed(() => {
  if (distanceKm.value === null) return '—'
  const mins = Math.max(1, Math.round((distanceKm.value / 25) * 60))
  if (mins < 60) return `~${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `~${h}h ${m}m`
})

const relTime = (d) => {
  if (!d) return '—'
  const diff = Math.max(0, now.value - new Date(d).getTime())
  const s = Math.floor(diff / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

const STATUS_ICONS = {
  pending:   ClockIcon,
  confirmed: CheckCircleIcon,
  preparing: FireIcon,
  ready:     BellAlertIcon,
  delivered: TruckIcon,
  cancelled: NoSymbolIcon,
}
const statusIcon = (s) => STATUS_ICONS[s] || ClockIcon

const statusTitle = (s) => ({
  pending:   'Order received',
  confirmed: 'Order confirmed',
  preparing: 'Preparing your food',
  ready:     'Out for delivery',
  delivered: 'Delivered!',
  cancelled: 'Cancelled',
}[s] || s)

const statusSub = (s) => ({
  pending:   'Waiting for the store to confirm.',
  confirmed: 'Your order is in the queue.',
  preparing: 'The kitchen is cooking your meal.',
  ready:     'Your rider is on the way.',
  delivered: 'Enjoy your meal!',
  cancelled: 'This order was cancelled.',
}[s] || '')

onMounted(async () => {
  await settingsStore.fetchStore()
  const id = route.params.id

  unsubscribe = orderStore.subscribeToOrder(id, (o) => {
    if (o && (o.userId === auth.user?.uid || auth.isAdmin)) {
      order.value = o
    } else if (o) {
      order.value = null // not allowed
    } else {
      order.value = null
    }
    loading.value = false
  })

  tick = setInterval(() => { now.value = Date.now() }, 10000)
})

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe()
  if (tick) clearInterval(tick)
})
</script>

<style scoped>
.track-page { padding: 24px 24px 80px; max-width: 1200px; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 12px; }
.btn-icon { width: 15px; height: 15px; }

.loading-overlay {
  display: flex; justify-content: center; padding: 80px 20px;
}
.empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; padding: 80px 24px; text-align: center;
}
.empty-icon { width: 44px; height: 44px; color: var(--accent); }
.empty h2 { font-size: 20px; font-weight: 700; }

.track-layout {
  display: grid; grid-template-columns: 1fr 360px; gap: 20px; align-items: start;
}
.map-wrap { padding: 10px; }
.info { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

/* Status banner */
.status-banner {
  display: flex; align-items: center; gap: 12px;
  padding: 14px; border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg3);
}
.status-banner-icon { width: 28px; height: 28px; flex-shrink: 0; }
.status-banner-title { font-size: 15px; font-weight: 700; }
.status-banner-sub { font-size: 12px; color: var(--text2); margin-top: 2px; }

.status-pending   { border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.06); }
.status-pending   .status-banner-icon { color: #f59e0b; }
.status-confirmed { border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.06); }
.status-confirmed .status-banner-icon { color: #3b82f6; }
.status-preparing { border-color: rgba(139,92,246,0.3); background: rgba(139,92,246,0.06); }
.status-preparing .status-banner-icon { color: #8b5cf6; }
.status-ready     { border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.06); }
.status-ready     .status-banner-icon { color: #10b981; }
.status-delivered { border-color: rgba(107,114,128,0.3); background: rgba(107,114,128,0.06); }
.status-delivered .status-banner-icon { color: #6b7280; }
.status-cancelled { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.06); }
.status-cancelled .status-banner-icon { color: #ef4444; }

/* Metrics */
.metric-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.metric {
  background: var(--bg3); border: 1px solid var(--border);
  border-radius: 10px; padding: 12px;
  display: flex; flex-direction: column; gap: 4px;
}
.metric-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text2); }
.metric-value { font-size: 18px; font-weight: 700; color: var(--text); }

/* Live indicator */
.live-row {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: var(--text2);
  padding: 8px 12px; border-radius: 8px;
  background: rgba(46,204,113,0.06);
  border: 1px solid rgba(46,204,113,0.2);
}
.live-row.offline {
  background: var(--bg3); border-color: var(--border);
}
.live-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #2ecc71;
  box-shadow: 0 0 0 0 rgba(46,204,113,0.7);
  animation: live-pulse 1.4s infinite;
}
.live-dot.off { background: #6b7280; animation: none; box-shadow: none; }
@keyframes live-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(46,204,113,0.7); }
  70%  { box-shadow: 0 0 0 8px rgba(46,204,113,0); }
  100% { box-shadow: 0 0 0 0 rgba(46,204,113,0); }
}

/* Sections */
.section {
  border-top: 1px solid var(--border); padding-top: 14px;
  display: flex; flex-direction: column; gap: 8px;
}
.section-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--text2);
}
.row {
  display: flex; justify-content: space-between;
  font-size: 13px; color: var(--text2);
}
.row span:last-child { color: var(--text); font-weight: 600; }
.mono { font-family: monospace; letter-spacing: 0.05em; }

/* Items list */
.order-items { display: flex; flex-direction: column; gap: 8px; }
.order-item { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.order-item img {
  width: 36px; height: 36px; border-radius: 6px;
  object-fit: cover; flex-shrink: 0;
  background: var(--bg3);
}
.order-item-name { flex: 1; color: var(--text); font-weight: 500; }
.order-item-qty { color: var(--text2); font-size: 12px; }
.order-item-price { font-weight: 600; color: var(--accent2); }

.address {
  display: flex; align-items: flex-start; gap: 8px;
  font-size: 13px;
}
.addr-icon { width: 18px; height: 18px; color: var(--accent); flex-shrink: 0; margin-top: 2px; }
.addr-icon.green { color: #2ecc71; }
.addr-main { font-weight: 600; color: var(--text); }
.addr-sub { font-size: 12px; color: var(--text2); margin-top: 2px; }

@media (max-width: 900px) {
  .track-layout { grid-template-columns: 1fr; }
}
</style>
