<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getBoards, createBoard, updateBoard, deleteBoard, type Board } from '../api/admin'
import { Plus, Pencil, Trash2, LayoutGrid, X } from 'lucide-vue-next'

const boards = ref<Board[]>([])
const loading = ref(true)
const showModal = ref(false)
const editTarget = ref<Board | null>(null)
const formName = ref('')
const formDesc = ref('')
const formError = ref('')
const saving = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await getBoards()
    boards.value = res.data
  } catch { /* ignore */ } finally { loading.value = false }
}

function openCreate() {
  editTarget.value = null
  formName.value = ''
  formDesc.value = ''
  formError.value = ''
  showModal.value = true
}

function openEdit(board: Board) {
  editTarget.value = board
  formName.value = board.name
  formDesc.value = board.description
  formError.value = ''
  showModal.value = true
}

async function handleSave() {
  formError.value = ''
  if (!formName.value.trim()) { formError.value = '请输入板块名称'; return }
  saving.value = true
  try {
    if (editTarget.value) {
      await updateBoard(editTarget.value.id, { name: formName.value.trim(), description: formDesc.value.trim() })
    } else {
      await createBoard({ name: formName.value.trim(), description: formDesc.value.trim() })
    }
    showModal.value = false
    await load()
  } catch (e: any) {
    formError.value = e.response?.data?.message || '操作失败'
  } finally { saving.value = false }
}

async function handleDelete(board: Board) {
  if (!confirm(`确定删除板块「${board.name}」？该板块下的所有帖子也会被删除。`)) return
  try {
    await deleteBoard(board.id)
    await load()
  } catch { /* ignore */ }
}

onMounted(() => load())
</script>

<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-serif font-bold mb-1">板块管理</h1>
        <p class="text-sm text-[var(--color-ink-muted)]">管理论坛的所有板块</p>
      </div>
      <button
        @click="openCreate"
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-ink)] text-white text-sm hover:bg-[var(--color-ink-light)] transition-colors cursor-pointer"
      >
        <Plus :size="16" />
        <span>新建板块</span>
      </button>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-xl border border-[var(--color-paper-darker)] overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-[var(--color-paper-dark)] text-left text-[var(--color-ink-muted)]">
            <th class="px-6 py-3 font-medium">板块名称</th>
            <th class="px-6 py-3 font-medium">描述</th>
            <th class="px-6 py-3 font-medium">创建时间</th>
            <th class="px-6 py-3 font-medium w-28">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" v-for="i in 5" :key="i" class="border-b border-[var(--color-paper-dark)] last:border-0 animate-pulse">
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-20"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-32"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-24"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-16"></div></td>
          </tr>
          <tr
            v-for="board in boards"
            :key="board.id"
            class="border-b border-[var(--color-paper-dark)] last:border-0 hover:bg-[var(--color-paper)] transition-colors"
          >
            <td class="px-6 py-3.5 font-medium">{{ board.name }}</td>
            <td class="px-6 py-3.5 text-[var(--color-ink-muted)]">{{ board.description || '—' }}</td>
            <td class="px-6 py-3.5 text-[var(--color-ink-muted)]">{{ new Date(board.created_at).toLocaleDateString('zh-CN') }}</td>
            <td class="px-6 py-3.5">
              <div class="flex items-center gap-1">
                <button
                  @click="openEdit(board)"
                  class="p-1.5 rounded-md hover:bg-[var(--color-paper-dark)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
                >
                  <Pencil :size="14" />
                </button>
                <button
                  @click="handleDelete(board)"
                  class="p-1.5 rounded-md hover:bg-[var(--color-cinnabar-soft)] text-[var(--color-ink-muted)] hover:text-[var(--color-cinnabar)] transition-colors cursor-pointer"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && boards.length === 0">
            <td colspan="4" class="px-6 py-16 text-center text-[var(--color-ink-muted)]">
              <LayoutGrid :size="32" class="mx-auto mb-3 text-[var(--color-paper-darker)]" />
              暂无板块，点击右上角创建第一个板块
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 弹窗 -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/30" @click="showModal = false"></div>
      <div class="relative bg-white rounded-xl border border-[var(--color-paper-darker)] w-full max-w-md p-6 shadow-xl">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold">{{ editTarget ? '编辑板块' : '新建板块' }}</h2>
          <button @click="showModal = false" class="p-1 rounded-md hover:bg-[var(--color-paper-dark)] text-[var(--color-ink-muted)] transition-colors cursor-pointer">
            <X :size="18" />
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1.5 text-[var(--color-ink-light)]">名称</label>
            <input
              v-model="formName"
              type="text"
              placeholder="板块名称"
              class="w-full rounded-lg border border-[var(--color-paper-darker)] bg-[var(--color-paper)] px-4 py-2.5 text-sm placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5 text-[var(--color-ink-light)]">描述</label>
            <textarea
              v-model="formDesc"
              placeholder="板块描述（选填）"
              rows="3"
              class="w-full rounded-lg border border-[var(--color-paper-darker)] bg-[var(--color-paper)] px-4 py-2.5 text-sm resize-none placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
            ></textarea>
          </div>
          <p v-if="formError" class="text-sm text-[var(--color-cinnabar)]">{{ formError }}</p>
          <div class="flex justify-end gap-2 pt-2">
            <button
              @click="showModal = false"
              class="px-4 py-2 text-sm rounded-lg border border-[var(--color-paper-darker)] hover:border-[var(--color-ink-muted)] transition-colors cursor-pointer"
            >取消</button>
            <button
              @click="handleSave"
              :disabled="saving"
              class="px-4 py-2 text-sm rounded-lg bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-light)] disabled:opacity-50 transition-colors cursor-pointer"
            >{{ saving ? '保存中...' : '保存' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
