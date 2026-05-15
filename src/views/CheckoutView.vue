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

          <div v-if="paymentStore.loading" class="loading-row">
            <div class="spinner" style="width:20px;height:20px;border-width:2px" />
            <span>Loading payment options...</span>
          </div>

          <div v-else-if="paymentOptions.length === 0" class="no-payments">
            <p>No payment methods available right now. Please contact the store.</p>
          </div>

          <template v-else>
            <div class="payment-options">
              <label
                v-for="opt in paymentOptions"
                :key="opt.value"
                class="payment-option"
                :class="{ active: form.payment === opt.value }"
              >
                <input type="radio" v-model="form.payment" :value="opt.value" hidden />
                <component :is="opt.icon" class="pay-icon" />
                <div>
                  <div class="pay-name">{{ opt.name }}</div>
                  <div class="pay-desc">{{ opt.desc }}</div>
                </div>
              </label>
            </div>

            <!-- Payment details (shown when an online method is selected) -->
            <div v-if="selectedDetails" class="payment-details">
              <div class="details-header">
                <component :is="selectedDetails.icon" class="details-icon" />
                <span>{{ selectedDetails.title }}</span>
              </div>

              <div class="details-body">
                <div v-if="selectedDetails.qr" class="qr-wrap">
                  <img :src="selectedDetails.qr" alt="Payment QR" class="qr-img" />
                  <span class="qr-cap">Scan to pay</span>
                </div>

                <div class="details-info">
                  <div v-for="line in selectedDetails.lines" :key="line.label" class="detail-line">
                    <span class="detail-label">{{ line.label }}</span>
                    <div class="detail-value-wrap">
                      <span class="detail-value">{{ line.value || '—' }}</span>
                      <button
                        v-if="line.value && line.copyable"
                        class="copy-btn"
                        @click.prevent="copy(line.value)"
                        title="Copy"
                      >
                        <ClipboardDocumentIcon class="copy-icon" />
                      </button>
                    </div>
                  </div>

                  <p class="details-note">
                    <InformationCircleIcon class="inline-icon" />
                    Send your payment to the details above, then place your order.
                    Keep a screenshot of the receipt as proof.
                  </p>
                </div>
              </div>
            </div>
          </template>
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
        <button
          class="btn btn-primary place-order-btn"
          @click="placeOrder"
          :disabled="placing || !cart.items.length || !form.payment"
        >
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useOrderStore } from '@/stores/orders'
import { usePaymentStore } from '@/stores/payments'
import { useToastStore } from '@/stores/toast'
import {
  ArrowLeftIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  LockClosedIcon,
  SparklesIcon,
  InformationCircleIcon,
  ClipboardDocumentIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const orderStore = useOrderStore()
const paymentStore = usePaymentStore()
const toast = useToastStore()
const placing = ref(false)

const form = ref({
  name: auth.profile?.name || '',
  phone: auth.profile?.phone || '',
  address: '',
  notes: '',
  payment: '',
})

const paymentOptions = computed(() => {
  const m = paymentStore.methods
  const out = []
  if (m.cod?.enabled !== false) {
    out.push({ value: 'cod', icon: BanknotesIcon, name: 'Cash on Delivery', desc: 'Pay when your order arrives' })
  }
  if (m.gcash?.enabled) {
    out.push({ value: 'gcash', icon: DevicePhoneMobileIcon, name: 'GCash', desc: 'Pay via GCash mobile wallet' })
  }
  if (m.paymaya?.enabled) {
    out.push({ value: 'paymaya', icon: DevicePhoneMobileIcon, name: 'Maya / PayMaya', desc: 'Pay via Maya mobile wallet' })
  }
  if (m.bank?.enabled) {
    out.push({ value: 'bank', icon: BuildingLibraryIcon, name: 'Bank Transfer', desc: 'Online bank transfer' })
  }
  return out
})

const selectedDetails = computed(() => {
  const m = paymentStore.methods
  if (form.value.payment === 'gcash' && m.gcash?.enabled) {
    return {
      icon: DevicePhoneMobileIcon,
      title: 'GCash Payment Details',
      qr: m.gcash.qr,
      lines: [
        { label: 'Account Name', value: m.gcash.name, copyable: true },
        { label: 'GCash Number', value: m.gcash.number, copyable: true },
      ],
    }
  }
  if (form.value.payment === 'paymaya' && m.paymaya?.enabled) {
    return {
      icon: DevicePhoneMobileIcon,
      title: 'Maya Payment Details',
      qr: m.paymaya.qr,
      lines: [
        { label: 'Account Name', value: m.paymaya.name, copyable: true },
        { label: 'Maya Number',  value: m.paymaya.number, copyable: true },
      ],
    }
  }
  if (form.value.payment === 'bank' && m.bank?.enabled) {
    return {
      icon: BuildingLibraryIcon,
      title: 'Bank Transfer Details',
      qr: m.bank.qr,
      lines: [
        { label: 'Bank',           value: m.bank.bankName,      copyable: false },
        { label: 'Account Name',   value: m.bank.accountName,   copyable: true  },
        { label: 'Account Number', value: m.bank.accountNumber, copyable: true  },
      ],
    }
  }
  return null
})

const copy = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied!')
  } catch {
    toast.error('Copy failed')
  }
}

