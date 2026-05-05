<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Image as ImageIcon } from 'lucide-vue-next'
import { getFeed, searchPosts, type PostSummary } from '../api/posts'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const posts = ref<PostSummary[]>([])
const loading = ref(true)
const keyword = computed(() => String(route.query.q || '').trim())

async function loadPosts() {
  loading.value = true
  try {
    const res = keyword.value ? await searchPosts(keyword.value, 1, 30) : await getFeed(1, 30)
    posts.value = res.data.items
  } catch {
    posts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => loadPosts())
watch(keyword, () => loadPosts())
</script>

<template>
  <div class="mx-auto max-w-[1480px] px-4 pb-10 lg:px-8">
    <div v-if="keyword" class="mb-5 rounded-2xl bg-[#f7f7f7] px-5 py-4 text-sm text-[#555]">
      搜索：<span class="font-semibold text-[#111]">{{ keyword }}</span>
    </div>

    <div v-if="loading" class="columns-2 gap-4 md:columns-3 xl:columns-4 2xl:columns-5">
      <div v-for="i in 10" :key="i" class="mb-5 break-inside-avoid overflow-hidden rounded-2xl bg-white animate-pulse">
        <div class="bg-[#f1f1f1]" :class="i % 3 === 0 ? 'h-80' : 'h-60'"></div>
        <div class="p-3">
          <div class="mb-2 h-4 rounded bg-[#f1f1f1]"></div>
          <div class="h-4 w-2/3 rounded bg-[#f1f1f1]"></div>
        </div>
      </div>
    </div>

    <div v-else-if="posts.length > 0" class="columns-2 gap-4 md:columns-3 xl:columns-4 2xl:columns-5">
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

    <div v-else class="py-24 text-center text-[#999]">
      <ImageIcon :size="44" class="mx-auto mb-4 text-[#ddd]" />
      <p>{{ keyword ? '没有搜到相关帖子' : '暂无推荐内容' }}</p>
    </div>
  </div>
</template>
