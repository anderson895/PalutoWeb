<template>
  <v-app theme="palutoDark">
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      color="#0d0d0d"
      :border="0"
      class="admin-drawer"
    >
      <!-- Logo -->
      <div class="drawer-logo" :class="{ collapsed: rail }">
        <div class="logo-icon-wrap">
          <span class="logo-emoji">🍳</span>
        </div>
        <transition name="fade-label">
          <div v-if="!rail" class="logo-text-wrap">
            <div class="logo-title">PALUTO</div>
            <div class="logo-sub">Admin Panel</div>
          </div>
        </transition>
      </div>

      <v-divider color="#1e1e1e" />

      <!-- Nav items -->
      <v-list density="compact" nav class="nav-list mt-2 px-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :value="item.to"
          color="#ff6b47"
          rounded="lg"
          class="nav-item mb-1"
        >
          <template #prepend>
            <component :is="item.icon" class="nav-icon" :class="{ 'nav-icon-active': isActive(item.to) }" />
          </template>
          <template #default>
            <v-list-item-title class="nav-label">{{ item.label }}</v-list-item-title>
          </template>
          <template #append>
            <v-badge
              v-if="item.badge && item.badge > 0"
              :content="item.badge"
              color="primary"
              inline
            />
          </template>
        </v-list-item>
      </v-list>

      <v-spacer />

      <v-divider color="#1e1e1e" />

      <!-- Footer -->
      <v-list density="compact" nav class="px-2 py-2">
        <v-list-item
          to="/"
          color="#ff6b47"
          rounded="lg"
          class="nav-item"
        >
          <template #prepend>
            <HomeIcon class="nav-icon" />
          </template>
          <template #default>
            <v-list-item-title class="nav-label">Back to App</v-list-item-title>
          </template>
        </v-list-item>

        <!-- Rail toggle -->
        <v-list-item
          rounded="lg"
          class="nav-item mt-1"
          @click="rail = !rail"
        >
          <template #prepend>
            <ChevronDoubleLeftIcon v-if="!rail" class="nav-icon" />
            <ChevronDoubleRightIcon v-else class="nav-icon" />
          </template>
          <template #default>
            <v-list-item-title class="nav-label">Collapse</v-list-item-title>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main content -->
    <v-main class="admin-main-bg">
      <!-- Top bar -->
      <v-app-bar flat color="#0a0a0a" border="b" height="60" class="admin-topbar">
        <v-app-bar-nav-icon
          v-if="mobile"
          @click="drawer = !drawer"
          color="#f5f0e8"
        />
        <div class="topbar-breadcrumb">
          <span class="topbar-page">{{ currentPageTitle }}</span>
        </div>
        <v-spacer />
        <div class="topbar-right">
          <!-- Notifications -->
          <v-btn icon variant="text" color="#a09888" class="mr-1">
            <v-badge :content="pendingCount" color="primary" :model-value="pendingCount > 0">
              <BellIcon class="topbar-icon" />
            </v-badge>
          </v-btn>
          <!-- Admin avatar -->
          <v-menu>
            <template #activator="{ props }">
              <v-btn icon variant="text" v-bind="props">
                <v-avatar size="34" color="primary" class="admin-avatar">
                  <span>{{ avatarLetter }}</span>
                </v-avatar>
              </v-btn>
            </template>
            <v-list bg-color="#141414" border rounded="xl" min-width="180" class="pa-1">
              <v-list-item rounded="lg" @click="$router.push('/profile')">
                <template #prepend><UserCircleIcon class="menu-icon mr-2" /></template>
                <v-list-item-title>Profile</v-list-item-title>
              </v-list-item>
              <v-divider class="my-1" color="#2a2a2a" />
              <v-list-item rounded="lg" @click="handleLogout" base-color="error">
                <template #prepend><ArrowRightOnRectangleIcon class="menu-icon mr-2" /></template>
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </v-app-bar>

      <v-container fluid class="admin-content pa-6">
        <router-view />
      </v-container>
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

