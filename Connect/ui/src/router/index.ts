import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import GUISurfaceManager from '../views/surfaces/GUISurfaceManager.vue'
import VibeSurface from '../views/surfaces/VibeSurface.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/surface/vibe',
  },
  {
    path: '/surface',
    component: GUISurfaceManager,
    children: [
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
        meta: { title: 'Dev Mode Dashboard' },
      },
      {
        path: 'browser',
        component: () => import('../views/surfaces/BrowserSurface.vue'),
        meta: { title: 'Browser Surface' },
      },
      {
        path: 'story',
        component: () => import('../views/surfaces/StorySurface.vue'),
        meta: { title: 'Story Surface' },
      },
      {
        path: 'tools',
        component: () => import('../views/surfaces/ToolRegistrySurface.vue'),
        meta: { title: 'MCP Tool Registry' },
      },
      {
        path: 'dev-dashboard',
        component: () => import('../views/surfaces/DevModeDashboard.vue'),
        meta: { title: 'Dev Mode Dashboard' },
      },
      {
        path: 'react-renderer',
        component: () => import('../views/surfaces/ReactRenderer.vue'),
        meta: { title: 'React Renderer' },
      },
    ],
  },

  {
    path: '/:catchAll(.*)',
    redirect: '/surface/vibe',
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
