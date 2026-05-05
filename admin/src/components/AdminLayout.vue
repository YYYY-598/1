<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAdminAuth } from '../stores/useAdminAuth'
import { LayoutGrid, MessageSquare, MessageCircle, Users, LogOut, Shield } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { user, logout } = useAdminAuth()

function handleLogout() {
  logout()
  router.push('/login')
}

const navItems = [
  { path: '/boards', label: '板块管理', icon: LayoutGrid },
  { path: '/posts', label: '帖子管理', icon: MessageSquare },
  { path: '/comments', label: '评论管理', icon: MessageCircle },
  { path: '/users', label: '用户管理', icon: Users },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="w-56 bg-[var(--color-sidebar)] text-white flex flex-col shrink-0">
      <div class="px-5 py-5 border-b border-white/10">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-md bg-[var(--color-cinnabar)] flex items-center justify-center">
            <Shield :size="14" />
          </div>
          <span class="font-bold text-sm tracking-tight">YY论坛后台</span>
        </div>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-0.5">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
          :class="isActive(item.path) ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white hover:bg-white/8'"
        >
          <component :is="item.icon" :size="16" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="px-5 py-4 border-t border-white/10">
        <div class="flex items-center justify-between">
          <span class="text-sm text-white/40">{{ user?.username }}</span>
          <button
            @click="handleLogout"
            class="text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut :size="14" />
          </button>
        </div>
      </div>
    </aside>

    <main class="flex-1 min-w-0">
      <slot />
    </main>
  </div>
</template>
