<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from './components/AdminLayout.vue'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
</script>

<template>
  <AdminLayout v-if="!isLoginPage">
    <router-view />
  </AdminLayout>
  <router-view v-else />
</template>
