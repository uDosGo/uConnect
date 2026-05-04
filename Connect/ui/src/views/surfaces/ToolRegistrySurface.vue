<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Tool Registry State
const registryStatus = ref<'idle' | 'loading' | 'active' | 'error'>('idle');
const tools = ref<any[]>([]);
const selectedTool = ref<any>(null);
const isEditing = ref(false);
const newTool = ref({
  id: '',
  name: '',
  description: '',
  category: 'ai',
  contextTemplate: '',
  parameters: [],
  enabled: true
});

// Tool categories
const categories = ref([
  'ai', 'automation', 'data', 'integration', 'utility', 'monitoring'
]);

// Load tools from registry
async function loadTools() {
  registryStatus.value = 'loading';
  try {
    // In a real implementation, this would load from an API
    // For now, we'll use some example tools
    tools.value = [
      {
        id: 'mistral-prompt-editor',
        name: 'Mistral Prompt Editor',
        description: 'Advanced prompt editing for Mistral AI models',
        category: 'ai',
        contextTemplate: '{\n  "model": "{{model}}",\n  "temperature": {{temperature}},\n  "max_tokens": {{max_tokens}},\n  "system_prompt": "{{system_prompt}}",\n  "user_prompt": "{{user_prompt}}"\n}',
        parameters: [
          { name: 'model', type: 'string', default: 'mistral-large', description: 'Mistral model to use' },
          { name: 'temperature', type: 'number', default: 0.7, description: 'Creativity level (0-1)' },
          { name: 'max_tokens', type: 'number', default: 4096, description: 'Maximum tokens to generate' },
          { name: 'system_prompt', type: 'string', default: 'You are a helpful AI assistant.', description: 'System prompt' },
          { name: 'user_prompt', type: 'string', default: '', description: 'User prompt' }
        ],
        enabled: true
      },
      {
        id: 'github-sync-monitor',
        name: 'GitHub Sync Monitor',
        description: 'Monitor and manage GitHub repository synchronization',
        category: 'integration',
        contextTemplate: '{\n  "repo": "{{repo}}",\n  "branch": "{{branch}}",\n  "sync_interval": {{sync_interval}},\n  "auto_merge": {{auto_merge}}\n}',
        parameters: [
          { name: 'repo', type: 'string', default: 'owner/repo', description: 'GitHub repository' },
          { name: 'branch', type: 'string', default: 'main', description: 'Branch to monitor' },
          { name: 'sync_interval', type: 'number', default: 300, description: 'Sync interval in seconds' },
          { name: 'auto_merge', type: 'boolean', default: false, description: 'Auto-merge PRs' }
        ],
        enabled: true
      },
      {
        id: 'wordpress-content-analyzer',
        name: 'WordPress Content Analyzer',
        description: 'Analyze WordPress content for SEO and readability',
        category: 'data',
        contextTemplate: '{\n  "post_id": {{post_id}},\n  "analyze_seo": {{analyze_seo}},\n  "analyze_readability": {{analyze_readability}},\n  "generate_suggestions": {{generate_suggestions}}\n}',
        parameters: [
          { name: 'post_id', type: 'number', default: 0, description: 'WordPress post ID' },
          { name: 'analyze_seo', type: 'boolean', default: true, description: 'Analyze SEO' },
          { name: 'analyze_readability', type: 'boolean', default: true, description: 'Analyze readability' },
          { name: 'generate_suggestions', type: 'boolean', default: true, description: 'Generate improvement suggestions' }
        ],
        enabled: false
      },
      {
        id: 'vault-search-optimizer',
        name: 'Vault Search Optimizer',
        description: 'Optimize search queries for the uDos vault',
        category: 'utility',
        contextTemplate: '{\n  "query": "{{query}}",\n  "limit": {{limit}},\n  "fuzzy_match": {{fuzzy_match}},\n  "include_metadata": {{include_metadata}}\n}',
        parameters: [
          { name: 'query', type: 'string', default: '', description: 'Search query' },
          { name: 'limit', type: 'number', default: 10, description: 'Maximum results' },
          { name: 'fuzzy_match', type: 'boolean', default: true, description: 'Use fuzzy matching' },
          { name: 'include_metadata', type: 'boolean', default: false, description: 'Include metadata in results' }
        ],
        enabled: true
      },
      {
        id: 'workflow-automation-engine',
        name: 'Workflow Automation Engine',
        description: 'Automate complex workflows with AI assistance',
        category: 'automation',
        contextTemplate: '{\n  "workflow_id": "{{workflow_id}}",\n  "auto_execute": {{auto_execute}},\n  "notify_on_completion": {{notify_on_completion}},\n  "max_retries": {{max_retries}}\n}',
        parameters: [
          { name: 'workflow_id', type: 'string', default: '', description: 'Workflow ID' },
          { name: 'auto_execute', type: 'boolean', default: false, description: 'Auto-execute workflow' },
          { name: 'notify_on_completion', type: 'boolean', default: true, description: 'Notify on completion' },
          { name: 'max_retries', type: 'number', default: 3, description: 'Maximum retries' }
        ],
        enabled: true
      }
    ];
    registryStatus.value = 'active';
  } catch (error) {
    registryStatus.value = 'error';
    console.error('Failed to load tools:', error);
  }
}

