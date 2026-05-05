<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from '../stores/useAuth'

const emit = defineEmits<{
  submit: [content: string]
}>()

const content = ref('')
const submitting = ref(false)
const { user } = useAuth()
const initial = computed(() => user.value?.username.charAt(0).toUpperCase() || '?')

async function handleSubmit() {
  const trimmed = content.value.trim()
  if (!trimmed || submitting.value) return
  submitting.value = true
  try {
    await emit('submit', trimmed)
    content.value = ''
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex gap-3">
    <div class="w-8 h-8 rounded-full bg-[var(--color-cinnabar-soft)] text-[var(--color-cinnabar)] flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden">
      <img
        v-if="user?.avatar_url"
        :src="user.avatar_url"
        :alt="user.username"
        class="w-full h-full object-cover"
      />
      <span v-else>{{ initial }}</span>
    </div>
    <div class="flex-1">
      <textarea
        v-model="content"
        placeholder="写下你的评论..."
        rows="2"
        class="w-full resize-none rounded-lg border border-[var(--color-paper-darker)] bg-[var(--color-paper)] px-4 py-2.5 text-sm placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-ink-muted)] focus:bg-white transition-colors"
        @keydown.ctrl.enter="handleSubmit"
      ></textarea>
      <div class="flex items-center justify-between mt-2">
        <span class="text-xs text-[var(--color-ink-muted)]">Ctrl + Enter 发送</span>
        <button
          @click="handleSubmit"
          :disabled="!content.trim() || submitting"
          class="px-4 py-1.5 text-sm rounded-md bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-light)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          发表评论
        </button>
      </div>
    </div>
  </div>
</template>
