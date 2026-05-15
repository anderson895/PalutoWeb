<template>
  <div class="admin-payments">

    <!-- Header -->
    <div class="page-header">
      <div class="page-title">
        <CreditCardIcon class="page-title-icon" />
        <h1>Payment Management</h1>
      </div>
      <button
        class="btn btn-primary save-btn"
        @click="handleSaveAll"
        :disabled="paymentStore.saving || uploading"
      >
        <div class="spinner" v-if="paymentStore.saving" style="width:15px;height:15px;border-width:2px" />
        <CheckIcon v-else class="btn-icon" />
        {{ paymentStore.saving ? 'Saving...' : 'Save All Changes' }}
      </button>
    </div>

    <p class="page-hint">
      <InformationCircleIcon class="hint-icon" />
      Toggle a method on/off and fill in the details. Only enabled methods will appear on the customer checkout page.
    </p>

    <div v-if="paymentStore.loading" class="loading-overlay">
      <div class="spinner" />
    </div>

    <div v-else class="methods-grid">

      <!-- Cash on Delivery -->
      <div class="method-card card" :class="{ disabled: !form.cod.enabled }">
        <div class="method-header">
          <div class="method-icon-wrap cod">
            <BanknotesIcon class="method-icon" />
          </div>
          <div class="method-title">
            <h3>Cash on Delivery</h3>
            <p>Pay when the order arrives</p>
          </div>
          <label class="enable-switch" :title="form.cod.enabled ? 'Enabled' : 'Disabled'">
            <input type="checkbox" v-model="form.cod.enabled" />
            <span class="switch-track"><span class="switch-thumb" /></span>
          </label>
        </div>
        <p class="method-note">
          No setup needed — customers pay cash to your delivery rider.
        </p>
      </div>

      <!-- GCash -->
      <div class="method-card card" :class="{ disabled: !form.gcash.enabled }">
        <div class="method-header">
          <div class="method-icon-wrap gcash">
            <DevicePhoneMobileIcon class="method-icon" />
          </div>
          <div class="method-title">
            <h3>GCash</h3>
            <p>Mobile wallet payment</p>
          </div>
          <label class="enable-switch">
            <input type="checkbox" v-model="form.gcash.enabled" />
            <span class="switch-track"><span class="switch-thumb" /></span>
          </label>
        </div>

        <div class="form-group">
          <label><UserIcon class="label-icon" /> Account Name</label>
          <input v-model="form.gcash.name" placeholder="e.g. Juan Dela Cruz" />
        </div>

        <div class="form-group">
          <label><PhoneIcon class="label-icon" /> GCash Number</label>
          <input v-model="form.gcash.number" placeholder="09XX XXX XXXX" />
        </div>

        <QrUpload
          :value="form.gcash.qr"
          :uploading="uploadKey === 'gcash'"
          @upload="handleUpload('gcash', $event)"
          @remove="form.gcash.qr = ''"
        />
      </div>

      <!-- PayMaya / Maya -->
      <div class="method-card card" :class="{ disabled: !form.paymaya.enabled }">
        <div class="method-header">
          <div class="method-icon-wrap paymaya">
            <DevicePhoneMobileIcon class="method-icon" />
          </div>
          <div class="method-title">
            <h3>Maya / PayMaya</h3>
            <p>Mobile wallet payment</p>
          </div>
          <label class="enable-switch">
            <input type="checkbox" v-model="form.paymaya.enabled" />
            <span class="switch-track"><span class="switch-thumb" /></span>
          </label>
        </div>

        <div class="form-group">
          <label><UserIcon class="label-icon" /> Account Name</label>
          <input v-model="form.paymaya.name" placeholder="e.g. Juan Dela Cruz" />
        </div>

        <div class="form-group">
          <label><PhoneIcon class="label-icon" /> Maya Number</label>
          <input v-model="form.paymaya.number" placeholder="09XX XXX XXXX" />
        </div>

        <QrUpload
          :value="form.paymaya.qr"
          :uploading="uploadKey === 'paymaya'"
          @upload="handleUpload('paymaya', $event)"
          @remove="form.paymaya.qr = ''"
        />
      </div>

      <!-- Bank Transfer -->
      <div class="method-card card" :class="{ disabled: !form.bank.enabled }">
        <div class="method-header">
          <div class="method-icon-wrap bank">
            <BuildingLibraryIcon class="method-icon" />
          </div>
          <div class="method-title">
            <h3>Bank Transfer</h3>
            <p>Direct bank deposit</p>
          </div>
          <label class="enable-switch">
            <input type="checkbox" v-model="form.bank.enabled" />
            <span class="switch-track"><span class="switch-thumb" /></span>
          </label>
        </div>

        <div class="form-group">
          <label><BuildingLibraryIcon class="label-icon" /> Bank Name</label>
          <input v-model="form.bank.bankName" placeholder="e.g. BDO, BPI, UnionBank" />
        </div>

        <div class="form-group">
          <label><UserIcon class="label-icon" /> Account Name</label>
          <input v-model="form.bank.accountName" placeholder="e.g. Juan Dela Cruz" />
        </div>

        <div class="form-group">
          <label><HashtagIcon class="label-icon" /> Account Number</label>
          <input v-model="form.bank.accountNumber" placeholder="0000-0000-0000" />
        </div>

        <QrUpload
          :value="form.bank.qr"
          :uploading="uploadKey === 'bank'"
          @upload="handleUpload('bank', $event)"
          @remove="form.bank.qr = ''"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { usePaymentStore } from '@/stores/payments'
import { useToastStore } from '@/stores/toast'
import { uploadToCloudinary } from '@/cloudinary'
import QrUpload from './QrUpload.vue'

