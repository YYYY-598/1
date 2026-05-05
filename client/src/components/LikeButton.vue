<script setup lang="ts">
import { ThumbsUp } from 'lucide-vue-next'

defineProps<{
  liked: boolean
  count: number
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    @click="emit('toggle')"
    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all duration-200 cursor-pointer"
    :class="liked
      ? 'bg-[var(--color-cinnabar-soft)] text-[var(--color-cinnabar)] border-[var(--color-cinnabar-soft)]'
      : 'bg-white text-[var(--color-ink-muted)] border-[var(--color-paper-darker)] hover:border-[var(--color-ink-muted)]'"
  >
    <ThumbsUp :size="14" :class="{ 'fill-current': liked }" />
    <span class="font-medium tabular-nums">{{ count }}</span>
  </button>
</template>
