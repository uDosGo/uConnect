<script setup lang="ts">
import { ref } from 'vue';

const demos = ref([
  {
    name: 'Teletext Console',
    description: 'Retro teletext-style console interface',
    url: '/surface/teletext-console',
    preview: '/images/demo-teletext.png'
  },
  {
    name: 'GitHub Theme',
    description: 'GitHub-inspired dark theme with cyan accents',
    url: '/surface/github-theme',
    preview: '/images/demo-github.png'
  },
  {
    name: 'NES Classic',
    description: 'Nintendo Entertainment System retro theme',
    url: '/surface/nes-classic',
    preview: '/images/demo-nes.png'
  },
  {
    name: 'Bedstead Modern',
    description: 'Clean modern interface design',
    url: '/surface/bedstead-modern',
    preview: '/images/demo-bedstead.png'
  },
  {
    name: 'C64 Retro',
    description: 'Commodore 64 inspired theme',
    url: '/surface/c64-retro',
    preview: '/images/demo-c64.png'
  },
  {
    name: 'Wireframe',
    description: 'Minimal wireframe design',
    url: '/surface/wireframe',
    preview: '/images/demo-wireframe.png'
  }
]);

async function startDemoServer() {
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'udo usxd serve --dir surfaces' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Demo server started successfully!\n' + data.output);
    } else {
      alert('Failed to start demo server:\n' + data.error);
    }
  } catch (error) {
    alert('Failed to start demo server:\n' + error.message);
  }
}

async function listSurfaces() {
  try {
    const response = await fetch('http://localhost:5175/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'udo usxd list' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Available surfaces:\n' + data.output);
    } else {
      alert('Failed to list surfaces:\n' + data.error);
    }
  } catch (error) {
    alert('Failed to list surfaces:\n' + error.message);
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-cyan-400">🎨 Demo Surfaces</h2>
      <div class="flex items-center space-x-2">
        <button 
          @click="startDemoServer"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          🚀 Start Demo Server
        </button>
        <button 
          @click="listSurfaces"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          📋 List Surfaces
        </button>
      </div>
    </div>
    
    <!-- Demo Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="demo in demos"
        :key="demo.name"
        class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-cyan-400 transition-colors"
      >
        <div class="h-48 bg-gray-700 flex items-center justify-center">
          <span class="text-gray-400">Preview: {{ demo.name }}</span>
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-white mb-2">{{ demo.name }}</h3>
          <p class="text-sm text-gray-400 mb-3">{{ demo.description }}</p>
          <a 
            :href="demo.url"
            target="_blank"
            class="inline-block px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 text-sm"
          >
            Open Demo →
          </a>
        </div>
      </div>
    </div>
    
    <!-- Documentation -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-400 mb-3">DEMO SURFACES</h3>
      <div class="text-sm text-gray-300 space-y-2">
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span>Click "Start Demo Server" to launch the USXD express server</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span>Use "List Surfaces" to see all available demo surfaces</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span>Click on any demo card to open it in a new tab</span>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-cyan-400">•</span>
          <span>The server runs on <code class="bg-gray-700 px-1 rounded">http://localhost:3000</code></span>
        </div>
      </div>
      
      <div class="mt-4 pt-2 border-t border-gray-700">
        <div class="text-xs text-gray-400 mb-1">BUILT-IN SURFACES (local):</div>
        <div class="text-sm text-gray-300 space-x-2">
          <router-link to="/surface/teletext-console" class="text-cyan-400 hover:underline">
            teletext-console
          </router-link>
          <router-link to="/surface/github-theme" class="text-cyan-400 hover:underline">
            github-theme
          </router-link>
          <router-link to="/surface/nes-classic" class="text-cyan-400 hover:underline">
            nes-classic
          </router-link>
          <router-link to="/surface/bedstead-modern" class="text-cyan-400 hover:underline">
            bedstead-modern
          </router-link>
          <router-link to="/surface/c64-retro" class="text-cyan-400 hover:underline">
            c64-retro
          </router-link>
          <router-link to="/surface/wireframe" class="text-cyan-400 hover:underline">
            wireframe
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
