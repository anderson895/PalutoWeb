<template>
  <div class="dashboard">
    <div class="dash-header">
      <div>
        <h1>Dashboard</h1>
        <div class="dash-date">
          <CalendarDaysIcon class="date-icon" />
          {{ today }}
        </div>
      </div>
      <router-link to="/admin/orders" class="btn btn-outline view-orders-btn">
        <ClipboardDocumentListIcon class="btn-icon" />
        View Orders
      </router-link>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card" v-for="s in stats" :key="s.label">
        <div class="stat-icon-wrap" :style="{ background: s.bg, borderColor: s.border }">
          <component :is="s.icon" class="stat-icon" :style="{ color: s.color }" />
        </div>
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- Bottom grid -->
    <div class="dash-grid">

      <!-- Recent Orders -->
      <div class="recent-orders card">
        <div class="section-header">
          <div class="section-title">
            <ClockIcon class="section-icon" />
            <h3>Recent Orders</h3>
          </div>
          <router-link to="/admin/orders" class="btn btn-ghost view-all-btn">
            View All
            <ArrowRightIcon class="btn-icon-sm" />
          </router-link>
        </div>
        <div class="orders-table">
          <div class="table-head">
            <span>Order ID</span>
            <span>Customer</span>
            <span>Total</span>
            <span>Status</span>
          </div>
          <div v-for="order in recentOrders" :key="order.id" class="table-row">
            <span class="mono">#{{ order.id.slice(-6).toUpperCase() }}</span>
            <div class="customer-cell">
              <UserCircleIcon class="customer-icon" />
              <span>{{ order.userName }}</span>
            </div>
            <span class="price-cell">₱{{ order.total?.toFixed(2) }}</span>
            <span class="status-pill" :class="`status-${order.status}`">
              <component :is="statusIcon(order.status)" class="status-dot-icon" />
              {{ order.status }}
            </span>
          </div>
          <div v-if="!recentOrders.length" class="empty-row">
            <InboxIcon class="empty-icon" />
            <span>No orders yet</span>
          </div>
        </div>
      </div>

      <!-- Products at a Glance -->
      <div class="top-products card">
        <div class="section-title" style="margin-bottom:16px">
          <ShoppingBagIcon class="section-icon" />
          <h3>Products at a Glance</h3>
        </div>
        <div class="product-glance" v-for="p in topProducts" :key="p.id">
          <img :src="p.image || 'https://placehold.co/44x44?text=F'" :alt="p.name" />
          <div class="product-glance-info">
            <div class="product-glance-name">{{ p.name }}</div>
            <div class="product-glance-price">₱{{ p.price }}</div>
          </div>
          <div class="product-status" :class="p.available ? 'status-live' : 'status-off'">
            <component :is="p.available ? CheckCircleIcon : XCircleIcon" class="status-icon" />
            {{ p.available ? 'Live' : 'Off' }}
          </div>
        </div>
        <div v-if="!topProducts.length" class="empty-row">
          <ShoppingBagIcon class="empty-icon" />
          <span>No products yet</span>
        </div>
        <router-link to="/admin/products" class="view-products-link">
          <PlusCircleIcon class="btn-icon-sm" />
          Manage Products
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/orders'
import { useProductStore } from '@/stores/products'

import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ArrowRightIcon,
  UserCircleIcon,
  InboxIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon,
  // Stat icons
  QueueListIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  // Status icons
  EllipsisHorizontalCircleIcon,
  CheckBadgeIcon,
  FireIcon,
  BellAlertIcon,
  TruckIcon,
  NoSymbolIcon,
} from '@heroicons/vue/24/outline'

const orderStore = useOrderStore()
const productStore = useProductStore()

const today = new Date().toLocaleDateString('en-PH', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})

const stats = computed(() => [
  {
    icon: QueueListIcon,
    label: 'Total Orders',
    value: orderStore.orders.length,
    color: '#6c6cff',
    bg: 'rgba(108,108,255,0.1)',
    border: 'rgba(108,108,255,0.2)',
  },
  {
    icon: ExclamationCircleIcon,
    label: 'Pending',
    value: orderStore.orders.filter(o => o.status === 'pending').length,
    color: '#d4a843',
    bg: 'rgba(212,168,67,0.1)',
    border: 'rgba(212,168,67,0.2)',
  },
  {
    icon: ShoppingBagIcon,
    label: 'Products',
    value: productStore.products.length,
    color: '#ff6b47',
    bg: 'rgba(232,70,42,0.1)',
    border: 'rgba(232,70,42,0.2)',
  },
  {
    icon: CurrencyDollarIcon,
    label: 'Revenue',
    value: '₱' + orderStore.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => s + (o.total || 0), 0)
      .toFixed(0),
    color: '#2ecc71',
    bg: 'rgba(46,204,113,0.1)',
    border: 'rgba(46,204,113,0.2)',
  },
])

