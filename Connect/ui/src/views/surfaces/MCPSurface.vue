<script setup lang="ts">
import { ref } from 'vue';

const mcpStatus = ref<'idle' | 'connecting' | 'connected' | 'error'>('idle');
const currentModel = ref('devstral-2');
const contextLog = ref<string[]>([]);

async function connectMCP() {
  mcpStatus.value = 'connecting';
  contextLog.value.push(`[${new Date().toLocaleTimeString()}] Connecting to MCP with model: ${currentModel.value}`);
  
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `udo mcp connect --model ${currentModel.value}` })
    });
    
    const data = await response.json();
    
    if (data.success) {
      mcpStatus.value = 'connected';
      contextLog.value.push(`[${new Date().toLocaleTimeString()}] ✅ MCP connected successfully`);
      contextLog.value.push(`[${new Date().toLocaleTimeString()}] ${data.output}`);
    } else {
      mcpStatus.value = 'error';
      contextLog.value.push(`[${new Date().toLocaleTimeString()}] ❌ Error: ${data.error || 'Failed to connect'}`);
    }
  } catch (error) {
    mcpStatus.value = 'error';
    contextLog.value.push(`[${new Date().toLocaleTimeString()}] ❌ Error: ${error.message}`);
  }
}

async function disconnectMCP() {
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'udo mcp disconnect' })
    });
    
    const data = await response.json();
    mcpStatus.value = 'idle';
    contextLog.value.push(`[${new Date().toLocaleTimeString()}] MCP disconnected`);
    if (data.output) contextLog.value.push(`[${new Date().toLocaleTimeString()}] ${data.output}`);
  } catch (error) {
    mcpStatus.value = 'idle';
    contextLog.value.push(`[${new Date().toLocaleTimeString()}] ❌ Error: ${error.message}`);
  }
}

async function sendContext(cmd: string) {
  if (mcpStatus.value !== 'connected') return;
  
  contextLog.value.push(`[${new Date().toLocaleTimeString()}] > ${cmd}`);
  
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `udo mcp send "${cmd}"` })
    });
    
    const data = await response.json();
    
    if (data.success) {
      contextLog.value.push(`[${new Date().toLocaleTimeString()}] ✅ Context sent`);
      contextLog.value.push(`[${new Date().toLocaleTimeString()}] ${data.output}`);
    } else {
      contextLog.value.push(`[${new Date().toLocaleTimeString()}] ❌ Error: ${data.error || 'Failed to send context'}`);
    }
  } catch (error) {
    contextLog.value.push(`[${new Date().toLocaleTimeString()}] ❌ Error: ${error.message}`);
  }
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
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-cyan-400">🌐 MCP Bridge Surface</h2>
      <div class="flex items-center space-x-2">
        <select v-model="currentModel" class="bg-gray-700 text-white px-3 py-1 rounded text-sm">
          <option value="devstral-2">devstral-2</option>
          <option value="mistral-large">mistral-large</option>
          <option value="claude-3-opus">claude-3-opus</option>
        </select>
        <button 
          @click="connectMCP" 
          :disabled="mcpStatus === 'connecting' || mcpStatus === 'connected'"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600"
        >
          Connect
        </button>
        <button 
          @click="disconnectMCP"
          :disabled="mcpStatus !== 'connected'"
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
            'bg-gray-600 text-gray-300': mcpStatus === 'idle',
            'bg-yellow-600 text-yellow-100': mcpStatus === 'connecting',
            'bg-green-600 text-green-100': mcpStatus === 'connected',
            'bg-red-600 text-red-100': mcpStatus === 'error'
          }"
        >
          {{ mcpStatus.toUpperCase() }}
        </span>
      </div>
      <div v-if="mcpStatus === 'connected'" class="text-sm text-gray-300">
        Connected to: <span class="text-cyan-400">{{ currentModel }}</span>
      </div>
    </div>
    
    <!-- Context Input -->
    <div v-if="mcpStatus === 'connected'" class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div class="flex space-x-2">
        <input 
          type="text"
          placeholder="Enter context..."
          class="flex-1 bg-gray-700 text-white px-3 py-2 rounded border-none focus:ring-2 focus:ring-cyan-400"
          @keyup.enter="(e) => sendContext((e.target as HTMLInputElement).value)"
        >
        <button 
          @click="sendContext('status check')"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Status
        </button>
        <button 
          @click="sendContext('context update')"
          class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Update
        </button>
      </div>
    </div>
    
    <!-- Context Log -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 flex-1">
      <h3 class="text-sm font-semibold text-gray-400 mb-3">CONTEXT LOG</h3>
      <div class="overflow-y-auto max-h-96">
        <div v-for="(log, index) in contextLog" :key="index" class="text-sm text-gray-300 mb-1">
          {{ log }}
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="grid grid-cols-2 gap-4">
      <button 
        @click="execCommand('udo mcp status')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        📊 MCP Status
      </button>
      <button 
        @click="execCommand('udo mcp reset')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        🔄 Reset Context
      </button>
      <button 
        @click="execCommand('udo mcp models')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        🤖 List Models
      </button>
      <button 
        @click="execCommand('udo mcp help')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        ❓ MCP Help
      </button>
    </div>
    
    <!-- Documentation -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-400 mb-3">MCP BRIDGE COMMANDS</h3>
      <div class="text-sm text-gray-300 space-y-2">
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span><code class="bg-gray-700 px-1 rounded">mcp connect</code> - Connect to MCP bridge</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span><code class="bg-gray-700 px-1 rounded">mcp send</code> - Send context to MCP</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span><code class="bg-gray-700 px-1 rounded">mcp status</code> - Check MCP status</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span><code class="bg-gray-700 px-1 rounded">mcp reset</code> - Reset MCP context</span>
        </div>
      </div>
    </div>
  </div>
</template>
