<template>
  <v-app theme="palutoDark">
    <!-- Mobile overlay -->
    <div v-if="mobile && drawer" class="mobile-overlay" @click="drawer = false" />

    <v-navigation-drawer
      v-model="drawer"
      :temporary="mobile"
      color="#0d0d0d"
      :border="0"
      :width="isCollapsed ? 60 : 240"
      class="admin-drawer"
    >
      <!-- Logo -->
      <div class="drawer-logo" :class="{ collapsed: isCollapsed }">
        <div class="logo-icon-wrap">
          <FireIcon class="logo-flame" />
        </div>
        <transition name="fade-label">
          <div v-if="!isCollapsed" class="logo-text-wrap">
            <div class="logo-title">PALUTO</div>
            <div class="logo-sub">Admin Panel</div>
          </div>
        </transition>
      </div>

      <div class="sidebar-divider" />

      <!-- Nav items -->
      <nav class="sidebar-nav">
        <v-tooltip
          v-for="item in navItems"
          :key="item.to"
          :text="item.label"
          location="end"
          :disabled="!isCollapsed"
        >
          <template #activator="{ props: tip }">
            <router-link
              v-bind="tip"
              :to="item.to"
              class="nav-item"
              :class="{ active: isActive(item.to), collapsed: isCollapsed }"
              @click="mobile && (drawer = false)"
            >
              <span class="nav-icon-wrap">
                <component :is="item.icon" class="nav-icon" />
              </span>
              <transition name="fade-label">
                <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
              </transition>
              <span v-if="item.badge > 0 && !isCollapsed" class="nav-badge">{{ item.badge }}</span>
              <span v-if="item.badge > 0 && isCollapsed" class="nav-badge-dot" />
            </router-link>
          </template>
        </v-tooltip>
      </nav>

      <div style="flex:1" />
      <div class="sidebar-divider" />

      <!-- Footer nav -->
      <nav class="sidebar-nav sidebar-footer-nav">
        <v-tooltip text="Back to App" location="end" :disabled="!isCollapsed">
          <template #activator="{ props: tip }">
            <router-link
              v-bind="tip"
              to="/"
              class="nav-item"
              :class="{ collapsed: isCollapsed }"
              @click="mobile && (drawer = false)"
            >
              <span class="nav-icon-wrap"><HomeIcon class="nav-icon" /></span>
              <transition name="fade-label">
                <span v-if="!isCollapsed" class="nav-label">Back to App</span>
              </transition>
            </router-link>
          </template>
        </v-tooltip>

        <v-tooltip :text="isCollapsed ? 'Expand' : 'Collapse'" location="end" :disabled="mobile">
          <template #activator="{ props: tip }">
            <button
              v-if="!mobile"
              v-bind="tip"
              class="nav-item collapse-btn"
              :class="{ collapsed: isCollapsed }"
              @click="rail = !rail"
            >
              <span class="nav-icon-wrap">
                <ChevronDoubleLeftIcon v-if="!isCollapsed" class="nav-icon" />
                <ChevronDoubleRightIcon v-else class="nav-icon" />
              </span>
              <transition name="fade-label">
                <span v-if="!isCollapsed" class="nav-label">Collapse</span>
              </transition>
            </button>
          </template>
        </v-tooltip>
      </nav>
    </v-navigation-drawer>

    <!-- Main -->
    <v-main class="admin-main-bg" :style="mainStyle">

      <!-- Top bar -->
      <div class="admin-topbar">
        <button v-if="mobile" class="topbar-btn" @click="drawer = !drawer">
          <Bars3Icon class="topbar-icon" />
        </button>

        <div class="topbar-breadcrumb">
          <component :is="currentPageIcon" class="topbar-page-icon" />
          <span class="topbar-page">{{ currentPageTitle }}</span>
        </div>

        <div style="flex:1" />

        <div class="topbar-right">

          <!-- Bell -->
          <v-menu
            min-width="340"
            max-width="340"
            offset="10"
            location="bottom end"
            :close-on-content-click="false"
          >
            <template #activator="{ props }">
              <button class="topbar-btn" v-bind="props" style="position:relative">
                <BellIcon class="topbar-icon" />
                <span v-if="pendingCount > 0" class="bell-badge">{{ pendingCount }}</span>
              </button>
            </template>

            <v-list bg-color="#141414" border rounded="xl" class="pa-1 notif-list">

              <!-- Header -->
              <div class="notif-header">
                <div>
                  <div class="menu-user-name">Notifications</div>
                  <div class="menu-user-email">
                    {{ pendingCount > 0 ? `${pendingCount} pending order(s)` : 'No new notifications' }}
                  </div>
                </div>
                <span
                  v-if="pendingCount > 0"
                  class="notif-view-all"
                  @click="$router.push('/admin/orders')"
                >View All</span>
              </div>

              <v-divider color="#2a2a2a" class="my-1" />

              <!-- Pending Orders -->
              <template v-if="pendingOrders.length > 0">
                <div v-for="order in pendingOrders" :key="order.id">

                  <!-- Row -->
                  <div
                    class="notif-row"
                    :class="{ expanded: expandedNotif === order.id }"
                    @click="expandedNotif = expandedNotif === order.id ? null : order.id"
                  >
                    <div class="notif-dot" />
                    <div class="notif-row-body">
                      <div class="notif-title">Order #{{ order.id.slice(-8).toUpperCase() }}</div>
                      <div class="notif-sub">{{ order.userName }} · {{ order.userPhone }}</div>
                      <div class="notif-time">{{ formatTime(order.createdAt) }}</div>
                    </div>
                    <div class="notif-row-aside">
                      <span class="notif-status-badge">pending</span>
                      <ChevronDownIcon class="notif-chevron" :class="{ open: expandedNotif === order.id }" />
                    </div>
                  </div>

                  <!-- Expanded Details -->
                  <div v-if="expandedNotif === order.id" class="notif-details">

                    <!-- Address -->
                    <div class="notif-detail-row">
                      <MapPinIcon class="notif-detail-icon" />
                      <span>{{ order.address }}</span>
                    </div>

                    <!-- Items -->
                    <div class="notif-items-label">Items ordered</div>
                    <div v-for="item in order.items" :key="item.id" class="notif-item-row">
                      <span class="notif-item-name">{{ item.name }}</span>
                      <span class="notif-item-qty">×{{ item.qty }}</span>
                      <span class="notif-item-price">₱{{ (item.price * item.qty).toFixed(2) }}</span>
                    </div>

                    <!-- Footer -->
                    <div class="notif-detail-footer">
                      <span class="notif-payment">
                        <CreditCardIcon class="notif-detail-icon" />
                        {{ order.payment?.toUpperCase() }}
                      </span>
                      <span class="notif-total">₱{{ order.total?.toFixed(2) }}</span>
                    </div>

                    <!-- Notes -->
                    <div v-if="order.notes" class="notif-notes">
                      <ChatBubbleLeftIcon class="notif-detail-icon" style="flex-shrink:0" />
                      {{ order.notes }}
                    </div>

                    <!-- Action -->
                    <button class="notif-action-btn" @click.stop="$router.push('/admin/orders')">
                      Manage Order
                    </button>

                  </div>

                  <v-divider color="#1e1e1e" />
                </div>
              </template>

              <!-- Empty state -->
              <div v-else class="notif-empty">
                <BellIcon class="notif-empty-icon" />
                <span>All caught up!</span>
              </div>

            </v-list>
          </v-menu>

          <!-- User menu -->
          <v-menu min-width="210" offset="10" location="bottom end">
            <template #activator="{ props }">
              <button class="avatar-btn" v-bind="props">
                <div class="admin-avatar">{{ avatarLetter }}</div>
                <ChevronDownIcon class="avatar-chevron" />
              </button>
            </template>
            <v-list bg-color="#141414" border rounded="xl" class="pa-1">
              <div class="menu-user-info">
                <div class="menu-user-name">{{ auth.profile?.name }}</div>
                <div class="menu-user-email">{{ auth.user?.email }}</div>
              </div>
              <v-divider color="#2a2a2a" class="my-1" />
              <v-list-item rounded="lg" @click="$router.push('/profile')" class="menu-list-item">
                <template #prepend><UserCircleIcon class="menu-icon" /></template>
                <v-list-item-title>Profile</v-list-item-title>
              </v-list-item>
              <v-list-item rounded="lg" @click="$router.push('/')" class="menu-list-item">
                <template #prepend><HomeIcon class="menu-icon" /></template>
                <v-list-item-title>View Store</v-list-item-title>
              </v-list-item>
              <v-divider color="#2a2a2a" class="my-1" />
              <v-list-item rounded="lg" @click="handleLogout" class="menu-list-item logout-item">
                <template #prepend><ArrowRightOnRectangleIcon class="menu-icon" /></template>
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

        </div>
      </div>

      <!-- Page content -->
      <div class="admin-content">
        <router-view />
      </div>

    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useOrderStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

