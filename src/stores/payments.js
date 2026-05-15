import { defineStore } from 'pinia'
import { ref } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'

const SETTINGS_DOC = 'paymentMethods'

const defaultMethods = () => ({
  cod:     { enabled: true },
  gcash:   { enabled: false, name: '', number: '', qr: '' },
  paymaya: { enabled: false, name: '', number: '', qr: '' },
  bank:    { enabled: false, bankName: '', accountName: '', accountNumber: '', qr: '' },
})

export const usePaymentStore = defineStore('payments', () => {
  const methods = ref(defaultMethods())
  const loading = ref(false)
  const saving  = ref(false)

  const fetchMethods = async () => {
    loading.value = true
    try {
      const snap = await getDoc(doc(db, 'settings', SETTINGS_DOC))
      const base = defaultMethods()
      if (snap.exists()) {
        const data = snap.data()
        methods.value = {
          cod:     { ...base.cod,     ...(data.cod     || {}) },
          gcash:   { ...base.gcash,   ...(data.gcash   || {}) },
          paymaya: { ...base.paymaya, ...(data.paymaya || {}) },
          bank:    { ...base.bank,    ...(data.bank    || {}) },
        }
      } else {
        methods.value = base
      }
    } finally {
      loading.value = false
    }
  }

  const saveMethods = async (data) => {
    saving.value = true
    try {
      await setDoc(doc(db, 'settings', SETTINGS_DOC), {
        ...data,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
      methods.value = { ...defaultMethods(), ...data }
    } finally {
      saving.value = false
    }
  }

  return { methods, loading, saving, fetchMethods, saveMethods }
})
