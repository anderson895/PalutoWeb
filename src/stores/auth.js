import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(true)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')

  const init = () => {
    onAuthStateChanged(auth, async (u) => {
      user.value = u
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid))
        profile.value = snap.exists() ? snap.data() : null
      } else {
        profile.value = null
      }
      loading.value = false
    })
  }

  const register = async (email, password, name, phone) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    const userData = {
      uid: cred.user.uid,
      name,
      email,
      phone,
      role: 'customer',
      createdAt: new Date().toISOString(),
      addresses: []
    }
    await setDoc(doc(db, 'users', cred.user.uid), userData)
    profile.value = userData
    return cred.user
  }

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    profile.value = snap.exists() ? snap.data() : null
    return cred.user
  }

  const logout = async () => {
    await signOut(auth)
    user.value = null
    profile.value = null
  }

  return { user, profile, loading, isLoggedIn, isAdmin, init, register, login, logout }
})
