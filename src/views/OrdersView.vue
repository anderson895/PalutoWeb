<template>
  <div class="orders-page container">
    <div class="orders-header">
      <h1>{{ viewMode === 'my' ? 'My Orders' : 'All Orders' }}</h1>

      <!-- Admin toggle: switch between personal orders and all orders -->
      <div class="view-toggle-group" v-if="auth.isAdmin">
        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'my' }"
          @click="switchMode('my')">
          🛒 My Orders
        </button>
        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'all' }"
          @click="switchMode('all')">
          📋 All Orders
        </button>
      </div>
    </div>

    <div v-if="orderStore.loading" class="loading-overlay"><div class="spinner"></div></div>

    <div v-else-if="displayOrders.length" class="orders-list">
      <div v-for="order in displayOrders" :key="order.id" class="order-card card">
        <div class="order-header">
          <div>
            <div class="order-id">#{{ order.id.slice(-8).toUpperCase() }}</div>
            <div class="order-date">{{ formatDate(order.createdAt) }}</div>
            <!-- Show customer name when admin views all orders -->
            <div class="order-customer-name" v-if="viewMode === 'all'">
              👤 {{ order.userName }} · 📞 {{ order.userPhone }}
            </div>
          </div>
          <span class="tag" :class="`status-${order.status}`">{{ statusLabel(order.status) }}</span>
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
          <div class="order-address">📍 {{ order.address }}</div>
          <div class="order-total">Total: <strong>₱{{ order.total?.toFixed(2) }}</strong></div>
        </div>

        <div class="order-notes" v-if="order.notes">
          💬 {{ order.notes }}
        </div>

        <!-- Admin: quick status update inline -->
        <div class="order-admin-actions" v-if="auth.isAdmin && viewMode === 'all'">
          <select class="status-select" :value="order.status" @change="updateStatus(order.id, $event.target.value)">
            <option value="pending">⏳ Pending</option>
            <option value="confirmed">✅ Confirmed</option>
            <option value="preparing">👨‍🍳 Preparing</option>
            <option value="ready">🎉 Ready</option>
            <option value="delivered">✓ Delivered</option>
            <option value="cancelled">✕ Cancelled</option>
          </select>
          <router-link to="/admin/orders" class="btn btn-outline" style="font-size:13px;padding:8px 14px;">
            Full Admin View
          </router-link>
        </div>
      </div>
    </div>

    <div v-else class="empty-orders">
      <div class="empty-icon">{{ viewMode === 'all' ? '📋' : '🛒' }}</div>
      <h3>{{ viewMode === 'all' ? 'No orders in the system yet' : 'You have no orders yet' }}</h3>
      <p>{{ viewMode === 'all' ? 'Orders will appear here once customers start ordering.' : 'Start ordering delicious Filipino food!' }}</p>
      <router-link v-if="viewMode === 'my'" to="/menu" class="btn btn-primary">Browse Menu</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useOrderStore } from '@/stores/orders'
import { useToastStore } from '@/stores/toast'

const auth = useAuthStore()
const orderStore = useOrderStore()
const toast = useToastStore()

// Default: admin sees their personal orders first (they can switch)
const viewMode = ref('my')

const displayOrders = computed(() =>
  viewMode.value === 'my' ? orderStore.myOrders : orderStore.orders
)

const switchMode = async (mode) => {
  viewMode.value = mode
  if (mode === 'all') {
    await orderStore.fetchAllOrders()
  } else {
    await orderStore.fetchMyOrders(auth.user.uid)
  }
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

const statusLabel = (s) => ({
  pending: '⏳ Pending',
  confirmed: '✅ Confirmed',
  preparing: '👨‍🍳 Preparing',
  ready: '🎉 Ready',
  delivered: '✓ Delivered',
  cancelled: '✕ Cancelled'
}[s] || s)

onMounted(() => orderStore.fetchMyOrders(auth.user.uid))
</script>

<style scoped>
.orders-page { padding: 40px 24px 80px; max-width: 860px; }

.orders-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

h1 { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; }

/* Admin toggle */
.view-toggle-group {
  display: flex;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}
.toggle-btn {
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text2);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.toggle-btn.active {
  background: var(--accent);
  color: white;
}
.toggle-btn:not(.active):hover {
  background: var(--border);
  color: var(--text);
}

.orders-list { display: flex; flex-direction: column; gap: 16px; }

.order-card { padding: 20px; }

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.order-id { font-weight: 700; font-size: 15px; font-family: monospace; letter-spacing: 0.05em; }
.order-date { font-size: 13px; color: var(--text2); margin-top: 4px; }
.order-customer-name { font-size: 13px; color: var(--gold); margin-top: 6px; font-weight: 500; }

.order-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.order-item { display: flex; align-items: center; gap: 10px; font-size: 14px; }
.order-item img { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.order-item-name { flex: 1; }
.order-item-qty { color: var(--text2); }
.order-item-price { font-weight: 600; color: var(--accent2); }

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 14px;
}
.order-address { color: var(--text2); }
.order-total { font-size: 16px; }
.order-total strong { color: var(--text); }

.order-notes {
  margin-top: 10px;
  font-size: 13px;
  color: var(--text2);
  font-style: italic;
  background: var(--bg3);
  padding: 8px 12px;
  border-radius: 8px;
}

/* Admin quick actions bar */
.order-admin-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}
.status-select {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  flex: 1;
  min-width: 180px;
}

.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
  gap: 16px;
}
.empty-icon { font-size: 48px; opacity: 0.4; }
.empty-orders h3 { font-size: 22px; font-weight: 700; }
.empty-orders p { color: var(--text2); max-width: 360px; line-height: 1.6; }

@media (max-width: 600px) {
  .orders-header { flex-direction: column; align-items: flex-start; }
}
</style>
