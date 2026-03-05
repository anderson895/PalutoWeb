<template>
  <teleport to="body">
    <transition name="drawer">
      <div class="drawer-overlay" v-if="cart.isOpen" @click.self="cart.toggleCart">
        <div class="drawer">
          <div class="drawer-header">
            <h2>Your Order</h2>
            <button class="drawer-close" @click="cart.toggleCart">✕</button>
          </div>

          <div class="drawer-body" v-if="cart.items.length">
            <div class="cart-item" v-for="item in cart.items" :key="item.id">
              <img :src="item.image || 'https://via.placeholder.com/60x60?text=Food'" :alt="item.name" />
              <div class="cart-item-info">
                <div class="cart-item-name">{{ item.name }}</div>
                <div class="cart-item-price">₱{{ item.price.toFixed(2) }}</div>
              </div>
              <div class="cart-item-qty">
                <button @click="cart.updateQty(item.id, item.qty - 1)">−</button>
                <span>{{ item.qty }}</span>
                <button @click="cart.updateQty(item.id, item.qty + 1)">+</button>
              </div>
              <button class="cart-item-remove" @click="cart.removeItem(item.id)">🗑</button>
            </div>
          </div>
          <div class="drawer-empty" v-else>
            <div class="empty-icon">🛒</div>
            <p>Your cart is empty</p>
            <button class="btn btn-primary" @click="cart.toggleCart; $router.push('/menu')">Browse Menu</button>
          </div>

          <div class="drawer-footer" v-if="cart.items.length">
            <div class="price-row"><span>Subtotal</span><span>₱{{ cart.subtotal.toFixed(2) }}</span></div>
            <div class="price-row"><span>Delivery</span><span>{{ cart.deliveryFee === 0 ? 'FREE' : '₱' + cart.deliveryFee }}</span></div>
            <div class="divider"></div>
            <div class="price-row total"><span>Total</span><span>₱{{ cart.total.toFixed(2) }}</span></div>
            <router-link to="/checkout" class="btn btn-primary checkout-btn" @click="cart.toggleCart">
              Proceed to Checkout
            </router-link>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>
<script setup>
import { useCartStore } from '@/stores/cart'
const cart = useCartStore()
</script>
<style scoped>
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; justify-content: flex-end; backdrop-filter: blur(4px); }
.drawer { width: 420px; max-width: 100vw; background: var(--bg2); border-left: 1px solid var(--border); height: 100%; display: flex; flex-direction: column; overflow: hidden; }
.drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.drawer-header h2 { font-family: 'Playfair Display', serif; font-size: 22px; }
.drawer-close { background: var(--bg3); border: 1px solid var(--border); color: var(--text2); width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 12px; transition: all 0.2s; }
.drawer-close:hover { color: var(--text); border-color: var(--text2); }
.drawer-body { flex: 1; overflow-y: auto; padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; }
.drawer-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 40px; text-align: center; }
.empty-icon { font-size: 48px; opacity: 0.4; }
.drawer-empty p { color: var(--text2); font-size: 15px; }
.cart-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--card); border: 1px solid var(--border); border-radius: 12px; }
.cart-item img { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.cart-item-info { flex: 1; min-width: 0; }
.cart-item-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cart-item-price { font-size: 13px; color: var(--accent2); font-weight: 600; margin-top: 2px; }
.cart-item-qty { display: flex; align-items: center; gap: 8px; }
.cart-item-qty button { width: 26px; height: 26px; background: var(--bg3); border: 1px solid var(--border); color: var(--text); border-radius: 6px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.cart-item-qty button:hover { border-color: var(--accent); color: var(--accent); }
.cart-item-qty span { font-size: 14px; font-weight: 600; min-width: 20px; text-align: center; }
.cart-item-remove { background: none; border: none; color: var(--text2); cursor: pointer; font-size: 16px; padding: 4px; opacity: 0.6; transition: opacity 0.15s; }
.cart-item-remove:hover { opacity: 1; }
.drawer-footer { padding: 20px 24px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 10px; }
.price-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--text2); }
.price-row.total { font-size: 18px; font-weight: 700; color: var(--text); }
.checkout-btn { width: 100%; margin-top: 8px; padding: 14px; font-size: 15px; }
.drawer-enter-active, .drawer-leave-active { transition: opacity 0.25s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform 0.3s cubic-bezier(0.34,1.2,0.64,1); }
.drawer-enter-from .drawer { transform: translateX(100%); }
.drawer-leave-to .drawer { transform: translateX(100%); }
</style>
