<script setup lang="ts">
import { ref } from 'vue';

const workflowStatus = ref<'idle' | 'running' | 'paused' | 'completed' | 'error'>('idle');
const workflows = ref<string[]>(['daily-sync', 'vault-backup', 'github-sync']);
const currentWorkflow = ref('daily-sync');
const executionLog = ref<string[]>([]);

async function startWorkflow() {
  workflowStatus.value = 'running';
  executionLog.value.push(`[${new Date().toLocaleTimeString()}] Starting workflow: ${currentWorkflow.value}`);
  
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `udo workflow run ${currentWorkflow.value}` })
    });
    
    const data = await response.json();
    
    if (data.success) {
      workflowStatus.value = 'completed';
      executionLog.value.push(`[${new Date().toLocaleTimeString()}] ✅ Workflow completed`);
      executionLog.value.push(`[${new Date().toLocaleTimeString()}] ${data.output}`);
    } else {
      workflowStatus.value = 'error';
      executionLog.value.push(`[${new Date().toLocaleTimeString()}] ❌ Error: ${data.error || 'Workflow failed'}`);
    }
  } catch (error) {
    workflowStatus.value = 'error';
    executionLog.value.push(`[${new Date().toLocaleTimeString()}] ❌ Error: ${error.message}`);
  }
}

async function pauseWorkflow() {
  workflowStatus.value = 'paused';
  executionLog.value.push(`[${new Date().toLocaleTimeString()}] Workflow paused`);
}

async function resumeWorkflow() {
  workflowStatus.value = 'running';
  executionLog.value.push(`[${new Date().toLocaleTimeString()}] Workflow resumed`);
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

async function createWorkflow() {
  const name = prompt('Enter workflow name:');
  if (!name) return;
  
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `udo workflow create ${name}` })
    });
    
    const data = await response.json();
    
    if (data.success) {
      workflows.value.push(name);
      alert(`Workflow created successfully:\n${data.output}`);
    } else {
      alert(`Failed to create workflow:\n${data.error}`);
    }
  } catch (error) {
    alert(`Failed to create workflow:\n${error.message}`);
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-cyan-400">🔄 Workflow Engine</h2>
      <div class="flex items-center space-x-2">
        <select v-model="currentWorkflow" class="bg-gray-700 text-white px-3 py-1 rounded text-sm">
          <option v-for="workflow in workflows" :key="workflow" :value="workflow">
            {{ workflow }}
          </option>
        </select>
        <button 
          @click="startWorkflow"
          :disabled="workflowStatus === 'running'"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600"
        >
          {{ workflowStatus === 'idle' || workflowStatus === 'paused' ? 'Start' : 'Running...' }}
        </button>
        <button 
          @click="pauseWorkflow"
          :disabled="workflowStatus !== 'running'"
          class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-600"
        >
          Pause
        </button>
        <button 
          @click="resumeWorkflow"
          :disabled="workflowStatus !== 'paused'"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600"
        >
          Resume
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
            'bg-gray-600 text-gray-300': workflowStatus === 'idle',
            'bg-blue-600 text-blue-100': workflowStatus === 'running',
            'bg-yellow-600 text-yellow-100': workflowStatus === 'paused',
            'bg-green-600 text-green-100': workflowStatus === 'completed',
            'bg-red-600 text-red-100': workflowStatus === 'error'
          }"
        >
          {{ workflowStatus.toUpperCase() }}
        </span>
      </div>
      <div v-if="workflowStatus === 'running'" class="text-sm text-gray-300">
        Executing: <span class="text-cyan-400">{{ currentWorkflow }}</span>
      </div>
    </div>
    
    <!-- Execution Log -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 flex-1">
      <h3 class="text-sm font-semibold text-gray-400 mb-3">EXECUTION LOG</h3>
      <div class="overflow-y-auto max-h-96">
        <div v-for="(log, index) in executionLog" :key="index" class="text-sm text-gray-300 mb-1">
          {{ log }}
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="grid grid-cols-2 gap-4">
      <button 
        @click="createWorkflow"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        ➕ Create Workflow
      </button>
      <button 
        @click="execCommand('udo workflow list')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        📋 List Workflows
      </button>
      <button 
        @click="execCommand('udo workflow history')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        📊 View History
      </button>
      <button 
        @click="execCommand('udo workflow help')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        ❓ Workflow Help
      </button>
    </div>
    
    <!-- Documentation -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-400 mb-3">WORKFLOW ENGINE COMMANDS</h3>
      <div class="text-sm text-gray-300 space-y-2">
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span><code class="bg-gray-700 px-1 rounded">workflow run</code> - Execute a workflow</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span><code class="bg-gray-700 px-1 rounded">workflow create</code> - Create new workflow</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span><code class="bg-gray-700 px-1 rounded">workflow list</code> - List available workflows</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span><code class="bg-gray-700 px-1 rounded">workflow history</code> - View execution history</span>
        </div>
      </div>
    </div>
  </div>
</template>
