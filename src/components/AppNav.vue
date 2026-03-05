<template>
  <nav class="nav">
    <div class="container nav-inner">

      <!-- Logo -->
      <router-link to="/" class="logo">
        <div class="logo-icon-wrap">
          <FireIcon class="logo-icon" />
        </div>
        <span class="logo-text">PALUTO</span>
      </router-link>

      <!-- Nav links -->
      <div class="nav-links" :class="{ open: menuOpen }">
        <router-link to="/" @click="menuOpen = false">
          <HomeIcon class="nav-link-icon" />
          Home
        </router-link>
        <router-link to="/menu" @click="menuOpen = false">
          <Squares2X2Icon class="nav-link-icon" />
          Menu
        </router-link>
        <router-link v-if="auth.isLoggedIn" to="/orders" @click="menuOpen = false">
          <ClipboardDocumentListIcon class="nav-link-icon" />
          My Orders
        </router-link>
        <router-link v-if="auth.isAdmin" to="/admin" @click="menuOpen = false" class="admin-link">
          <Cog6ToothIcon class="nav-link-icon" />
          Admin
        </router-link>
      </div>

      <!-- Actions -->
      <div class="nav-actions">

        <!-- Cart -->
        <button class="cart-btn" @click="cart.toggleCart">
          <ShoppingCartIcon class="cart-icon" />
          <span class="badge" v-if="cart.totalItems">{{ cart.totalItems }}</span>
        </button>

        <!-- Sign In -->
        <router-link v-if="!auth.isLoggedIn" to="/login" class="btn btn-primary nav-auth-btn">
          <ArrowRightEndOnRectangleIcon class="btn-icon" />
          Sign In
        </router-link>

        <!-- User menu -->
        <div v-else class="user-menu" @click="userDropdown = !userDropdown" ref="userMenuRef">
          <div class="user-avatar">
            {{ auth.profile?.name?.[0]?.toUpperCase() || 'U' }}
          </div>
          <ChevronDownIcon class="chevron-icon" :class="{ rotated: userDropdown }" />

          <transition name="dropdown">
            <div class="user-dropdown" v-if="userDropdown">
              <div class="dropdown-user-info">
                <div class="dropdown-name">{{ auth.profile?.name }}</div>
                <div class="dropdown-email">{{ auth.user?.email }}</div>
              </div>
              <div class="dropdown-divider"></div>
              <router-link to="/profile" @click="userDropdown = false">
                <UserCircleIcon class="dropdown-icon" />
                Profile
              </router-link>
              <router-link to="/orders" @click="userDropdown = false">
                <ClipboardDocumentListIcon class="dropdown-icon" />
                My Orders
              </router-link>
              <div v-if="auth.isAdmin" class="dropdown-divider"></div>
              <router-link v-if="auth.isAdmin" to="/admin" @click="userDropdown = false" class="dropdown-admin">
                <Cog6ToothIcon class="dropdown-icon" />
                Admin Panel
              </router-link>
              <div class="dropdown-divider"></div>
              <button @click="handleLogout" class="dropdown-logout">
                <ArrowLeftStartOnRectangleIcon class="dropdown-icon" />
                Logout
              </button>
            </div>
          </transition>
        </div>

        <!-- Hamburger -->
        <button class="hamburger" @click="menuOpen = !menuOpen" :class="{ open: menuOpen }">
          <Bars3Icon v-if="!menuOpen" class="hamburger-icon" />
          <XMarkIcon v-else class="hamburger-icon" />
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

import {
  FireIcon,
  HomeIcon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ShoppingCartIcon,
  ArrowRightEndOnRectangleIcon,
  ArrowLeftStartOnRectangleIcon,
  UserCircleIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

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
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    userDropdown.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,10,10,0.92);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  height: 64px;
}
.nav-inner {
  height: 100%;
  display: flex; align-items: center;
  justify-content: space-between; gap: 24px;
}