import {
  FireIcon, ChartBarIcon, ClipboardDocumentListIcon,
  ShoppingBagIcon, FolderIcon, HomeIcon, BellIcon,
  UserCircleIcon, ArrowRightOnRectangleIcon,
  ChevronDoubleLeftIcon, ChevronDoubleRightIcon,
  Bars3Icon, ChevronDownIcon,
  MapPinIcon, CreditCardIcon, ChatBubbleLeftIcon,
} from '@heroicons/vue/24/outline'

const route      = useRoute()
const router     = useRouter()
const orderStore = useOrderStore()
const auth       = useAuthStore()
const toast      = useToastStore()
const { mobile } = useDisplay()

const drawer         = ref(true)
const rail           = ref(false)
const expandedNotif  = ref(null)

const isCollapsed = computed(() => !mobile.value && rail.value)

const mainStyle = computed(() => ({
  paddingLeft: mobile.value ? '0px' : (isCollapsed.value ? '60px' : '240px'),
  transition: 'padding-left 0.25s ease',
}))

const pendingCount = computed(() => orderStore.orders.filter(o => o.status === 'pending').length)
const avatarLetter = computed(() => auth.profile?.name?.[0]?.toUpperCase() || 'A')

const pendingOrders = computed(() =>
  orderStore.orders
    .filter(o => o.status === 'pending')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
)

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

