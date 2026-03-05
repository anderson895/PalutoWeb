<template>
  <div class="product-page container" v-if="product">

    <!-- Back button -->
    <button class="back-btn" @click="$router.back()">
      <ArrowLeftIcon class="back-icon" />
      Back
    </button>

    <div class="product-detail">

      <!-- Image -->
      <div class="product-image-wrap">
        <img
          :src="product.image || `https://placehold.co/600x500?text=${product.name}`"
          :alt="product.name"
        />
        <div class="product-detail-badges">
          <span v-if="product.isNew" class="badge-pill badge-red">
            <SparklesIcon class="pill-icon" /> NEW
          </span>
          <span v-if="product.isBestseller" class="badge-pill badge-gold">
            <StarIcon class="pill-icon" /> Bestseller
          </span>
          <span v-if="!product.available" class="badge-pill badge-gray">
            <XCircleIcon class="pill-icon" /> Unavailable
          </span>
        </div>
      </div>

      <!-- Info -->
      <div class="product-info">
        <div class="product-category-tag">
          <TagIcon class="cat-tag-icon" />
          {{ product.category }}
        </div>

        <h1>{{ product.name }}</h1>
        <p class="product-description">{{ product.description }}</p>

        <!-- Meta pills -->
        <div class="product-meta">
          <div v-if="product.prepTime" class="meta-pill">
            <ClockIcon class="meta-icon" />
            {{ product.prepTime }} min prep
          </div>
          <div v-if="product.calories" class="meta-pill">
            <FireIcon class="meta-icon" />
            {{ product.calories }} cal
          </div>
          <div v-if="product.servings" class="meta-pill">
            <UsersIcon class="meta-icon" />
            Serves {{ product.servings }}
          </div>
        </div>

        <!-- Price -->
        <div class="price-section">
          <div class="price-label">
            <CurrencyDollarIcon class="price-label-icon" />
            Price
          </div>
          <div class="price-display">₱{{ product.price?.toFixed(2) }}</div>
        </div>

        <div class="divider" />

        <!-- Qty + Add to cart -->
        <div class="qty-section">
          <div class="qty-controls">
            <button @click="qty > 1 && qty--" :disabled="qty <= 1">
              <MinusIcon class="qty-icon" />
            </button>
            <span>{{ qty }}</span>
            <button @click="qty++">
              <PlusIcon class="qty-icon" />
            </button>
          </div>

          <button
            class="btn btn-primary add-btn"
            @click="handleAdd"
            :disabled="!product.available"
          >
            <ShoppingCartIcon class="btn-icon" />
            {{ product.available ? 'Add to Cart' : 'Not Available' }}
          </button>
        </div>

        <!-- Available indicator -->
        <div class="availability" :class="product.available ? 'avail-yes' : 'avail-no'">
          <CheckCircleIcon v-if="product.available" class="avail-icon" />
          <XCircleIcon v-else class="avail-icon" />
          {{ product.available ? 'In stock — ready to order' : 'Currently unavailable' }}
        </div>
      </div>
    </div>
  </div>

  <!-- Loading -->
  <div class="loading-overlay" v-else>
    <div class="spinner"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'

import {
  ArrowLeftIcon,
  SparklesIcon,
  StarIcon,
  XCircleIcon,
  CheckCircleIcon,
  TagIcon,
  ClockIcon,
  FireIcon,
  UsersIcon,
  CurrencyDollarIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const productStore = useProductStore()
const cart  = useCartStore()
const toast = useToastStore()
const qty   = ref(1)

const product = computed(() =>
  productStore.products.find(p => p.id === route.params.id)
)

const handleAdd = () => {
  for (let i = 0; i < qty.value; i++) cart.addItem(product.value)
  toast.success(`${qty.value}x ${product.value.name} added to cart!`)
}

onMounted(() => {
  if (!productStore.products.length) productStore.fetchProducts()
})
</script>

<style scoped>
.product-page { padding: 32px 24px 80px; }

/* Back button */
.back-btn {
  display: inline-flex; align-items: center; gap: 8px;
  margin-bottom: 28px; padding: 8px 16px; border-radius: 10px;
  background: var(--bg3); border: 1px solid var(--border);
  color: var(--text2); font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all 0.15s;
}
.back-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.15); }
.back-icon { width: 16px; height: 16px; }

/* Layout */
.product-detail {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 48px; align-items: start;
}

/* Image */
.product-image-wrap {
  position: relative; border-radius: 20px; overflow: hidden;
  background: var(--bg3);
}
.product-image-wrap img {
  width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block;
}
.product-detail-badges {
  position: absolute; top: 14px; left: 14px;
  display: flex; gap: 8px; flex-wrap: wrap;
}
.badge-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px; border-radius: 100px;
  font-size: 11px; font-weight: 700;
  backdrop-filter: blur(8px);
}
.pill-icon { width: 12px; height: 12px; }
.badge-red  { background: rgba(232,70,42,0.85);  color: white; }
.badge-gold { background: rgba(212,168,67,0.85); color: white; }
.badge-gray { background: rgba(30,30,30,0.85);   color: #a09888; }

/* Category tag */
.product-category-tag {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--accent2); margin-bottom: 12px;
}
.cat-tag-icon { width: 13px; height: 13px; }

/* Title & desc */
.product-info h1 {
  font-family: 'Playfair Display', serif;
  font-size: 38px; font-weight: 900; line-height: 1.1; margin-bottom: 14px;
}
.product-description {
  font-size: 15px; color: var(--text2); line-height: 1.75; margin-bottom: 24px;
}

/* Meta pills */
.product-meta { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
.meta-pill {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--text2);
  background: var(--bg3); border: 1px solid var(--border);
  padding: 7px 14px; border-radius: 100px;
}
.meta-icon { width: 14px; height: 14px; color: var(--accent2); }

/* Price */
.price-section { margin-bottom: 4px; }
.price-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text2); margin-bottom: 4px;
}
.price-label-icon { width: 13px; height: 13px; }
.price-display { font-size: 42px; font-weight: 700; line-height: 1; }

.divider { height: 1px; background: var(--border); margin: 24px 0; }

/* Qty + Cart */
.qty-section { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
.qty-controls {
  display: flex; align-items: center; gap: 10px;
  background: var(--bg3); border: 1px solid var(--border);
  border-radius: 12px; padding: 6px 14px;
}
.qty-controls button {
  background: none; border: none; color: var(--text2); cursor: pointer;
  width: 30px; height: 30px; display: flex; align-items: center;
  justify-content: center; border-radius: 7px; transition: all 0.15s;
}
.qty-controls button:hover:not(:disabled) { background: var(--border); color: var(--text); }
.qty-controls button:disabled { opacity: 0.3; cursor: not-allowed; }
.qty-icon { width: 16px; height: 16px; }
.qty-controls span { font-size: 16px; font-weight: 700; min-width: 28px; text-align: center; }

.add-btn {
  flex: 1; padding: 14px; font-size: 15px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-icon { width: 18px; height: 18px; }

/* Availability */
.availability {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 500;
  padding: 7px 14px; border-radius: 100px; border: 1px solid;
}
.avail-yes { background: rgba(46,204,113,0.08); border-color: rgba(46,204,113,0.2); color: #2ecc71; }
.avail-no  { background: rgba(232,70,42,0.08);  border-color: rgba(232,70,42,0.2);  color: var(--accent2); }
.avail-icon { width: 15px; height: 15px; }

@media (max-width: 768px) {
  .product-detail { grid-template-columns: 1fr; gap: 28px; }
  .product-info h1 { font-size: 28px; }
  .price-display { font-size: 34px; }
}
</style>