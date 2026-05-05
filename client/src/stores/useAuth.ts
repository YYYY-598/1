import { ref, computed } from 'vue'

interface User {
  id: number
  username: string
  email: string
  role: string
  avatar_url?: string
  signature?: string
}

const user = ref<User | null>(null)

function loadUser() {
  const stored = localStorage.getItem('user')
  if (stored) {
    try {
      user.value = JSON.parse(stored)
    } catch {
      user.value = null
    }
  }
}

loadUser()

export function useAuth() {
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setAuth(u: User) {
    user.value = u
    localStorage.setItem('user', JSON.stringify(u))
  }

  function updateUser(patch: Partial<User>) {
    if (!user.value) return
    user.value = { ...user.value, ...patch }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  function setToken(token: string) {
    localStorage.setItem('token', token)
  }

  function logout() {
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    user,
    isLoggedIn,
    isAdmin,
    setAuth,
    setToken,
    updateUser,
    logout,
  }
}
