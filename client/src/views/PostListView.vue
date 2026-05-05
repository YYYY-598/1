<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPosts, type PostSummary } from '../api/posts'
import PostCard from '../components/PostCard.vue'
import Pagination from '../components/Pagination.vue'

const route = useRoute()

const posts = ref<PostSummary[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const loading = ref(true)
const boardId = computed(() => Number(route.params.boardId))

async function loadPosts() {
  loading.value = true
  try {
    const postsRes = await getPosts(boardId.value, page.value, pageSize)
    posts.value = postsRes.data.items
    total.value = postsRes.data.total
  } catch {
    posts.value = []
    total.value = 0
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
</script>

<template>
  <div class="mx-auto max-w-[1480px] px-4 pb-10 lg:px-8">
    <div v-if="loading" class="columns-2 gap-4 md:columns-3 xl:columns-4 2xl:columns-5">
      <div v-for="i in 10" :key="i" class="mb-5 break-inside-avoid overflow-hidden rounded-2xl bg-white animate-pulse">
        <div class="bg-[#f1f1f1]" :class="i % 3 === 0 ? 'h-80' : 'h-60'"></div>
        <div class="p-3">
          <div class="mb-2 h-4 rounded bg-[#f1f1f1]"></div>
          <div class="h-4 w-2/3 rounded bg-[#f1f1f1]"></div>
        </div>
      </div>
    </div>

    <template v-else-if="posts.length > 0">
      <div class="columns-2 gap-4 md:columns-3 xl:columns-4 2xl:columns-5">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :id="post.id"
          :title="post.title"
          :summary="post.summary"
          :username="post.username"
          :avatar-url="post.avatar_url"
          :cover-url="post.cover_url"
          :images="post.images"
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

    <div v-else class="py-20 text-center">
      <p class="text-[#999]">暂无内容</p>
    </div>
  </div>
</template>
