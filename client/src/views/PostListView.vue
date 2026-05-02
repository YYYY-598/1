<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPosts, type PostSummary } from '../api/posts'
import { getBoard, type Board } from '../api/boards'
import { useAuth } from '../stores/useAuth'
import PostCard from '../components/PostCard.vue'
import Pagination from '../components/Pagination.vue'
import { Plus, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { isLoggedIn } = useAuth()

const board = ref<Board | null>(null)
const posts = ref<PostSummary[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const loading = ref(true)
const boardId = computed(() => Number(route.params.boardId))

async function loadPosts() {
  loading.value = true
  try {
    const [boardRes, postsRes] = await Promise.all([
      getBoard(boardId.value),
      getPosts(boardId.value, page.value, pageSize),
    ])
    board.value = boardRes.data
    posts.value = postsRes.data.items
    total.value = postsRes.data.total
  } catch {
    // 后端未启动
  } finally {
    loading.value = false
  }
}

function handlePageChange(p: number) {
  page.value = p
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(page, () => loadPosts())
onMounted(() => loadPosts())
watch(() => route.params.boardId, () => {
  page.value = 1
  loadPosts()
})

const showNewPost = ref(false)
const newTitle = ref('')
const newContent = ref('')
const submitLoading = ref(false)
const postError = ref('')

async function handleCreatePost() {
  postError.value = ''
  if (!newTitle.value.trim() || !newContent.value.trim()) {
    postError.value = '请填写标题和内容'
    return
  }
  submitLoading.value = true
  try {
    const { createPost } = await import('../api/posts')
    const res = await createPost(boardId.value, {
      title: newTitle.value.trim(),
      content: newContent.value.trim(),
    })
    showNewPost.value = false
    newTitle.value = ''
    newContent.value = ''
    router.push(`/post/${res.data.id}`)
  } catch (e: any) {
    postError.value = e.response?.data?.message || '发帖失败'
  } finally {
    submitLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-12">
    <!-- 头部 -->
    <div class="mb-8">
      <button
        @click="router.push('/boards')"
        class="flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors mb-4 cursor-pointer"
      >
        <ArrowLeft :size="15" />
        <span>返回板块列表</span>
      </button>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-serif font-bold mb-1">{{ board?.name || '加载中...' }}</h1>
          <p class="text-sm text-[var(--color-ink-muted)]">{{ board?.description || '' }}</p>
        </div>
        <button
          v-if="isLoggedIn"
          @click="showNewPost = !showNewPost"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-ink)] text-white text-sm hover:bg-[var(--color-ink-light)] transition-colors cursor-pointer shrink-0"
        >
          <Plus :size="16" />
          <span>发帖</span>
        </button>
      </div>
    </div>

    <!-- 发帖表单 -->
    <div v-if="showNewPost" class="bg-white rounded-xl border border-[var(--color-paper-darker)] p-5 mb-6">
      <input
        v-model="newTitle"
        type="text"
        placeholder="标题"
        class="w-full rounded-lg border border-[var(--color-paper-darker)] bg-[var(--color-paper)] px-4 py-2.5 text-sm mb-3 placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-ink)] focus:bg-white transition-colors"
      />
      <textarea
        v-model="newContent"
        placeholder="写下你想分享的内容..."
        rows="4"
        class="w-full rounded-lg border border-[var(--color-paper-darker)] bg-[var(--color-paper)] px-4 py-2.5 text-sm resize-none placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-ink)] focus:bg-white transition-colors"
      ></textarea>
      <p v-if="postError" class="text-sm text-[var(--color-cinnabar)] mt-2">{{ postError }}</p>
      <div class="flex items-center justify-end gap-2 mt-3">
        <button
          @click="showNewPost = false"
          class="px-4 py-1.5 text-sm rounded-md border border-[var(--color-paper-darker)] hover:border-[var(--color-ink-muted)] transition-colors cursor-pointer"
        >取消</button>
        <button
          @click="handleCreatePost"
          :disabled="submitLoading"
          class="px-4 py-1.5 text-sm rounded-md bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-light)] disabled:opacity-50 transition-colors cursor-pointer"
        >{{ submitLoading ? '发布中...' : '发布' }}</button>
      </div>
    </div>

    <!-- 帖子列表 -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="bg-white rounded-xl p-5 border border-[var(--color-paper-darker)] animate-pulse">
        <div class="h-5 bg-[var(--color-paper-dark)] rounded w-3/4 mb-3"></div>
        <div class="h-4 bg-[var(--color-paper-dark)] rounded w-full mb-2"></div>
        <div class="h-4 bg-[var(--color-paper-dark)] rounded w-1/2"></div>
      </div>
    </div>

    <template v-else-if="posts.length > 0">
      <div class="space-y-3">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :id="post.id"
          :title="post.title"
          :summary="post.summary"
          :username="post.username"
          :like-count="post.like_count"
          :comment-count="post.comment_count"
          :created-at="post.created_at"
        />
      </div>
      <div class="mt-8">
        <Pagination
          :page="page"
          :total="total"
          :page-size="pageSize"
          @change="handlePageChange"
        />
      </div>
    </template>

    <div v-else class="text-center py-20">
      <p class="text-[var(--color-ink-muted)]">暂无帖子，来做第一个发言的人吧</p>
    </div>
  </div>
</template>
