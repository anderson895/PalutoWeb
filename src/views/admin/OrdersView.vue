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
      </div>
    </div>
    <div v-else class="empty-state">
      <p>No {{ filter !== 'all' ? filter : '' }} orders</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useOrderStore } from '@/stores/orders'
import { useToastStore } from '@/stores/toast'
import {
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  ChatBubbleLeftIcon,
  ChevronDownIcon,
  CheckIcon,
} from '@heroicons/vue/24/outline'

const orderStore = useOrderStore()
const toast = useToastStore()
const filter = ref('all')
const openDropdown = ref(null)

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