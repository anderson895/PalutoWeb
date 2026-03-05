<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-logo"><span>🍳</span> PALUTO</div>
      <h1>Welcome Back</h1>
      <p class="auth-sub">Sign in to your account to continue</p>
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="your@email.com" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </div>
        <div v-if="error" class="auth-error">{{ error }}</div>
        <button type="submit" class="btn btn-primary auth-submit" :disabled="loading">
          <div class="spinner" v-if="loading" style="width:18px;height:18px;border-width:2px"></div>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
      <div class="auth-footer">
        Don't have an account? <router-link to="/register">Create one →</router-link>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()
const email = ref(''); const password = ref(''); const error = ref(''); const loading = ref(false)

const handleLogin = async () => {
  error.value = ''; loading.value = true
  try {
    await auth.login(email.value, password.value)
    toast.success('Welcome back!')
    router.push(auth.isAdmin ? '/admin' : '/')
  } catch (e) {
    error.value = e.code === 'auth/invalid-credential' ? 'Invalid email or password' : e.message
  } finally { loading.value = false }
}
</script>
<style scoped>
.auth-page { min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; padding: 40px 16px; background: radial-gradient(ellipse at center, rgba(232,70,42,0.05) 0%, transparent 60%); }
.auth-card { width: 100%; max-width: 440px; padding: 40px; }
.auth-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 0.1em; display: flex; align-items: center; gap: 8px; margin-bottom: 24px; color: var(--accent2); }
.auth-card h1 { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 900; margin-bottom: 8px; }
.auth-sub { color: var(--text2); font-size: 15px; margin-bottom: 32px; }
.auth-form { display: flex; flex-direction: column; gap: 18px; }
.auth-error { background: rgba(232,70,42,0.1); border: 1px solid rgba(232,70,42,0.2); color: var(--accent2); padding: 12px 16px; border-radius: 10px; font-size: 14px; }
.auth-submit { width: 100%; padding: 14px; font-size: 15px; margin-top: 4px; }
.auth-footer { text-align: center; margin-top: 24px; font-size: 14px; color: var(--text2); }
.auth-footer a { color: var(--accent2); font-weight: 600; }
</style>