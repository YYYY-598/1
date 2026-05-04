<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../stores/useAuth'
import { House, LogOut, MessageCircle } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { user, isLoggedIn, logout } = useAuth()

function handleLogout() {
  logout()
  router.push('/boards')
}

const isTransparent = computed(() => {
  return route.path === '/login' || route.path === '/register'
})
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b transition-colors"
    :class="isTransparent ? 'bg-transparent border-transparent' : 'bg-[var(--color-card)] border-[var(--color-paper-darker)]'"
  >
    <div class="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
      <router-link to="/boards" class="flex items-center gap-2.5 group">
        <div class="w-8 h-8 rounded-lg bg-[var(--color-cinnabar)] flex items-center justify-center">
          <MessageCircle :size="16" class="text-white" />
        </div>
        <span class="font-bold text-[17px] tracking-tight">Forum</span>
      </router-link>

      <div class="flex items-center gap-4 text-sm">
        <template v-if="isLoggedIn">
          <router-link
            to="/me"
            class="flex items-center gap-2 rounded-full px-2 py-1 text-[var(--color-ink-light)] hover:bg-[var(--color-paper)] transition-colors"
          >
            <div
              v-if="user?.avatar_url"
              class="w-8 h-8 rounded-full overflow-hidden border border-[var(--color-paper-darker)] bg-white shrink-0"
            >
              <img :src="user.avatar_url" :alt="user.username" class="w-full h-full object-cover" />
            </div>
            <div
              v-else
              class="w-8 h-8 rounded-full bg-[var(--color-sage-soft)] text-[var(--color-sage)] flex items-center justify-center text-xs font-semibold shrink-0"
            >
              {{ user?.username?.charAt(0).toUpperCase() }}
            </div>
            <span class="hidden sm:inline">{{ user?.username }}</span>
          </router-link>
          <router-link
            to="/me"
            class="flex items-center gap-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
          >
            <House :size="14" />
            <span>我的</span>
          </router-link>
          <button
            @click="handleLogout"
            class="flex items-center gap-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-cinnabar)] transition-colors cursor-pointer"
          >
            <LogOut :size="14" />
            <span>退出</span>
          </button>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="px-4 py-1.5 rounded-md border border-[var(--color-paper-darker)] hover:border-[var(--color-ink-muted)] transition-colors"
          >
            登录
          </router-link>
          <router-link
            to="/register"
            class="px-4 py-1.5 rounded-md bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-light)] transition-colors"
          >
            注册
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>