// Auto-select the first available option once loaded
watch(paymentOptions, (opts) => {
  if (!form.value.payment && opts.length) {
    form.value.payment = opts[0].value
  } else if (form.value.payment && !opts.find(o => o.value === form.value.payment)) {
    form.value.payment = opts[0]?.value || ''
  }
}, { immediate: true })

const placeOrder = async () => {
  if (!form.value.name || !form.value.phone || !form.value.address) {
    toast.error('Please fill in all required fields'); return
  }
  if (!form.value.payment) {
    toast.error('Please select a payment method'); return
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

onMounted(() => paymentStore.fetchMethods())
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

.loading-row {
  display: flex; align-items: center; gap: 10px;
  color: var(--text2); font-size: 13px; padding: 8px 4px;
}
.no-payments {
  padding: 16px; text-align: center;
  background: var(--bg3); border: 1px dashed var(--border);
  border-radius: 12px; color: var(--text2); font-size: 13px;
}

/* Payment details panel */
.payment-details {
  margin-top: 16px;
  border: 1px solid rgba(232,70,42,0.25);
  background: rgba(232,70,42,0.04);
  border-radius: 12px; overflow: hidden;
}
.details-header {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px;
  background: rgba(232,70,42,0.08);
  border-bottom: 1px solid rgba(232,70,42,0.15);
  font-size: 13px; font-weight: 700; color: var(--accent2);
  text-transform: uppercase; letter-spacing: 0.06em;
}
.details-icon { width: 16px; height: 16px; }
.details-body {
  display: grid; grid-template-columns: auto 1fr; gap: 18px;
  padding: 16px;
  align-items: start;
}
.qr-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.qr-img {
  width: 160px; height: 160px; object-fit: contain;
  background: #fff; border-radius: 10px; padding: 8px;
  border: 1px solid var(--border);
}
.qr-cap { font-size: 11px; color: var(--text2); }

.details-info { display: flex; flex-direction: column; gap: 10px; }
.detail-line {
  display: flex; flex-direction: column; gap: 3px;
  padding-bottom: 8px; border-bottom: 1px dashed var(--border);
}
.detail-line:last-of-type { border-bottom: none; }
.detail-label {
  font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text2);
}
.detail-value-wrap {
  display: flex; align-items: center; gap: 8px;
}
.detail-value {
  font-size: 14px; font-weight: 600; color: var(--text);
  word-break: break-all;
}
.copy-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border-radius: 7px;
  background: var(--bg3); border: 1px solid var(--border);
  color: var(--text2); cursor: pointer;
  transition: all 0.15s; flex-shrink: 0;
}
.copy-btn:hover { color: var(--accent2); border-color: var(--accent); }
.copy-icon { width: 13px; height: 13px; }

.details-note {
  display: flex; align-items: flex-start; gap: 6px;
  font-size: 12px; color: var(--text2);
  margin-top: 4px; line-height: 1.5;
}

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
  .details-body { grid-template-columns: 1fr; }
  .qr-wrap { align-items: flex-start; }
}
</style>