const recentOrders = computed(() => orderStore.orders.slice(0, 6))
const topProducts  = computed(() => productStore.products.slice(0, 5))

const statusIcon = (status) => ({
  pending:   EllipsisHorizontalCircleIcon,
  confirmed: CheckBadgeIcon,
  preparing: FireIcon,
  ready:     BellAlertIcon,
  delivered: TruckIcon,
  cancelled: NoSymbolIcon,
}[status] || EllipsisHorizontalCircleIcon)

onMounted(() => productStore.fetchProducts())
</script>

<style scoped>
.dashboard { max-width: 1200px; }

/* Header */
.dash-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
}
.dash-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 32px; font-weight: 900; margin-bottom: 6px;
}
.dash-date {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--text2);
}
.date-icon { width: 14px; height: 14px; }
.view-orders-btn {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; padding: 8px 16px;
}
.btn-icon { width: 16px; height: 16px; }
.btn-icon-sm { width: 14px; height: 14px; }

/* Stats */
.stats-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16px; margin-bottom: 28px;
}
.stat-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 24px;
  transition: border-color 0.2s, transform 0.2s;
}
.stat-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.1); }
.stat-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px;
  border: 1px solid; display: flex; align-items: center;
  justify-content: center; margin-bottom: 16px;
}
.stat-icon { width: 22px; height: 22px; }
.stat-value {
  font-size: 32px; font-weight: 700;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 0.05em; margin-bottom: 4px; line-height: 1;
}
.stat-label { font-size: 12px; color: var(--text2); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }

/* Bottom grid */
.dash-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 20px; }
.recent-orders, .top-products { padding: 24px; }

.section-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
}
.section-title {
  display: flex; align-items: center; gap: 8px;
}
.section-title h3 { font-size: 15px; font-weight: 700; }
.section-icon { width: 18px; height: 18px; color: var(--accent2); }

.view-all-btn {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; padding: 6px 10px;
}

/* Table */
.table-head, .table-row {
  display: grid; grid-template-columns: 1fr 1.4fr 0.8fr 1fr;
  gap: 8px; align-items: center; font-size: 13px;
}
.table-head {
  color: var(--text2); font-weight: 700; text-transform: uppercase;
  font-size: 10px; letter-spacing: 0.1em;
  padding-bottom: 10px; border-bottom: 1px solid var(--border); margin-bottom: 2px;
}
.table-row { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.mono { font-family: monospace; letter-spacing: 0.05em; font-size: 12px; }

.customer-cell { display: flex; align-items: center; gap: 6px; overflow: hidden; }
.customer-icon { width: 16px; height: 16px; color: var(--text2); flex-shrink: 0; }
.customer-cell span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.price-cell { font-weight: 600; color: var(--text); }

.status-pill {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 100px; font-size: 11px; font-weight: 600;
  text-transform: capitalize; width: fit-content;
}
.status-dot-icon { width: 12px; height: 12px; }

.empty-row {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; padding: 32px; color: var(--text2); font-size: 14px;
}
.empty-icon { width: 20px; height: 20px; opacity: 0.4; }

/* Products glance */
.product-glance {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
}
.product-glance img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.product-glance-info { flex: 1; min-width: 0; }
.product-glance-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.product-glance-price { font-size: 13px; color: var(--accent2); margin-top: 2px; }

.product-status {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 600; padding: 3px 8px;
  border-radius: 100px; white-space: nowrap; flex-shrink: 0;
}
.status-icon { width: 13px; height: 13px; }
.status-live { background: rgba(46,204,113,0.12); color: #2ecc71; }
.status-off  { background: rgba(255,255,255,0.06); color: var(--text2); }

.view-products-link {
  display: flex; align-items: center; gap: 6px;
  margin-top: 14px; font-size: 13px; font-weight: 600;
  color: var(--accent2); text-decoration: none; transition: color 0.15s;
}
.view-products-link:hover { color: var(--accent); }

@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .dash-grid   { grid-template-columns: 1fr; }
}
</style>