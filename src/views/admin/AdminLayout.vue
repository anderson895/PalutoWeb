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

      <!-- Spacer -->
      <div style="flex:1" />
      <div class="sidebar-divider" />

      <!-- Footer nav -->
      <nav class="sidebar-nav sidebar-footer-nav">
        <!-- Back to App -->
        <v-tooltip text="Back to App" location="end" :disabled="!isCollapsed">
          <template #activator="{ props: tip }">
            <router-link
              v-bind="tip"
              to="/"
              class="nav-item"
              :class="{ collapsed: isCollapsed }"
              @click="mobile && (drawer = false)"
            >
              <span class="nav-icon-wrap">
                <HomeIcon class="nav-icon" />
              </span>
              <transition name="fade-label">
                <span v-if="!isCollapsed" class="nav-label">Back to App</span>
              </transition>
            </router-link>
          </template>
        </v-tooltip>

        <!-- Collapse toggle — desktop only -->
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
        <!-- Hamburger for mobile -->
        <button v-if="mobile" class="topbar-btn" @click="drawer = !drawer">
          <Bars3Icon class="topbar-icon" />
        </button>

        <!-- Breadcrumb -->
        <div class="topbar-breadcrumb">
          <component :is="currentPageIcon" class="topbar-page-icon" />
          <span class="topbar-page">{{ currentPageTitle }}</span>
        </div>

        <div style="flex:1" />

        <div class="topbar-right">
          <!-- Bell -->
          <button class="topbar-btn" style="position:relative">
            <BellIcon class="topbar-icon" />
            <span v-if="pendingCount > 0" class="bell-badge">{{ pendingCount }}</span>
          </button>

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
} from '@heroicons/vue/24/outline'

const route  = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const auth   = useAuthStore()
const toast  = useToastStore()
const { mobile } = useDisplay()

const drawer = ref(true)
const rail   = ref(false)

// Only collapse on desktop
const isCollapsed = computed(() => !mobile.value && rail.value)

// Push main content accordingly
const mainStyle = computed(() => ({
  paddingLeft: mobile.value ? '0px' : (isCollapsed.value ? '60px' : '240px'),
  transition: 'padding-left 0.25s ease',
}))

const pendingCount = computed(() => orderStore.orders.filter(o => o.status === 'pending').length)
const avatarLetter = computed(() => auth.profile?.name?.[0]?.toUpperCase() || 'A')

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
  display: flex;
  flex-direction: column;
}
:deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ── Logo ── */
.drawer-logo {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 14px; min-height: 60px; flex-shrink: 0;
  transition: padding 0.25s ease;
  overflow: hidden;
}
.drawer-logo.collapsed { justify-content: center; padding: 16px 0; }
.logo-icon-wrap {
  width: 34px; height: 34px; border-radius: 9px;
  background: rgba(232,70,42,0.15); border: 1px solid rgba(232,70,42,0.25);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.logo-flame { width: 18px; height: 18px; color: #ff6b47; }
.logo-text-wrap { overflow: hidden; white-space: nowrap; }
.logo-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 17px; letter-spacing: 0.12em; color: #f5f0e8; line-height: 1;
}
.logo-sub { font-size: 9px; color: #a09888; text-transform: uppercase; letter-spacing: 0.18em; margin-top: 3px; }

.sidebar-divider { height: 1px; background: #1e1e1e; flex-shrink: 0; }

/* ── Custom nav ── */
.sidebar-nav {
  display: flex; flex-direction: column;
  gap: 2px; padding: 10px 8px; flex-shrink: 0;
}
.sidebar-footer-nav { padding: 8px; }

.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 0 8px; height: 42px; border-radius: 10px;
  text-decoration: none; cursor: pointer;
  color: #a09888; font-size: 14px; font-weight: 500;
  transition: all 0.15s ease; position: relative;
  overflow: hidden; white-space: nowrap;
  background: none; border: none; width: 100%;
  text-align: left;
}
.nav-item:hover { background: rgba(255,255,255,0.05); color: #f5f0e8; }
.nav-item.active { background: rgba(232,70,42,0.12); color: #ff6b47; }
.nav-item.active .nav-icon { color: #ff6b47; }

/* Collapsed state — center icon */
.nav-item.collapsed {
  justify-content: center;
  padding: 0;
  width: 44px;
  margin: 0 auto;
}

.nav-icon-wrap { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nav-icon { width: 20px; height: 20px; color: inherit; flex-shrink: 0; }
.nav-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }

/* Badges */
.nav-badge {
  background: #e8462a; color: white;
  font-size: 10px; font-weight: 700;
  padding: 1px 6px; border-radius: 100px; flex-shrink: 0;
}
.nav-badge-dot {
  position: absolute; top: 8px; right: 8px;
  width: 7px; height: 7px; border-radius: 50%;
  background: #e8462a;
}

/* ── Topbar ── */
.admin-topbar {
  height: 60px; display: flex; align-items: center;
  gap: 8px; padding: 0 16px;
  background: #0a0a0a; border-bottom: 1px solid #1e1e1e;
  position: sticky; top: 0; z-index: 10;
}
.topbar-breadcrumb { display: flex; align-items: center; gap: 8px; }
.topbar-page-icon { width: 17px; height: 17px; color: #a09888; }
.topbar-page { font-size: 15px; font-weight: 600; color: #f5f0e8; }

.topbar-right { display: flex; align-items: center; gap: 6px; }

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

/* Avatar btn */
.avatar-btn {
  display: flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer; padding: 2px;
}
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