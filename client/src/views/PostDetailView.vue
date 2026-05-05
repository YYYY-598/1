<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, MessageCircle, Pencil, Trash2 } from 'lucide-vue-next'
import { getPost, deletePost, type PostDetail } from '../api/posts'
import { createComment, deleteComment, type Comment } from '../api/comments'
import { toggleLike } from '../api/likes'
import { useAuth } from '../stores/useAuth'
import CommentItem from '../components/CommentItem.vue'
import CommentForm from '../components/CommentForm.vue'
import LikeButton from '../components/LikeButton.vue'

const route = useRoute()
const router = useRouter()
const { user, isLoggedIn } = useAuth()

const post = ref<PostDetail | null>(null)
const comments = ref<Comment[]>([])
const loading = ref(true)
const activeImageIndex = ref(0)
const postId = computed(() => Number(route.params.postId))
const images = computed(() => post.value?.images || [])
const activeImage = computed(() => images.value[activeImageIndex.value] || '')
const postAuthorInitial = computed(() => post.value?.username.charAt(0).toUpperCase() || '?')

const canManagePost = computed(() => {
  return user.value && post.value && (user.value.id === post.value.user_id || user.value.role === 'admin')
})

async function loadData() {
  loading.value = true
  try {
    const postRes = await getPost(postId.value)
    post.value = postRes.data
    comments.value = postRes.data.comments || []
    activeImageIndex.value = 0
  } catch {
    post.value = null
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
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
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

function formatTime(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', {
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
  <div class="mx-auto max-w-[1320px] px-4 pb-10 lg:px-8">
    <button
      v-if="post"
      @click="router.push(`/board/${post.board_id}`)"
      class="mb-5 inline-flex items-center gap-1.5 text-sm text-[#777] hover:text-black transition-colors cursor-pointer"
    >
      <ArrowLeft :size="15" />
      <span>返回 {{ post.board_name }}</span>
    </button>

    <div v-if="loading" class="grid overflow-hidden rounded-[32px] bg-white shadow-[0_24px_90px_rgba(0,0,0,0.06)] lg:grid-cols-[minmax(0,1.08fr)_440px]">
      <div class="h-[72vh] min-h-[520px] bg-[#f1f1f1] animate-pulse"></div>
      <div class="p-7">
        <div class="mb-6 h-10 rounded bg-[#f1f1f1] animate-pulse"></div>
        <div class="mb-3 h-7 rounded bg-[#f1f1f1] animate-pulse"></div>
        <div class="h-40 rounded bg-[#f1f1f1] animate-pulse"></div>
      </div>
    </div>

    <div v-else-if="post" class="grid overflow-hidden rounded-[32px] bg-white shadow-[0_24px_90px_rgba(0,0,0,0.06)] lg:grid-cols-[minmax(0,1.08fr)_440px]">
      <section class="relative flex min-h-[520px] items-center justify-center bg-[#0f0f0f] lg:h-[76vh]">
        <img
          v-if="activeImage"
          :src="activeImage"
          :alt="post.title"
          class="max-h-full w-full object-contain"
        />
        <div v-else class="mx-8 max-w-lg rounded-[28px] bg-white p-8 text-center">
          <p class="mb-3 text-xs font-semibold tracking-[0.22em] text-[#ff2442] uppercase">Text Note</p>
          <h1 class="text-3xl font-bold leading-tight text-[#111]">{{ post.title }}</h1>
          <p class="mt-5 whitespace-pre-wrap text-left text-sm leading-7 text-[#666]">{{ post.content }}</p>
        </div>

        <div v-if="images.length > 1" class="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/45 px-3 py-2 backdrop-blur">
          <button
            v-for="(image, index) in images"
            :key="image"
            @click="activeImageIndex = index"
            class="h-2.5 w-2.5 rounded-full transition"
            :class="activeImageIndex === index ? 'bg-white' : 'bg-white/40 hover:bg-white/70'"
          ></button>
        </div>
      </section>

      <aside class="flex max-h-[76vh] min-h-[520px] flex-col">
        <div class="border-b border-[#f0f0f0] p-6">
          <div class="flex items-center justify-between gap-4">
            <div class="flex min-w-0 items-center gap-3">
              <span class="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f7f7f7] text-sm font-bold text-[#ff2442]">
                <img v-if="post.avatar_url" :src="post.avatar_url" :alt="post.username" class="h-full w-full object-cover" />
                <span v-else>{{ postAuthorInitial }}</span>
              </span>
              <div class="min-w-0">
                <p class="truncate font-semibold text-[#111]">{{ post.username }}</p>
                <p class="text-xs text-[#999]">{{ formatTime(post.created_at) }}</p>
              </div>
            </div>
            <button class="rounded-full border border-[#ff2442] px-4 py-1.5 text-sm font-semibold text-[#ff2442] hover:bg-[#fff1f3]">
              关注
            </button>
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto p-6">
          <article class="border-b border-[#f0f0f0] pb-6">
            <h1 class="text-2xl font-bold leading-snug text-[#111]">{{ post.title }}</h1>
            <p v-if="post.content" class="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-[#333]">{{ post.content }}</p>
            <p v-if="post.created_at !== post.updated_at" class="mt-3 text-xs text-[#aaa]">已编辑</p>
          </article>

          <section class="pt-6">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="font-semibold text-[#111]">评论 {{ comments.length }}</h2>
              <span class="inline-flex items-center gap-1 text-xs text-[#999]">
                <MessageCircle :size="14" />
                讨论
              </span>
            </div>

            <div v-if="comments.length > 0" class="divide-y divide-[#f2f2f2]">
              <CommentItem
                v-for="comment in comments"
                :key="comment.id"
                :id="comment.id"
                :content="comment.content"
                :username="comment.username"
                :avatar-url="comment.avatar_url"
                :user-id="comment.user_id"
                :created-at="comment.created_at"
                @delete="handleDeleteComment"
              />
            </div>
            <p v-else class="py-10 text-center text-sm text-[#999]">暂无评论，来抢第一条</p>
          </section>
        </div>

        <div class="border-t border-[#f0f0f0] p-5">
          <div class="mb-4 flex items-center justify-between">
            <LikeButton :liked="post.liked" :count="post.like_count" @toggle="handleLike" />
            <div v-if="canManagePost" class="flex items-center gap-2">
              <button
                @click="router.push(`/post/${post.id}/edit`)"
                class="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-[#777] hover:bg-[#f7f7f7] hover:text-black"
              >
                <Pencil :size="14" />
                编辑
              </button>
              <button
                @click="handleDeletePost"
                class="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-[#777] hover:bg-[#fff1f3] hover:text-[#ff2442]"
              >
                <Trash2 :size="14" />
                删除
              </button>
            </div>
          </div>

          <CommentForm v-if="isLoggedIn" @submit="handleComment" />
          <p v-else class="rounded-2xl bg-[#f7f7f7] px-4 py-3 text-center text-sm text-[#777]">
            <router-link to="/login" class="font-semibold text-[#ff2442] hover:underline">登录</router-link>
            后即可评论
          </p>
        </div>
      </aside>
    </div>

    <div v-else class="py-24 text-center text-[#999]">帖子不存在或加载失败</div>
  </div>
</template>
