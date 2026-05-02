<script setup lang="ts">
import { computed } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import { useAuth } from '../stores/useAuth'

const props = defineProps<{
  id: number
  content: string
  username: string
  userId: number
  createdAt: string
}>()

const emit = defineEmits<{
  delete: [id: number]
}>()

const { user } = useAuth()
const canDelete = computed(() => user.value?.id === props.userId || user.value?.role === 'admin')

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
  <div class="flex gap-3 py-4 border-b border-[var(--color-paper-dark)] last:border-0">
    <div class="w-8 h-8 rounded-full bg-[var(--color-sage-soft)] text-[var(--color-sage)] flex items-center justify-center text-xs font-semibold shrink-0">
      {{ username.charAt(0).toUpperCase() }}
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between mb-1.5">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium">{{ username }}</span>
          <span class="text-xs text-[var(--color-ink-muted)]">{{ formatTime(createdAt) }}</span>
        </div>
        <button
          v-if="canDelete"
          @click="emit('delete', id)"
          class="text-[var(--color-ink-muted)] hover:text-[var(--color-cinnabar)] transition-colors cursor-pointer"
        >
          <Trash2 :size="13" />
        </button>
      </div>
      <p class="text-sm leading-relaxed text-[var(--color-ink-light)] whitespace-pre-wrap">{{ content }}</p>
    </div>
  </div>
</template>
