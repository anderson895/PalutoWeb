import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy, onSnapshot
} from 'firebase/firestore'
import { db } from '@/firebase'

export const useOrderStore = defineStore('orders', () => {
  const orders = ref([])
  const myOrders = ref([])
  const loading = ref(false)
  let unsubscribe = null

  const placeOrder = async (orderData) => {
    const ref2 = await addDoc(collection(db, 'orders'), {
      ...orderData,
      status: 'pending',
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

  const subscribeToOrders = () => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    unsubscribe = onSnapshot(q, (snap) => {
      orders.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
  }

  const updateOrderStatus = async (id, status) => {
    await updateDoc(doc(db, 'orders', id), {
      status,
      updatedAt: new Date().toISOString()
    })
  }

  const stopSubscription = () => {
    if (unsubscribe) unsubscribe()
  }

  return { orders, myOrders, loading, placeOrder, fetchMyOrders, fetchAllOrders, subscribeToOrders, updateOrderStatus, stopSubscription }
})
