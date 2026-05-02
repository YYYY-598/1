<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps<{
  page: number
  total: number
  pageSize: number
}>()

const emit = defineEmits<{
  change: [page: number]
}>()

function totalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize))
}
</script>

<template>
  <div v-if="total > pageSize" class="flex items-center justify-center gap-1">
    <button
      :disabled="page <= 1"
      @click="emit('change', page - 1)"
      class="w-8 h-8 flex items-center justify-center rounded-md text-sm border border-[var(--color-paper-darker)] hover:border-[var(--color-ink-muted)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
    >
      <ChevronLeft :size="15" />
    </button>
    <template v-for="p in totalPages(total, pageSize)" :key="p">
      <button
        v-if="p === 1 || p === totalPages(total, pageSize) || (p >= page - 1 && p <= page + 1)"
        @click="emit('change', p)"
        class="w-8 h-8 flex items-center justify-center rounded-md text-sm border transition-colors cursor-pointer"
        :class="p === page
          ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
          : 'border-[var(--color-paper-darker)] hover:border-[var(--color-ink-muted)]'"
      >
        {{ p }}
      </button>
      <span
        v-else-if="p === page - 2 || p === page + 2"
        class="w-8 h-8 flex items-center justify-center text-xs text-[var(--color-ink-muted)]"
      >...</span>
    </template>
    <button
      :disabled="page >= totalPages(total, pageSize)"
      @click="emit('change', page + 1)"
      class="w-8 h-8 flex items-center justify-center rounded-md text-sm border border-[var(--color-paper-darker)] hover:border-[var(--color-ink-muted)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
    >
      <ChevronRight :size="15" />
    </button>
  </div>
</template>