const navItems = computed(() => [
  { to: '/admin/dashboard',  label: 'Dashboard',  icon: ChartBarIcon,              badge: 0 },
  { to: '/admin/orders',     label: 'Orders',      icon: ClipboardDocumentListIcon, badge: pendingCount.value },
  { to: '/admin/products',   label: 'Products',    icon: ShoppingBagIcon,           badge: 0 },
  { to: '/admin/categories', label: 'Categories',  icon: FolderIcon,                badge: 0 },
])

const pageMap = {
  '/admin/dashboard':  { title: 'Dashboard',          icon: ChartBarIcon },
  '/admin/orders':     { title: 'Orders Management',   icon: ClipboardDocumentListIcon },
  '/admin/products':   { title: 'Products Management', icon: ShoppingBagIcon },
  '/admin/categories': { title: 'Categories',          icon: FolderIcon },
}
const currentPageTitle = computed(() => pageMap[route.path]?.title || 'Admin')
const currentPageIcon  = computed(() => pageMap[route.path]?.icon  || ChartBarIcon)
const isActive = (to) => route.path === to

const handleLogout = async () => {
  await auth.logout()
  toast.success('Logged out!')
  router.push('/')
}

onMounted(() => {
  orderStore.subscribeToOrders()
  if (mobile.value) drawer.value = false
})
onUnmounted(() => orderStore.stopSubscription())
</script>

<style scoped>
/* ── Drawer ── */
:deep(.v-navigation-drawer) {
  border-right: 1px solid #1e1e1e !important;
  transition: width 0.25s ease !important;
  display: flex; flex-direction: column;
}
:deep(.v-navigation-drawer__content) {
  display: flex; flex-direction: column;
  height: 100%; overflow: hidden;
}