/* Logo */
.logo {
  display: flex; align-items: center; gap: 10px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 24px; letter-spacing: 0.1em;
  color: var(--text); text-decoration: none;
  flex-shrink: 0;
}
.logo-icon-wrap {
  width: 34px; height: 34px; border-radius: 9px;
  background: rgba(232,70,42,0.15);
  border: 1px solid rgba(232,70,42,0.25);
  display: flex; align-items: center; justify-content: center;
}
.logo-icon { width: 18px; height: 18px; color: var(--accent2); }
.logo-text {
  background: linear-gradient(135deg, #f5f0e8, var(--accent));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

/* Nav links */
.nav-links { display: flex; align-items: center; gap: 4px; }
.nav-links a {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 12px; border-radius: 8px;
  font-size: 14px; font-weight: 500;
  color: var(--text2); transition: all 0.15s; position: relative;
  text-decoration: none;
}
.nav-links a:hover { color: var(--text); background: rgba(255,255,255,0.05); }
.nav-links a.router-link-active { color: var(--text); background: rgba(255,255,255,0.06); }
.nav-links a.router-link-active::after {
  content: ''; position: absolute; bottom: 0; left: 12px; right: 12px;
  height: 2px; background: var(--accent); border-radius: 2px;
}
.nav-link-icon { width: 15px; height: 15px; }
.admin-link { color: var(--gold) !important; }
.admin-link:hover { background: rgba(212,168,67,0.08) !important; }

/* Actions */
.nav-actions { display: flex; align-items: center; gap: 8px; }

/* Cart */
.cart-btn {
  position: relative;
  background: var(--bg3); border: 1px solid var(--border);
  color: var(--text); width: 40px; height: 40px;
  border-radius: 10px; display: flex; align-items: center;
  justify-content: center; cursor: pointer; transition: all 0.2s;
}
.cart-btn:hover { border-color: var(--accent); color: var(--accent); }
.cart-icon { width: 18px; height: 18px; }
.badge {
  position: absolute; top: -6px; right: -6px;
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--accent); color: white;
  font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

/* Auth btn */
.nav-auth-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; font-size: 13px;
}
.btn-icon { width: 15px; height: 15px; }

/* User menu */
.user-menu { position: relative; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px; color: white;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}
.user-menu:hover .user-avatar { border-color: rgba(232,70,42,0.4); }
.chevron-icon {
  width: 14px; height: 14px; color: var(--text2);
  transition: transform 0.2s;
}
.chevron-icon.rotated { transform: rotate(180deg); }

/* Dropdown */
.user-dropdown {
  position: absolute; top: calc(100% + 12px); right: 0;
  background: var(--card); border: 1px solid var(--border);
  border-radius: 14px; padding: 8px;
  min-width: 200px; box-shadow: 0 16px 40px rgba(0,0,0,0.4);
  z-index: 200;
}
.dropdown-user-info { padding: 8px 12px 10px; }
.dropdown-name { font-size: 14px; font-weight: 600; color: var(--text); }
.dropdown-email { font-size: 12px; color: var(--text2); margin-top: 2px; }
.dropdown-divider { height: 1px; background: var(--border); margin: 4px 0; }
.user-dropdown a,
.user-dropdown button {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 8px;
  font-size: 14px; color: var(--text2);
  background: none; border: none; width: 100%;
  text-align: left; cursor: pointer;
  transition: all 0.15s; text-decoration: none;
}
.user-dropdown a:hover,
.user-dropdown button:hover { background: var(--bg3); color: var(--text); }
.dropdown-icon { width: 16px; height: 16px; flex-shrink: 0; }
.dropdown-admin { color: var(--gold) !important; }
.dropdown-admin:hover { background: rgba(212,168,67,0.08) !important; }
.dropdown-logout:hover { background: rgba(232,70,42,0.08) !important; color: var(--accent2) !important; }

/* Hamburger */
.hamburger {
  display: none; background: var(--bg3);
  border: 1px solid var(--border); color: var(--text);
  width: 38px; height: 38px; border-radius: 9px;
  align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.hamburger:hover { border-color: var(--accent); color: var(--accent); }
.hamburger-icon { width: 18px; height: 18px; }

/* Dropdown animation */
.dropdown-enter-active { transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.dropdown-leave-active { transition: all 0.15s ease; }
.dropdown-enter-from { opacity: 0; transform: translateY(-8px) scale(0.96); }
.dropdown-leave-to   { opacity: 0; transform: translateY(-4px) scale(0.98); }

/* Mobile */
@media (max-width: 768px) {
  .hamburger { display: flex; }
  .nav-links {
    display: none; position: fixed;
    top: 64px; left: 0; right: 0;
    background: rgba(10,10,10,0.97);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    padding: 12px 16px; flex-direction: column;
    gap: 4px; align-items: stretch;
  }
  .nav-links.open { display: flex; }
  .nav-links a { padding: 12px 14px; }
  .nav-links a.router-link-active::after { display: none; }
}
</style>