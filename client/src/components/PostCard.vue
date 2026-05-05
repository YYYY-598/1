<script setup lang="ts">
import { computed } from 'vue'
import { Heart } from 'lucide-vue-next'

const props = defineProps<{
  id: number
  title: string
  summary: string
  username: string
  avatarUrl?: string
  coverUrl?: string
  images?: string[]
  likeCount: number
  commentCount: number
  createdAt: string
}>()

const coverUrl = computed(() => {
  return props.coverUrl || props.images?.[0] || ''
})

const initial = computed(() => props.username.charAt(0).toUpperCase())
</script>

<template>
  <router-link
    :to="`/post/${id}`"
    class="group mb-5 block break-inside-avoid"
  >
    <div v-if="coverUrl" class="overflow-hidden rounded-2xl bg-[#f6f6f6]">
      <img
        :src="coverUrl"
        :alt="title"
        class="w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    </div>
    <div class="px-1.5 pt-2.5">
      <h3 class="line-clamp-2 text-[15px] leading-6 text-[#111]">{{ title }}</h3>
      <p class="line-clamp-1 text-xs leading-5 text-[#999]">{{ summary }}</p>
      <div class="mt-2 flex items-center justify-between text-xs text-[#777]">
        <div class="flex min-w-0 items-center gap-1.5">
          <span class="grid h-5 w-5 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f2f2f2] text-[10px] font-semibold text-[#ff2442]">
            <img v-if="avatarUrl" :src="avatarUrl" :alt="username" class="h-full w-full object-cover" />
            <span v-else>{{ initial }}</span>
          </span>
          <span class="truncate">{{ username }}</span>
        </div>
        <span class="flex shrink-0 items-center gap-1">
          <Heart :size="14" />
          {{ likeCount }}
        </span>
      </div>
    </div>
  </router-link>
</template>
