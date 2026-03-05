<template>
  <div class="product-page container" v-if="product">
    <button class="back-btn btn btn-ghost" @click="$router.back()">← Back</button>
    <div class="product-detail">
      <div class="product-image-wrap">
        <img :src="product.image || 'https://via.placeholder.com/600x500?text=' + product.name" :alt="product.name" />
        <div class="product-detail-badges">
          <span v-if="product.isNew" class="tag tag-red">NEW</span>
          <span v-if="product.isBestseller" class="tag tag-gold">⭐ Bestseller</span>
          <span v-if="!product.available" class="tag tag-gray">Unavailable</span>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category-tag">{{ product.category }}</div>
        <h1>{{ product.name }}</h1>
        <p class="product-description">{{ product.description }}</p>
        <div class="product-meta">
          <div v-if="product.prepTime"><span>🕐</span> {{ product.prepTime }} min prep time</div>
          <div v-if="product.calories"><span>🔥</span> {{ product.calories }} cal</div>
          <div v-if="product.servings"><span>🍽️</span> Serves {{ product.servings }}</div>
        </div>
        <div class="price-section">
          <div class="price-display">₱{{ product.price?.toFixed(2) }}</div>
        </div>
        <div class="qty-section">
          <div class="qty-controls">
            <button @click="qty > 1 && qty--">−</button>
            <span>{{ qty }}</span>
            <button @click="qty++">+</button>
          </div>
          <button class="btn btn-primary add-btn" @click="handleAdd" :disabled="!product.available">
            {{ product.available ? 'Add to Cart' : 'Not Available' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="loading-overlay" v-else><div class="spinner"></div></div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const productStore = useProductStore()
const cart = useCartStore()
const toast = useToastStore()
const qty = ref(1)

const product = computed(() => productStore.products.find(p => p.id === route.params.id))

const handleAdd = () => {
  for (let i = 0; i < qty.value; i++) cart.addItem(product.value)
  toast.success(`${qty.value}x ${product.value.name} added to cart!`)
}

onMounted(() => { if (!productStore.products.length) productStore.fetchProducts() })
</script>
<style scoped>
.product-page { padding: 32px 24px 80px; }
.back-btn { margin-bottom: 24px; }
.product-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
.product-image-wrap { position: relative; border-radius: 20px; overflow: hidden; }
.product-image-wrap img { width: 100%; aspect-ratio: 4/3; object-fit: cover; }
.product-detail-badges { position: absolute; top: 16px; left: 16px; display: flex; gap: 8px; }
.product-category-tag { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent2); margin-bottom: 12px; }
.product-info h1 { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 900; line-height: 1.1; margin-bottom: 16px; }
.product-description { font-size: 15px; color: var(--text2); line-height: 1.7; margin-bottom: 24px; }
.product-meta { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 28px; }
.product-meta > div { display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--text2); background: var(--bg3); padding: 8px 14px; border-radius: 100px; border: 1px solid var(--border); }
.price-display { font-size: 40px; font-weight: 700; margin: 20px 0; }
.qty-section { display: flex; gap: 16px; align-items: center; }
.qty-controls { display: flex; align-items: center; gap: 12px; background: var(--bg3); border: 1px solid var(--border); border-radius: 12px; padding: 8px 16px; }
.qty-controls button { background: none; border: none; color: var(--text); font-size: 20px; font-weight: 300; cursor: pointer; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: background 0.15s; }
.qty-controls button:hover { background: var(--border); }
.qty-controls span { font-size: 16px; font-weight: 700; min-width: 24px; text-align: center; }
.add-btn { flex: 1; padding: 16px; font-size: 16px; }
@media (max-width: 768px) {
  .product-detail { grid-template-columns: 1fr; }
}
</style>
