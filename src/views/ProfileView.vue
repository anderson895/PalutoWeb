<template>
  <div class="profile-page container">
    <h1>My Profile</h1>
    <div class="profile-layout">
      <div class="profile-card card">
        <div class="profile-avatar">{{ auth.profile?.name?.[0]?.toUpperCase() }}</div>
        <div class="profile-name">{{ auth.profile?.name }}</div>
        <div class="profile-email">
          <EnvelopeIcon class="icon-sm" />
          {{ auth.user?.email }}
        </div>
        <span class="tag tag-gold" v-if="auth.isAdmin">
          <StarIcon class="icon-sm" /> Admin
        </span>
        <span class="tag tag-green" v-else>
          <FireIcon class="icon-sm" /> Foodie
        </span>
      </div>

      <div class="profile-form card">
        <h3>Edit Profile</h3>
        <div class="form-group">
          <label>
            <UserIcon class="icon-sm" /> Full Name
          </label>
          <input v-model="form.name" placeholder="Full Name" />
        </div>
        <div class="form-group">
          <label>
            <PhoneIcon class="icon-sm" /> Phone
          </label>
          <input v-model="form.phone" placeholder="+63..." />
        </div>
        <button class="btn btn-primary" @click="saveProfile" :disabled="saving">
          <ArrowPathIcon v-if="saving" class="icon-sm spinning" />
          <CheckIcon v-else class="icon-sm" />
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  StarIcon,
  FireIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/solid'

const auth = useAuthStore()
const toast = useToastStore()
const saving = ref(false)
const form = ref({ name: auth.profile?.name || '', phone: auth.profile?.phone || '' })

const saveProfile = async () => {
  saving.value = true
  try {
    await updateDoc(doc(db, 'users', auth.user.uid), form.value)
    auth.profile = { ...auth.profile, ...form.value }
    toast.success('Profile updated!')
  } catch (e) {
    toast.error('Failed to update profile')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-page { padding: 40px 24px 80px; max-width: 800px; }
h1 { font-family: 'Playfair Display', serif; font-size: 36px; margin-bottom: 32px; }
.profile-layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start; }
.profile-card { padding: 32px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
.profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: white; margin-bottom: 8px; }
.profile-name { font-size: 20px; font-weight: 700; }
.profile-email { font-size: 14px; color: var(--text2); display: flex; align-items: center; gap: 4px; }
.profile-form { padding: 28px; display: flex; flex-direction: column; gap: 18px; }
.profile-form h3 { font-size: 18px; font-weight: 700; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
label { display: flex; align-items: center; gap: 6px; }
.btn { display: flex; align-items: center; justify-content: center; gap: 6px; }

.icon-sm { width: 16px; height: 16px; flex-shrink: 0; }

.spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg) ; } }

@media (max-width: 768px) { .profile-layout { grid-template-columns: 1fr; } }
</style>