<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'

const route = useRoute()
const isAuthPage = computed(() => route.path === '/login' || route.path === '/register')
</script>

<template>
  <div class="min-h-screen">
    <NavBar />
    <main :class="isAuthPage ? '' : 'pt-28 lg:pl-[260px]'">
      <router-view />
    </main>
  </div>
</template>
