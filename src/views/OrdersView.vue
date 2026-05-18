<template>
  <div class="orders-page container">
    <div class="orders-header">
      <h1>{{ viewMode === 'my' ? 'My Orders' : 'All Orders' }}</h1>

      <div class="view-toggle-group" v-if="auth.isAdmin">
        <button class="toggle-btn" :class="{ active: viewMode === 'my' }" @click="switchMode('my')">
          <ShoppingCartIcon class="toggle-icon" /> My Orders
        </button>
        <button class="toggle-btn" :class="{ active: viewMode === 'all' }" @click="switchMode('all')">
          <ClipboardDocumentListIcon class="toggle-icon" /> All Orders
        </button>
      </div>
    </div>

    <div class="history-toggle-group">
      <button class="toggle-btn" :class="{ active: tab === 'active' }" @click="tab = 'active'">
        <BellAlertIcon class="toggle-icon" /> Active
        <span v-if="activeCount" class="count-pill">{{ activeCount }}</span>
      </button>
      <button class="toggle-btn" :class="{ active: tab === 'history' }" @click="tab = 'history'">
        <ClockIcon class="toggle-icon" /> History
        <span v-if="historyCount" class="count-pill">{{ historyCount }}</span>
      </button>
    </div>

    <div v-if="orderStore.loading" class="loading-overlay"><div class="spinner"></div></div>

    <div v-else-if="displayOrders.length" class="orders-list">
      <div v-for="order in displayOrders" :key="order.id" class="order-card card">
        <div class="order-header">
          <div>
            <div class="order-id">#{{ order.id.slice(-8).toUpperCase() }}</div>
            <div class="order-date">
              <CalendarDaysIcon class="meta-icon" />
              {{ formatDate(order.createdAt) }}
            </div>
            <div class="order-customer-name" v-if="viewMode === 'all'">
              <UserIcon class="meta-icon" /> {{ order.userName }}
              <span class="separator">·</span>
              <PhoneIcon class="meta-icon" /> {{ order.userPhone }}
            </div>
          </div>
          <span class="tag" :class="`status-${order.status}`">
            <component :is="statusIcon(order.status)" class="status-icon" />
            {{ statusLabel(order.status) }}
          </span>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <img :src="item.image || 'https://via.placeholder.com/40?text=F'" :alt="item.name" />
            <span class="order-item-name">{{ item.name }}</span>
            <span class="order-item-qty">x{{ item.qty }}</span>
            <span class="order-item-price">₱{{ (item.price * item.qty).toFixed(2) }}</span>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-address">
            <MapPinIcon class="meta-icon" /> {{ order.address }}
          </div>
          <div class="order-total">Total: <strong>₱{{ order.total?.toFixed(2) }}</strong></div>
        </div>

        <div class="order-notes" v-if="order.notes">
          <ChatBubbleLeftIcon class="meta-icon" /> {{ order.notes }}
        </div>

        <div class="order-track-row" v-if="canTrack(order)">
          <router-link :to="`/track/${order.id}`" class="btn btn-primary track-btn">
            <MapIcon class="btn-icon" />
            Track Order
            <span v-if="order.driverLocation" class="live-pill">
              <span class="live-dot-sm" /> LIVE
            </span>
          </router-link>
        </div>

        <div class="order-admin-actions" v-if="auth.isAdmin && viewMode === 'all'">
          <div class="select-wrap">
            <AdjustmentsHorizontalIcon class="select-icon" />
            <select class="status-select" :value="order.status" @change="updateStatus(order.id, $event.target.value)">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDownIcon class="select-chevron" />
          </div>
          <router-link to="/admin/orders" class="btn btn-outline admin-link">
            <ArrowTopRightOnSquareIcon class="btn-icon" />
            Full Admin View
          </router-link>
        </div>
      </div>
    </div>

    <div v-else class="empty-orders">
      <div class="empty-icon-wrap">
        <component :is="tab === 'history' ? ClockIcon : (viewMode === 'all' ? ClipboardDocumentListIcon : ShoppingCartIcon)" class="empty-svg" />
      </div>
      <h3>{{ emptyTitle }}</h3>
      <p>{{ emptyBody }}</p>
      <router-link v-if="tab === 'active' && viewMode === 'my'" to="/menu" class="btn btn-primary">
        <SparklesIcon class="btn-icon" /> Browse Menu
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useOrderStore } from '@/stores/orders'
import { useToastStore } from '@/stores/toast'
import {
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ArrowTopRightOnSquareIcon,
  MapIcon,
  SparklesIcon,
  // Status icons
  ClockIcon,
  CheckCircleIcon,
  FireIcon,
  BellAlertIcon,
  TruckIcon,
  NoSymbolIcon,
} from '@heroicons/vue/24/outline'

