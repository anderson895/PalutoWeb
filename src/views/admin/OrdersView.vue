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
          <select class="status-select" :value="order.status" @change="updateStatus(order.id, $event.target.value)">
            <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="order-customer">
          <span>👤 {{ order.userName }}</span>
          <span>📞 {{ order.userPhone }}</span>
        </div>
        <div class="order-address">📍 {{ order.address }}</div>
        <div class="order-items-list">
          <div v-for="item in order.items" :key="item.id" class="order-item-row">
            <span>{{ item.name }}</span>
            <span class="item-qty">×{{ item.qty }}</span>
            <span>₱{{ (item.price * item.qty).toFixed(2) }}</span>
          </div>
        </div>
        <div class="order-card-footer">
          <span class="pay-method">💳 {{ order.payment?.toUpperCase() }}</span>
          <span class="order-total">Total: ₱{{ order.total?.toFixed(2) }}</span>
        </div>
        <div class="order-notes" v-if="order.notes">💬 {{ order.notes }}</div>
      </div>
    </div>
    <div v-else class="empty-state"><p>No {{ filter !== 'all' ? filter : '' }} orders</p></div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useOrderStore } from '@/stores/orders'
import { useToastStore } from '@/stores/toast'

const orderStore = useOrderStore()
const toast = useToastStore()
const filter = ref('all')

const statuses = [
  { value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' }, { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' }, { value: 'delivered', label: 'Delivered' },
]
const statusOptions = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']

const filteredOrders = computed(() =>
  filter.value === 'all' ? orderStore.orders : orderStore.orders.filter(o => o.status === filter.value)
)

const updateStatus = async (id, status) => {
  try {
    await orderStore.updateOrderStatus(id, status)
    toast.success('Order status updated')
  } catch { toast.error('Failed to update status') }
}

const formatDate = (d) => new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
</script>
<style scoped>
.admin-orders { max-width: 1200px; }
h1 { font-family: 'Playfair Display', serif; font-size: 32px; margin-bottom: 24px; }
.orders-filter { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
.filter-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 100px; border: 1px solid var(--border); background: transparent; color: var(--text2); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.filter-btn:hover { border-color: var(--accent); color: var(--accent); }
.filter-btn.active { background: var(--accent); border-color: var(--accent); color: white; }
.filter-count { background: rgba(255,255,255,0.2); border-radius: 100px; padding: 1px 7px; font-size: 11px; }
.orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
.order-card { padding: 20px; }
.order-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.order-id { font-weight: 700; font-size: 14px; font-family: monospace; letter-spacing: 0.08em; }
.order-time { font-size: 12px; color: var(--text2); margin-top: 3px; }
.status-select { background: var(--bg3); border: 1px solid var(--border); color: var(--text); padding: 6px 12px; border-radius: 8px; font-size: 13px; cursor: pointer; }
.order-customer { display: flex; gap: 16px; font-size: 13px; color: var(--text2); margin-bottom: 8px; flex-wrap: wrap; }
.order-address { font-size: 13px; color: var(--text2); margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.order-items-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.order-item-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.order-item-row > span:first-child { flex: 1; }
.item-qty { color: var(--text2); }
.order-card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border); font-size: 13px; }
.pay-method { color: var(--text2); text-transform: uppercase; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; }
.order-total { font-weight: 700; font-size: 15px; }
.order-notes { margin-top: 10px; font-size: 13px; color: var(--text2); font-style: italic; background: var(--bg3); padding: 8px 12px; border-radius: 8px; }
.empty-state { text-align: center; padding: 60px; color: var(--text2); }
</style>
