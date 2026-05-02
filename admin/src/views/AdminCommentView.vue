<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getComments, deleteComment, type Comment } from '../api/admin'
import { Trash2, MessageCircle } from 'lucide-vue-next'

const comments = ref<Comment[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await getComments(page.value, pageSize)
    comments.value = res.data.items
    total.value = res.data.total
  } catch { /* ignore */ } finally { loading.value = false }
}

async function handleDelete(comment: Comment) {
  if (!confirm('确定删除这条评论？')) return
  try {
    await deleteComment(comment.id)
    await load()
  } catch { /* ignore */ }
}

function changePage(p: number) { page.value = p; load() }

onMounted(() => load())
</script>

<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-2xl font-serif font-bold mb-1">评论管理</h1>
      <p class="text-sm text-[var(--color-ink-muted)]">管理论坛所有评论，共 {{ total }} 条</p>
    </div>

    <div class="bg-white rounded-xl border border-[var(--color-paper-darker)] overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-[var(--color-paper-dark)] text-left text-[var(--color-ink-muted)]">
            <th class="px-6 py-3 font-medium">内容</th>
            <th class="px-6 py-3 font-medium">用户</th>
            <th class="px-6 py-3 font-medium">所属帖子</th>
            <th class="px-6 py-3 font-medium">评论时间</th>
            <th class="px-6 py-3 font-medium w-20">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" v-for="i in 5" :key="i" class="border-b border-[var(--color-paper-dark)] last:border-0 animate-pulse">
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-48"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-16"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-20"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-24"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-8"></div></td>
          </tr>
          <tr
            v-for="comment in comments"
            :key="comment.id"
            class="border-b border-[var(--color-paper-dark)] last:border-0 hover:bg-[var(--color-paper)] transition-colors"
          >
            <td class="px-6 py-3.5 max-w-xs truncate">{{ comment.content }}</td>
            <td class="px-6 py-3.5 text-[var(--color-ink-muted)]">{{ comment.username }}</td>
            <td class="px-6 py-3.5 text-[var(--color-ink-muted)] truncate max-w-[200px]">{{ comment.post_title }}</td>
            <td class="px-6 py-3.5 text-[var(--color-ink-muted)]">{{ new Date(comment.created_at).toLocaleDateString('zh-CN') }}</td>
            <td class="px-6 py-3.5">
              <button
                @click="handleDelete(comment)"
                class="p-1.5 rounded-md hover:bg-[var(--color-cinnabar-soft)] text-[var(--color-ink-muted)] hover:text-[var(--color-cinnabar)] transition-colors cursor-pointer"
              >
                <Trash2 :size="14" />
              </button>
            </td>
          </tr>
          <tr v-if="!loading && comments.length === 0">
            <td colspan="5" class="px-6 py-16 text-center text-[var(--color-ink-muted)]">
              <MessageCircle :size="32" class="mx-auto mb-3 text-[var(--color-paper-darker)]" />
              暂无评论
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