// Tool management functions
function selectTool(tool: any) {
  selectedTool.value = tool;
  newTool.value = { ...tool };
  isEditing.value = true;
}

function createNewTool() {
  newTool.value = {
    id: '',
    name: '',
    description: '',
    category: 'ai',
    contextTemplate: '',
    parameters: [],
    enabled: true
  };
  selectedTool.value = null;
  isEditing.value = true;
}

function addParameter() {
  newTool.value.parameters.push({
    name: '',
    type: 'string',
    default: '',
    description: ''
  });
}

function removeParameter(index: number) {
  newTool.value.parameters.splice(index, 1);
}

function saveTool() {
  if (isEditing.value && selectedTool.value) {
    // Update existing tool
    const index = tools.value.findIndex(t => t.id === selectedTool.value.id);
    if (index !== -1) {
      tools.value[index] = { ...newTool.value };
    }
  } else {
    // Add new tool
    newTool.value.id = `tool-${Date.now()}`;
    tools.value.push({ ...newTool.value });
  }
  
  isEditing.value = false;
  selectedTool.value = null;
}

function cancelEdit() {
  isEditing.value = false;
  selectedTool.value = null;
}

function deleteTool(toolId: string) {
  if (confirm('Are you sure you want to delete this tool?')) {
    tools.value = tools.value.filter(t => t.id !== toolId);
    if (selectedTool.value && selectedTool.value.id === toolId) {
      selectedTool.value = null;
      isEditing.value = false;
    }
  }
}

function toggleToolStatus(toolId: string) {
  const tool = tools.value.find(t => t.id === toolId);
  if (tool) {
    tool.enabled = !tool.enabled;
  }
}

// Execute tool
async function executeTool(toolId: string) {
  const tool = tools.value.find(t => t.id === toolId);
  if (tool) {
    try {
      // In a real implementation, this would execute the tool
      console.log(`Executing tool: ${tool.name}`);
      alert(`✅ Executing ${tool.name} with standardized context`);
    } catch (error) {
      console.error('Error executing tool:', error);
      alert(`❌ Error executing tool: ${error.message}`);
    }
  }
}

// Computed properties
const filteredTools = computed(() => {
  return tools.value.filter(tool => tool.enabled);
});

const toolsByCategory = computed(() => {
  const grouped: Record<string, any[]> = {};
  filteredTools.value.forEach(tool => {
    if (!grouped[tool.category]) {
      grouped[tool.category] = [];
    }
    grouped[tool.category].push(tool);
  });
  return grouped;
});

