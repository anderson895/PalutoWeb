<template>
  <div class="product-card" @click="$router.push(`/product/${product.id}`)">
    <div class="product-img-wrap">
      <img :src="product.image || 'https://via.placeholder.com/400x300?text=' + product.name" :alt="product.name" loading="lazy" />
      <div class="product-badges">
        <span v-if="product.isNew" class="tag tag-red">NEW</span>
        <span v-if="product.isBestseller" class="tag tag-gold">
          <StarIcon class="icon-xs" /> Bestseller
        </span>
      </div>
      <button class="quick-add" @click.stop="handleAdd" :disabled="!product.available">
        <PlusIcon v-if="product.available" class="icon-sm" />
        <XMarkIcon v-else class="icon-sm" />
      </button>
    </div>
    <div class="product-body">
      <div class="product-category">{{ product.category }}</div>
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-desc">{{ product.description }}</p>
      <div class="product-footer">
        <span class="product-price">₱{{ product.price?.toFixed(2) }}</span>
        <span class="product-time" v-if="product.prepTime">
          <ClockIcon class="icon-xs" /> {{ product.prepTime }}min
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'
import { StarIcon, PlusIcon, XMarkIcon, ClockIcon } from '@heroicons/vue/24/solid'

const props = defineProps({ product: Object })
const cart = useCartStore()
const toast = useToastStore()

const handleAdd = () => {
  cart.addItem(props.product)
  toast.success(`${props.product.name} added to cart!`)
}
</script>

<style scoped>
.product-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; cursor: pointer; transition: all 0.25s; }
.product-card:hover { border-color: rgba(232,70,42,0.3); transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.3); }
.product-img-wrap { position: relative; height: 200px; overflow: hidden; }
.product-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
.product-card:hover .product-img-wrap img { transform: scale(1.06); }
.product-badges { position: absolute; top: 10px; left: 10px; display: flex; gap: 6px; flex-wrap: wrap; }
.tag-gold { display: flex; align-items: center; gap: 3px; }
.quick-add { position: absolute; bottom: 10px; right: 10px; width: 36px; height: 36px; border-radius: 50%; background: var(--accent); border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; opacity: 0; box-shadow: 0 4px 12px rgba(232,70,42,0.4); }
.product-card:hover .quick-add { opacity: 1; }
.quick-add:hover { background: var(--accent2); transform: scale(1.1); }
.quick-add:disabled { background: var(--border); cursor: not-allowed; }
.product-body { padding: 16px; }
.product-category { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent2); margin-bottom: 6px; }
.product-name { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700; margin-bottom: 6px; line-height: 1.3; }
.product-desc { font-size: 13px; color: var(--text2); line-height: 1.5; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.product-footer { display: flex; align-items: center; justify-content: space-between; }
.product-price { font-size: 18px; font-weight: 700; color: var(--text); }
.product-time { font-size: 12px; color: var(--text2); display: flex; align-items: center; gap: 3px; }

.icon-sm { width: 16px; height: 16px; }
.icon-xs { width: 12px; height: 12px; }
</style>