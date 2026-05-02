<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/auth'
import { useAuth } from '../stores/useAuth'
import { Eye, EyeOff, MessageCircle } from 'lucide-vue-next'

const router = useRouter()
const { setAuth, setToken, isLoggedIn } = useAuth()

if (isLoggedIn.value) {
  router.replace('/boards')
}

const username = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  if (!username.value || !email.value || !password.value) {
    error.value = '请填写所有字段'
    return
  }
  if (password.value.length < 6) {
    error.value = '密码长度不能少于6位'
    return
  }
  loading.value = true
  try {
    const res = await register({
      username: username.value,
      email: email.value,
      password: password.value,
    })
    setToken(res.data.token)
    setAuth(res.data.user)
    router.push('/boards')
  } catch (e: any) {
    error.value = e.response?.data?.message || '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-56px)] flex">
    <!-- 右侧装饰区 -->
    <div class="flex-1 flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md">
        <div class="lg:hidden flex items-center gap-3 mb-10">
          <div class="w-10 h-10 rounded-xl bg-[var(--color-cinnabar)] flex items-center justify-center">
            <MessageCircle :size="20" class="text-white" />
          </div>
          <span class="text-xl font-bold">Forum</span>
        </div>

        <h2 class="text-2xl font-bold mb-2">注册</h2>
        <p class="text-[var(--color-ink-muted)] mb-8">
          已有账号？
          <router-link to="/login" class="text-[var(--color-cinnabar)] hover:underline">立即登录</router-link>
        </p>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium mb-1.5 text-[var(--color-ink-light)]">用户名</label>
            <input
              v-model="username"
              type="text"
              placeholder="给自己取个名字"
              class="w-full rounded-lg border border-[var(--color-paper-darker)] bg-[var(--color-paper)] px-4 py-2.5 text-sm placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-ink)] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5 text-[var(--color-ink-light)]">邮箱</label>
            <input
              v-model="email"
              type="email"
              placeholder="your@email.com"
              class="w-full rounded-lg border border-[var(--color-paper-darker)] bg-[var(--color-paper)] px-4 py-2.5 text-sm placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-ink)] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5 text-[var(--color-ink-light)]">密码</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="至少6位密码"
                class="w-full rounded-lg border border-[var(--color-paper-darker)] bg-[var(--color-paper)] px-4 py-2.5 text-sm placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-ink)] focus:bg-white transition-colors pr-10"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer"
              >
                <EyeOff v-if="showPassword" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <p v-if="error" class="text-sm text-[var(--color-cinnabar)]">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-sm font-medium hover:bg-[var(--color-ink-light)] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>
      </div>
    </div>

    <!-- 左侧装饰区 -->
    <div class="hidden lg:flex w-5/12 bg-[var(--color-sage)] relative overflow-hidden">
      <div class="absolute inset-0 opacity-[0.04]"
           style="background-image: radial-gradient(circle at 75% 70%, #fff 1px, transparent 1px); background-size: 40px 40px;">
      </div>
      <div class="relative flex flex-col justify-center px-16 text-white">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <MessageCircle :size="20" />
          </div>
          <span class="text-xl font-bold tracking-tight">Forum</span>
        </div>
        <h1 class="text-3xl font-serif font-bold leading-tight mb-4">加入讨论</h1>
        <p class="text-base leading-relaxed opacity-60">注册账号，开始与大家分享你的想法和见解。</p>
        <div class="mt-12 flex gap-2">
          <span class="w-2 h-2 rounded-full bg-white/60"></span>
          <span class="w-2 h-2 rounded-full bg-white/20"></span>
          <span class="w-2 h-2 rounded-full bg-white/20"></span>
        </div>
      </div>
    </div>
  </div>
</template>
