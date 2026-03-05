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
.toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
.toast { display: flex; align-items: center; gap: 10px; padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; min-width: 260px; max-width: 380px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
.toast-success { background: rgba(46,204,113,0.15); border: 1px solid rgba(46,204,113,0.3); color: #2ecc71; }
.toast-error { background: rgba(232,70,42,0.15); border: 1px solid rgba(232,70,42,0.3); color: #e8462a; }
.toast-info { background: rgba(100,100,255,0.15); border: 1px solid rgba(100,100,255,0.3); color: #8888ff; }
.toast-icon { width: 22px; height: 22px; border-radius: 50%; font-size: 11px; font-weight: 700; background: currentColor; color: #0a0a0a; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.toast-enter-active { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(60px); }
</style>
