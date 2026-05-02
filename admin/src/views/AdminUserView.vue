<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUsers, banUser, type User } from '../api/admin'
import { ShieldBan, ShieldCheck, Users } from 'lucide-vue-next'

const users = ref<User[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await getUsers(page.value, pageSize)
    users.value = res.data.items
    total.value = res.data.total
  } catch { /* ignore */ } finally { loading.value = false }
}

async function handleToggleBan(user: User) {
  const action = user.is_banned ? '解封' : '封禁'
  if (!confirm(`确定${action}用户「${user.username}」？`)) return
  try {
    await banUser(user.id, !user.is_banned)
    user.is_banned = !user.is_banned
  } catch { /* ignore */ }
}

function changePage(p: number) { page.value = p; load() }

onMounted(() => load())
</script>

<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-2xl font-serif font-bold mb-1">用户管理</h1>
      <p class="text-sm text-[var(--color-ink-muted)]">管理论坛用户，共 {{ total }} 人</p>
    </div>

    <div class="bg-white rounded-xl border border-[var(--color-paper-darker)] overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-[var(--color-paper-dark)] text-left text-[var(--color-ink-muted)]">
            <th class="px-6 py-3 font-medium">用户名</th>
            <th class="px-6 py-3 font-medium">邮箱</th>
            <th class="px-6 py-3 font-medium">角色</th>
            <th class="px-6 py-3 font-medium">状态</th>
            <th class="px-6 py-3 font-medium">注册时间</th>
            <th class="px-6 py-3 font-medium w-24">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" v-for="i in 5" :key="i" class="border-b border-[var(--color-paper-dark)] last:border-0 animate-pulse">
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-16"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-32"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-12"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-12"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-24"></div></td>
            <td class="px-6 py-3.5"><div class="h-4 bg-[var(--color-paper-dark)] rounded w-16"></div></td>
          </tr>
          <tr
            v-for="user in users"
            :key="user.id"
            class="border-b border-[var(--color-paper-dark)] last:border-0 hover:bg-[var(--color-paper)] transition-colors"
          >
            <td class="px-6 py-3.5 font-medium">{{ user.username }}</td>
            <td class="px-6 py-3.5 text-[var(--color-ink-muted)]">{{ user.email }}</td>
            <td class="px-6 py-3.5">
              <span
                class="px-2 py-0.5 rounded text-xs"
                :class="user.role === 'admin' ? 'bg-[var(--color-ink)] text-white' : 'bg-[var(--color-paper-dark)]'"
              >
                {{ user.role === 'admin' ? '管理员' : '用户' }}
              </span>
            </td>
            <td class="px-6 py-3.5">
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                :class="user.is_banned ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'"
              >
                <ShieldCheck v-if="!user.is_banned" :size="12" />
                <ShieldBan v-else :size="12" />
                {{ user.is_banned ? '已封禁' : '正常' }}
              </span>
            </td>
            <td class="px-6 py-3.5 text-[var(--color-ink-muted)]">{{ new Date(user.created_at).toLocaleDateString('zh-CN') }}</td>
            <td class="px-6 py-3.5">
              <button
                @click="handleToggleBan(user)"
                class="px-3 py-1 text-xs rounded-md border transition-colors cursor-pointer"
                :class="user.is_banned
                  ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  : 'border-red-200 text-red-600 hover:bg-red-50'"
              >
                {{ user.is_banned ? '解封' : '封禁' }}
              </button>
            </td>
          </tr>
          <tr v-if="!loading && users.length === 0">
            <td colspan="6" class="px-6 py-16 text-center text-[var(--color-ink-muted)]">
              <Users :size="32" class="mx-auto mb-3 text-[var(--color-paper-darker)]" />
              暂无用户
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
