<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminLogin } from '../api/admin'
import { useAdminAuth } from '../stores/useAdminAuth'
import { Shield } from 'lucide-vue-next'

const router = useRouter()
const { setAuth, setToken } = useAdminAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = '请填写所有字段'
    return
  }
  loading.value = true
  try {
    const res = await adminLogin({ email: email.value, password: password.value })
    if (res.data.user.role !== 'admin') {
      error.value = '该账号不是管理员'
      return
    }
    setToken(res.data.token)
    setAuth(res.data.user)
    router.push('/boards')
  } catch (e: any) {
    error.value = e.response?.data?.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--color-paper)] px-6">
    <div class="w-full max-w-sm">
      <div class="text-center mb-10">
        <div class="w-12 h-12 rounded-xl bg-[var(--color-ink)] flex items-center justify-center mx-auto mb-4">
          <Shield :size="22" class="text-white" />
        </div>
        <h1 class="text-xl font-bold">论坛管理后台</h1>
        <p class="text-sm text-[var(--color-ink-muted)] mt-1">请使用管理员账号登录</p>
      </div>

      <form @submit.prevent="handleSubmit" class="bg-white rounded-xl border border-[var(--color-paper-darker)] p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1.5 text-[var(--color-ink-light)]">邮箱</label>
          <input
            v-model="email"
            type="email"
            placeholder="admin@forum.com"
            class="w-full rounded-lg border border-[var(--color-paper-darker)] bg-[var(--color-paper)] px-4 py-2.5 text-sm placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-ink)] focus:bg-white transition-colors"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1.5 text-[var(--color-ink-light)]">密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="输入密码"
            class="w-full rounded-lg border border-[var(--color-paper-darker)] bg-[var(--color-paper)] px-4 py-2.5 text-sm placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-ink)] focus:bg-white transition-colors"
          />
        </div>
        <p v-if="error" class="text-sm text-[var(--color-cinnabar)]">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-sm font-medium hover:bg-[var(--color-ink-light)] disabled:opacity-50 transition-colors cursor-pointer"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>
