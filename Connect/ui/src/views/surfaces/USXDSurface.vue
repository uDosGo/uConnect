<script setup lang="ts">
import { ref } from 'vue';

const usxdStatus = ref<'stopped' | 'starting' | 'running' | 'error'>('stopped');
const currentSurface = ref('teletext-console');
const surfaces = ref<string[]>(['teletext-console', 'github-theme', 'nes-classic']);

async function startUSXD() {
  usxdStatus.value = 'starting';
  
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'udo usxd serve --dir surfaces' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      usxdStatus.value = 'running';
    } else {
      usxdStatus.value = 'error';
      alert(`Failed to start USXD: ${data.error}`);
    }
  } catch (error) {
    usxdStatus.value = 'error';
    alert(`Failed to start USXD: ${error.message}`);
  }
}

async function stopUSXD() {
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'pkill -f "usxd serve"' })
    });
    
    usxdStatus.value = 'stopped';
  } catch (error) {
    alert(`Failed to stop USXD: ${error.message}`);
  }
}

function openSurface() {
  window.open(`http://localhost:3000/surface/${currentSurface.value}`, '_blank');
}

async function execCommand(cmd: string) {
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(`Command executed successfully:\n${data.output}`);
    } else {
      alert(`Command failed:\n${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    alert(`Command failed:\n${error.message}`);
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-cyan-400">🎨 USXD Express Surface</h2>
      <div class="flex items-center space-x-2">
        <button 
          @click="startUSXD"
          :disabled="usxdStatus === 'starting' || usxdStatus === 'running'"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600"
        >
          {{ usxdStatus === 'stopped' ? 'Start Server' : 'Starting...' }}
        </button>
        <button 
          @click="stopUSXD"
          :disabled="usxdStatus !== 'running'"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-600"
        >
          Stop Server
        </button>
        <button 
          @click="openSurface"
          :disabled="usxdStatus !== 'running'"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600"
        >
          Open Surface
        </button>
      </div>
    </div>
    
    <!-- Status -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div class="flex items-center space-x-2 mb-2">
        <span class="text-gray-400">Status:</span>
        <span 
          class="px-2 py-1 rounded text-xs font-semibold"
          :class="{
            'bg-gray-600 text-gray-300': usxdStatus === 'stopped',
            'bg-yellow-600 text-yellow-100': usxdStatus === 'starting',
            'bg-green-600 text-green-100': usxdStatus === 'running',
            'bg-red-600 text-red-100': usxdStatus === 'error'
          }"
        >
          {{ usxdStatus.toUpperCase() }}
        </span>
      </div>
      <div v-if="usxdStatus === 'running'" class="text-sm text-gray-300">
        Server running on <a href="http://localhost:3000" target="_blank" class="text-cyan-400 hover:underline">http://localhost:3000</a>
      </div>
    </div>
    
    <!-- Surface Selector -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-400 mb-3">SELECT SURFACE</h3>
      <div class="flex items-center space-x-2">
        <select v-model="currentSurface" class="flex-1 bg-gray-700 text-white px-3 py-2 rounded">
          <option v-for="surface in surfaces" :key="surface" :value="surface">
            {{ surface }}
          </option>
        </select>
        <button 
          @click="openSurface"
          :disabled="usxdStatus !== 'running'"
          class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-600"
        >
          Open
        </button>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="grid grid-cols-2 gap-4">
      <button 
        @click="execCommand('udo usxd serve --dir surfaces')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        🚀 Start USXD Server
      </button>
      <button 
        @click="execCommand('udo usxd list')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        📋 List Surfaces
      </button>
      <button 
        @click="execCommand('udo usxd export')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        📤 Export Surfaces
      </button>
      <button 
        @click="execCommand('udo usxd validate')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        ✅ Validate Surfaces
      </button>
    </div>
    
    <!-- Documentation -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-400 mb-3">USXD EXPRESS COMMANDS</h3>
      <div class="text-sm text-gray-300 space-y-2">
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span><code class="bg-gray-700 px-1 rounded">usxd-express serve</code> - Preview server with live reload</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span><code class="bg-gray-700 px-1 rounded">usxd-express export</code> - Export static HTML</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span><code class="bg-gray-700 px-1 rounded">usxd-express render</code> - Terminal render</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span><code class="bg-gray-700 px-1 rounded">usxd-express validate</code> - Check USXD syntax</span>
        </div>
      </div>
      
      <div class="mt-4 pt-2 border-t border-gray-700">
        <div class="text-xs text-gray-400 mb-1">DEFAULT SURFACES:</div>
        <div class="text-sm text-gray-300">
          <a href="http://localhost:3000/surface/teletext-console" target="_blank" class="text-cyan-400 hover:underline">
            teletext-console
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
