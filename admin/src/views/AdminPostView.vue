<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPosts, deletePost, type Post } from '../api/admin'
import { Trash2, MessageSquare, ExternalLink } from 'lucide-vue-next'

const posts = ref<Post[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await getPosts(page.value, pageSize)
    posts.value = res.data.items
    total.value = res.data.total
  } catch { /* ignore */ } finally { loading.value = false }
}

async function handleDelete(post: Post) {
  if (!confirm(`确定删除帖子「${post.title}」？`)) return
  try {
    await deletePost(post.id)
    await load()
  } catch { /* ignore */ }
}

function changePage(p: number) { page.value = p; load() }

onMounted(() => load())
</script>

<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-2xl font-serif font-bold mb-1">帖子管理</h1>
      <p class="text-sm text-[var(--color-ink-muted)]">管理论坛所有帖子，共 {{ total }} 篇</p>
    </div>

    <div class="bg-white rounded-xl border border-[var(--color-paper-darker)] overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-[var(--color-paper-dark)] text-left text-[var(--color-ink-muted)]">
            <th class="px-6 py-3 font-medium">标题</th>
            <th class="px-6 py-3 font-medium">作者</th>
            <th class="px-6 py-3 font-medium">板块</th>
            <th class="px-6 py-3 font-medium">点赞/评论</th>
            <th class="px-6 py-3 font-medium">发布时间</th>
            <th class="px-6 py-3 font-medium w-28">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" v-for="i in 5" :key="i" class="border-b border-[var(--color-paper-dark)] last:border-0 animate-pulse">
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-40"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-16"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-16"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-12"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-24"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-16"></div></td>
          </tr>
          <tr
            v-for="post in posts"
            :key="post.id"
            class="border-b border-[var(--color-paper-dark)] last:border-0 hover:bg-[var(--color-paper)] transition-colors"
          >
            <td class="px-6 py-3.5 font-medium max-w-xs truncate">{{ post.title }}</td>
            <td class="px-6 py-3.5 text-[var(--color-ink-muted)]">{{ post.username }}</td>
            <td class="px-6 py-3.5">
              <span class="px-2 py-0.5 rounded text-xs bg-[var(--color-paper-dark)]">{{ post.board_name }}</span>
            </td>
            <td class="px-6 py-3.5 text-[var(--color-ink-muted)]">{{ post.like_count }} / {{ post.comment_count }}</td>
            <td class="px-6 py-3.5 text-[var(--color-ink-muted)]">{{ new Date(post.created_at).toLocaleDateString('zh-CN') }}</td>
            <td class="px-6 py-3.5">
              <div class="flex items-center gap-1">
                <a
                  :href="`/post/${post.id}`"
                  target="_blank"
                  class="p-1.5 rounded-md hover:bg-[var(--color-paper-dark)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
                >
                  <ExternalLink :size="14" />
                </a>
                <button
                  @click="handleDelete(post)"
                  class="p-1.5 rounded-md hover:bg-[var(--color-cinnabar-soft)] text-[var(--color-ink-muted)] hover:text-[var(--color-cinnabar)] transition-colors cursor-pointer"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && posts.length === 0">
            <td colspan="6" class="px-6 py-16 text-center text-[var(--color-ink-muted)]">
              <MessageSquare :size="32" class="mx-auto mb-3 text-[var(--color-paper-darker)]" />
              暂无帖子
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 简易分页 -->
    <div v-if="total > pageSize" class="flex items-center justify-center gap-2 mt-6">
      <button
        v-for="p in Math.ceil(total / pageSize)"
        :key="p"
        @click="changePage(p)"
        class="w-8 h-8 flex items-center justify-center rounded-md text-sm border transition-colors cursor-pointer"
        :class="p === page
          ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
          : 'border-[var(--color-paper-darker)] hover:border-[var(--color-ink-muted)]'"
      >{{ p }}</button>
    </div>
  </div>
</template>
