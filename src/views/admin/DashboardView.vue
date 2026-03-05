<template>
  <div class="dashboard">
    <!-- Header -->
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
        <div>
          <div class="stat-value">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- Revenue Line Chart -->
      <div class="card chart-card">
        <div class="section-header">
          <div class="section-title">
            <PresentationChartLineIcon class="section-icon" />
            <h3>Revenue (7 days)</h3>
          </div>
        </div>
        <div class="chart-wrap">
          <canvas ref="revenueChart"></canvas>
        </div>
      </div>
      <!-- Order Status Doughnut -->
      <div class="card chart-card chart-card--sm">
        <div class="section-header">
          <div class="section-title">
            <ChartPieIcon class="section-icon" />
            <h3>Order Status</h3>
          </div>
        </div>
        <div class="donut-inner">
          <div class="chart-wrap chart-wrap--donut">
            <canvas ref="statusChart"></canvas>
          </div>
          <div class="donut-legend">
            <div class="legend-item" v-for="item in statusLegend" :key="item.label">
              <span class="legend-dot" :style="{ background: item.color }"></span>
              <span class="legend-label">{{ item.label }}</span>
              <span class="legend-val">{{ item.value }}</span>
            </div>
            <div v-if="!statusLegend.length" class="legend-empty">No orders yet</div>
          </div>
        </div>
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
            View All <ArrowRightIcon class="btn-icon-sm" />
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
        <div class="section-header">
          <div class="section-title">
            <ShoppingBagIcon class="section-icon" />
            <h3>Products at a Glance</h3>
          </div>
          <router-link to="/admin/products" class="btn btn-ghost view-all-btn">
            <PlusCircleIcon class="btn-icon-sm" /> Manage
          </router-link>
        </div>
        <div class="product-glance-list">
          <div class="product-glance" v-for="p in topProducts" :key="p.id">
            <img :src="p.image || 'https://placehold.co/36x36?text=F'" :alt="p.name" />
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useOrderStore } from '@/stores/orders'
import { useProductStore } from '@/stores/products'
import {
  CalendarDaysIcon, ClipboardDocumentListIcon, ClockIcon,
  ArrowRightIcon, UserCircleIcon, InboxIcon, ShoppingBagIcon,
  CheckCircleIcon, XCircleIcon, PlusCircleIcon,
  QueueListIcon, ExclamationCircleIcon, CurrencyDollarIcon,
  EllipsisHorizontalCircleIcon, CheckBadgeIcon, FireIcon,
  BellAlertIcon, TruckIcon, NoSymbolIcon,
  PresentationChartLineIcon, ChartPieIcon,
} from '@heroicons/vue/24/outline'

const orderStore   = useOrderStore()
const productStore = useProductStore()

const revenueChart = ref(null)
const statusChart  = ref(null)
let revenueChartInstance = null
let statusChartInstance  = null

const today = new Date().toLocaleDateString('en-PH', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})

const stats = computed(() => [
  { icon: QueueListIcon,         label: 'Total Orders', value: orderStore.orders.length,                                                                    color: '#6c6cff', bg: 'rgba(108,108,255,0.1)', border: 'rgba(108,108,255,0.2)' },
  { icon: ExclamationCircleIcon, label: 'Pending',      value: orderStore.orders.filter(o => o.status === 'pending').length,                                color: '#d4a843', bg: 'rgba(212,168,67,0.1)',  border: 'rgba(212,168,67,0.2)'  },
  { icon: ShoppingBagIcon,       label: 'Products',     value: productStore.products.length,                                                                color: '#ff6b47', bg: 'rgba(232,70,42,0.1)',   border: 'rgba(232,70,42,0.2)'   },
  { icon: CurrencyDollarIcon,    label: 'Revenue',      value: '₱' + orderStore.orders.filter(o => o.status !== 'cancelled').reduce((s,o) => s+(o.total||0),0).toFixed(0), color: '#2ecc71', bg: 'rgba(46,204,113,0.1)', border: 'rgba(46,204,113,0.2)' },
])

