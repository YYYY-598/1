<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Feather, Sparkles } from 'lucide-vue-next'
import { getBoard, type Board } from '../api/boards'
import { createPost } from '../api/posts'
import { useAuth } from '../stores/useAuth'

const route = useRoute()
const router = useRouter()
const { isLoggedIn } = useAuth()

const boardId = computed(() => Number(route.params.boardId))
const board = ref<Board | null>(null)
const title = ref('')
const content = ref('')
const loading = ref(true)
const submitting = ref(false)
const error = ref('')

async function loadBoard() {
  loading.value = true
  try {
    const res = await getBoard(boardId.value)
    board.value = res.data
  } catch {
    error.value = '板块加载失败'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  error.value = ''
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }

  if (!title.value.trim() || !content.value.trim()) {
    error.value = '请填写标题和正文'
    return
  }

  submitting.value = true
  try {
    const res = await createPost(boardId.value, {
      title: title.value.trim(),
      content: content.value.trim(),
    })
    router.push(`/post/${res.data.id}`)
  } catch (e: any) {
    error.value = e.response?.data?.message || '发帖失败'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (!isLoggedIn.value) {
    router.replace('/login')
    return
  }
  loadBoard()
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <button
      @click="router.push(`/board/${boardId}`)"
      class="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors mb-6 cursor-pointer"
    >
      <ArrowLeft :size="15" />
      <span>返回帖子列表</span>
    </button>

    <div class="relative overflow-hidden rounded-[28px] border border-[var(--color-paper-darker)] bg-[linear-gradient(135deg,#fffaf3_0%,#ffffff_42%,#f7efe7_100%)] shadow-[0_24px_80px_rgba(53,37,28,0.08)]">
      <div class="absolute -top-10 right-8 h-32 w-32 rounded-full bg-[color:var(--color-cinnabar-soft)] blur-3xl opacity-80"></div>
      <div class="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[color:var(--color-sage-soft)] blur-3xl opacity-70"></div>

      <div class="relative px-7 py-8 md:px-10 md:py-10">
        <div class="flex flex-wrap items-start justify-between gap-6 mb-8">
          <div class="max-w-2xl">
            <div class="inline-flex items-center gap-2 rounded-full border border-[var(--color-paper-darker)] bg-white/75 px-3 py-1 text-xs tracking-[0.18em] text-[var(--color-ink-muted)] uppercase mb-4">
              <Feather :size="13" />
              <span>New Thread</span>
            </div>
            <h1 class="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-3">写一篇值得被回复的帖子</h1>
            <p class="text-[15px] leading-7 text-[var(--color-ink-light)]">
              在
              <span class="font-semibold text-[var(--color-cinnabar)]">{{ board?.name || '当前板块' }}</span>
              里开启一个新话题。标题说重点，正文给细节，别人会更愿意参与讨论。
            </p>
          </div>

          <div class="min-w-56 rounded-2xl border border-white/70 bg-white/75 p-4 backdrop-blur">
            <div class="flex items-center gap-2 text-sm font-medium mb-2">
              <Sparkles :size="15" class="text-[var(--color-cinnabar)]" />
              <span>发帖建议</span>
            </div>
            <p class="text-sm leading-6 text-[var(--color-ink-muted)]">
              标题尽量明确，正文先给背景，再说问题或观点，这样更容易收到高质量回复。
            </p>
          </div>
        </div>

        <div v-if="loading" class="grid gap-5">
          <div class="h-14 rounded-2xl bg-[var(--color-paper-dark)] animate-pulse"></div>
          <div class="h-64 rounded-3xl bg-[var(--color-paper-dark)] animate-pulse"></div>
        </div>

        <div v-else class="grid gap-5">
          <label class="block">
            <span class="block text-sm font-medium text-[var(--color-ink-light)] mb-2">标题</span>
            <input
              v-model="title"
              type="text"
              maxlength="200"
              placeholder="比如：Vue 组件状态管理应该放到哪里？"
              class="w-full rounded-2xl border border-[var(--color-paper-darker)] bg-white px-5 py-4 text-[15px] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-cinnabar)] focus:ring-4 focus:ring-[color:var(--color-cinnabar-soft)] transition-all"
            />
          </label>

          <label class="block">
            <span class="block text-sm font-medium text-[var(--color-ink-light)] mb-2">正文</span>
            <textarea
              v-model="content"
              rows="14"
              placeholder="把背景、现状、问题、你的想法都写清楚。内容越具体，越容易得到有价值的回复。"
              class="w-full rounded-3xl border border-[var(--color-paper-darker)] bg-white px-5 py-4 text-[15px] leading-7 resize-y placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-cinnabar)] focus:ring-4 focus:ring-[color:var(--color-cinnabar-soft)] transition-all"
            ></textarea>
          </label>

          <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-[var(--color-paper-darker)] bg-white/70 px-5 py-4">
            <div class="text-sm text-[var(--color-ink-muted)]">
              <span class="mr-4">标题 {{ title.trim().length }}/200</span>
              <span>正文 {{ content.trim().length }} 字</span>
            </div>
            <div class="flex items-center gap-3">
              <button
                @click="router.push(`/board/${boardId}`)"
                class="px-4 py-2 rounded-xl border border-[var(--color-paper-darker)] text-sm hover:border-[var(--color-ink-muted)] transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                @click="handleSubmit"
                :disabled="submitting"
                class="px-5 py-2.5 rounded-xl bg-[var(--color-ink)] text-white text-sm font-medium hover:bg-[var(--color-cinnabar)] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {{ submitting ? '发布中...' : '发布帖子' }}
              </button>
            </div>
          </div>

          <p v-if="error" class="text-sm text-[var(--color-cinnabar)]">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
