<template>
  <div class="admin-store">

    <!-- Header -->
    <div class="page-header">
      <div class="page-title">
        <BuildingStorefrontIcon class="page-title-icon" />
        <h1>Store Settings</h1>
      </div>
      <button
        class="btn btn-primary save-btn"
        @click="handleSave"
        :disabled="settingsStore.saving"
      >
        <div class="spinner" v-if="settingsStore.saving" style="width:15px;height:15px;border-width:2px" />
        <CheckIcon v-else class="btn-icon" />
        {{ settingsStore.saving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>

    <p class="page-hint">
      <InformationCircleIcon class="hint-icon" />
      Set your store's pickup location. This pin is used as the starting point on the delivery tracking map.
    </p>

    <div class="layout">
      <div class="form-card card">
        <div class="form-group">
          <label><BuildingStorefrontIcon class="label-icon" /> Store Name</label>
          <input v-model="form.name" placeholder="e.g. Paluto Main Branch" />
        </div>

        <div class="form-group">
          <label><MapPinIcon class="label-icon" /> Store Address</label>
          <input v-model="form.address" placeholder="Street, Barangay, City" />
        </div>

        <div class="form-group">
          <label><PhoneIcon class="label-icon" /> Contact Number</label>
          <input v-model="form.phone" placeholder="09XX XXX XXXX" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Latitude</label>
            <input v-model.number="form.lat" type="number" step="0.000001" />
          </div>
          <div class="form-group">
            <label>Longitude</label>
            <input v-model.number="form.lng" type="number" step="0.000001" />
          </div>
        </div>

        <div class="action-row">
          <button class="btn btn-outline locate-btn" @click="useMyLocation" :disabled="locating">
            <div class="spinner" v-if="locating" style="width:14px;height:14px;border-width:2px" />
            <MapPinIcon v-else class="btn-icon" />
            {{ locating ? 'Locating...' : 'Use my current location' }}
          </button>
        </div>

        <p class="map-hint">
          <InformationCircleIcon class="hint-icon" />
          Click anywhere on the map to drop the pin, or drag the existing pin to fine-tune.
        </p>
      </div>

      <div class="map-card card">
        <DeliveryMap
          ref="mapRef"
          height="500px"
          :picker="true"
          :store-location="null"
          :delivery-location="null"
          :initial-center="{ lat: form.lat, lng: form.lng }"
          :initial-zoom="15"
          :auto-fit="false"
          @ready="onMapReady"
          @pick="onPick"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useToastStore } from '@/stores/toast'
import DeliveryMap from '@/components/DeliveryMap.vue'

import {
  BuildingStorefrontIcon,
  CheckIcon,
  InformationCircleIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/vue/24/outline'

const settingsStore = useSettingsStore()
const toast = useToastStore()

const mapRef = ref(null)
const locating = ref(false)

const form = reactive({
  name: '',
  address: '',
  phone: '',
  lat: 14.5995,
  lng: 120.9842,
})

const onMapReady = () => {
  if (mapRef.value && form.lat && form.lng) {
    mapRef.value.placePicker(form.lat, form.lng)
  }
}

const onPick = ({ lat, lng }) => {
  form.lat = +lat.toFixed(6)
  form.lng = +lng.toFixed(6)
}

const useMyLocation = () => {
  if (!navigator.geolocation) {
    toast.error('Geolocation not supported by this browser')
    return
  }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords
      form.lat = +latitude.toFixed(6)
      form.lng = +longitude.toFixed(6)
      mapRef.value?.placePicker(latitude, longitude)
      mapRef.value?.setView(latitude, longitude, 16)
      locating.value = false
      toast.success('Pin updated to your location')
    },
    (err) => {
      locating.value = false
      toast.error(err.message || 'Could not get location')
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

const handleSave = async () => {
  try {
    await settingsStore.saveStore({ ...form })
    toast.success('Store settings saved!')
  } catch {
    toast.error('Failed to save store settings')
  }
}

// Keep picker in sync if user edits lat/lng numerically
watch([() => form.lat, () => form.lng], ([lat, lng]) => {
  if (mapRef.value && Number.isFinite(lat) && Number.isFinite(lng)) {
    mapRef.value.placePicker(lat, lng)
  }
})

onMounted(async () => {
  await settingsStore.fetchStore()
  Object.assign(form, settingsStore.store)
})
</script>

<style scoped>
.admin-store { max-width: 1200px; }

.page-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; margin-bottom: 12px; flex-wrap: wrap;
}
.page-title { display: flex; align-items: center; gap: 10px; }
.page-title-icon { width: 26px; height: 26px; color: var(--accent2); }
h1 { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 900; }
.save-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; }
.btn-icon { width: 15px; height: 15px; }

.page-hint, .map-hint {
  display: flex; align-items: flex-start; gap: 8px;
  font-size: 13px; color: var(--text2);
  background: rgba(108,108,255,0.06);
  border: 1px solid rgba(108,108,255,0.18);
  padding: 10px 14px; border-radius: 10px;
}
.page-hint { margin-bottom: 24px; }
.hint-icon { width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; color: #8a8aff; }

.layout {
  display: grid; grid-template-columns: 380px 1fr; gap: 20px; align-items: start;
}
.form-card { padding: 22px; display: flex; flex-direction: column; gap: 14px; }
.map-card { padding: 12px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.form-group { display: flex; flex-direction: column; gap: 7px; }
.form-group label {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text2);
}
.label-icon { width: 12px; height: 12px; }

.action-row { display: flex; gap: 10px; }
.locate-btn {
  flex: 1; display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; padding: 10px;
}

@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
}
</style>
