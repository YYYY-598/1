import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/AdminLoginView.vue'),
    },
    {
      path: '/boards',
      name: 'boards',
      component: () => import('../views/AdminBoardView.vue'),
    },
    {
      path: '/posts',
      name: 'posts',
      component: () => import('../views/AdminPostView.vue'),
    },
    {
      path: '/comments',
      name: 'comments',
      component: () => import('../views/AdminCommentView.vue'),
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/AdminUserView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/boards',
    },
  ],
})

router.beforeEach((to, from) => {
  const token = localStorage.getItem('admin_token')
  const user = localStorage.getItem('admin_user')
  if (to.path !== '/login' && (!token || !user)) {
    return '/login'
  }
  if (to.path === '/login' && token && user) {
    try {
      const u = JSON.parse(user)
      if (u.role === 'admin') return '/boards'
    } catch { /* pass */ }
  }
})

export default router
