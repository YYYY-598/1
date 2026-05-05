<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Compass,
  LogIn,
  LogOut,
  Menu,
  Search,
  SquarePlus,
  UserRound,
  UserPlus,
} from 'lucide-vue-next'
import { getBoards, type Board } from '../api/boards'
import { useAuth } from '../stores/useAuth'

const route = useRoute()
const router = useRouter()
const { user, isLoggedIn, logout } = useAuth()
const boards = ref<Board[]>([])
const searchKeyword = ref('')

const isAuthPage = computed(() => route.path === '/login' || route.path === '/register')
const activeBoardId = computed(() => Number(route.params.boardId || 0))
const firstBoardPath = computed(() => boards.value[0] ? `/board/${boards.value[0].id}/new` : '/boards')

const navItems = computed(() => [
  { label: '发现', icon: Compass, path: '/boards', active: route.path === '/boards' || route.name === 'board' },
  { label: '发布', icon: SquarePlus, path: isLoggedIn.value ? firstBoardPath.value : '/login', active: route.name === 'create-post' },
  { label: '我', icon: UserRound, path: isLoggedIn.value ? '/me' : '/login', active: route.path === '/me' },
])

function handleLogout() {
  logout()
  router.push('/boards')
}

function handleSearch() {
  const q = searchKeyword.value.trim()
  router.push(q ? { path: '/boards', query: { q } } : '/boards')
}

function isRecommendActive() {
  return route.path === '/boards' && !route.query.q
}

function isBoardActive(id: number) {
  return route.name === 'board' && activeBoardId.value === id
}

onMounted(async () => {
  try {
    const res = await getBoards()
    boards.value = res.data
  } catch {
    boards.value = []
  }
})
</script>

<template>
  <template v-if="!isAuthPage">
    <aside class="hidden lg:flex fixed inset-y-0 left-0 z-50 w-[260px] bg-white flex-col px-7 py-5">
      <router-link
        to="/boards"
        class="inline-flex w-fit items-center rounded-full bg-[#ff2442] px-3.5 py-1.5 text-lg font-black tracking-tight text-white"
      >
        YY论坛
      </router-link>

      <nav class="mt-9 space-y-2">
        <router-link
          v-for="item in navItems"
          :key="item.label"
          :to="item.path"
          class="flex h-12 items-center gap-4 rounded-full px-5 text-[17px] font-semibold transition-colors"
          :class="item.active ? 'bg-[#f6f6f6] text-black' : 'text-[#1f1f1f] hover:bg-[#f7f7f7]'"
        >
          <component :is="item.icon" :size="21" stroke-width="2" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="mt-auto space-y-3">
        <button
          v-if="isLoggedIn"
          @click="handleLogout"
          class="flex h-11 w-full items-center gap-4 rounded-full px-5 text-[16px] font-semibold text-[#1f1f1f] hover:bg-[#f7f7f7] transition-colors cursor-pointer"
        >
          <LogOut :size="21" />
          <span>退出</span>
        </button>
        <router-link
          to="/boards"
          class="flex h-11 items-center gap-4 rounded-full px-5 text-[16px] font-semibold text-[#1f1f1f] hover:bg-[#f7f7f7] transition-colors"
        >
          <Menu :size="21" />
          <span>更多</span>
        </router-link>
      </div>
    </aside>

    <header class="fixed left-0 right-0 top-0 z-40 bg-white/95 backdrop-blur lg:left-[260px]">
      <div class="h-[68px] px-5 lg:px-10 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <router-link
          to="/boards"
          class="lg:hidden inline-flex items-center rounded-full bg-[#ff2442] px-3 py-1 text-base font-black tracking-tight text-white"
        >
          YY论坛
        </router-link>

        <div class="hidden lg:block"></div>

        <label class="mx-auto flex h-10 w-full max-w-[540px] items-center gap-2 rounded-full bg-[#f6f6f6] px-4 text-[#999]">
          <input
            v-model="searchKeyword"
            @keydown.enter.prevent="handleSearch"
            type="text"
            placeholder="搜索帖子"
            class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#b8b8b8]"
          />
          <button type="button" @click="handleSearch" class="grid place-items-center text-[#333] cursor-pointer">
            <Search :size="19" />
          </button>
        </label>

        <div class="flex items-center justify-end gap-5 text-sm text-[#555]">
          <router-link v-if="!isLoggedIn" to="/login" class="hidden sm:flex items-center gap-1.5 hover:text-black">
            <LogIn :size="16" />
            <span>登录</span>
          </router-link>
          <router-link v-if="!isLoggedIn" to="/register" class="hidden sm:flex items-center gap-1.5 hover:text-black">
            <UserPlus :size="16" />
            <span>注册</span>
          </router-link>
          <router-link v-if="isLoggedIn" to="/me" class="hidden sm:flex items-center gap-2 hover:text-black">
            <span class="max-w-[90px] truncate">{{ user?.username }}</span>
            <span class="h-8 w-8 overflow-hidden rounded-full bg-[#f6f6f6] grid place-items-center text-xs font-semibold">
              <img
                v-if="user?.avatar_url"
                :src="user.avatar_url"
                :alt="user.username"
                class="h-full w-full object-cover"
              />
              <span v-else>{{ user?.username?.charAt(0).toUpperCase() }}</span>
            </span>
          </router-link>
        </div>
      </div>

      <nav class="px-5 lg:px-10">
        <div class="flex h-12 items-center gap-2 overflow-x-auto whitespace-nowrap channel-scroll">
          <router-link
            to="/boards"
            class="shrink-0 rounded-full px-4 py-2 text-base font-semibold transition-colors"
            :class="isRecommendActive() ? 'bg-[#f6f6f6] text-black' : 'text-[#333] hover:bg-[#f7f7f7]'"
          >
            推荐
          </router-link>
          <router-link
            v-for="board in boards"
            :key="board.id"
            :to="`/board/${board.id}`"
            class="shrink-0 rounded-full px-4 py-2 text-base transition-colors"
            :class="isBoardActive(board.id) ? 'bg-[#f6f6f6] font-semibold text-black' : 'text-[#333] hover:bg-[#f7f7f7]'"
          >
            {{ board.name }}
          </router-link>
        </div>
      </nav>
    </header>
  </template>
</template>

<style scoped>
.channel-scroll {
  scrollbar-width: none;
}

.channel-scroll::-webkit-scrollbar {
  display: none;
}
</style>
