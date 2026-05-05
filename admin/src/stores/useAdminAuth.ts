import { ref, computed } from 'vue'

interface User {
  id: number
  username: string
  email: string
  role: string
}

const user = ref<User | null>(null)

const stored = localStorage.getItem('admin_user')
if (stored) {
  try { user.value = JSON.parse(stored) } catch { user.value = null }
}

export function useAdminAuth() {
  const isLoggedIn = computed(() => !!user.value && user.value.role === 'admin')

  function setAuth(u: User) {
    user.value = u
    localStorage.setItem('admin_user', JSON.stringify(u))
  }

  function setToken(token: string) {
    localStorage.setItem('admin_token', token)
  }

  function logout() {
    user.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  return { user, isLoggedIn, setAuth, setToken, logout }
}
