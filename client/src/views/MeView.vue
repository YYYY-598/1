<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Camera, LockKeyhole, PenSquare, Trash2, FileText } from 'lucide-vue-next'
import { getMe, getMyPosts, updatePassword, updateProfile, uploadAvatar, type MeProfile, type MyPostSummary } from '../api/me'
import { deletePost } from '../api/posts'
import { useAuth } from '../stores/useAuth'
import Pagination from '../components/Pagination.vue'

const router = useRouter()
const { isLoggedIn, logout, updateUser } = useAuth()

const profile = ref<MeProfile | null>(null)
const signature = ref('')
const posts = ref<MyPostSummary[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(true)
const savingProfile = ref(false)
const uploadingAvatar = ref(false)
const changingPassword = ref(false)
const profileMessage = ref('')
const passwordMessage = ref('')
const oldPassword = ref('')
const newPassword = ref('')

const avatarPreview = computed(() => profile.value?.avatar_url || '')
const joinDate = computed(() => {
  if (!profile.value) return ''
  return new Date(profile.value.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

async function loadProfile() {
  const res = await getMe()
  profile.value = res.data
  signature.value = res.data.signature || ''
  updateUser({
    username: res.data.username,
    email: res.data.email,
    role: res.data.role,
    avatar_url: res.data.avatar_url,
    signature: res.data.signature,
  })
}

async function loadMyPosts() {
  const res = await getMyPosts(page.value, pageSize)
  posts.value = res.data.items
  total.value = res.data.total
}

async function loadData() {
  loading.value = true
  profileMessage.value = ''
  passwordMessage.value = ''
  try {
    await Promise.all([loadProfile(), loadMyPosts()])
  } finally {
    loading.value = false
  }
}

async function handleSignatureSave() {
  if (!profile.value) return
  savingProfile.value = true
  profileMessage.value = ''
  try {
    const res = await updateProfile({ signature: signature.value.trim() })
    profile.value = res.data
    signature.value = res.data.signature || ''
    updateUser({
      avatar_url: res.data.avatar_url,
      signature: res.data.signature,
    })
    profileMessage.value = '资料已保存'
  } catch (e: any) {
    profileMessage.value = e.response?.data?.message || '资料保存失败'
  } finally {
    savingProfile.value = false
  }
}

async function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploadingAvatar.value = true
  profileMessage.value = ''
  try {
    const res = await uploadAvatar(file)
    if (profile.value) {
      profile.value.avatar_url = res.data.avatar_url
    }
    updateUser({ avatar_url: res.data.avatar_url })
    profileMessage.value = '头像已更新'
  } catch (e: any) {
    profileMessage.value = e.response?.data?.message || '头像上传失败'
  } finally {
    uploadingAvatar.value = false
    input.value = ''
  }
}

async function handlePasswordChange() {
  passwordMessage.value = ''
  if (!oldPassword.value || !newPassword.value) {
    passwordMessage.value = '请填写旧密码和新密码'
    return
  }
  changingPassword.value = true
  try {
    await updatePassword({
      old_password: oldPassword.value,
      new_password: newPassword.value,
    })
    oldPassword.value = ''
    newPassword.value = ''
    passwordMessage.value = '密码已更新'
  } catch (e: any) {
    passwordMessage.value = e.response?.data?.message || '密码修改失败'
  } finally {
    changingPassword.value = false
  }
}

async function handleDeletePost(id: number) {
  if (!confirm('确定删除这篇帖子吗？')) return
  try {
    await deletePost(id)
    posts.value = posts.value.filter((post) => post.id !== id)
    total.value = Math.max(0, total.value - 1)
    if (profile.value) {
      profile.value.post_count = Math.max(0, profile.value.post_count - 1)
    }
  } catch {
    // ignore
  }
}

function handleLogout() {
  logout()
  router.push('/boards')
}

function formatTime(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  if (!isLoggedIn.value) {
    router.replace('/login')
    return
  }
  loadData()
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <div class="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <section class="rounded-[28px] border border-[var(--color-paper-darker)] bg-[linear-gradient(180deg,#fffdf9_0%,#ffffff_55%,#f7f1ea_100%)] p-6 md:p-7 shadow-[0_20px_70px_rgba(53,37,28,0.07)]">
        <div v-if="loading" class="space-y-4">
          <div class="w-24 h-24 rounded-full bg-[var(--color-paper-dark)] animate-pulse"></div>
          <div class="h-6 w-32 rounded bg-[var(--color-paper-dark)] animate-pulse"></div>
          <div class="h-4 w-20 rounded bg-[var(--color-paper-dark)] animate-pulse"></div>
        </div>

        <template v-else-if="profile">
          <div class="flex flex-col items-start">
            <div class="relative mb-5">
              <div
                v-if="avatarPreview"
                class="w-24 h-24 rounded-full overflow-hidden border border-[var(--color-paper-darker)] bg-white shadow-sm"
              >
                <img :src="avatarPreview" :alt="profile.username" class="w-full h-full object-cover" />
              </div>
              <div
                v-else
                class="w-24 h-24 rounded-full bg-[var(--color-sage-soft)] text-[var(--color-sage)] flex items-center justify-center text-3xl font-semibold"
              >
                {{ profile.username.charAt(0).toUpperCase() }}
              </div>

              <label
                class="absolute -right-1 -bottom-1 w-10 h-10 rounded-full bg-[var(--color-ink)] text-white flex items-center justify-center shadow-lg hover:bg-[var(--color-cinnabar)] transition-colors cursor-pointer"
              >
                <Camera :size="16" />
                <input type="file" accept="image/*" class="hidden" @change="handleAvatarChange" />
              </label>
            </div>

            <h1 class="text-3xl font-serif font-bold tracking-tight">{{ profile.username }}</h1>
            <p class="text-sm text-[var(--color-ink-muted)] mt-1">{{ profile.email }}</p>

            <div class="grid grid-cols-2 gap-3 w-full mt-6">
              <div class="rounded-2xl bg-white border border-[var(--color-paper-darker)] px-4 py-3">
                <p class="text-xs tracking-[0.16em] uppercase text-[var(--color-ink-muted)] mb-1">加入时间</p>
                <p class="text-sm font-medium">{{ joinDate }}</p>
              </div>
              <div class="rounded-2xl bg-white border border-[var(--color-paper-darker)] px-4 py-3">
                <p class="text-xs tracking-[0.16em] uppercase text-[var(--color-ink-muted)] mb-1">发帖数</p>
                <p class="text-sm font-medium">{{ profile.post_count }}</p>
              </div>
            </div>

            <div class="w-full mt-6">
              <div class="flex items-center gap-2 mb-2 text-sm font-medium">
                <PenSquare :size="15" class="text-[var(--color-cinnabar)]" />
                <span>个性签名</span>
              </div>
              <textarea
                v-model="signature"
                rows="5"
                maxlength="200"
                class="w-full rounded-3xl border border-[var(--color-paper-darker)] bg-white px-4 py-3 text-sm leading-7 resize-none placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-cinnabar)] focus:ring-4 focus:ring-[color:var(--color-cinnabar-soft)] transition-all"
                placeholder="写一点关于你的介绍、兴趣，或者你最近在关注什么。"
              ></textarea>
              <div class="flex items-center justify-between mt-3">
                <span class="text-xs text-[var(--color-ink-muted)]">{{ signature.trim().length }}/200</span>
                <button
                  @click="handleSignatureSave"
                  :disabled="savingProfile || uploadingAvatar"
                  class="px-4 py-2 rounded-xl bg-[var(--color-ink)] text-white text-sm hover:bg-[var(--color-cinnabar)] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {{ savingProfile ? '保存中...' : '保存资料' }}
                </button>
              </div>
              <p v-if="profileMessage" class="text-sm mt-3" :class="profileMessage.includes('失败') ? 'text-[var(--color-cinnabar)]' : 'text-[var(--color-sage)]'">{{ profileMessage }}</p>
            </div>

            <div class="w-full mt-8 pt-6 border-t border-[var(--color-paper-darker)]">
              <div class="flex items-center gap-2 mb-3 text-sm font-medium">
                <LockKeyhole :size="15" class="text-[var(--color-cinnabar)]" />
                <span>修改密码</span>
              </div>
              <div class="grid gap-3">
                <input
                  v-model="oldPassword"
                  type="password"
                  placeholder="当前密码"
                  class="w-full rounded-2xl border border-[var(--color-paper-darker)] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-cinnabar)] focus:ring-4 focus:ring-[color:var(--color-cinnabar-soft)] transition-all"
                />
                <input
                  v-model="newPassword"
                  type="password"
                  placeholder="新密码"
                  class="w-full rounded-2xl border border-[var(--color-paper-darker)] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-cinnabar)] focus:ring-4 focus:ring-[color:var(--color-cinnabar-soft)] transition-all"
                />
              </div>
              <div class="flex items-center justify-between mt-4">
                <button
                  @click="handleLogout"
                  class="px-4 py-2 rounded-xl border border-[var(--color-paper-darker)] text-sm hover:border-[var(--color-ink-muted)] transition-colors cursor-pointer"
                >
                  退出登录
                </button>
                <button
                  @click="handlePasswordChange"
                  :disabled="changingPassword"
                  class="px-4 py-2 rounded-xl bg-[var(--color-ink)] text-white text-sm hover:bg-[var(--color-cinnabar)] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {{ changingPassword ? '提交中...' : '更新密码' }}
                </button>
              </div>
              <p v-if="passwordMessage" class="text-sm mt-3" :class="passwordMessage.includes('失败') ? 'text-[var(--color-cinnabar)]' : 'text-[var(--color-sage)]'">{{ passwordMessage }}</p>
            </div>
          </div>
        </template>
      </section>

      <section class="rounded-[28px] border border-[var(--color-paper-darker)] bg-white p-6 md:p-7 shadow-[0_20px_70px_rgba(53,37,28,0.05)]">
        <div class="flex items-center justify-between gap-4 mb-6">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full border border-[var(--color-paper-darker)] bg-[var(--color-paper)] px-3 py-1 text-xs tracking-[0.16em] uppercase text-[var(--color-ink-muted)] mb-3">
              <FileText :size="13" />
              <span>My Threads</span>
            </div>
            <h2 class="text-2xl font-serif font-bold">我发的帖子</h2>
            <p class="text-sm text-[var(--color-ink-muted)] mt-1">在这里整理你发布过的话题，继续修改或清理旧内容。</p>
          </div>
        </div>

        <div v-if="loading" class="space-y-4">
          <div v-for="i in 4" :key="i" class="rounded-2xl border border-[var(--color-paper-darker)] p-5 animate-pulse">
            <div class="h-5 w-2/3 rounded bg-[var(--color-paper-dark)] mb-3"></div>
            <div class="h-4 w-full rounded bg-[var(--color-paper-dark)] mb-2"></div>
            <div class="h-4 w-1/3 rounded bg-[var(--color-paper-dark)]"></div>
          </div>
        </div>

        <template v-else-if="posts.length > 0">
          <div class="space-y-4">
            <article
              v-for="post in posts"
              :key="post.id"
              class="rounded-2xl border border-[var(--color-paper-darker)] p-5 hover:border-[var(--color-ink-muted)] transition-colors"
            >
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <div class="text-xs tracking-[0.16em] uppercase text-[var(--color-ink-muted)] mb-2">{{ post.board_name }}</div>
                  <h3 class="text-lg font-semibold leading-snug mb-2">{{ post.title }}</h3>
                  <p class="text-sm leading-7 text-[var(--color-ink-muted)] line-clamp-2">{{ post.summary }}</p>
                </div>
                <div class="text-xs text-[var(--color-ink-muted)] shrink-0">
                  更新于 {{ formatTime(post.updated_at || post.created_at) }}
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[var(--color-paper-dark)]">
                <div class="text-xs text-[var(--color-ink-muted)]">
                  <span class="mr-4">👍 {{ post.like_count }}</span>
                  <span>💬 {{ post.comment_count }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="router.push(`/post/${post.id}`)"
                    class="px-3 py-1.5 rounded-lg border border-[var(--color-paper-darker)] text-sm hover:border-[var(--color-ink-muted)] transition-colors cursor-pointer"
                  >
                    查看
                  </button>
                  <button
                    @click="router.push(`/post/${post.id}/edit`)"
                    class="px-3 py-1.5 rounded-lg border border-[var(--color-paper-darker)] text-sm hover:border-[var(--color-ink-muted)] transition-colors cursor-pointer"
                  >
                    编辑
                  </button>
                  <button
                    @click="handleDeletePost(post.id)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-cinnabar-soft)] text-[var(--color-cinnabar)] text-sm hover:bg-[var(--color-cinnabar)] hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 :size="13" />
                    <span>删除</span>
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div class="mt-8">
            <Pagination :page="page" :total="total" :page-size="pageSize" @change="page = $event; loadMyPosts()" />
          </div>
        </template>

        <div v-else class="rounded-3xl border border-dashed border-[var(--color-paper-darker)] bg-[var(--color-paper)] px-6 py-16 text-center">
          <p class="text-[var(--color-ink-muted)] mb-5">你还没有发过帖子，去分享第一个话题吧。</p>
          <button
            @click="router.push('/boards')"
            class="px-5 py-2.5 rounded-xl bg-[var(--color-ink)] text-white text-sm hover:bg-[var(--color-cinnabar)] transition-colors cursor-pointer"
          >
            去逛板块
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
