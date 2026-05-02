<script setup lang="ts">
import { MessageSquare, ThumbsUp, Clock } from 'lucide-vue-next'

defineProps<{
  id: number
  title: string
  summary: string
  username: string
  likeCount: number
  commentCount: number
  createdAt: string
}>()

function formatTime(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 30) return `${days} 天前`
  return d.toLocaleDateString('zh-CN')
}
</script>

<template>
  <router-link
    :to="`/post/${id}`"
    class="block bg-[var(--color-card)] rounded-xl p-5 border border-[var(--color-paper-darker)] hover:border-[var(--color-paper-darker)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
  >
    <h3 class="text-base font-semibold leading-snug mb-2 line-clamp-1">{{ title }}</h3>
    <p class="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-4 line-clamp-2">{{ summary }}</p>
    <div class="flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
      <div class="flex items-center gap-4">
        <span>{{ username }}</span>
        <span class="flex items-center gap-1">
          <Clock :size="12" />
          {{ formatTime(createdAt) }}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1">
          <ThumbsUp :size="12" />
          {{ likeCount }}
        </span>
        <span class="flex items-center gap-1">
          <MessageSquare :size="12" />
          {{ commentCount }}
        </span>
      </div>
    </div>
  </router-link>
</template>