const recentOrders = computed(() => orderStore.orders.slice(0, 6))
const topProducts  = computed(() => productStore.products.slice(0, 5))

const statusIcon = (status) => ({
  pending: EllipsisHorizontalCircleIcon, confirmed: CheckBadgeIcon,
  preparing: FireIcon, ready: BellAlertIcon,
  delivered: TruckIcon, cancelled: NoSymbolIcon,
}[status] || EllipsisHorizontalCircleIcon)

// Chart helpers
const last7Days = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    days.push(d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }))
  }
  return days
})

const revenueByDay = computed(() => {
  const map = {}
  last7Days.value.forEach(d => (map[d] = 0))
  orderStore.orders
    .filter(o => o.status !== 'cancelled' && o.createdAt)
    .forEach(o => {
      const ts = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : o.createdAt
      const label = new Date(ts).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
      if (map[label] !== undefined) map[label] += o.total || 0
    })
  return Object.values(map)
})

const STATUS_COLORS = {
  pending: '#d4a843', confirmed: '#6c6cff', preparing: '#ff6b47',
  ready: '#5bc0eb', delivered: '#2ecc71', cancelled: '#555',
}

const statusCounts = computed(() => {
  const map = {}
  orderStore.orders.forEach(o => { map[o.status] = (map[o.status] || 0) + 1 })
  return map
})

const statusLegend = computed(() =>
  Object.entries(statusCounts.value).map(([label, value]) => ({
    label, value, color: STATUS_COLORS[label] || '#888',
  }))
)

function buildRevenueChart() {
  if (!revenueChart.value || !window.Chart) return
  if (revenueChartInstance) revenueChartInstance.destroy()
  revenueChartInstance = new window.Chart(revenueChart.value, {
    type: 'line',
    data: {
      labels: last7Days.value,
      datasets: [{
        data: revenueByDay.value,
        borderColor: '#2ecc71',
        backgroundColor: 'rgba(46,204,113,0.07)',
        borderWidth: 2,
        pointBackgroundColor: '#2ecc71',
        pointRadius: 3,
        tension: 0.4,
        fill: true,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', font: { size: 10 } } },
        y: {
          min: 0,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#666', font: { size: 10 }, callback: v => '₱' + v, precision: 0 },
        },
      },
    },
  })
}

function buildStatusChart() {
  if (!statusChart.value || !window.Chart) return
  if (statusChartInstance) statusChartInstance.destroy()
  const entries = Object.entries(statusCounts.value)
  const data    = entries.length ? entries.map(([, v]) => v)                            : [1]
  const colors  = entries.length ? entries.map(([k]) => STATUS_COLORS[k] || '#888')     : ['rgba(255,255,255,0.06)']
  const labels  = entries.length ? entries.map(([k]) => k)                              : ['No Orders']
  statusChartInstance = new window.Chart(statusChart.value, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '68%' },
  })
}

function loadChartJs(cb) {
  if (window.Chart) return cb()
  const s = document.createElement('script')
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
  s.onload = cb
  document.head.appendChild(s)
}

onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    orderStore.fetchOrders?.() ?? Promise.resolve(),
  ])
  loadChartJs(() => {
    buildRevenueChart()
    buildStatusChart()
  })
})

watch(() => orderStore.orders, () => {
  buildRevenueChart()
  buildStatusChart()
}, { deep: true })
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
}

