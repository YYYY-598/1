import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/boards',
      name: 'boards',
      component: () => import('../views/BoardListView.vue'),
    },
    {
      path: '/board/:boardId',
      name: 'board',
      component: () => import('../views/PostListView.vue'),
    },
    {
      path: '/board/:boardId/new',
      name: 'create-post',
      component: () => import('../views/CreatePostView.vue'),
    },
    {
      path: '/post/:postId/edit',
      name: 'edit-post',
      component: () => import('../views/EditPostView.vue'),
    },
    {
      path: '/post/:postId',
      name: 'post',
      component: () => import('../views/PostDetailView.vue'),
    },
    {
      path: '/me',
      name: 'me',
      component: () => import('../views/MeView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/boards',
    },
  ],
})

export default router
