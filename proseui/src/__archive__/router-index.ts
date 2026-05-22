import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/surface/ucode2',
  },
  {
    path: '/surface',
    component: () => import('../views/surfaces/ProseSurfaceManager.vue'),
    children: [
      {
        path: 'ucode2reasoning',
        component: () => import('../views/surfaces/uCode2ReasoningSurface.vue'),
        meta: { title: 'uCode2 Reasoning' },
      },
      {
        path: 'ucode2',
        component: () => import('../views/surfaces/uCode2Surface.vue'),
        meta: { title: 'uCode2 Publish' },
      },
      {
        path: 'proseui',
        component: () => import('../views/surfaces/proseui/ProseUISurface.vue'),
        meta: { title: 'ProseUI Document' },
      },
      {
        path: 'vibe',
        component: () => import('../views/surfaces/VibeTUI.vue'),
        meta: { title: 'Vibe TUI' },
      },
      {
        path: 'vault',
        component: () => import('../views/surfaces/VaultSurface.vue'),
        meta: { title: 'Vault Browser' },
      },
      {
        path: 'workflow',
        component: () => import('../views/surfaces/WorkflowSurface.vue'),
        meta: { title: 'Task/Workflow Board' },
      },
      {
        path: 'tools',
        component: () => import('../views/surfaces/ToolRegistrySurface.vue'),
        meta: { title: 'Tool Builder' },
      },
      {
        path: 'usxd',
        component: () => import('../views/surfaces/VibeTUI.vue'),
        meta: { title: 'USXD Renderer' },
      },
      {
        path: 'github',
        component: () => import('../views/surfaces/GitHubSurface.vue'),
        meta: { title: 'GitHub Sync' },
      },
      {
        path: 'wordpress',
        component: () => import('../views/surfaces/WordPressSurface.vue'),
        meta: { title: 'WordPress Adaptor' },
      },
      {
        path: 'dev',
        component: () => import('../views/surfaces/DevModeSurface.vue'),
        meta: { title: 'Dev Dashboard' },
      },
      {
        path: 'settings',
        component: () => import('../views/surfaces/SettingsSurface.vue'),
        meta: { title: 'Settings' },
      },
    ],
  },

  {
    path: '/:catchAll(.*)',
    redirect: '/surface/ucode2',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guards
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `proseui - ${to.meta.title}`
  } else {
    document.title = 'proseui'
  }
  next()
})

export default router
