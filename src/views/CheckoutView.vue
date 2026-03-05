<template>
  <div class="checkout-page container">
    <button class="btn btn-ghost back-btn" @click="$router.back()">
      <ArrowLeftIcon class="btn-icon" /> Back to Cart
    </button>
    <h1>Checkout</h1>
    <div class="checkout-layout">
      <!-- Order form -->
      <div class="checkout-form">
        <div class="checkout-section card">
          <h3>Delivery Details</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Full Name</label>
              <input v-model="form.name" placeholder="Juan Dela Cruz" required />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input v-model="form.phone" placeholder="+63 912 345 6789" required />
            </div>
            <div class="form-group full">
              <label>Delivery Address</label>
              <input v-model="form.address" placeholder="Street, Barangay, City" required />
            </div>
            <div class="form-group full">
              <label>Special Instructions (optional)</label>
              <textarea v-model="form.notes" placeholder="Allergy info, extra spicy, no onions..." rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="checkout-section card">
          <h3>Payment Method</h3>
          <div class="payment-options">
            <label v-for="opt in paymentOptions" :key="opt.value" class="payment-option" :class="{ active: form.payment === opt.value }">
              <input type="radio" v-model="form.payment" :value="opt.value" hidden />
              <component :is="opt.icon" class="pay-icon" />
              <div><div class="pay-name">{{ opt.name }}</div><div class="pay-desc">{{ opt.desc }}</div></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Order summary -->
      <div class="order-summary card">
        <h3>Order Summary</h3>
        <div class="summary-items">
          <div v-for="item in cart.items" :key="item.id" class="summary-item">
            <img :src="item.image || 'https://via.placeholder.com/48?text=Food'" :alt="item.name" />
            <div class="summary-item-info">
              <div class="summary-item-name">{{ item.name }}</div>
              <div class="summary-item-qty">x{{ item.qty }}</div>
            </div>
            <div class="summary-item-price">₱{{ (item.price * item.qty).toFixed(2) }}</div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="price-row"><span>Subtotal</span><span>₱{{ cart.subtotal.toFixed(2) }}</span></div>
        <div class="price-row">
          <span>Delivery Fee</span>
          <span class="free-delivery" v-if="cart.deliveryFee === 0">
            <SparklesIcon class="inline-icon" /> FREE
          </span>
          <span v-else>₱{{ cart.deliveryFee }}</span>
        </div>
        <div class="divider"></div>
        <div class="price-row total"><span>Total</span><span>₱{{ cart.total.toFixed(2) }}</span></div>
        <button class="btn btn-primary place-order-btn" @click="placeOrder" :disabled="placing || !cart.items.length">
          <div class="spinner" v-if="placing" style="width:18px;height:18px;border-width:2px"></div>
          {{ placing ? 'Placing Order...' : 'Place Order' }}
        </button>
        <p class="order-note">
          <LockClosedIcon class="inline-icon" /> Your order is secure and encrypted
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useOrderStore } from '@/stores/orders'
import { useToastStore } from '@/stores/toast'
import {
  ArrowLeftIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  LockClosedIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const orderStore = useOrderStore()
const toast = useToastStore()
const placing = ref(false)

const form = ref({
  name: auth.profile?.name || '',
  phone: auth.profile?.phone || '',
  address: '',
  notes: '',
  payment: 'cod'
})

const paymentOptions = [
  { value: 'cod',   icon: BanknotesIcon,         name: 'Cash on Delivery', desc: 'Pay when your order arrives' },
  { value: 'gcash', icon: DevicePhoneMobileIcon,  name: 'GCash',            desc: 'Pay via GCash mobile wallet' },
  { value: 'bank',  icon: BuildingLibraryIcon,    name: 'Bank Transfer',    desc: 'Online bank transfer' },
]

const placeOrder = async () => {
  if (!form.value.name || !form.value.phone || !form.value.address) {
    toast.error('Please fill in all required fields'); return
  }
  placing.value = true
  try {
    const orderId = await orderStore.placeOrder({
      userId: auth.user.uid,
      userName: form.value.name,
      userPhone: form.value.phone,
      userEmail: auth.user.email,
      address: form.value.address,
      notes: form.value.notes,
      payment: form.value.payment,
      items: cart.items,
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
      total: cart.total,
    })
    cart.clearCart()
    toast.success('Order placed successfully!')
    router.push('/orders')
  } catch (e) {
    toast.error('Failed to place order. Please try again.')
  } finally { placing.value = false }
}
</script>

<style scoped>
.checkout-page { padding: 32px 24px 80px; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 16px; }
.btn-icon { width: 16px; height: 16px; }
h1 { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; margin-bottom: 32px; }
.checkout-layout { display: grid; grid-template-columns: 1fr 400px; gap: 28px; align-items: start; }
.checkout-section { padding: 24px; margin-bottom: 20px; }
.checkout-section h3 { font-size: 17px; font-weight: 700; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group.full { grid-column: 1 / -1; }
.payment-options { display: flex; flex-direction: column; gap: 10px; }
.payment-option { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1px solid var(--border); border-radius: 12px; cursor: pointer; transition: all 0.2s; }
.payment-option.active { border-color: var(--accent); background: rgba(232,70,42,0.06); }
.payment-option:hover { border-color: rgba(232,70,42,0.3); }
.pay-icon { width: 24px; height: 24px; flex-shrink: 0; color: var(--text2); }
.payment-option.active .pay-icon { color: var(--accent); }
.pay-name { font-size: 14px; font-weight: 600; }
.pay-desc { font-size: 12px; color: var(--text2); margin-top: 2px; }
.order-summary { padding: 24px; }
.order-summary h3 { font-size: 17px; font-weight: 700; margin-bottom: 20px; }
.summary-items { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.summary-item { display: flex; align-items: center; gap: 12px; }
.summary-item img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.summary-item-info { flex: 1; }
.summary-item-name { font-size: 13px; font-weight: 500; }
.summary-item-qty { font-size: 12px; color: var(--text2); }
.summary-item-price { font-size: 14px; font-weight: 600; }
.price-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--text2); padding: 6px 0; }
.price-row.total { font-size: 20px; font-weight: 700; color: var(--text); padding: 12px 0 4px; }
.free-delivery { display: inline-flex; align-items: center; gap: 4px; color: var(--accent); font-weight: 600; }
.inline-icon { width: 13px; height: 13px; flex-shrink: 0; }
.place-order-btn { width: 100%; padding: 16px; font-size: 16px; margin-top: 16px; }
.order-note { display: flex; align-items: center; justify-content: center; gap: 5px; text-align: center; font-size: 12px; color: var(--text2); margin-top: 12px; }
@media (max-width: 900px) {
  .checkout-layout { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>