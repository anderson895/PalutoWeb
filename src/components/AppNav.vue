<template>
  <nav class="nav">
    <div class="container nav-inner">
      <router-link to="/" class="logo">
        <span class="logo-icon">🍳</span>
        <span class="logo-text">PALUTO</span>
      </router-link>
      <div class="nav-links" :class="{ open: menuOpen }">
        <router-link to="/" @click="menuOpen = false">Home</router-link>
        <router-link to="/menu" @click="menuOpen = false">Menu</router-link>
        <router-link v-if="auth.isLoggedIn" to="/orders" @click="menuOpen = false">My Orders</router-link>
        <router-link v-if="auth.isAdmin" to="/admin" @click="menuOpen = false" class="admin-link">Admin</router-link>
      </div>
      <div class="nav-actions">
        <button class="cart-btn" @click="cart.toggleCart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span class="badge" v-if="cart.totalItems">{{ cart.totalItems }}</span>
        </button>
        <router-link v-if="!auth.isLoggedIn" to="/login" class="btn btn-primary nav-auth-btn">Sign In</router-link>
        <div v-else class="user-menu" @click="userDropdown = !userDropdown" ref="userMenuRef">
          <div class="user-avatar">{{ auth.profile?.name?.[0]?.toUpperCase() || 'U' }}</div>
          <div class="user-dropdown" v-if="userDropdown">
            <router-link to="/profile" @click="userDropdown=false"><span>👤</span> Profile</router-link>
            <router-link to="/orders" @click="userDropdown=false"><span>📋</span> My Orders</router-link>
            <div class="divider"></div>
            <button @click="handleLogout"><span>🚪</span> Logout</button>
          </div>
        </div>
        <button class="hamburger" @click="menuOpen = !menuOpen">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'

const auth = useAuthStore()
const cart = useCartStore()
const toast = useToastStore()
const router = useRouter()
const menuOpen = ref(false)
const userDropdown = ref(false)
const userMenuRef = ref(null)

const handleLogout = async () => {
  await auth.logout()
  userDropdown.value = false
  toast.success('Logged out successfully')
  router.push('/')
}

const handleClickOutside = (e) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) userDropdown.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
<style scoped>
.nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,10,10,0.9); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  height: 64px;
}
.nav-inner { height: 100%; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.logo { display: flex; align-items: center; gap: 10px; font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 0.1em; color: var(--text); text-decoration: none; }
.logo-icon { font-size: 28px; }
.logo-text { background: linear-gradient(135deg, #f5f0e8, var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-links { display: flex; align-items: center; gap: 32px; }
.nav-links a { font-size: 14px; font-weight: 500; color: var(--text2); transition: color 0.2s; position: relative; }
.nav-links a:hover, .nav-links a.router-link-active { color: var(--text); }
.nav-links a.router-link-active::after { content: ''; position: absolute; bottom: -4px; left: 0; right: 0; height: 2px; background: var(--accent); border-radius: 2px; }
.admin-link { color: var(--gold) !important; }
.nav-actions { display: flex; align-items: center; gap: 12px; }
.cart-btn { position: relative; background: var(--bg3); border: 1px solid var(--border); color: var(--text); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.cart-btn:hover { border-color: var(--accent); color: var(--accent); }
.badge { position: absolute; top: -6px; right: -6px; }
.nav-auth-btn { padding: 8px 16px; font-size: 13px; }
.user-menu { position: relative; cursor: pointer; }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: white; }
.user-dropdown { position: absolute; top: calc(100% + 10px); right: 0; background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 8px; min-width: 180px; box-shadow: var(--shadow); z-index: 200; }
.user-dropdown a, .user-dropdown button { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; font-size: 14px; color: var(--text2); background: none; border: none; width: 100%; text-align: left; cursor: pointer; transition: all 0.15s; }
.user-dropdown a:hover, .user-dropdown button:hover { background: var(--bg3); color: var(--text); }
.hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; padding: 8px; cursor: pointer; }
.hamburger span { display: block; width: 22px; height: 2px; background: var(--text); border-radius: 2px; transition: all 0.2s; }
@media (max-width: 768px) {
  .hamburger { display: flex; }
  .nav-links { display: none; position: fixed; top: 64px; left: 0; right: 0; background: var(--bg); border-bottom: 1px solid var(--border); padding: 20px; flex-direction: column; gap: 4px; align-items: stretch; }
  .nav-links.open { display: flex; }
  .nav-links a { padding: 12px 16px; border-radius: 8px; }
}
</style>