const auth       = useAuthStore()
const orderStore = useOrderStore()
const toast      = useToastStore()

const viewMode = ref('my')
const tab = ref('active') // 'active' | 'history'

const HISTORY_STATUSES = ['delivered', 'cancelled']
const isHistory = (o) => HISTORY_STATUSES.includes(o.status)

const sourceOrders = computed(() =>
  viewMode.value === 'my' ? orderStore.myOrders : orderStore.orders
)

const activeCount  = computed(() => sourceOrders.value.filter((o) => !isHistory(o)).length)
const historyCount = computed(() => sourceOrders.value.filter(isHistory).length)

const displayOrders = computed(() =>
  sourceOrders.value.filter((o) => tab.value === 'history' ? isHistory(o) : !isHistory(o))
)

const emptyTitle = computed(() => {
  if (tab.value === 'history') {
    return viewMode.value === 'all' ? 'No order history yet' : 'No past orders yet'
  }
  return viewMode.value === 'all' ? 'No active orders' : 'You have no active orders'
})
const emptyBody = computed(() => {
  if (tab.value === 'history') {
    return viewMode.value === 'all'
      ? 'Completed and cancelled orders will appear here.'
      : 'Your completed and cancelled orders will show up here.'
  }
  return viewMode.value === 'all'
    ? 'New orders will appear here as customers place them.'
    : 'Start ordering delicious Filipino food!'
})

const switchMode = async (mode) => {
  viewMode.value = mode
  if (mode === 'all') await orderStore.fetchAllOrders()
  else await orderStore.fetchMyOrders(auth.user.uid)
}

const updateStatus = async (id, status) => {
  try {
    await orderStore.updateOrderStatus(id, status)
    toast.success('Order status updated!')
    await orderStore.fetchAllOrders()
  } catch {
    toast.error('Failed to update status')
  }
}

const formatDate = (d) => new Date(d).toLocaleDateString('en-PH', {
  year: 'numeric', month: 'short', day: 'numeric',
  hour: '2-digit', minute: '2-digit'
})

const STATUS_ICONS = {
  pending:   ClockIcon,
  confirmed: CheckCircleIcon,
  preparing: FireIcon,
  ready:     BellAlertIcon,
  delivered: TruckIcon,
  cancelled: NoSymbolIcon,
}
const statusIcon  = (s) => STATUS_ICONS[s] || ClockIcon

const canTrack = (o) =>
  !['delivered', 'cancelled'].includes(o.status)
const statusLabel = (s) => ({
  pending:   'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready:     'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}[s] || s)

onMounted(() => orderStore.fetchMyOrders(auth.user.uid))
</script>

<style scoped>
.orders-page { padding: 40px 24px 80px; max-width: 860px; }

.orders-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
}
h1 { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; }

