import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy
} from 'firebase/firestore'
import { db } from '@/firebase'

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const categories = ref([])
  const loading = ref(false)

  const fetchProducts = async () => {
    loading.value = true
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      products.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, 'categories'))
    categories.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  const addProduct = async (data) => {
    const ref2 = await addDoc(collection(db, 'products'), {
      ...data, createdAt: new Date().toISOString(), available: true
    })
    await fetchProducts()
    return ref2.id
  }

  const updateProduct = async (id, data) => {
    await updateDoc(doc(db, 'products', id), data)
    await fetchProducts()
  }

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, 'products', id))
    products.value = products.value.filter(p => p.id !== id)
  }

  const addCategory = async (name, emoji) => {
    await addDoc(collection(db, 'categories'), { name, emoji, createdAt: new Date().toISOString() })
    await fetchCategories()
  }

  return { products, categories, loading, fetchProducts, fetchCategories, addProduct, updateProduct, deleteProduct, addCategory }
})