import {
  CreditCardIcon,
  CheckIcon,
  InformationCircleIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  UserIcon,
  PhoneIcon,
  HashtagIcon,
} from '@heroicons/vue/24/outline'

const paymentStore = usePaymentStore()
const toast = useToastStore()

const uploadKey = ref(null)
const uploading = computed(() => uploadKey.value !== null)

const form = reactive({
  cod:     { enabled: true },
  gcash:   { enabled: false, name: '', number: '', qr: '' },
  paymaya: { enabled: false, name: '', number: '', qr: '' },
  bank:    { enabled: false, bankName: '', accountName: '', accountNumber: '', qr: '' },
})

const loadIntoForm = () => {
  const m = paymentStore.methods
  Object.assign(form.cod,     { enabled: true, ...m.cod })
  Object.assign(form.gcash,   { enabled: false, name: '', number: '', qr: '', ...m.gcash })
  Object.assign(form.paymaya, { enabled: false, name: '', number: '', qr: '', ...m.paymaya })
  Object.assign(form.bank,    { enabled: false, bankName: '', accountName: '', accountNumber: '', qr: '', ...m.bank })
}

const handleUpload = async (key, file) => {
  if (!file) return
  uploadKey.value = key
  try {
    const url = await uploadToCloudinary(file)
    form[key].qr = url
    toast.success('QR uploaded!')
  } catch {
    toast.error('Upload failed. Check Cloudinary preset.')
  } finally {
    uploadKey.value = null
  }
}

const handleSaveAll = async () => {
  try {
    await paymentStore.saveMethods({
      cod:     { ...form.cod },
      gcash:   { ...form.gcash },
      paymaya: { ...form.paymaya },
      bank:    { ...form.bank },
    })
    toast.success('Payment methods saved!')
  } catch {
    toast.error('Failed to save payment methods')
  }
}

onMounted(async () => {
  await paymentStore.fetchMethods()
  loadIntoForm()
})
</script>

<style scoped>
.admin-payments { max-width: 1200px; }

/* Header */
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; margin-bottom: 12px; flex-wrap: wrap;
}
.page-title { display: flex; align-items: center; gap: 10px; }
.page-title-icon { width: 26px; height: 26px; color: var(--accent2); }
h1 { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 900; }
.save-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; }
.btn-icon { width: 15px; height: 15px; }

.page-hint {
  display: flex; align-items: flex-start; gap: 8px;
  font-size: 13px; color: var(--text2);
  background: rgba(108,108,255,0.06);
  border: 1px solid rgba(108,108,255,0.18);
  padding: 10px 14px; border-radius: 10px;
  margin-bottom: 24px;
}
.hint-icon { width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; color: #8a8aff; }

/* Methods grid */
.methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.method-card {
  padding: 22px;
  display: flex; flex-direction: column; gap: 14px;
  transition: opacity 0.2s;
}
.method-card.disabled { opacity: 0.55; }
.method-card.disabled .form-group,
.method-card.disabled :deep(.qr-block) {
  opacity: 0.7;
}

.method-header {
  display: flex; align-items: center; gap: 12px;
  padding-bottom: 14px; border-bottom: 1px solid var(--border);
}
.method-title { flex: 1; min-width: 0; }
.method-header h3 { font-size: 16px; font-weight: 700; }
.method-header p { font-size: 12px; color: var(--text2); margin-top: 2px; }
.method-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.method-icon { width: 22px; height: 22px; }
.method-icon-wrap.cod {
  background: rgba(46,204,113,0.12); border: 1px solid rgba(46,204,113,0.25);
}
.method-icon-wrap.cod .method-icon { color: #2ecc71; }
.method-icon-wrap.gcash {
  background: rgba(0,123,255,0.12); border: 1px solid rgba(0,123,255,0.25);
}
.method-icon-wrap.gcash .method-icon { color: #4d9eff; }
.method-icon-wrap.paymaya {
  background: rgba(108,108,255,0.12); border: 1px solid rgba(108,108,255,0.25);
}
.method-icon-wrap.paymaya .method-icon { color: #8a8aff; }
.method-icon-wrap.bank {
  background: rgba(232,70,42,0.12); border: 1px solid rgba(232,70,42,0.25);
}
.method-icon-wrap.bank .method-icon { color: var(--accent2); }

.method-note {
  font-size: 13px; color: var(--text2);
  background: var(--bg3); border: 1px solid var(--border);
  padding: 10px 12px; border-radius: 10px;
}

/* Toggle switch */
.enable-switch {
  position: relative; cursor: pointer; flex-shrink: 0;
  display: inline-flex; align-items: center;
}
.enable-switch input { display: none; }
.switch-track {
  width: 40px; height: 22px; border-radius: 100px;
  background: var(--bg3); border: 1px solid var(--border);
  position: relative; transition: all 0.2s;
  display: block;
}
.switch-thumb {
  position: absolute; top: 2px; left: 2px;
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--text2); transition: all 0.2s;
}
.enable-switch input:checked + .switch-track {
  background: rgba(232,70,42,0.2); border-color: var(--accent);
}
.enable-switch input:checked + .switch-track .switch-thumb {
  left: 20px; background: var(--accent2);
}

/* Form */
.form-group { display: flex; flex-direction: column; gap: 7px; }
.form-group label {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text2);
}
.label-icon { width: 12px; height: 12px; }

/* Loading */
.loading-overlay {
  display: flex; justify-content: center; align-items: center;
  padding: 80px 20px;
}

@media (max-width: 768px) {
  .page-header { align-items: stretch; }
  .save-btn { width: 100%; justify-content: center; }
}
</style>
