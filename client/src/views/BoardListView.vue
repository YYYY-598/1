<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getBoards, type Board } from '../api/boards'
import {
  MessageCircle, Coffee, Code2, Palette, Gamepad2, BookOpen, Music, Film, ShoppingBag, Lightbulb,
} from 'lucide-vue-next'

const boards = ref<Board[]>([])
const loading = ref(true)

const iconMap: Record<string, any> = {
  Coffee, Code2, Palette, Gamepad2, BookOpen, Music, Film, ShoppingBag, Lightbulb,
}

function getIcon(name: string) {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const keys = Object.keys(iconMap)
  return iconMap[keys[hash % keys.length]] || MessageCircle
}

function getColor(index: number) {
  const colors = [
    'bg-rose-50 text-rose-600',
    'bg-amber-50 text-amber-600',
    'bg-emerald-50 text-emerald-600',
    'bg-sky-50 text-sky-600',
    'bg-violet-50 text-violet-600',
    'bg-teal-50 text-teal-600',
    'bg-orange-50 text-orange-600',
    'bg-indigo-50 text-indigo-600',
  ]
  return colors[index % colors.length]
}

onMounted(async () => {
  try {
    const res = await getBoards()
    boards.value = res.data
  } catch {
    // 后端未启动时显示空列表
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-12">
    <div class="mb-10">
      <h1 class="text-3xl font-serif font-bold mb-3">板块</h1>
      <p class="text-[var(--color-ink-muted)]">选择一个你感兴趣的板块，开始探索</p>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="bg-white rounded-xl p-6 border border-[var(--color-paper-darker)] animate-pulse">
        <div class="w-10 h-10 rounded-lg bg-[var(--color-paper-dark)] mb-4"></div>
        <div class="h-5 bg-[var(--color-paper-dark)] rounded w-20 mb-2"></div>
        <div class="h-4 bg-[var(--color-paper-dark)] rounded w-32"></div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <router-link
        v-for="(board, idx) in boards"
        :key="board.id"
        :to="`/board/${board.id}`"
        class="group bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-paper-darker)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      >
        <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-4" :class="getColor(idx)">
          <component :is="getIcon(board.name)" :size="20" />
        </div>
        <h3 class="font-semibold mb-1.5 group-hover:text-[var(--color-cinnabar)] transition-colors">{{ board.name }}</h3>
        <p class="text-sm text-[var(--color-ink-muted)] leading-relaxed line-clamp-2">{{ board.description || '暂无简介' }}</p>
      </router-link>
    </div>

    <div v-if="!loading && boards.length === 0" class="text-center py-20">
      <MessageCircle :size="48" class="mx-auto text-[var(--color-paper-darker)] mb-4" />
      <p class="text-[var(--color-ink-muted)]">暂无板块，请联系管理员创建</p>
    </div>
  </div>
</template>
