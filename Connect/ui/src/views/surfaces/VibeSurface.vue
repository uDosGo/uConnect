<script setup lang="ts">
import { ref } from 'vue';

const vibeStatus = ref<'idle' | 'connecting' | 'active' | 'error'>('idle');
const model = ref('devstral-2');
const sessionLog = ref<string[]>([]);

async function startVibe() {
  vibeStatus.value = 'connecting';
  sessionLog.value.push(`[${new Date().toLocaleTimeString()}] Starting Vibe with model: ${model.value}`);
  
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `udo vibe --model ${model.value}` })
    });
    
    const data = await response.json();
    
    if (data.success) {
      vibeStatus.value = 'active';
      sessionLog.value.push(`[${new Date().toLocaleTimeString()}] Vibe connected successfully`);
      sessionLog.value.push(`[${new Date().toLocaleTimeString()}] ${data.output}`);
    } else {
      vibeStatus.value = 'error';
      sessionLog.value.push(`[${new Date().toLocaleTimeString()}] ❌ Error: ${data.error || 'Failed to start Vibe'}`);
    }
  } catch (error) {
    vibeStatus.value = 'error';
    sessionLog.value.push(`[${new Date().toLocaleTimeString()}] ❌ Error: ${error.message}`);
  }
}

async function stopVibe() {
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'udo vibe disconnect' })
    });
    
    const data = await response.json();
    vibeStatus.value = 'idle';
    sessionLog.value.push(`[${new Date().toLocaleTimeString()}] Vibe session ended`);
    if (data.output) sessionLog.value.push(`[${new Date().toLocaleTimeString()}] ${data.output}`);
  } catch (error) {
    vibeStatus.value = 'idle';
    sessionLog.value.push(`[${new Date().toLocaleTimeString()}] ❌ Error: ${error.message}`);
  }
}

async function sendCommand(cmd: string) {
  if (vibeStatus.value !== 'active') return;
  
  sessionLog.value.push(`[${new Date().toLocaleTimeString()}] > ${cmd}`);
  
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    });
    
    const data = await response.json();
    
    if (data.success) {
      sessionLog.value.push(`[${new Date().toLocaleTimeString()}] ✅ ${data.output}`);
    } else {
      sessionLog.value.push(`[${new Date().toLocaleTimeString()}] ❌ Error: ${data.error || 'Command failed'}`);
    }
  } catch (error) {
    sessionLog.value.push(`[${new Date().toLocaleTimeString()}] ❌ Error: ${error.message}`);
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-cyan-400">🌀 Vibe TUI Surface</h2>
      <div class="flex items-center space-x-2">
        <select v-model="model" class="bg-gray-700 text-white px-3 py-1 rounded text-sm">
          <option value="devstral-2">devstral-2</option>
          <option value="mistral-large">mistral-large</option>
          <option value="claude-3-opus">claude-3-opus</option>
        </select>
        <button 
          @click="startVibe" 
          :disabled="vibeStatus === 'connecting' || vibeStatus === 'active'"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600"
        >
          Connect
        </button>
        <button 
          @click="stopVibe"
          :disabled="vibeStatus !== 'active'"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-600"
        >
          Disconnect
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
            'bg-gray-600 text-gray-300': vibeStatus === 'idle',
            'bg-yellow-600 text-yellow-100': vibeStatus === 'connecting',
            'bg-green-600 text-green-100': vibeStatus === 'active',
            'bg-red-600 text-red-100': vibeStatus === 'error'
          }"
        >
          {{ vibeStatus.toUpperCase() }}
        </span>
      </div>
      <div v-if="vibeStatus === 'active'" class="text-sm text-gray-300">
        Connected to: <span class="text-cyan-400">{{ model }}</span>
      </div>
    </div>
    
    <!-- Command Input -->
    <div v-if="vibeStatus === 'active'" class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div class="flex space-x-2">
        <input 
          type="text"
          placeholder="Enter command..."
          class="flex-1 bg-gray-700 text-white px-3 py-2 rounded border-none focus:ring-2 focus:ring-cyan-400"
          @keyup.enter="(e) => sendCommand((e.target as HTMLInputElement).value)"
        >
        <button 
          @click="sendCommand('udo status')"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Status
        </button>
        <button 
          @click="sendCommand('udo list')"
          class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          List
        </button>
      </div>
    </div>
    
    <!-- Session Log -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 flex-1">
      <h3 class="text-sm font-semibold text-gray-400 mb-3">SESSION LOG</h3>
      <div class="overflow-y-auto max-h-96">
        <div v-for="(log, index) in sessionLog" :key="index" class="text-sm text-gray-300 mb-1">
          {{ log }}
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="grid grid-cols-2 gap-4">
      <button 
        @click="sendCommand('udo vibe --model mistral-large')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        🔄 Switch to mistral-large
      </button>
      <button 
        @click="sendCommand('udo gui demos')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        🎨 Show USXD Demos
      </button>
      <button 
        @click="sendCommand('udo publish preview')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        📄 Publish Preview
      </button>
      <button 
        @click="sendCommand('udo usxd serve')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        🌐 USXD Server
      </button>
    </div>
  </div>
</template>
