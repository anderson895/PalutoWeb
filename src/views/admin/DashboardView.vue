<template>
  <div class="dashboard">
    <div class="dash-header">
      <h1>Dashboard</h1>
      <div class="dash-date">{{ today }}</div>
    </div>
    <div class="stats-grid">
      <div class="stat-card" v-for="s in stats" :key="s.label">
        <div class="stat-icon">{{ s.icon }}</div>
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>
    <div class="dash-grid">
      <div class="recent-orders card">
        <div class="section-header">
          <h3>Recent Orders</h3>
          <router-link to="/admin/orders" class="btn btn-ghost" style="font-size:13px">View All →</router-link>
        </div>
        <div class="orders-table">
          <div class="table-head">
            <span>Order ID</span><span>Customer</span><span>Total</span><span>Status</span>
          </div>
          <div v-for="order in recentOrders" :key="order.id" class="table-row">
            <span class="mono">#{{ order.id.slice(-6).toUpperCase() }}</span>
            <span>{{ order.userName }}</span>
            <span>₱{{ order.total?.toFixed(2) }}</span>
            <span class="tag" :class="`status-${order.status}`" style="font-size:11px">{{ order.status }}</span>
          </div>
          <div v-if="!recentOrders.length" class="empty-row">No orders yet</div>
        </div>
      </div>
      <div class="top-products card">
        <h3>Products at a Glance</h3>
        <div class="product-glance" v-for="p in topProducts" :key="p.id">
          <img :src="p.image || 'https://via.placeholder.com/44?text=F'" />
          <div class="product-glance-info">
            <div class="product-glance-name">{{ p.name }}</div>
            <div class="product-glance-price">₱{{ p.price }}</div>
          </div>
          <span class="tag" :class="p.available ? 'tag-green' : 'tag-gray'">{{ p.available ? 'Live' : 'Off' }}</span>
        </div>
        <div v-if="!topProducts.length" class="empty-row">No products yet</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useOrderStore } from '@/stores/orders'
import { useProductStore } from '@/stores/products'
import { onMounted } from 'vue'

const orderStore = useOrderStore()
const productStore = useProductStore()

const today = new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const stats = computed(() => [
  { icon: '📋', label: 'Total Orders', value: orderStore.orders.length },
  { icon: '⏳', label: 'Pending', value: orderStore.orders.filter(o => o.status === 'pending').length },
  { icon: '🍽️', label: 'Products', value: productStore.products.length },
  { icon: '💰', label: 'Revenue', value: '₱' + orderStore.orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0).toFixed(0) },
])

const recentOrders = computed(() => orderStore.orders.slice(0, 6))
const topProducts = computed(() => productStore.products.slice(0, 5))

onMounted(() => productStore.fetchProducts())
</script>
<style scoped>
.dashboard { max-width: 1200px; }
.dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 8px; }
.dash-header h1 { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; }
.dash-date { font-size: 13px; color: var(--text2); }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
.stat-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; }
.stat-icon { font-size: 28px; margin-bottom: 12px; }
.stat-value { font-size: 32px; font-weight: 700; font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.05em; margin-bottom: 4px; }
.stat-label { font-size: 13px; color: var(--text2); font-weight: 500; }
.dash-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 20px; }
.recent-orders, .top-products { padding: 24px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-header h3, .top-products h3 { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
.table-head, .table-row { display: grid; grid-template-columns: 1fr 1.2fr 0.8fr 1fr; gap: 8px; align-items: center; font-size: 13px; }
.table-head { color: var(--text2); font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.08em; padding-bottom: 8px; border-bottom: 1px solid var(--border); margin-bottom: 4px; }
.table-row { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.mono { font-family: monospace; letter-spacing: 0.05em; }
.empty-row { text-align: center; padding: 24px; color: var(--text2); font-size: 14px; }
.product-glance { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.product-glance img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.product-glance-info { flex: 1; }
.product-glance-name { font-size: 14px; font-weight: 500; }
.product-glance-price { font-size: 13px; color: var(--accent2); margin-top: 2px; }
@media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2,1fr); } .dash-grid { grid-template-columns: 1fr; } }
</style>
