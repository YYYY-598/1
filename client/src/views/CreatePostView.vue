<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ImagePlus, Sparkles, X } from 'lucide-vue-next'
import { getBoard, type Board } from '../api/boards'
import { createPost, uploadPostImages } from '../api/posts'
import { useAuth } from '../stores/useAuth'

const route = useRoute()
const router = useRouter()
const { isLoggedIn } = useAuth()

const boardId = computed(() => Number(route.params.boardId))
const board = ref<Board | null>(null)
const title = ref('')
const content = ref('')
const files = ref<File[]>([])
const previews = ref<string[]>([])
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

function handleFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const selected = Array.from(input.files || [])
  const imageFiles = selected.filter((file) => file.type.startsWith('image/')).slice(0, 9 - files.value.length)
  files.value = [...files.value, ...imageFiles]
  previews.value = files.value.map((file) => URL.createObjectURL(file))
  input.value = ''
}

function removeImage(index: number) {
  files.value.splice(index, 1)
  previews.value.splice(index, 1)
}

async function handleSubmit() {
  error.value = ''
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }

  if (!title.value.trim()) {
    error.value = '请填写标题'
    return
  }
  if (!content.value.trim()) {
    error.value = '请填写说明'
    return
  }
  if (files.value.length === 0) {
    error.value = '图片帖至少上传 1 张图片'
    return
  }

  submitting.value = true
  try {
    const res = await createPost(boardId.value, {
      title: title.value.trim(),
      content: content.value.trim(),
    })
    await uploadPostImages(res.data.id, files.value)
    router.push(`/post/${res.data.id}`)
  } catch (e: any) {
    error.value = e.response?.data?.message || '发布失败'
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
  <div class="mx-auto max-w-[1180px] px-4 pb-12 lg:px-8">
    <button
      @click="router.push(`/board/${boardId}`)"
      class="mb-6 inline-flex items-center gap-1.5 text-sm text-[#777] hover:text-black transition-colors cursor-pointer"
    >
      <ArrowLeft :size="15" />
      <span>返回频道</span>
    </button>

    <div class="overflow-hidden rounded-[32px] border border-[#eee] bg-white shadow-[0_24px_90px_rgba(0,0,0,0.06)]">
      <div class="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <section class="min-h-[560px] bg-[#fafafa] p-5 md:p-7">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold tracking-[0.22em] text-[#ff2442] uppercase">Image Note</p>
              <h1 class="mt-2 text-2xl font-bold text-[#111]">发布图片帖</h1>
            </div>
            <span class="rounded-full bg-white px-3 py-1 text-xs text-[#777]">{{ files.length }}/9</span>
          </div>

          <label
            v-if="previews.length === 0"
            class="grid min-h-[420px] cursor-pointer place-items-center rounded-[28px] border-2 border-dashed border-[#ddd] bg-white text-center transition hover:border-[#ff2442] hover:bg-[#fff7f8]"
          >
            <input type="file" multiple accept="image/*" class="hidden" @change="handleFiles" />
            <span>
              <ImagePlus :size="52" class="mx-auto mb-4 text-[#ff2442]" />
              <span class="block text-lg font-semibold text-[#111]">选择图片</span>
              <span class="mt-2 block text-sm text-[#888]">最多 9 张，第一张会作为封面</span>
            </span>
          </label>

          <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-3">
            <div v-for="(src, index) in previews" :key="src" class="group relative overflow-hidden rounded-3xl bg-[#eee]">
              <img :src="src" alt="预览图片" class="aspect-[3/4] h-full w-full object-cover" />
              <button
                type="button"
                @click="removeImage(index)"
                class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
              >
                <X :size="16" />
              </button>
            </div>
            <label
              v-if="files.length < 9"
              class="grid aspect-[3/4] cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-[#ddd] bg-white text-[#999] hover:border-[#ff2442] hover:text-[#ff2442]"
            >
              <input type="file" multiple accept="image/*" class="hidden" @change="handleFiles" />
              <ImagePlus :size="28" />
            </label>
          </div>
        </section>

        <section class="p-6 md:p-8">
          <div class="mb-7 rounded-3xl bg-[#fff7f8] px-5 py-4">
            <div class="flex items-center gap-2 text-sm font-semibold text-[#ff2442]">
              <Sparkles :size="15" />
              <span>{{ board?.name || '当前频道' }}</span>
            </div>
            <p class="mt-2 text-sm leading-6 text-[#777]">第一版只做图片帖。标题写重点，正文写说明、体验、标签或补充信息。</p>
          </div>

          <div v-if="loading" class="grid gap-4">
            <div class="h-12 rounded-2xl bg-[#f3f3f3] animate-pulse"></div>
            <div class="h-48 rounded-3xl bg-[#f3f3f3] animate-pulse"></div>
          </div>

          <div v-else class="grid gap-5">
            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-[#333]">标题</span>
              <input
                v-model="title"
                maxlength="200"
                placeholder="给这组图片起个标题"
                class="w-full rounded-2xl border border-[#e8e8e8] bg-[#fafafa] px-5 py-4 text-[15px] outline-none transition focus:border-[#ff2442] focus:bg-white"
              />
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-[#333]">说明</span>
              <textarea
                v-model="content"
                rows="11"
                placeholder="写一点背景、心得、标签或想讨论的问题"
                class="w-full resize-y rounded-3xl border border-[#e8e8e8] bg-[#fafafa] px-5 py-4 text-[15px] leading-7 outline-none transition focus:border-[#ff2442] focus:bg-white"
              ></textarea>
            </label>

            <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#eee] bg-[#fafafa] px-5 py-4">
              <div class="text-sm text-[#888]">
                <span class="mr-4">标题 {{ title.trim().length }}/200</span>
                <span>说明 {{ content.trim().length }} 字</span>
              </div>
              <div class="flex items-center gap-3">
                <button
                  @click="router.push(`/board/${boardId}`)"
                  class="rounded-full border border-[#ddd] px-5 py-2.5 text-sm font-semibold hover:border-[#aaa] transition cursor-pointer"
                >
                  取消
                </button>
                <button
                  @click="handleSubmit"
                  :disabled="submitting"
                  class="rounded-full bg-[#ff2442] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e91f3c] disabled:opacity-50 cursor-pointer"
                >
                  {{ submitting ? '发布中...' : '发布' }}
                </button>
              </div>
            </div>

            <p v-if="error" class="text-sm text-[#ff2442]">{{ error }}</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
