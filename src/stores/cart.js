import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const isOpen = ref(false)

  const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))
  const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.price * i.qty, 0))
  const deliveryFee = computed(() => subtotal.value > 500 ? 0 : 49)
  const total = computed(() => subtotal.value + deliveryFee.value)

  const addItem = (product) => {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      existing.qty++
    } else {
      items.value.push({ ...product, qty: 1 })
    }
  }

  const removeItem = (id) => {
    items.value = items.value.filter(i => i.id !== id)
  }

  const updateQty = (id, qty) => {
    if (qty <= 0) { removeItem(id); return }
    const item = items.value.find(i => i.id === id)
    if (item) item.qty = qty
  }

  const clearCart = () => { items.value = [] }

  const toggleCart = () => { isOpen.value = !isOpen.value }

  return { items, isOpen, totalItems, subtotal, deliveryFee, total, addItem, removeItem, updateQty, clearCart, toggleCart }
})
