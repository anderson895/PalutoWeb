<template>
  <div class="auth-page">
    <div class="auth-card card">
      <h1>Welcome Back</h1>
      <p class="auth-sub">Sign in to your account to continue</p>

      <!-- Google Sign-In -->
      <button class="btn-google" @click="handleGoogle" :disabled="loading">
        <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {{ loading === 'google' ? 'Connecting...' : 'Continue with Google' }}
      </button>

      <div class="divider"><span>or sign in with email</span></div>

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
          <div class="spinner" v-if="loading === 'email'" style="width:18px;height:18px;border-width:2px"></div>
          {{ loading === 'email' ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="auth-footer">
        Don't have an account? <router-link to="/register">Create one</router-link>
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
const auth   = useAuthStore()
const toast  = useToastStore()

const email    = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false) // false | 'email' | 'google'

const handleLogin = async () => {
  error.value = ''; loading.value = 'email'
  try {
    await auth.login(email.value, password.value)
    toast.success('Welcome back!')
    router.push(auth.isAdmin ? '/admin' : '/')
  } catch (e) {
    error.value = e.code === 'auth/invalid-credential'
      ? 'Invalid email or password'
      : e.message
  } finally { loading.value = false }
}

const handleGoogle = async () => {
  error.value = ''; loading.value = 'google'
  try {
    await auth.loginWithGoogle()
    toast.success('Welcome back!')
    router.push(auth.isAdmin ? '/admin' : '/')
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      error.value = e.message
    }
  } finally { loading.value = false }
}
</script>

<style scoped>
.auth-page { min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; padding: 40px 16px; background: radial-gradient(ellipse at center, rgba(232,70,42,0.05) 0%, transparent 60%); }
.auth-card { width: 100%; max-width: 440px; padding: 40px; }
.auth-card h1 { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 900; margin-bottom: 8px; }
.auth-sub { color: var(--text2); font-size: 15px; margin-bottom: 24px; }

.btn-google {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 12px 16px;
  background: #fff; color: #3c3c3c;
  border: 1px solid #dadce0; border-radius: 10px;
  font-size: 14px; font-weight: 600;
  cursor: pointer; transition: background 0.15s, box-shadow 0.15s;
}
.btn-google:hover:not(:disabled) { background: #f8f8f8; box-shadow: 0 1px 6px rgba(0,0,0,0.12); }
.btn-google:disabled { opacity: 0.6; cursor: not-allowed; }
.google-icon { width: 18px; height: 18px; flex-shrink: 0; }

.divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: var(--text2); font-size: 12px; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

.auth-form { display: flex; flex-direction: column; gap: 18px; }
.auth-error { background: rgba(232,70,42,0.1); border: 1px solid rgba(232,70,42,0.2); color: var(--accent2); padding: 12px 16px; border-radius: 10px; font-size: 14px; }
.auth-submit { width: 100%; padding: 14px; font-size: 15px; margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 8px; }
.auth-footer { text-align: center; margin-top: 24px; font-size: 14px; color: var(--text2); }
.auth-footer a { color: var(--accent2); font-weight: 600; }
</style>