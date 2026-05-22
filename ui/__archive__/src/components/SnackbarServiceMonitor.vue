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

async function snackbarExec(cmd: string): Promise<string> {
  const snackbar = snackbarServices.value.find(s => s.name === 'Snackbar Daemon')
  if (!snackbar || snackbar.status !== 'online') {
    return '⚠️ Snackbar not reachable. Try starting it on linux-mint-server.'
  }
  try {
    const response = await fetch(`http://linux-mint-server:${snackbar.port}/api/snackbar/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd }),
      signal: AbortSignal.timeout(5000)
    })
    if (response.ok) {
      const data = await response.json()
      return data.output || '✅ Command sent to snackbar'
    }
    return '❌ Snackbar command failed'
  } catch {
    return '❌ Could not reach snackbar'
  }
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
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
        Services
      </h3>
      <button @click="checkAllServices(); checkSnackbarRemote()" class="text-xs text-cyan-400 hover:text-cyan-300" title="Refresh services">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
        </svg>
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
            <svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
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
