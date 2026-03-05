<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-gradient"></div>
        <div class="hero-pattern"></div>
      </div>
      <div class="container hero-content">
        <div class="hero-tag tag tag-red">🔥 Now Delivering</div>
        <h1 class="hero-title">
          <span>Authentic</span>
          <span class="hero-title-accent">Filipino</span>
          <span>Flavors</span>
        </h1>
        <p class="hero-sub">Handcrafted Filipino cuisine delivered to your doorstep. Fresh ingredients, traditional recipes, modern taste.</p>
        <div class="hero-actions">
          <router-link to="/menu" class="btn btn-primary hero-btn">Order Now →</router-link>
          <a href="#categories" class="btn btn-outline">Explore Menu</a>
        </div>
        <div class="hero-stats">
          <div><span>500+</span><label>Menu Items</label></div>
          <div class="stat-divider"></div>
          <div><span>30min</span><label>Avg. Delivery</label></div>
          <div class="stat-divider"></div>
          <div><span>4.9★</span><label>Rating</label></div>
        </div>
      </div>
      <div class="hero-food-showcase">
        <div class="food-float food-1">🍚</div>
        <div class="food-float food-2">🍖</div>
        <div class="food-float food-3">🍲</div>
        <div class="food-float food-4">🥘</div>
      </div>
    </section>

    <!-- Categories -->
    <section class="categories" id="categories">
      <div class="container">
        <div class="section-header">
          <h2>Browse by Category</h2>
          <router-link to="/menu" class="btn btn-ghost">View All →</router-link>
        </div>
        <div class="categories-grid">
          <div v-for="cat in displayCategories" :key="cat.id || cat.name"
            class="category-card"
            @click="$router.push(`/menu?category=${cat.name}`)">
            <div class="category-emoji">{{ cat.emoji }}</div>
            <div class="category-name">{{ cat.name }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured products -->
    <section class="featured">
      <div class="container">
        <div class="section-header">
          <h2>Today's <span class="accent">Best Sellers</span></h2>
          <router-link to="/menu" class="btn btn-ghost">See All →</router-link>
        </div>
        <div class="products-grid" v-if="featured.length">
          <ProductCard v-for="p in featured" :key="p.id" :product="p" />
        </div>
        <div v-else-if="productStore.loading" class="loading-overlay"><div class="spinner"></div></div>
        <div v-else class="empty-state">
          <p>No products yet. <router-link to="/admin/products">Add some!</router-link></p>
        </div>
      </div>
    </section>

    <!-- Why choose us -->
    <section class="why-us">
      <div class="container">
        <h2 class="text-center">Why Choose <span class="accent">Paluto?</span></h2>
        <div class="features-grid">
          <div class="feature-card" v-for="f in features" :key="f.title">
            <div class="feature-icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="cta-banner">
      <div class="container cta-inner">
        <div>
          <h2>Ready to Order?</h2>
          <p>Free delivery on orders above ₱500</p>
        </div>
        <router-link to="/menu" class="btn btn-primary cta-btn">Order Now →</router-link>
      </div>
    </section>
  </div>
</template>
<script setup>
import { computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/products'
import ProductCard from '@/components/ProductCard.vue'

const productStore = useProductStore()

const displayCategories = computed(() => {
  if (productStore.categories.length) return productStore.categories.slice(0, 8)
  return [
    { name: 'Rice Meals', emoji: '🍚' }, { name: 'Soups', emoji: '🍲' },
    { name: 'Grilled', emoji: '🔥' }, { name: 'Fried', emoji: '🍳' },
    { name: 'Desserts', emoji: '🍮' }, { name: 'Drinks', emoji: '🥤' },
    { name: 'Snacks', emoji: '🍡' }, { name: 'Seafood', emoji: '🦐' }
  ]
})

const featured = computed(() =>
  productStore.products.filter(p => p.isBestseller || p.available).slice(0, 4)
)

const features = [
  { icon: '🚀', title: 'Fast Delivery', desc: 'Hot meals delivered in 30 minutes or less' },
  { icon: '🌿', title: 'Fresh Ingredients', desc: 'Sourced daily from local markets' },
  { icon: '👨‍🍳', title: 'Expert Chefs', desc: 'Authentic recipes from Filipino masters' },
  { icon: '💳', title: 'Easy Payment', desc: 'Multiple payment options available' },
]

onMounted(async () => {
  await Promise.all([productStore.fetchProducts(), productStore.fetchCategories()])
})
</script>
<style scoped>
.home { overflow-x: hidden; }
.hero { position: relative; min-height: 88vh; display: flex; align-items: center; overflow: hidden; }
.hero-bg { position: absolute; inset: 0; }
.hero-gradient { position: absolute; inset: 0; background: radial-gradient(ellipse at 30% 50%, rgba(232,70,42,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(212,168,67,0.08) 0%, transparent 50%); }
.hero-pattern { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px; }
.hero-content { position: relative; z-index: 2; padding: 80px 24px; max-width: 680px; }
.hero-tag { margin-bottom: 24px; font-size: 13px; }
.hero-title { font-family: 'Playfair Display', serif; font-size: clamp(52px, 8vw, 96px); line-height: 0.95; font-weight: 900; margin-bottom: 24px; }
.hero-title span { display: block; }
.hero-title-accent { color: var(--accent); font-style: italic; }
.hero-sub { font-size: 17px; color: var(--text2); line-height: 1.7; margin-bottom: 36px; max-width: 480px; }
.hero-actions { display: flex; gap: 12px; margin-bottom: 48px; flex-wrap: wrap; }
.hero-btn { padding: 14px 32px; font-size: 15px; }
.hero-stats { display: flex; align-items: center; gap: 24px; }
.hero-stats > div { display: flex; flex-direction: column; gap: 2px; }
.hero-stats span { font-size: 24px; font-weight: 700; }
.hero-stats label { font-size: 12px; color: var(--text2); }
.stat-divider { width: 1px; height: 36px; background: var(--border); }
.hero-food-showcase { position: absolute; right: 10%; top: 50%; transform: translateY(-50%); z-index: 1; }
.food-float { position: absolute; font-size: 64px; animation: float 6s ease-in-out infinite; opacity: 0.7; }
.food-1 { top: -120px; left: 0; animation-delay: 0s; }
.food-2 { top: -40px; left: 100px; animation-delay: 1.5s; }
.food-3 { top: 40px; left: -60px; animation-delay: 0.8s; }
.food-4 { top: 120px; left: 60px; animation-delay: 2.2s; }
@keyframes float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
.section-header h2 { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; }
.accent { color: var(--accent); }
.text-center { text-align: center; }
.categories { padding: 80px 0; }
.categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; }
.category-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s; }
.category-card:hover { border-color: var(--accent); transform: translateY(-4px); background: rgba(232,70,42,0.05); }
.category-emoji { font-size: 36px; }
.category-name { font-size: 13px; font-weight: 600; text-align: center; }
.featured { padding: 0 0 80px; }
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
.empty-state { text-align: center; padding: 60px; color: var(--text2); }
.empty-state a { color: var(--accent); }
.why-us { padding: 80px 0; background: var(--bg2); }
.why-us h2 { font-family: 'Playfair Display', serif; font-size: 36px; margin-bottom: 48px; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
.feature-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; transition: all 0.2s; }
.feature-card:hover { border-color: rgba(232,70,42,0.3); transform: translateY(-2px); }
.feature-icon { font-size: 36px; margin-bottom: 16px; }
.feature-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
.feature-card p { font-size: 14px; color: var(--text2); line-height: 1.6; }
.cta-banner { padding: 60px 0; background: linear-gradient(135deg, rgba(232,70,42,0.15), rgba(212,168,67,0.08)); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.cta-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.cta-inner h2 { font-family: 'Playfair Display', serif; font-size: 32px; margin-bottom: 8px; }
.cta-inner p { color: var(--text2); font-size: 15px; }
.cta-btn { padding: 16px 40px; font-size: 16px; }
@media (max-width: 768px) {
  .hero-food-showcase { display: none; }
  .hero-content { padding: 60px 16px; }
  .cta-inner { flex-direction: column; text-align: center; }
}
</style>
