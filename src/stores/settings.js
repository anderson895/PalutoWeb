import { defineStore } from 'pinia'
import { ref } from 'vue'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

const STORE_DOC = 'store'

const defaultStore = () => ({
  name: 'Paluto',
  address: '',
  lat: 14.5995,
  lng: 120.9842,
  phone: '',
})

export const useSettingsStore = defineStore('settings', () => {
  const store = ref(defaultStore())
  const loading = ref(false)
  const saving = ref(false)
  let unsubscribe = null

  const fetchStore = async () => {
    loading.value = true
    try {
      const snap = await getDoc(doc(db, 'settings', STORE_DOC))
      if (snap.exists()) {
        store.value = { ...defaultStore(), ...snap.data() }
      } else {
        store.value = defaultStore()
      }
    } finally {
      loading.value = false
    }
  }

  const subscribeStore = () => {
    if (unsubscribe) return
    unsubscribe = onSnapshot(doc(db, 'settings', STORE_DOC), (snap) => {
      if (snap.exists()) {
        store.value = { ...defaultStore(), ...snap.data() }
      }
    })
  }

  const stopStoreSubscription = () => {
    if (unsubscribe) { unsubscribe(); unsubscribe = null }
  }

  const saveStore = async (data) => {
    saving.value = true
    try {
      await setDoc(doc(db, 'settings', STORE_DOC), {
        ...data,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
      store.value = { ...defaultStore(), ...data }
    } finally {
      saving.value = false
    }
  }

  return { store, loading, saving, fetchStore, subscribeStore, stopStoreSubscription, saveStore }
})
