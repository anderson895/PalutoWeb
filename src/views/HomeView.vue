<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-gradient"></div>
        <div class="hero-pattern"></div>
      </div>
      <div class="container hero-content">
        <div class="hero-tag">
          <FireIcon class="tag-icon" />
          Now Delivering
        </div>
        <h1 class="hero-title">
          <span>Authentic</span>
          <span class="hero-title-accent">Filipino</span>
          <span>Flavors</span>
        </h1>
        <p class="hero-sub">
          Handcrafted Filipino cuisine delivered to your doorstep.
          Fresh ingredients, traditional recipes, modern taste.
        </p>
        <div class="hero-actions">
          <router-link to="/menu" class="btn btn-primary hero-btn">
            Order Now
            <ArrowRightIcon class="btn-icon" />
          </router-link>
          <a href="#categories" class="btn btn-outline">
            <Squares2X2Icon class="btn-icon" />
            Explore Menu
          </a>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <ShoppingBagIcon class="stat-icon" />
            <div>
              <span>500+</span>
              <label>Menu Items</label>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <ClockIcon class="stat-icon" />
            <div>
              <span>30min</span>
              <label>Avg. Delivery</label>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <StarIcon class="stat-icon" />
            <div>
              <span>4.9</span>
              <label>Rating</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero floating icons -->
      <div class="hero-food-showcase">
        <div class="food-float food-1">
          <CakeIcon />
        </div>
        <div class="food-float food-2">
          <FireIcon />
        </div>
        <div class="food-float food-3">
          <SparklesIcon />
        </div>
        <div class="food-float food-4">
          <GlobeAsiaAustraliaIcon />
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="categories" id="categories">
      <div class="container">
        <div class="section-header">
          <h2>Browse by Category</h2>
          <router-link to="/menu" class="btn btn-ghost">
            View All
            <ArrowRightIcon class="btn-icon-sm" />
          </router-link>
        </div>
        <div class="categories-grid">
          <div
            v-for="cat in displayCategories"
            :key="cat.id || cat.name"
            class="category-card"
            @click="$router.push(`/menu?category=${cat.name}`)">
            <div class="category-icon-wrap">
              <component :is="cat.icon" class="category-icon" />
            </div>
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
          <router-link to="/menu" class="btn btn-ghost">
            See All
            <ArrowRightIcon class="btn-icon-sm" />
          </router-link>
        </div>
        <div class="products-grid" v-if="featured.length">
          <ProductCard v-for="p in featured" :key="p.id" :product="p" />
        </div>
        <div v-else-if="productStore.loading" class="loading-overlay">
          <div class="spinner"></div>
        </div>
        <div v-else class="empty-state">
          <ShoppingBagIcon class="empty-icon" />
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
            <div class="feature-icon-wrap">
              <component :is="f.icon" class="feature-icon" />
            </div>
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
          <p>
            <TruckIcon class="inline-icon" />
            Free delivery on orders above ₱500
          </p>
        </div>
        <router-link to="/menu" class="btn btn-primary cta-btn">
          Order Now
          <ArrowRightIcon class="btn-icon" />
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/products'
import ProductCard from '@/components/ProductCard.vue'

import {
  FireIcon,
  ArrowRightIcon,
  Squares2X2Icon,
  ShoppingBagIcon,
  ClockIcon,
  StarIcon,
  CakeIcon,
  SparklesIcon,
  GlobeAsiaAustraliaIcon,
  TruckIcon,
  // Category icons
  BoltIcon,
  BeakerIcon,
  SunIcon,
  MoonIcon,
  HeartIcon,
  GiftIcon,
  CubeIcon,
  // Feature icons
  RocketLaunchIcon,
  CheckBadgeIcon,
  UserGroupIcon,
  CreditCardIcon,
} from '@heroicons/vue/24/outline'

const productStore = useProductStore()

const categoryIcons = {
  'Rice Meals':  CubeIcon,
  'Soups':       BeakerIcon,
  'Grilled':     FireIcon,
  'Fried':       BoltIcon,
  'Desserts':    CakeIcon,
  'Drinks':      BeakerIcon,
  'Snacks':      GiftIcon,
  'Seafood':     GlobeAsiaAustraliaIcon,
}

const displayCategories = computed(() => {
  const defaultCats = [
    { name: 'Rice Meals' }, { name: 'Soups' },
    { name: 'Grilled' },    { name: 'Fried' },
    { name: 'Desserts' },   { name: 'Drinks' },
    { name: 'Snacks' },     { name: 'Seafood' },
  ]
  const list = productStore.categories.length
    ? productStore.categories.slice(0, 8)
    : defaultCats
  return list.map(c => ({
    ...c,
    icon: categoryIcons[c.name] || SparklesIcon,
  }))
})

const featured = computed(() =>
  productStore.products.filter(p => p.isBestseller || p.available).slice(0, 4)
)

const features = [
  { icon: RocketLaunchIcon, title: 'Fast Delivery',      desc: 'Hot meals delivered in 30 minutes or less' },
  { icon: CheckBadgeIcon,   title: 'Fresh Ingredients',  desc: 'Sourced daily from local markets' },
  { icon: UserGroupIcon,    title: 'Expert Chefs',       desc: 'Authentic recipes from Filipino masters' },
  { icon: CreditCardIcon,   title: 'Easy Payment',       desc: 'Multiple payment options available' },
]

onMounted(async () => {
  await Promise.all([productStore.fetchProducts(), productStore.fetchCategories()])
})
</script>