// Heroicons
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  FolderIcon,
  HomeIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const auth = useAuthStore()
const toast = useToastStore()
const { mobile } = useDisplay()

const drawer = ref(true)
const rail = ref(false)

const pendingCount = computed(() => orderStore.orders.filter(o => o.status === 'pending').length)
const avatarLetter = computed(() => auth.profile?.name?.[0]?.toUpperCase() || 'A')

const navItems = computed(() => [
  { to: '/admin/dashboard', label: 'Dashboard',   icon: ChartBarIcon,               badge: 0 },
  { to: '/admin/orders',    label: 'Orders',       icon: ClipboardDocumentListIcon,  badge: pendingCount.value },
  { to: '/admin/products',  label: 'Products',     icon: ShoppingBagIcon,            badge: 0 },
  { to: '/admin/categories',label: 'Categories',   icon: FolderIcon,                 badge: 0 },
])

const currentPageTitle = computed(() => {
  const map = {
    '/admin/dashboard':  'Dashboard',
    '/admin/orders':     'Orders Management',
    '/admin/products':   'Products Management',
    '/admin/categories': 'Categories',
  }
  return map[route.path] || 'Admin'
})

const isActive = (to) => route.path === to

const handleLogout = async () => {
  await auth.logout()
  toast.success('Logged out!')
  router.push('/')
}

onMounted(() => orderStore.subscribeToOrders())
onUnmounted(() => orderStore.stopSubscription())
</script>

<style scoped>
/* Drawer logo */
.drawer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  transition: all 0.25s ease;
}
.drawer-logo.collapsed {
  justify-content: center;
  padding: 20px 8px;
}
.logo-icon-wrap {
  width: 38px;
  height: 38px;
  background: rgba(232,70,42,0.15);
  border: 1px solid rgba(232,70,42,0.25);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.logo-emoji { font-size: 20px; }
.logo-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 18px;
  letter-spacing: 0.12em;
  color: #f5f0e8;
  line-height: 1;
}
.logo-sub {
  font-size: 9px;
  color: #a09888;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  margin-top: 3px;
}

/* Nav items */
.nav-list { background: transparent !important; }

.nav-item {
  transition: all 0.15s ease !important;
  min-height: 44px !important;
}
.nav-item:hover { background: rgba(255,255,255,0.05) !important; }

.nav-icon {
  width: 20px;
  height: 20px;
  color: #a09888;
  transition: color 0.15s;
  flex-shrink: 0;
  margin-right: 12px;
}
.nav-icon-active { color: #ff6b47 !important; }

.nav-label {
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #a09888;
}

/* Active state override */
:deep(.v-list-item--active .nav-label) { color: #ff6b47 !important; }
:deep(.v-list-item--active .nav-icon)  { color: #ff6b47 !important; }
:deep(.v-list-item--active) { background: rgba(232,70,42,0.1) !important; }

/* Topbar */
.admin-topbar { border-color: #1e1e1e !important; }
.topbar-breadcrumb { display: flex; align-items: center; gap: 8px; margin-left: 8px; }
.topbar-page {
  font-size: 15px;
  font-weight: 600;
  color: #f5f0e8;
  letter-spacing: 0.01em;
}
.topbar-right { display: flex; align-items: center; gap: 4px; padding-right: 8px; }
.topbar-icon { width: 20px; height: 20px; }
.menu-icon { width: 18px; height: 18px; }

/* Admin avatar */
.admin-avatar {
  font-size: 13px !important;
  font-weight: 700 !important;
}

/* Main content */
.admin-main-bg { background: #0a0a0a !important; }
.admin-content { min-height: calc(100vh - 60px); }

/* Vuetify drawer border fix */
:deep(.v-navigation-drawer__border) { display: none; }
:deep(.v-navigation-drawer) { border-right: 1px solid #1e1e1e !important; }

/* Fade label transition */
.fade-label-enter-active,
.fade-label-leave-active { transition: opacity 0.2s ease; }
.fade-label-enter-from,
.fade-label-leave-to { opacity: 0; }
</style>