import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, addDoc, getDocs, updateDoc, doc, getDoc,
  query, where, orderBy, onSnapshot
} from 'firebase/firestore'
import { db } from '@/firebase'

export const useOrderStore = defineStore('orders', () => {
  const orders = ref([])
  const myOrders = ref([])
  const loading = ref(false)
  let unsubscribe = null
  const orderSubs = new Map()

  const placeOrder = async (orderData) => {
    const ref2 = await addDoc(collection(db, 'orders'), {
      ...orderData,
      status: 'pending',
      driverLocation: null,
      driverLocationUpdatedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    return ref2.id
  }

  const fetchMyOrders = async (uid) => {
    loading.value = true
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      myOrders.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } finally {
      loading.value = false
    }
  }

  const fetchAllOrders = async () => {
    loading.value = true
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      orders.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } finally {
      loading.value = false
    }
  }

  const fetchOrderById = async (id) => {
    const snap = await getDoc(doc(db, 'orders', id))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() }
  }

  const subscribeToOrders = () => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    unsubscribe = onSnapshot(q, (snap) => {
      orders.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
  }

  const subscribeToOrder = (id, callback) => {
    if (orderSubs.has(id)) {
      orderSubs.get(id)()
      orderSubs.delete(id)
    }
    const unsub = onSnapshot(doc(db, 'orders', id), (snap) => {
      if (snap.exists()) callback({ id: snap.id, ...snap.data() })
      else callback(null)
    })
    orderSubs.set(id, unsub)
    return () => {
      unsub()
      orderSubs.delete(id)
    }
  }

  const updateOrderStatus = async (id, status) => {
    await updateDoc(doc(db, 'orders', id), {
      status,
      updatedAt: new Date().toISOString()
    })
  }

  const updateDriverLocation = async (id, lat, lng) => {
    await updateDoc(doc(db, 'orders', id), {
      driverLocation: { lat, lng },
      driverLocationUpdatedAt: new Date().toISOString(),
    })
  }

  const updateDeliveryLocation = async (id, lat, lng) => {
    await updateDoc(doc(db, 'orders', id), {
      deliveryLocation: { lat, lng },
      updatedAt: new Date().toISOString(),
    })
  }

  const clearDriverLocation = async (id) => {
    await updateDoc(doc(db, 'orders', id), {
      driverLocation: null,
      driverLocationUpdatedAt: null,
    })
  }

  const stopSubscription = () => {
    if (unsubscribe) unsubscribe()
    orderSubs.forEach(unsub => unsub())
    orderSubs.clear()
  }

  return {
    orders, myOrders, loading,
    placeOrder, fetchMyOrders, fetchAllOrders, fetchOrderById,
    subscribeToOrders, subscribeToOrder,
    updateOrderStatus, updateDriverLocation, updateDeliveryLocation, clearDriverLocation,
    stopSubscription,
  }
})
