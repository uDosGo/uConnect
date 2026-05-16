import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import GUISurfaceManager from '../views/surfaces/GUISurfaceManager.vue'
import VibeSurface from '../views/surfaces/VibeSurface.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/surface/ucode1',
  },
  {
    path: '/surface',
    component: GUISurfaceManager,
    children: [
      {
        path: 'ucode1teledesk',
        component: () => import('../views/surfaces/uCode1TeledeskSurface.vue'),
        meta: { title: 'uCode1 Teledesk' },
      },
      {
        path: 'ucode1',
        component: () => import('../views/surfaces/uCode1Surface.vue'),
        meta: { title: 'uCode1 Terminal' },
      },
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
        path: 'dashboard',
        component: () => import('../views/surfaces/NESClassicSurface.vue'),
        meta: { title: 'Dashboard' },
      },
      {
        path: 'vibe',
        component: VibeSurface,
        meta: { title: 'Vibe TUI' },
      },
      {
        path: 'vault',
        component: () => import('../views/surfaces/VaultSurface.vue'),
        meta: { title: 'Vault Browser' },
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
        path: 'usxd',
        component: () => import('../views/surfaces/USXDSurface.vue'),
        meta: { title: 'USXD Renderer' },
      },
      {
        path: 'workflow',
        component: () => import('../views/surfaces/WorkflowSurface.vue'),
        meta: { title: 'Workflow Engine' },
      },
      {
        path: 'mcp',
        component: () => import('../views/surfaces/MCPSurface.vue'),
        meta: { title: 'MCP Bridge' },
      },
      {
        path: 'demos',
        component: () => import('../views/surfaces/DemosSurface.vue'),
        meta: { title: 'Demo Surfaces' },
      },
      {
        path: 'dev',
        component: () => import('../views/surfaces/DevModeSurface.vue'),
        meta: { title: 'Dev Dashboard' },
      },
      {
        path: 'browser',
        component: () => import('../views/surfaces/BrowserSurface.vue'),
        meta: { title: 'Browser Surface' },
      },
      {
        path: 'tools',
        component: () => import('../views/surfaces/ToolRegistrySurface.vue'),
        meta: { title: 'MCP Tool Registry' },
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
    redirect: '/surface/ucode1',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guards
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `uDosConnect - ${to.meta.title}`
  } else {
    document.title = 'uDosConnect'
  }
  next()
})

export default router
