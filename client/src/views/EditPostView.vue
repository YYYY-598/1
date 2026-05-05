<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, PenLine } from 'lucide-vue-next'
import { getPost, updatePost } from '../api/posts'
import { useAuth } from '../stores/useAuth'

const route = useRoute()
const router = useRouter()
const { user, isLoggedIn } = useAuth()

const postId = computed(() => Number(route.params.postId))
const boardId = ref<number | null>(null)
const title = ref('')
const content = ref('')
const loading = ref(true)
const submitting = ref(false)
const error = ref('')

async function loadPost() {
  loading.value = true
  error.value = ''
  try {
    const res = await getPost(postId.value)
    const post = res.data
    if (!user.value || (user.value.id !== post.user_id && user.value.role !== 'admin')) {
      router.replace(`/post/${postId.value}`)
      return
    }
    boardId.value = post.board_id
    title.value = post.title
    content.value = post.content
  } catch (e: any) {
    error.value = e.response?.data?.message || '帖子加载失败'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  error.value = ''
  if (!title.value.trim() || !content.value.trim()) {
    error.value = '请填写标题和正文'
    return
  }

  submitting.value = true
  try {
    await updatePost(postId.value, {
      title: title.value.trim(),
      content: content.value.trim(),
    })
    router.push(`/post/${postId.value}`)
  } catch (e: any) {
    error.value = e.response?.data?.message || '保存失败'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (!isLoggedIn.value) {
    router.replace('/login')
    return
  }
  loadPost()
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <button
      @click="router.push(`/post/${postId}`)"
      class="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors mb-6 cursor-pointer"
    >
      <ArrowLeft :size="15" />
      <span>返回帖子详情</span>
    </button>

    <div class="rounded-[28px] border border-[var(--color-paper-darker)] bg-white shadow-[0_24px_80px_rgba(53,37,28,0.06)] px-7 py-8 md:px-10 md:py-10">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-10 h-10 rounded-2xl bg-[var(--color-cinnabar-soft)] text-[var(--color-cinnabar)] flex items-center justify-center">
          <PenLine :size="18" />
        </div>
        <div>
          <h1 class="text-3xl font-serif font-bold">编辑帖子</h1>
          <p class="text-sm text-[var(--color-ink-muted)] mt-1">润色内容、修正细节，再发出去。</p>
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
            class="w-full rounded-2xl border border-[var(--color-paper-darker)] bg-[var(--color-paper)] px-5 py-4 text-[15px] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-cinnabar)] focus:ring-4 focus:ring-[color:var(--color-cinnabar-soft)] transition-all"
          />
        </label>

        <label class="block">
          <span class="block text-sm font-medium text-[var(--color-ink-light)] mb-2">正文</span>
          <textarea
            v-model="content"
            rows="14"
            class="w-full rounded-3xl border border-[var(--color-paper-darker)] bg-[var(--color-paper)] px-5 py-4 text-[15px] leading-7 resize-y focus:outline-none focus:border-[var(--color-cinnabar)] focus:ring-4 focus:ring-[color:var(--color-cinnabar-soft)] transition-all"
          ></textarea>
        </label>

        <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-[var(--color-paper-darker)] bg-[var(--color-paper)] px-5 py-4">
          <div class="text-sm text-[var(--color-ink-muted)]">
            <span class="mr-4">标题 {{ title.trim().length }}/200</span>
            <span>正文 {{ content.trim().length }} 字</span>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="router.push(boardId ? `/board/${boardId}` : '/boards')"
              class="px-4 py-2 rounded-xl border border-[var(--color-paper-darker)] text-sm hover:border-[var(--color-ink-muted)] transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              @click="handleSubmit"
              :disabled="submitting"
              class="px-5 py-2.5 rounded-xl bg-[var(--color-ink)] text-white text-sm font-medium hover:bg-[var(--color-cinnabar)] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {{ submitting ? '保存中...' : '保存修改' }}
            </button>
          </div>
        </div>

        <p v-if="error" class="text-sm text-[var(--color-cinnabar)]">{{ error }}</p>
      </div>
    </div>
  </div>
</template>