/* Toggle */
.view-toggle-group,
.history-toggle-group {
  display: flex; background: var(--bg3); border: 1px solid var(--border);
  border-radius: 12px; padding: 4px; gap: 4px;
}
.history-toggle-group { margin-bottom: 20px; align-self: flex-start; }
.toggle-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 8px; border: none;
  background: transparent; color: var(--text2);
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.toggle-btn.active { background: var(--accent); color: white; }
.toggle-btn:not(.active):hover { background: var(--border); color: var(--text); }
.toggle-icon { width: 15px; height: 15px; }
.count-pill {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 6px;
  border-radius: 100px; font-size: 11px; font-weight: 700;
  background: rgba(255,255,255,0.2);
}
.toggle-btn:not(.active) .count-pill {
  background: var(--border); color: var(--text2);
}

.orders-list { display: flex; flex-direction: column; gap: 16px; }
.order-card { padding: 20px; }

.order-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border);
}
.order-id { font-weight: 700; font-size: 15px; font-family: monospace; letter-spacing: 0.05em; }
.order-date { display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--text2); margin-top: 4px; }
.order-customer-name { display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--gold); margin-top: 6px; font-weight: 500; flex-wrap: wrap; }
.separator { color: var(--text2); }
.meta-icon { width: 13px; height: 13px; flex-shrink: 0; }

/* Status tag */
.tag { display: inline-flex; align-items: center; gap: 5px; }
.status-icon { width: 13px; height: 13px; }

.order-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.order-item { display: flex; align-items: center; gap: 10px; font-size: 14px; }
.order-item img { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.order-item-name { flex: 1; }
.order-item-qty { color: var(--text2); }
.order-item-price { font-weight: 600; color: var(--accent2); }

.order-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 12px; border-top: 1px solid var(--border); font-size: 14px;
}
.order-address { display: flex; align-items: center; gap: 5px; color: var(--text2); }
.order-total { font-size: 16px; }
.order-total strong { color: var(--text); }

.order-notes {
  display: flex; align-items: flex-start; gap: 6px;
  margin-top: 10px; font-size: 13px; color: var(--text2);
  font-style: italic; background: var(--bg3); padding: 8px 12px; border-radius: 8px;
}

/* Track button */
.order-track-row {
  margin-top: 12px; padding-top: 12px;
  border-top: 1px solid var(--border);
}
.track-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 16px; font-size: 13px;
}
.live-pill {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(255,255,255,0.18);
  padding: 2px 7px; border-radius: 100px;
  font-size: 10px; font-weight: 800; letter-spacing: 0.08em;
}
.live-dot-sm {
  width: 6px; height: 6px; border-radius: 50%;
  background: #fff;
  animation: live-pill-pulse 1.4s infinite;
}
@keyframes live-pill-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

/* Admin actions */
.order-admin-actions {
  display: flex; align-items: center; gap: 10px;
  margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); flex-wrap: wrap;
}
.select-wrap { position: relative; display: flex; align-items: center; flex: 1; min-width: 180px; }
.select-icon { position: absolute; left: 10px; width: 15px; height: 15px; color: var(--text2); pointer-events: none; z-index: 1; }
.select-chevron { position: absolute; right: 10px; width: 13px; height: 13px; color: var(--text2); pointer-events: none; }
.status-select {
  width: 100%; background: var(--bg3); border: 1px solid var(--border);
  color: var(--text); padding: 8px 32px 8px 32px;
  border-radius: 8px; font-size: 13px; cursor: pointer; appearance: none;
}
.admin-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; padding: 8px 14px; }
.btn-icon { width: 14px; height: 14px; }

/* Empty state */
.empty-orders {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 80px 40px; text-align: center; gap: 16px;
}
.empty-icon-wrap { opacity: 0.3; }
.empty-svg { width: 52px; height: 52px; }
.empty-orders h3 { font-size: 22px; font-weight: 700; }
.empty-orders p { color: var(--text2); max-width: 360px; line-height: 1.6; }

@media (max-width: 600px) {
  .orders-header { flex-direction: column; align-items: flex-start; }
}
</style>