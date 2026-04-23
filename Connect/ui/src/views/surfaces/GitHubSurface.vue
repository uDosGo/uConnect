<script setup lang="ts">
import { ref } from 'vue';

const repoStatus = ref<'idle' | 'syncing' | 'synced' | 'error'>('idle');
const branches = ref<string[]>(['main', 'dev', 'feature/vibe-integration']);
const currentBranch = ref('main');
const commits = ref<{message: string; author: string; date: string}[]>([]);

async function syncRepo() {
  repoStatus.value = 'syncing';
  
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'udo github sync' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      repoStatus.value = 'synced';
      commits.value = [
        { message: 'Add Vibe integration', author: 'fredbook', date: '2026-04-17' },
        { message: 'Update GUI launcher', author: 'fredbook', date: '2026-04-16' },
        { message: 'Fix Tailwind config', author: 'fredbook', date: '2026-04-15' },
      ];
    } else {
      repoStatus.value = 'error';
      alert(`Sync failed: ${data.error}`);
    }
  } catch (error) {
    repoStatus.value = 'error';
    alert(`Sync failed: ${error.message}`);
  }
}

async function pullRequest() {
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'udo github pr create' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(`Pull request created successfully:\n${data.output}`);
    } else {
      alert(`Failed to create pull request:\n${data.error}`);
    }
  } catch (error) {
    alert(`Failed to create pull request:\n${error.message}`);
  }
}

async function checkoutBranch(branch: string) {
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `udo github checkout ${branch}` })
    });
    
    const data = await response.json();
    
    if (data.success) {
      currentBranch.value = branch;
    } else {
      alert(`Failed to checkout branch:\n${data.error}`);
    }
  } catch (error) {
    alert(`Failed to checkout branch:\n${error.message}`);
  }
}

async function pushChanges() {
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'udo github push' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(`Changes pushed successfully:\n${data.output}`);
    } else {
      alert(`Failed to push changes:\n${data.error}`);
    }
  } catch (error) {
    alert(`Failed to push changes:\n${error.message}`);
  }
}

async function pullUpdates() {
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'udo github pull' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(`Updates pulled successfully:\n${data.output}`);
    } else {
      alert(`Failed to pull updates:\n${data.error}`);
    }
  } catch (error) {
    alert(`Failed to pull updates:\n${error.message}`);
  }
}

async function createBranch() {
  const branchName = prompt('Enter new branch name:');
  if (!branchName) return;
  
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `udo github branch ${branchName}` })
    });
    
    const data = await response.json();
    
    if (data.success) {
      branches.value.push(branchName);
      alert(`Branch created successfully:\n${data.output}`);
    } else {
      alert(`Failed to create branch:\n${data.error}`);
    }
  } catch (error) {
    alert(`Failed to create branch:\n${error.message}`);
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-cyan-400">🌐 GitHub Sync</h2>
      <div class="flex items-center space-x-2">
        <button 
          @click="syncRepo"
          :disabled="repoStatus === 'syncing'"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600"
        >
          {{ repoStatus === 'syncing' ? 'Syncing...' : 'Sync Now' }}
        </button>
        <button 
          @click="pullRequest"
          class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Create PR
        </button>
      </div>
    </div>
    
    <!-- Status -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div class="flex items-center space-x-2 mb-2">
        <span class="text-gray-400">Branch:</span>
        <select v-model="currentBranch" @change="checkoutBranch(currentBranch)" class="bg-gray-700 text-white px-2 py-1 rounded text-sm">
          <option v-for="branch in branches" :key="branch" :value="branch">
            {{ branch }}
          </option>
        </select>
        <span 
          class="px-2 py-1 rounded text-xs font-semibold"
          :class="{
            'bg-gray-600 text-gray-300': repoStatus === 'idle',
            'bg-yellow-600 text-yellow-100': repoStatus === 'syncing',
            'bg-green-600 text-green-100': repoStatus === 'synced',
            'bg-red-600 text-red-100': repoStatus === 'error'
          }"
        >
          {{ repoStatus.toUpperCase() }}
        </span>
      </div>
    </div>
    
    <!-- Recent Commits -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-400 mb-3">RECENT COMMITS</h3>
      <div v-if="commits.length === 0" class="text-gray-400 text-center py-4">
        No commits yet. Sync to fetch latest changes.
      </div>
      <div v-else class="space-y-3">
        <div v-for="(commit, index) in commits" :key="index" class="p-3 bg-gray-700 rounded">
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-xs font-bold">
              {{ commit.author[0].toUpperCase() }}
            </div>
            <div class="flex-1">
              <div class="text-sm text-gray-300">{{ commit.message }}</div>
              <div class="text-xs text-gray-400 mt-1">
                {{ commit.author }} • {{ commit.date }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="grid grid-cols-2 gap-4">
      <button @click="pushChanges" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left">
        📤 Push Changes
      </button>
      <button @click="pullUpdates" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left">
        📥 Pull Updates
      </button>
      <button @click="createBranch" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left">
        🌿 Create Branch
      </button>
      <button class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left">
        🔖 View Issues
      </button>
    </div>
  </div>
</template>