<style scoped>
.home { overflow-x: hidden; }

/* ── Hero ── */
.hero { position: relative; min-height: 88vh; display: flex; align-items: center; overflow: hidden; }
.hero-bg { position: absolute; inset: 0; }
.hero-gradient { position: absolute; inset: 0; background: radial-gradient(ellipse at 30% 50%, rgba(232,70,42,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(212,168,67,0.08) 0%, transparent 50%); }
.hero-pattern { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px; }
.hero-content { position: relative; z-index: 2; padding: 80px 24px; max-width: 680px; }

.hero-tag {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(232,70,42,0.12); border: 1px solid rgba(232,70,42,0.25);
  color: #ff6b47; padding: 6px 14px; border-radius: 100px;
  font-size: 13px; font-weight: 600; margin-bottom: 28px;
}
.tag-icon { width: 14px; height: 14px; }

.hero-title { font-family: 'Playfair Display', serif; font-size: clamp(52px, 8vw, 96px); line-height: 0.95; font-weight: 900; margin-bottom: 24px; }
.hero-title span { display: block; }
.hero-title-accent { color: var(--accent); font-style: italic; }

.hero-sub { font-size: 17px; color: var(--text2); line-height: 1.7; margin-bottom: 36px; max-width: 480px; }

.hero-actions { display: flex; gap: 12px; margin-bottom: 48px; flex-wrap: wrap; }
.hero-btn { padding: 14px 32px; font-size: 15px; }
.btn-icon { width: 16px; height: 16px; }
.btn-icon-sm { width: 14px; height: 14px; }

/* Stats */
.hero-stats { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
.stat-item { display: flex; align-items: center; gap: 10px; }
.stat-icon { width: 22px; height: 22px; color: var(--accent2); flex-shrink: 0; }
.stat-item div { display: flex; flex-direction: column; gap: 1px; }
.stat-item span { font-size: 22px; font-weight: 700; line-height: 1; }
.stat-item label { font-size: 11px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.06em; }
.stat-divider { width: 1px; height: 36px; background: var(--border); }

/* Floating hero icons */
.hero-food-showcase { position: absolute; right: 10%; top: 50%; transform: translateY(-50%); z-index: 1; }
.food-float {
  position: absolute;
  animation: float 6s ease-in-out infinite;
  opacity: 0.12;
}
.food-float svg, .food-float > * { width: 80px; height: 80px; color: var(--accent2); }
.food-1 { top: -120px; left: 0;    animation-delay: 0s; }
.food-2 { top: -40px;  left: 100px; animation-delay: 1.5s; }
.food-3 { top: 40px;   left: -60px; animation-delay: 0.8s; }
.food-4 { top: 120px;  left: 60px;  animation-delay: 2.2s; }
@keyframes float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }

/* ── Section headers ── */
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
.section-header h2 { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; }
.accent { color: var(--accent); }
.text-center { text-align: center; }

/* ── Categories ── */
.categories { padding: 80px 0; }
.categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; }
.category-card {
  background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 24px 16px; display: flex; flex-direction: column; align-items: center;
  gap: 12px; cursor: pointer; transition: all 0.2s;
}
.category-card:hover { border-color: var(--accent); transform: translateY(-4px); background: rgba(232,70,42,0.05); }
.category-icon-wrap {
  width: 52px; height: 52px; border-radius: 14px;
  background: rgba(232,70,42,0.1); border: 1px solid rgba(232,70,42,0.15);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.category-card:hover .category-icon-wrap { background: rgba(232,70,42,0.18); }
.category-icon { width: 26px; height: 26px; color: var(--accent2); }
.category-name { font-size: 13px; font-weight: 600; text-align: center; }

/* ── Featured ── */
.featured { padding: 0 0 80px; }
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px; color: var(--text2); text-align: center; }
.empty-icon { width: 48px; height: 48px; opacity: 0.3; }
.empty-state a { color: var(--accent); }

/* ── Why us ── */
.why-us { padding: 80px 0; background: var(--bg2); }
.why-us h2 { font-family: 'Playfair Display', serif; font-size: 36px; margin-bottom: 48px; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
.feature-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; transition: all 0.2s; }
.feature-card:hover { border-color: rgba(232,70,42,0.3); transform: translateY(-2px); }
.feature-icon-wrap {
  width: 48px; height: 48px; border-radius: 12px;
  background: rgba(232,70,42,0.1); border: 1px solid rgba(232,70,42,0.15);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
}
.feature-icon { width: 24px; height: 24px; color: var(--accent2); }
.feature-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
.feature-card p { font-size: 14px; color: var(--text2); line-height: 1.6; }

/* ── CTA ── */
.cta-banner { padding: 60px 0; background: linear-gradient(135deg, rgba(232,70,42,0.15), rgba(212,168,67,0.08)); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.cta-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.cta-inner h2 { font-family: 'Playfair Display', serif; font-size: 32px; margin-bottom: 8px; }
.cta-inner p { color: var(--text2); font-size: 15px; display: flex; align-items: center; gap: 6px; }
.inline-icon { width: 16px; height: 16px; color: var(--accent2); }
.cta-btn { padding: 16px 40px; font-size: 16px; }

@media (max-width: 768px) {
  .hero-food-showcase { display: none; }
  .hero-content { padding: 60px 16px; }
  .cta-inner { flex-direction: column; text-align: center; }
  .cta-inner p { justify-content: center; }
}
</style>