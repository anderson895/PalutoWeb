<template>
  <div id="app-root">
    <AppNav v-if="!isAdminRoute" />

    <Transition name="fade">
      <div v-if="isRouteLoading" class="loading-overlay">
        <v-progress-circular
          indeterminate
          color="error"
          size="48"
          width="4"
        />
      </div>
    </Transition>

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <CartDrawer />
    <AppFooter v-if="!isAdminRoute" />
    <Toast />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { isRouteLoading } from '@/router'
import AppNav from '@/components/AppNav.vue'
import AppFooter from '@/components/AppFooter.vue'
import CartDrawer from '@/components/CartDrawer.vue'
import Toast from '@/components/Toast.vue'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-background), 0.7);
  backdrop-filter: blur(3px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>