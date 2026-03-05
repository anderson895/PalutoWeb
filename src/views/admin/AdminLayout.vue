<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-logo">
        <span>🍳</span>
        <div><div class="admin-logo-text">PALUTO</div><div class="admin-logo-sub">Admin Panel</div></div>
      </div>
      <nav class="admin-nav">
        <router-link to="/admin/dashboard" class="admin-nav-item">
          <span>📊</span> Dashboard
        </router-link>
        <router-link to="/admin/orders" class="admin-nav-item">
          <span>📋</span> Orders
          <span class="nav-badge" v-if="pendingCount">{{ pendingCount }}</span>
        </router-link>
        <router-link to="/admin/products" class="admin-nav-item">
          <span>🍽️</span> Products
        </router-link>
        <router-link to="/admin/categories" class="admin-nav-item">
          <span>📂</span> Categories
        </router-link>
      </nav>
      <div class="admin-sidebar-footer">
        <router-link to="/" class="admin-nav-item">
          <span>🏠</span> Back to App
        </router-link>
      </div>
    </aside>
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>
<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useOrderStore } from '@/stores/orders'

const orderStore = useOrderStore()
const pendingCount = computed(() => orderStore.orders.filter(o => o.status === 'pending').length)

onMounted(() => orderStore.subscribeToOrders())
onUnmounted(() => orderStore.stopSubscription())
</script>
<style scoped>
.admin-layout { display: flex; min-height: 100vh; background: #080808; }
.admin-sidebar { width: 240px; flex-shrink: 0; background: #0d0d0d; border-right: 1px solid #1e1e1e; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
.admin-logo { display: flex; align-items: center; gap: 12px; padding: 24px 20px; border-bottom: 1px solid #1e1e1e; }
.admin-logo > span { font-size: 28px; }
.admin-logo-text { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 0.1em; }
.admin-logo-sub { font-size: 10px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.15em; margin-top: 1px; }
.admin-nav { padding: 16px 12px; flex: 1; display: flex; flex-direction: column; gap: 4px; }
.admin-nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-radius: 10px; font-size: 14px; font-weight: 500; color: var(--text2); transition: all 0.15s; position: relative; }
.admin-nav-item:hover { background: #1a1a1a; color: var(--text); }
.admin-nav-item.router-link-active { background: rgba(232,70,42,0.1); color: var(--accent2); }
.nav-badge { margin-left: auto; background: var(--accent); color: white; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 100px; }
.admin-sidebar-footer { padding: 12px; border-top: 1px solid #1e1e1e; }
.admin-main { flex: 1; overflow-y: auto; padding: 32px; }
@media (max-width: 900px) {
  .admin-sidebar { width: 60px; }
  .admin-logo > div, .admin-nav-item > :not(:first-child), .nav-badge { display: none; }
  .admin-nav-item { justify-content: center; padding: 12px; }
  .admin-nav-item > span:first-child { font-size: 20px; margin: 0; }
  .admin-main { padding: 20px; }
}
</style>
