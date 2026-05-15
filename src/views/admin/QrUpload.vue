<template>
  <div class="form-group qr-block">
    <label><QrCodeIcon class="label-icon" /> QR Code (optional)</label>

    <div class="qr-zone" :class="{ uploading, filled: !!value }">
      <template v-if="value">
        <img :src="value" class="qr-preview" alt="QR code" />
        <div class="qr-actions">
          <button class="qr-action-btn" @click="$refs.input.click()" :disabled="uploading">
            <ArrowPathIcon class="qr-action-icon" />
            Replace
          </button>
          <button class="qr-action-btn danger" @click="$emit('remove')" :disabled="uploading">
            <TrashIcon class="qr-action-icon" />
            Remove
          </button>
        </div>
      </template>

      <div
        v-else
        class="qr-placeholder"
        @click="$refs.input.click()"
      >
        <div class="qr-icon-wrap">
          <ArrowUpTrayIcon v-if="!uploading" class="qr-up-icon" />
          <div v-else class="spinner" style="width:22px;height:22px;border-width:2px" />
        </div>
        <span>{{ uploading ? 'Uploading...' : 'Click to upload QR' }}</span>
        <span class="qr-hint">JPG, PNG, WebP</span>
      </div>
    </div>

    <input
      ref="input"
      type="file"
      accept="image/*"
      hidden
      @change="onChange"
    />
  </div>
</template>

<script setup>
import {
  QrCodeIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'

defineProps({
  value:     { type: String, default: '' },
  uploading: { type: Boolean, default: false },
})

const emit = defineEmits(['upload', 'remove'])

const onChange = (e) => {
  const file = e.target.files?.[0]
  if (file) emit('upload', file)
  e.target.value = ''
}
</script>

<style scoped>
.qr-block { margin-top: 4px; }

.form-group label {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text2);
}
.label-icon { width: 12px; height: 12px; }

.qr-zone {
  border: 2px dashed var(--border); border-radius: 12px;
  padding: 16px; min-height: 180px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px; transition: all 0.2s;
}
.qr-zone.filled { border-style: solid; padding: 14px; }
.qr-zone.uploading,
.qr-zone:hover { border-color: var(--accent); background: rgba(232,70,42,0.04); }

.qr-placeholder {
  display: flex; flex-direction: column;
  align-items: center; gap: 6px; cursor: pointer;
  text-align: center;
}
.qr-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--bg3); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.qr-up-icon { width: 22px; height: 22px; color: var(--text2); }
.qr-placeholder span:nth-child(2) {
  font-size: 13px; font-weight: 500; color: var(--text2);
}
.qr-hint { font-size: 11px; color: var(--text2); opacity: 0.6; }

.qr-preview {
  width: 140px; height: 140px; object-fit: contain;
  background: #fff; border-radius: 10px; padding: 6px;
}

.qr-actions { display: flex; gap: 8px; }
.qr-action-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 8px;
  background: var(--bg3); border: 1px solid var(--border);
  color: var(--text2); font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.qr-action-btn:hover:not(:disabled) {
  border-color: var(--text2); color: var(--text);
}
.qr-action-btn.danger:hover:not(:disabled) {
  border-color: var(--accent); color: var(--accent2);
  background: rgba(232,70,42,0.08);
}
.qr-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.qr-action-icon { width: 13px; height: 13px; }
</style>
