<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPost, deletePost, type PostDetail } from '../api/posts'
import { getComments, createComment, deleteComment, type Comment } from '../api/comments'
import { toggleLike } from '../api/likes'
import { useAuth } from '../stores/useAuth'
import CommentItem from '../components/CommentItem.vue'
import CommentForm from '../components/CommentForm.vue'
import LikeButton from '../components/LikeButton.vue'
import { ArrowLeft, Trash2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { user, isLoggedIn } = useAuth()

const post = ref<PostDetail | null>(null)
const comments = ref<Comment[]>([])
const loading = ref(true)
const postId = computed(() => Number(route.params.postId))

async function loadData() {
  loading.value = true
  try {
    const [postRes, commentsRes] = await Promise.all([
      getPost(postId.value),
      getComments(postId.value),
    ])
    post.value = postRes.data
    comments.value = commentsRes.data
  } catch {
    // Handle error
  } finally {
    loading.value = false
  }
}

async function handleLike() {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  try {
    const res = await toggleLike(postId.value)
    if (post.value) {
      post.value.liked = res.data.liked
      post.value.like_count = res.data.like_count
    }
  } catch { /* ignore */ }
}

async function handleComment(content: string) {
  try {
    const res = await createComment(postId.value, { content })
    comments.value.push(res.data)
  } catch { /* ignore */ }
}

async function handleDeleteComment(id: number) {
  try {
    await deleteComment(id)
    comments.value = comments.value.filter((c) => c.id !== id)
  } catch { /* ignore */ }
}

async function handleDeletePost() {
  if (!confirm('确定删除这个帖子吗？')) return
  try {
    await deletePost(postId.value)
    router.push('/boards')
  } catch { /* ignore */ }
}

const canDeletePost = computed(() => {
  return user.value && post.value && (user.value.id === post.value.user_id || user.value.role === 'admin')
})

function formatTime(date: string) {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => loadData())
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-12">
    <!-- 返回 -->
    <button
      v-if="post"
      @click="router.push(`/board/${post.board_id}`)"
      class="flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors mb-6 cursor-pointer"
    >
      <ArrowLeft :size="15" />
      <span>返回 {{ post.board_name }}</span>
    </button>

    <!-- 骨架屏 -->
    <div v-if="loading" class="animate-pulse">
      <div class="bg-white rounded-xl border border-[var(--color-paper-darker)] p-8 mb-6">
        <div class="h-7 bg-[var(--color-paper-dark)] rounded w-2/3 mb-4"></div>
        <div class="h-4 bg-[var(--color-paper-dark)] rounded w-1/4 mb-6"></div>
        <div class="space-y-2">
          <div class="h-4 bg-[var(--color-paper-dark)] rounded w-full"></div>
          <div class="h-4 bg-[var(--color-paper-dark)] rounded w-full"></div>
          <div class="h-4 bg-[var(--color-paper-dark)] rounded w-3/4"></div>
        </div>
      </div>
    </div>

    <template v-else-if="post">
      <!-- 帖子内容 -->
      <article class="bg-[var(--color-card)] rounded-xl border border-[var(--color-paper-darker)] p-8 mb-6">
        <h1 class="text-2xl font-serif font-bold leading-snug mb-4">{{ post.title }}</h1>
        <div class="flex items-center gap-3 text-sm text-[var(--color-ink-muted)] mb-6">
          <span class="font-medium text-[var(--color-ink-light)]">{{ post.username }}</span>
          <span class="w-1 h-1 rounded-full bg-[var(--color-paper-darker)]"></span>
          <span>{{ formatTime(post.created_at) }}</span>
          <span v-if="post.created_at !== post.updated_at" class="text-xs">(已编辑)</span>
        </div>
        <div class="prose prose-sm max-w-none text-[var(--color-ink-light)] leading-relaxed whitespace-pre-wrap">
          {{ post.content }}
        </div>

        <div class="flex items-center justify-between mt-8 pt-6 border-t border-[var(--color-paper-dark)]">
          <LikeButton
            :liked="post.liked"
            :count="post.like_count"
            @toggle="handleLike"
          />
          <button
            v-if="canDeletePost"
            @click="handleDeletePost"
            class="flex items-center gap-1 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-cinnabar)] transition-colors cursor-pointer"
          >
            <Trash2 :size="14" />
            <span>删除</span>
          </button>
        </div>
      </article>

      <!-- 评论区 -->
      <section class="bg-[var(--color-card)] rounded-xl border border-[var(--color-paper-darker)] p-8">
        <h2 class="font-semibold mb-6">
          评论
          <span class="text-[var(--color-ink-muted)] font-normal ml-1">({{ comments.length }})</span>
        </h2>

        <div v-if="isLoggedIn" class="mb-6 pb-6 border-b border-[var(--color-paper-dark)]">
          <CommentForm @submit="handleComment" />
        </div>
        <div v-else class="mb-6 pb-6 border-b border-[var(--color-paper-dark)] text-center py-4">
          <p class="text-sm text-[var(--color-ink-muted)]">
            <router-link to="/login" class="text-[var(--color-cinnabar)] hover:underline">登录</router-link>
            后即可评论
          </p>
        </div>

        <div v-if="comments.length > 0" class="divide-y divide-[var(--color-paper-dark)]">
          <CommentItem
            v-for="comment in comments"
            :key="comment.id"
            :id="comment.id"
            :content="comment.content"
            :username="comment.username"
            :user-id="comment.user_id"
            :created-at="comment.created_at"
            @delete="handleDeleteComment"
          />
        </div>
        <p v-else class="text-sm text-[var(--color-ink-muted)] text-center py-8">暂无评论，来说点什么吧</p>
      </section>
    </template>
  </div>
</template>
