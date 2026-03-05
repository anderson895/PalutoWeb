<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-logo">
        <FireIcon class="logo-icon" /> PALUTO
      </div>
      <h1>Create Account</h1>
      <p class="auth-sub">Join PALUTO and start ordering amazing Filipino food</p>

      <!-- Google Sign-In -->
      <button class="btn-google" @click="handleGoogle" :disabled="loading">
        <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <ArrowPathIcon v-if="loading === 'google'" class="spin-icon" />
        <span>{{ loading === 'google' ? 'Connecting...' : 'Continue with Google' }}</span>
      </button>

      <div class="divider"><span>or sign up with email</span></div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>Full Name</label>
          <div class="input-wrap">
            <UserIcon class="input-icon" />
            <input v-model="name" type="text" placeholder="Juan Dela Cruz" required />
          </div>
        </div>
        <div class="form-group">
          <label>Email</label>
          <div class="input-wrap">
            <EnvelopeIcon class="input-icon" />
            <input v-model="email" type="email" placeholder="your@email.com" required />
          </div>
        </div>
        <div class="form-group">
          <label>Phone</label>
          <div class="input-wrap">
            <PhoneIcon class="input-icon" />
            <input v-model="phone" type="tel" placeholder="+63 912 345 6789" />
          </div>
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-wrap">
            <LockClosedIcon class="input-icon" />
            <input v-model="password" type="password" placeholder="Min. 6 characters" required minlength="6" />
          </div>
        </div>

        <div v-if="error" class="auth-error">
          <ExclamationCircleIcon class="error-icon" />
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary auth-submit" :disabled="loading">
          <ArrowPathIcon v-if="loading === 'email'" class="spin-icon" />
          <span>{{ loading === 'email' ? 'Creating account...' : 'Create Account' }}</span>
        </button>
      </form>

      <div class="auth-footer">
        Already have an account?
        <router-link to="/login">
          Sign in <ArrowRightIcon class="footer-arrow" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import {
  FireIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const auth   = useAuthStore()
const toast  = useToastStore()

const name     = ref('')
const email    = ref('')
const phone    = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false) // false | 'email' | 'google'

const handleRegister = async () => {
  error.value = ''; loading.value = 'email'
  try {
    await auth.register(email.value, password.value, name.value, phone.value)
    toast.success('Account created! Welcome to PALUTO!')
    router.push('/')
  } catch (e) {
    error.value = e.code === 'auth/email-already-in-use'
      ? 'Email already in use'
      : e.message
  } finally { loading.value = false }
}

const handleGoogle = async () => {
  error.value = ''; loading.value = 'google'
  try {
    await auth.loginWithGoogle()
    toast.success('Welcome to PALUTO!')
    router.push('/')
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      error.value = e.message
    }
  } finally { loading.value = false }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 64px);
  display: flex; align-items: center; justify-content: center;
  padding: 40px 16px;
  background: radial-gradient(ellipse at center, rgba(232,70,42,0.05) 0%, transparent 60%);
}
.auth-card { width: 100%; max-width: 440px; padding: 40px; }

.auth-logo {
  font-family: 'Bebas Neue', sans-serif; font-size: 22px;
  letter-spacing: 0.1em; display: flex; align-items: center;
  gap: 8px; margin-bottom: 24px; color: var(--accent2);
}
.logo-icon { width: 22px; height: 22px; color: var(--accent); }

.auth-card h1 { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 900; margin-bottom: 8px; }
.auth-sub { color: var(--text2); font-size: 15px; margin-bottom: 24px; }

/* Google button */
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

/* Divider */
.divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: var(--text2); font-size: 12px; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

/* Inputs with leading icon */
.input-wrap { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 12px; width: 15px; height: 15px; color: var(--text2); pointer-events: none; }
.input-wrap input { width: 100%; padding-left: 36px; }

.auth-form { display: flex; flex-direction: column; gap: 16px; }

.auth-error {
  display: flex; align-items: center; gap: 8px;
  background: rgba(232,70,42,0.1); border: 1px solid rgba(232,70,42,0.2);
  color: var(--accent2); padding: 12px 16px; border-radius: 10px; font-size: 14px;
}
.error-icon { width: 16px; height: 16px; flex-shrink: 0; }

.auth-submit {
  width: 100%; padding: 14px; font-size: 15px; margin-top: 4px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}

.spin-icon { width: 16px; height: 16px; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.auth-footer { text-align: center; margin-top: 24px; font-size: 14px; color: var(--text2); }
.auth-footer a { color: var(--accent2); font-weight: 600; display: inline-flex; align-items: center; gap: 3px; }
.footer-arrow { width: 13px; height: 13px; }
</style>