/* ── Logo ── */
.drawer-logo {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 14px; min-height: 60px; flex-shrink: 0;
  transition: padding 0.25s ease; overflow: hidden;
}
.drawer-logo.collapsed { justify-content: center; padding: 16px 0; }
.logo-icon-wrap {
  width: 34px; height: 34px; border-radius: 9px;
  background: rgba(232,70,42,0.15); border: 1px solid rgba(232,70,42,0.25);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.logo-flame     { width: 18px; height: 18px; color: #ff6b47; }
.logo-text-wrap { overflow: hidden; white-space: nowrap; }
.logo-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 17px; letter-spacing: 0.12em; color: #f5f0e8; line-height: 1;
}
.logo-sub { font-size: 9px; color: #a09888; text-transform: uppercase; letter-spacing: 0.18em; margin-top: 3px; }
.sidebar-divider { height: 1px; background: #1e1e1e; flex-shrink: 0; }

/* ── Nav ── */
.sidebar-nav { display: flex; flex-direction: column; gap: 2px; padding: 10px 8px; flex-shrink: 0; }
.sidebar-footer-nav { padding: 8px; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 0 8px; height: 42px; border-radius: 10px;
  text-decoration: none; cursor: pointer;
  color: #a09888; font-size: 14px; font-weight: 500;
  transition: all 0.15s ease; position: relative;
  overflow: hidden; white-space: nowrap;
  background: none; border: none; width: 100%; text-align: left;
}
.nav-item:hover  { background: rgba(255,255,255,0.05); color: #f5f0e8; }
.nav-item.active { background: rgba(232,70,42,0.12); color: #ff6b47; }
.nav-item.active .nav-icon { color: #ff6b47; }
.nav-item.collapsed { justify-content: center; padding: 0; width: 44px; margin: 0 auto; }
.nav-icon-wrap { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nav-icon      { width: 20px; height: 20px; color: inherit; flex-shrink: 0; }
.nav-label     { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.nav-badge {
  background: #e8462a; color: white;
  font-size: 10px; font-weight: 700;
  padding: 1px 6px; border-radius: 100px; flex-shrink: 0;
}
.nav-badge-dot {
  position: absolute; top: 8px; right: 8px;
  width: 7px; height: 7px; border-radius: 50%; background: #e8462a;
}

/* ── Topbar ── */
.admin-topbar {
  height: 60px; display: flex; align-items: center;
  gap: 8px; padding: 0 16px;
  background: #0a0a0a; border-bottom: 1px solid #1e1e1e;
  position: sticky; top: 0; z-index: 10;
}
.topbar-breadcrumb { display: flex; align-items: center; gap: 8px; }
.topbar-page-icon  { width: 17px; height: 17px; color: #a09888; }
.topbar-page       { font-size: 15px; font-weight: 600; color: #f5f0e8; }
.topbar-right      { display: flex; align-items: center; gap: 6px; }
.topbar-btn {
  width: 36px; height: 36px; border-radius: 9px;
  background: rgba(255,255,255,0.04); border: 1px solid #2a2a2a;
  color: #a09888; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s; position: relative;
}
.topbar-btn:hover { color: #f5f0e8; border-color: #3a3a3a; }
.topbar-icon { width: 18px; height: 18px; }

/* Bell badge */
.bell-badge {
  position: absolute; top: -4px; right: -4px;
  background: #e8462a; color: white;
  font-size: 9px; font-weight: 700;
  width: 16px; height: 16px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

/* Avatar */
.avatar-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; padding: 2px; }
.admin-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, #e8462a, #ff6b47);
  color: white; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.avatar-chevron { width: 14px; height: 14px; color: #a09888; }

/* ── User dropdown ── */
.menu-user-info  { padding: 10px 14px 8px; }
.menu-user-name  { font-size: 13px; font-weight: 600; color: #f5f0e8; }
.menu-user-email { font-size: 11px; color: #a09888; margin-top: 2px; }
.menu-icon       { width: 16px; height: 16px; margin-right: 10px; color: #a09888; }
.menu-list-item  { min-height: 40px !important; }
:deep(.logout-item .v-list-item-title) { color: #e8462a !important; }
:deep(.logout-item .menu-icon)         { color: #e8462a !important; }

/* ── Notification bell dropdown ── */
.notif-list { max-height: 520px; overflow-y: auto; }

.notif-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px 8px;
}
.notif-view-all {
  font-size: 10px; color: #ff6b47; font-weight: 600;
  cursor: pointer; text-transform: uppercase; letter-spacing: 0.08em;
}
.notif-view-all:hover { text-decoration: underline; }

/* Notification row */
.notif-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 12px; cursor: pointer;
  transition: background 0.15s; border-radius: 10px; margin: 2px 4px;
}
.notif-row:hover    { background: rgba(255,255,255,0.04); }
.notif-row.expanded { background: rgba(232,70,42,0.06); }

.notif-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #e8462a; margin-top: 4px; flex-shrink: 0;
}
.notif-row-body  { flex: 1; min-width: 0; }
.notif-row-aside { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex-shrink: 0; }

.notif-title { font-size: 13px; font-weight: 600; color: #f5f0e8; }
.notif-sub   { font-size: 11px; color: #a09888; margin-top: 2px; }
.notif-time  { font-size: 10px; color: #6a6060; margin-top: 2px; }

.notif-status-badge {
  font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  background: rgba(232,70,42,0.15); color: #ff6b47;
  padding: 2px 7px; border-radius: 100px; border: 1px solid rgba(232,70,42,0.25);
}
.notif-chevron { width: 13px; height: 13px; color: #6a6060; transition: transform 0.2s; }
.notif-chevron.open { transform: rotate(180deg); }

/* Expanded details */
.notif-details {
  padding: 4px 12px 12px 30px;
  display: flex; flex-direction: column; gap: 6px;
}
.notif-detail-row {
  display: flex; align-items: flex-start; gap: 6px;
  font-size: 12px; color: #a09888;
}
.notif-detail-icon { width: 13px; height: 13px; flex-shrink: 0; margin-top: 1px; color: #6a6060; }

.notif-items-label {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;
  color: #6a6060; font-weight: 600; margin-top: 4px;
}
.notif-item-row  { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.notif-item-name { flex: 1; color: #c8c0b0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notif-item-qty  { color: #6a6060; flex-shrink: 0; }
.notif-item-price { color: #f5f0e8; font-weight: 600; flex-shrink: 0; }

.notif-detail-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 8px; margin-top: 2px; border-top: 1px solid #1e1e1e;
}
.notif-payment {
  display: flex; align-items: center; gap: 5px;
  color: #a09888; font-size: 11px; text-transform: uppercase;
  font-weight: 600; letter-spacing: 0.05em;
}
.notif-total { font-size: 15px; font-weight: 700; color: #f5f0e8; }

.notif-notes {
  display: flex; align-items: flex-start; gap: 5px;
  font-size: 11px; color: #a09888; font-style: italic;
  background: rgba(255,255,255,0.03); padding: 6px 10px; border-radius: 7px;
}

.notif-action-btn {
  width: 100%; margin-top: 4px; padding: 7px; border-radius: 8px;
  background: rgba(232,70,42,0.12); border: 1px solid rgba(232,70,42,0.25);
  color: #ff6b47; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.notif-action-btn:hover { background: rgba(232,70,42,0.2); border-color: rgba(232,70,42,0.4); }

/* Empty state */
.notif-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 24px; color: #6a6060; font-size: 13px;
}
.notif-empty-icon { width: 28px; height: 28px; opacity: 0.4; }

/* ── Content ── */
.admin-main-bg { background: #0a0a0a !important; }
:deep(.v-main__wrap) { padding: 0 !important; }
.admin-content { padding: 24px; min-height: calc(100vh - 60px); }

/* ── Mobile overlay ── */
.mobile-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  z-index: 1003; backdrop-filter: blur(2px);
}

/* ── Transitions ── */
.fade-label-enter-active, .fade-label-leave-active { transition: opacity 0.15s ease; }
.fade-label-enter-from,   .fade-label-leave-to     { opacity: 0; }

@media (max-width: 960px) {
  .admin-content { padding: 16px; }
}
</style>