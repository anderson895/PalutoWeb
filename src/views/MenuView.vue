<template>
  <div class="menu-page">
    <div class="menu-hero">
      <div class="container">
        <h1>Our <span class="accent">Menu</span></h1>
        <p>Discover authentic Filipino flavors crafted with love</p>
      </div>
    </div>
    <div class="container menu-layout">
      <!-- Sidebar -->
      <aside class="menu-sidebar">
        <div class="search-wrap">
          <input v-model="search" type="text" placeholder="🔍 Search dishes..." />
        </div>
        <div class="filter-section">
          <div class="filter-label">Categories</div>
          <button class="category-btn" :class="{ active: !activeCategory }" @click="activeCategory = ''">
            All Items
          </button>
          <button
            v-for="cat in allCategories"
            :key="cat.name"
            class="category-btn"
            :class="{ active: activeCategory === cat.name }"
            @click="activeCategory = cat.name">
            {{ cat.emoji }} {{ cat.name }}
          </button>
        </div>
        <div class="filter-section">
          <div class="filter-label">Sort By</div>
          <select v-model="sortBy">
            <option value="">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </aside>

      <!-- Products -->
      <main class="menu-main">
        <div class="menu-toolbar">
          <span class="results-count">{{ filteredProducts.length }} items</span>
          <div class="view-toggle">
            <button :class="{ active: view === 'grid' }" @click="view = 'grid'">⊞</button>
            <button :class="{ active: view === 'list' }" @click="view = 'list'">☰</button>
          </div>
        </div>

        <div v-if="productStore.loading" class="loading-overlay"><div class="spinner"></div></div>

        <div v-else-if="filteredProducts.length" :class="view === 'grid' ? 'products-grid' : 'products-list'">
          <ProductCard v-for="p in filteredProducts" :key="p.id" :product="p" />
        </div>

        <div v-else class="no-results">
          <div class="no-results-icon">🍽️</div>
          <h3>No dishes found</h3>
          <p>Try a different search or category</p>
          <button class="btn btn-outline" @click="search=''; activeCategory=''">Clear Filters</button>
        </div>
      </main>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/products'
import ProductCard from '@/components/ProductCard.vue'

const route = useRoute()
const productStore = useProductStore()

const search = ref('')
const activeCategory = ref(route.query.category || '')
const sortBy = ref('')
const view = ref('grid')

const allCategories = computed(() => {
  if (productStore.categories.length) return productStore.categories
  const cats = [...new Set(productStore.products.map(p => p.category).filter(Boolean))]
  return cats.map(c => ({ name: c, emoji: '🍽️' }))
})

const filteredProducts = computed(() => {
  let list = productStore.products.filter(p => p.available !== false)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
  }
  if (activeCategory.value) list = list.filter(p => p.category === activeCategory.value)
  if (sortBy.value === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
  if (sortBy.value === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
  if (sortBy.value === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
  return list
})

onMounted(async () => {
  await Promise.all([productStore.fetchProducts(), productStore.fetchCategories()])
})

watch(() => route.query.category, (v) => { activeCategory.value = v || '' })
</script>
<style scoped>
.menu-page { min-height: 100vh; padding-bottom: 80px; }
.menu-hero { background: linear-gradient(135deg, rgba(232,70,42,0.1), rgba(212,168,67,0.06)); border-bottom: 1px solid var(--border); padding: 48px 0 40px; }
.menu-hero h1 { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 900; margin-bottom: 8px; }
.menu-hero p { color: var(--text2); font-size: 16px; }
.accent { color: var(--accent); }
.menu-layout { display: grid; grid-template-columns: 260px 1fr; gap: 32px; padding-top: 32px; }
.menu-sidebar { position: sticky; top: 84px; height: fit-content; }
.search-wrap { margin-bottom: 24px; }
.filter-section { margin-bottom: 24px; }
.filter-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text2); margin-bottom: 10px; }
.category-btn { display: block; width: 100%; text-align: left; padding: 10px 14px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: var(--text2); font-size: 14px; cursor: pointer; transition: all 0.15s; margin-bottom: 4px; }
.category-btn:hover { background: var(--bg3); color: var(--text); }
.category-btn.active { background: rgba(232,70,42,0.12); color: var(--accent2); border-color: rgba(232,70,42,0.2); }
.menu-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.results-count { font-size: 14px; color: var(--text2); }
.view-toggle { display: flex; gap: 4px; }
.view-toggle button { width: 32px; height: 32px; background: var(--bg3); border: 1px solid var(--border); color: var(--text2); border-radius: 8px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.view-toggle button.active { background: var(--accent); color: white; border-color: var(--accent); }
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
.products-list { display: flex; flex-direction: column; gap: 16px; }
.no-results { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 40px; text-align: center; }
.no-results-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
.no-results h3 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.no-results p { color: var(--text2); margin-bottom: 20px; }
@media (max-width: 768px) {
  .menu-layout { grid-template-columns: 1fr; }
  .menu-sidebar { position: static; }
}
</style>