/* Header */
.dash-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.dash-header h1 { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 900; margin-bottom: 2px; }
.dash-date { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text2); }
.date-icon { width: 13px; height: 13px; }
.view-orders-btn { display: flex; align-items: center; gap: 6px; font-size: 13px; padding: 7px 14px; }
.btn-icon { width: 15px; height: 15px; }
.btn-icon-sm { width: 13px; height: 13px; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.stat-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 12px 14px;
  display: flex; align-items: center; gap: 12px;
  transition: border-color 0.2s, transform 0.2s;
}
.stat-card:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.1); }
.stat-icon-wrap { width: 36px; height: 36px; border-radius: 10px; border: 1px solid; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon { width: 17px; height: 17px; }
.stat-value { font-size: 20px; font-weight: 700; font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.05em; line-height: 1; }
.stat-label { font-size: 10px; color: var(--text2); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 1px; }

/* Charts row */
.charts-row { display: grid; grid-template-columns: 1fr 320px; gap: 12px; }
.chart-card { padding: 14px 16px; display: flex; flex-direction: column; }

/* Revenue line */
.chart-wrap { position: relative; height: 160px; }

/* Donut card — donut left, legend right */
.donut-inner { display: flex; align-items: center; gap: 14px; flex: 1; min-height: 0; }
.chart-wrap--donut { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
.donut-legend { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
.legend-item { display: flex; align-items: center; gap: 7px; font-size: 11px; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.legend-label { flex: 1; color: var(--text2); text-transform: capitalize; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.legend-val { font-weight: 700; font-size: 12px; }
.legend-empty { font-size: 11px; color: var(--text2); text-align: center; padding: 8px 0; }

/* Bottom grid */
.dash-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 12px; flex: 1; min-height: 0; }
.recent-orders, .top-products { padding: 14px 16px; display: flex; flex-direction: column; overflow: hidden; min-height: 180px; }
.orders-table { flex: 1; overflow-y: auto; }
.product-glance-list { flex: 1; overflow-y: auto; }

.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.section-title { display: flex; align-items: center; gap: 7px; }
.section-title h3 { font-size: 14px; font-weight: 700; }
.section-icon { width: 15px; height: 15px; color: var(--accent2); }
.view-all-btn { display: flex; align-items: center; gap: 4px; font-size: 12px; padding: 5px 8px; }

/* Table */
.table-head, .table-row { display: grid; grid-template-columns: 1fr 1.4fr 0.8fr 1fr; gap: 6px; align-items: center; font-size: 12px; }
.table-head { color: var(--text2); font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.08em; padding-bottom: 7px; border-bottom: 1px solid var(--border); }
.table-row { padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.mono { font-family: monospace; font-size: 11px; letter-spacing: 0.04em; }
.customer-cell { display: flex; align-items: center; gap: 5px; overflow: hidden; }
.customer-icon { width: 14px; height: 14px; color: var(--text2); flex-shrink: 0; }
.customer-cell span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.price-cell { font-weight: 600; }
.status-pill { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 100px; font-size: 10px; font-weight: 600; text-transform: capitalize; width: fit-content; }
.status-dot-icon { width: 11px; height: 11px; }
.empty-row { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 20px; color: var(--text2); font-size: 13px; }
.empty-icon { width: 18px; height: 18px; opacity: 0.4; }

/* Products glance */
.product-glance { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.product-glance img { width: 34px; height: 34px; border-radius: 7px; object-fit: cover; flex-shrink: 0; }
.product-glance-info { flex: 1; min-width: 0; }
.product-glance-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.product-glance-price { font-size: 12px; color: var(--accent2); margin-top: 1px; }
.product-status { display: flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 100px; white-space: nowrap; flex-shrink: 0; }
.status-icon { width: 12px; height: 12px; }
.status-live { background: rgba(46,204,113,0.12); color: #2ecc71; }
.status-off  { background: rgba(255,255,255,0.06); color: var(--text2); }

@media (max-width: 1024px) {
  .charts-row { grid-template-columns: 1fr 280px; }
}
@media (max-width: 900px) {
  .stats-grid  { grid-template-columns: repeat(2, 1fr); }
  .charts-row  { grid-template-columns: 1fr; }
  .chart-wrap--donut { width: 100px; height: 100px; }
  .dash-grid   { grid-template-columns: 1fr; flex: unset; }
}
@media (max-width: 560px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .donut-inner { flex-direction: column; align-items: flex-start; }
  .chart-wrap--donut { width: 100%; height: 140px; }
  .table-head, .table-row { grid-template-columns: 1fr 1fr 0.7fr; }
  .table-head span:nth-child(3),
  .table-row  span:nth-child(3) { display: none; }
}
</style>