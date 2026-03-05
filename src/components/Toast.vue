<template>
  <teleport to="body">
    <div class="toast-container">
      <transition-group name="toast">
        <div v-for="t in toasts" :key="t.id" class="toast" :class="`toast-${t.type}`">
          <span class="toast-icon">{{ t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ' }}</span>
          {{ t.message }}
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'
import { storeToRefs } from 'pinia'
const { toasts } = storeToRefs(useToastStore())
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  min-width: 260px;
  max-width: 380px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  /* Always white text on solid bg — readable on any palette */
  color: #ffffff;
}

/* Solid backgrounds — no more transparency issues */
.toast-success {
  background: #1a7a4a;
}

.toast-error {
  background: #8b1a0e;
  border-left: 4px solid #e8462a;
}

.toast-info {
  background: #1a2a6e;
  border-left: 4px solid #5b7fff;
}

/* Icon circle uses the accent color as bg, dark text inside */
.toast-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-success .toast-icon { background: #2ecc71; color: #0a2e1a; }
.toast-error   .toast-icon { background: #e8462a; color: #fff; }
.toast-info    .toast-icon { background: #5b7fff; color: #fff; }

/* Animations */
.toast-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateX(60px); }
</style>