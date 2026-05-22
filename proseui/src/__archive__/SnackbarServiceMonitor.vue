<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface SnackbarService {
  name: string
  port: number
  host: string
  status: 'online' | 'offline' | 'unknown'
  type: 'local' | 'remote'
  description: string
}

const snackbarServices = ref<SnackbarService[]>([
  { name: 'GUI Dashboard', port: 5176, host: 'localhost', status: 'unknown', type: 'local', description: 'Vue dev server' },
  { name: 'API Server', port: 5175, host: 'localhost', status: 'unknown', type: 'local', description: 'REST API backend' },
  { name: 'USXD Express', port: 3000, host: 'localhost', status: 'unknown', type: 'local', description: 'Document renderer' },
  { name: 'Vite Dev Server', port: 5173, host: 'localhost', status: 'unknown', type: 'local', description: 'Frontend dev server' },
  { name: 'Snackbar Daemon', port: 0, host: 'linux-mint-server', status: 'unknown', type: 'remote', description: 'Snackbar orchestrator' },
])

const snackbarPollInterval = ref<ReturnType<typeof setInterval> | null>(null)
const snackbarLastCheck = ref<string>('never')

async function checkServiceHealth(svc: SnackbarService) {
  if (svc.type === 'remote') return
  try {
    const response = await fetch(`http://localhost:${svc.port}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    })
    svc.status = response.ok ? 'online' : 'offline'
  } catch {
    svc.status = 'offline'
  }
}

async function checkAllServices() {
  await Promise.all(snackbarServices.value.map(checkServiceHealth))
  snackbarLastCheck.value = new Date().toLocaleTimeString()
}

async function checkSnackbarRemote() {
  const snackbar = snackbarServices.value.find(s => s.name === 'Snackbar Daemon')
  if (!snackbar) return
  const ports = [5175, 8080, 9090, 3001]
  for (const port of ports) {
    try {
      const response = await fetch(`http://linux-mint-server:${port}/api/snackbar/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      })
      if (response.ok) {
        snackbar.port = port
        snackbar.status = 'online'
        return
      }
    } catch {}
  }
  snackbar.status = 'offline'
}

onMounted(() => {
  checkAllServices()
  checkSnackbarRemote()

  snackbarPollInterval.value = setInterval(() => {
    checkAllServices()
    checkSnackbarRemote()
  }, 30000)
})

onUnmounted(() => {
  if (snackbarPollInterval.value) {
    clearInterval(snackbarPollInterval.value)
  }
})
</script>

<template>
  <div class="snackbar-service-monitor">
    <div class="flex items-center justify-between px-2 mb-2">
      <h3 class="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
        <span class="material-symbols-outlined" style="font-size: 14px;">settings</span>
        Services
      </h3>
      <button @click="checkAllServices(); checkSnackbarRemote()" class="text-xs text-cyan-400 hover:text-cyan-300" title="Refresh services">
        <span class="material-symbols-outlined" style="font-size: 14px;">refresh</span>
      </button>
    </div>
    <div class="space-y-0.5 text-sm">
      <div v-for="svc in snackbarServices" :key="svc.name" class="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-700">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="{
            'bg-green-400': svc.status === 'online',
            'bg-red-400': svc.status === 'offline',
            'bg-gray-500': svc.status === 'unknown'
          }"></span>
          <span class="text-xs">{{ svc.name }}</span>
          <span v-if="svc.type === 'remote'" class="text-xs text-gray-500">
            <span class="material-symbols-outlined" style="font-size: 12px;">language</span>
          </span>
        </div>
        <span class="text-xs text-gray-500">{{ svc.port > 0 ? svc.port : '—' }}</span>
      </div>
    </div>
    <div class="px-2 mt-2">
      <span class="text-xs text-gray-600">Last: {{ snackbarLastCheck }}</span>
    </div>
  </div>
</template>