// Initialize
onMounted(() => {
  loadTools();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-cyan-400">🔧 MCP Tool Registry</h2>
      <div class="flex items-center space-x-2">
        <span class="text-sm">Status:</span>
        <span
          class="px-2 py-1 rounded text-xs font-semibold"
          :class="{
            'bg-gray-600 text-gray-300': registryStatus === 'idle',
            'bg-yellow-600 text-yellow-100': registryStatus === 'loading',
            'bg-green-600 text-green-100': registryStatus === 'active',
            'bg-red-600 text-red-100': registryStatus === 'error'
          }"
        >
          {{ registryStatus.toUpperCase() }}
        </span>
      </div>
    </div>

    <!-- Stats -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-cyan-400">{{ tools.length }}</div>
          <div class="text-sm text-gray-400">Total Tools</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-400">{{ filteredTools.length }}</div>
          <div class="text-sm text-gray-400">Enabled Tools</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-400">{{ categories.length }}</div>
          <div class="text-sm text-gray-400">Categories</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-400">{{ tools.reduce((sum, tool) => sum + tool.parameters.length, 0) }}</div>
          <div class="text-sm text-gray-400">Total Parameters</div>
        </div>
      </div>
    </div>

    <!-- Tool Management -->
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-cyan-400">Tool Registry</h3>
      <button
        @click="createNewTool"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ✚ Add New Tool
      </button>
    </div>

    <!-- Tool Editor (Modal-like) -->
    <div v-if="isEditing" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-white">
            {{ selectedTool ? 'Edit Tool' : 'Create New Tool' }}
          </h3>
          <button @click="cancelEdit" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Tool ID</label>
            <input
              v-model="newTool.id"
              type="text"
              placeholder="tool-unique-id"
              class="w-full bg-gray-700 text-white px-3 py-2 rounded border-none focus:ring-2 focus:ring-cyan-400"
              :disabled="!!selectedTool"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              v-model="newTool.name"
              type="text"
              placeholder="Tool Name"
              class="w-full bg-gray-700 text-white px-3 py-2 rounded border-none focus:ring-2 focus:ring-cyan-400"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              v-model="newTool.description"
              placeholder="Tool description"
              rows="3"
              class="w-full bg-gray-700 text-white px-3 py-2 rounded border-none focus:ring-2 focus:ring-cyan-400"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select
              v-model="newTool.category"
              class="w-full bg-gray-700 text-white px-3 py-2 rounded border-none focus:ring-2 focus:ring-cyan-400"
            >
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Context Template</label>
            <textarea
              v-model="newTool.contextTemplate"
              placeholder="JSON template with {{placeholders}}"
              rows="6"
              class="w-full bg-gray-700 text-white px-3 py-2 rounded border-none focus:ring-2 focus:ring-cyan-400 font-mono text-sm"
            ></textarea>
            <p class="text-xs text-gray-400 mt-1">
              Use {{parameter_name}} syntax for dynamic values. Example: {"model": "{{model}}", "temperature": {{temperature}}}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Parameters</label>
            <div class="space-y-2">
              <div v-for="(param, index) in newTool.parameters" :key="index" class="bg-gray-700 rounded-lg p-3">
                <div class="grid grid-cols-4 gap-2 mb-2">
                  <input
                    v-model="param.name"
                    type="text"
                    placeholder="name"
                    class="bg-gray-600 text-white px-2 py-1 rounded text-xs"
                  >
                  <select v-model="param.type" class="bg-gray-600 text-white px-2 py-1 rounded text-xs">
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                  </select>
                  <input
                    v-model="param.default"
                    type="text"
                    placeholder="default"
                    class="bg-gray-600 text-white px-2 py-1 rounded text-xs"
                  >
                  <input
                    v-model="param.description"
                    type="text"
                    placeholder="description"
                    class="bg-gray-600 text-white px-2 py-1 rounded text-xs"
                  >
                </div>
                <button
                  @click="removeParameter(index)"
                  class="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
              <button @click="addParameter" class="text-xs text-blue-400 hover:text-blue-300">
                + Add Parameter
              </button>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <input type="checkbox" v-model="newTool.enabled" id="tool-enabled" class="rounded">
            <label for="tool-enabled" class="text-sm text-gray-300">Enabled</label>
          </div>

          <div class="flex justify-end space-x-2">
            <button @click="cancelEdit" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500">
              Cancel
            </button>
            <button @click="saveTool" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Save Tool
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tools by Category -->
    <div class="space-y-6">
      <div v-for="(categoryTools, category) in toolsByCategory" :key="category" class="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-cyan-400 mb-3 capitalize">
          {{ category }} ({{ categoryTools.length }})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="tool in categoryTools" :key="tool.id" class="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <h4 class="font-semibold text-white">{{ tool.name }}</h4>
                  <span class="text-xs bg-blue-600 text-blue-100 px-2 py-1 rounded">
                    {{ tool.category }}
                  </span>
                </div>
                <p class="text-sm text-gray-300 mb-2">{{ tool.description }}</p>
                <div class="text-xs text-gray-400">
                  <span>{{ tool.parameters.length }} parameters</span>
                  <span class="mx-1">·</span>
                  <span>{{ tool.id }}</span>
                </div>
              </div>
              <div class="flex space-x-1">
                <button
                  @click="executeTool(tool.id)"
                  class="p-1 text-green-400 hover:text-green-300"
                  title="Execute"
                >
                  ▶️
                </button>
                <button
                  @click="selectTool(tool)"
                  class="p-1 text-blue-400 hover:text-blue-300"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  @click="toggleToolStatus(tool.id)"
                  class="p-1 hover:text-yellow-300"
                  :class="{
                    'text-green-400': tool.enabled,
                    'text-gray-400': !tool.enabled
                  }"
                  title="Toggle Status"
                >
                  {{ tool.enabled ? '🔴' : '🟢' }}
                </button>
                <button
                  @click="deleteTool(tool.id)"
                  class="p-1 text-red-400 hover:text-red-300"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>

            <!-- Expandable context template -->
            <div class="mt-2 text-xs">
              <details>
                <summary class="text-gray-400 cursor-pointer">Context Template</summary>
                <pre class="bg-gray-600 rounded p-2 mt-1 overflow-x-auto text-gray-300">{{ tool.contextTemplate }}</pre>
              </details>
            </div>

            <!-- Parameters list -->
            <div v-if="tool.parameters.length > 0" class="mt-2">
              <div class="text-xs text-gray-400 mb-1">Parameters:</div>
              <div class="flex flex-wrap gap-1">
                <span v-for="param in tool.parameters" :key="param.name" class="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                  {{ param.name }}:{{ param.type }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 gap-4">
      <button
        @click="executeTool('mistral-prompt-editor')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        🤖 Execute Mistral Prompt Editor
      </button>
      <button
        @click="executeTool('github-sync-monitor')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        🌐 Execute GitHub Sync Monitor
      </button>
      <button
        @click="executeTool('workflow-automation-engine')"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        ⚙️ Execute Workflow Automation
      </button>
      <button
        @click="createNewTool"
        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded text-left"
      >
        ➕ Add New Tool
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Category styling */
.capitalize {
  text-transform: capitalize;
}

/* Tool card hover effect */
.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Modal backdrop */
.fixed.inset-0 {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

/* Parameter grid */
.parameter-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

/* Code/pre formatting */
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Disabled input */
input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Button transitions */
button:hover:not(:disabled) {
  transform: translateY(-1px);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>