<template>
  <div class="ucode2-surface">
    <!-- View Tabs -->
    <div class="view-tabs">
      <button
        v-for="tab in viewTabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeView === tab.id }"
        @click="activeView = tab.id"
      >
        <span v-html="tab.iconSvg"></span>
        {{ tab.label }}
      </button>
    </div>

    <!-- Kanban Board View -->
    <div v-if="activeView === 'kanban'" class="kanban-board">
      <div v-for="col in kanbanColumns" :key="col.id" class="kanban-col">
        <div class="kanban-col-header">
          <span class="col-dot" :style="{ background: col.color }"></span>
          <span class="col-title">{{ col.title }}</span>
          <span class="col-count">{{ col.items.length }}</span>
        </div>
        <div class="kanban-col-body">
          <div
            v-for="item in col.items"
            :key="item.id"
            class="kanban-card"
            draggable="true"
          >
            <div class="card-title">{{ item.title }}</div>
            <div class="card-meta">
              <span class="card-type">{{ item.type }}</span>
              <span class="card-date">{{ item.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table/List View -->
    <div v-if="activeView === 'table'" class="table-view">
      <div class="table-header">
        <span class="th">Title</span>
        <span class="th">Status</span>
        <span class="th">Type</span>
        <span class="th">Updated</span>
      </div>
      <div v-for="item in tableItems" :key="item.id" class="table-row">
        <span class="td title">{{ item.title }}</span>
        <span class="td">
          <span class="status-badge" :class="item.status">{{ item.status }}</span>
        </span>
        <span class="td type">{{ item.type }}</span>
        <span class="td date">{{ item.date }}</span>
      </div>
    </div>

    <!-- Prose View -->
    <div v-if="activeView === 'prose'" class="prose-view">
      <div class="prose-content">
        <h1>{{ proseDoc.title }}</h1>
        <div class="prose-meta">
          <span>{{ proseDoc.author }}</span>
          <span>{{ proseDoc.date }}</span>
          <span>{{ proseDoc.status }}</span>
        </div>
        <div class="prose-body" v-html="proseDoc.body"></div>
      </div>
    </div>

    <!-- Editor View -->
    <div v-if="activeView === 'editor'" class="editor-view">
      <div class="editor-toolbar">
        <button class="toolbar-btn" title="Bold"><strong>B</strong></button>
        <button class="toolbar-btn" title="Italic"><em>I</em></button>
        <button class="toolbar-btn" title="Code"><span v-text="codeIcon"></span></button>
        <button class="toolbar-btn" title="Link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
        </button>
        <button class="toolbar-btn" title="Image">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </button>
        <span class="toolbar-sep"></span>
        <button class="toolbar-btn" title="Preview">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Preview
        </button>
        <button class="toolbar-btn primary" title="Publish">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"/>
            <polyline points="5 12 12 5 19 12"/>
          </svg>
          Publish
        </button>
      </div>
      <div class="editor-body">
        <textarea
          class="editor-textarea"
          v-model="editorContent"
          placeholder="Start writing in Markdown..."
          spellcheck="false"
        ></textarea>
      </div>
    </div>

    <!-- GitHub Theme View -->
    <div v-if="activeView === 'github'" class="github-view">
      <div class="gh-header">
        <div class="gh-repo-info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <div>
            <div class="gh-repo-name">uDosGo / Connect</div>
            <div class="gh-repo-desc">uDosGo Connect — Surface Manager & Publishing Platform</div>
          </div>
        </div>
        <div class="gh-tabs">
          <span class="gh-tab active">Code</span>
          <span class="gh-tab">Issues</span>
          <span class="gh-tab">Pull Requests</span>
          <span class="gh-tab">Actions</span>
          <span class="gh-tab">Projects</span>
          <span class="gh-tab">Wiki</span>
        </div>
      </div>
      <div class="gh-content">
        <div class="gh-file-list">
          <div class="gh-file-header">
            <span class="gh-file-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
              </svg>
            </span>
            <span class="gh-branch">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/>
              </svg>
              main
            </span>
          </div>
          <div v-for="file in githubFiles" :key="file.name" class="gh-file-row">
            <span class="gh-file-icon">
              <svg v-if="file.type === 'dir'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </span>
            <span class="gh-file-name">{{ file.name }}</span>
            <span class="gh-file-msg">{{ file.message }}</span>
            <span class="gh-file-date">{{ file.date }}</span>
          </div>
        </div>
        <div class="gh-readme">
          <div class="gh-readme-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            README.md
          </div>
          <div class="gh-readme-body">
            <h1>uDosGo Connect</h1>
            <p>Surface Manager & Publishing Platform for the uDos ecosystem.</p>
            <h2>Getting Started</h2>
            <pre><code>npm install
npm run dev</code></pre>
            <h2>Surfaces</h2>
            <ul>
              <li><strong>uCode1 Terminal</strong> — 40×25 character grid terminal</li>
              <li><strong>uCode2 Publish</strong> — Document workspace with Kanban, Editor, Prose</li>
              <li><strong>Dashboard</strong> — NES Classic system dashboard</li>
              <li><strong>Vibe TUI</strong> — AI chat interface</li>
              <li><strong>Vault Browser</strong> — File management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Story Wizard View -->
    <div v-if="activeView === 'story'" class="story-wrapper">
      <StorySurface />
    </div>

    <!-- CLI Command Bar -->
    <div class="command-bar">
      <span class="cmd-prompt">$</span>
      <input
        ref="cmdInput"
        v-model="cmdBuffer"
        type="text"
        class="cmd-input"
        @keyup.enter="executeCmd"
        placeholder="Type a command..."
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import StorySurface from './StorySurface.vue';

// ─── Flowbite SVG Icon Templates ───────────────────────────────
const boardIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
const listIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;
const proseIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
const editorIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const githubIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`;
const storyIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`;
const codeIcon = `</>`;

// ─── View Tabs ──────────────────────────────────────────────────
const viewTabs = [
  { id: 'kanban', iconSvg: boardIcon, label: 'Board' },
  { id: 'table', iconSvg: listIcon, label: 'List' },
  { id: 'prose', iconSvg: proseIcon, label: 'Prose' },
  { id: 'editor', iconSvg: editorIcon, label: 'Editor' },
  { id: 'github', iconSvg: githubIcon, label: 'GitHub' },
  { id: 'story', iconSvg: storyIcon, label: 'Story Wizard' },
];
const activeView = ref('kanban');

// ─── Kanban Board ───────────────────────────────────────────────
const kanbanColumns = ref([
  {
    id: 'draft',
    title: 'Draft',
    color: '#94a3b8',
    items: [
      { id: 'd1', title: 'Getting Started Guide', type: 'doc', date: '2d ago' },
      { id: 'd2', title: 'API Reference v2', type: 'doc', date: '3d ago' },
      { id: 'd3', title: 'Tutorial: Kanban Setup', type: 'tutorial', date: '5d ago' },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    color: '#f59e0b',
    items: [
      { id: 'r1', title: 'Architecture Overview', type: 'doc', date: '1d ago' },
      { id: 'r2', title: 'Workflow Automation', type: 'guide', date: '2d ago' },
    ],
  },
  {
    id: 'published',
    title: 'Published',
    color: '#22c55e',
    items: [
      { id: 'p1', title: 'Quickstart Guide', type: 'doc', date: '1w ago' },
      { id: 'p2', title: 'USXD Format Spec', type: 'spec', date: '2w ago' },
      { id: 'p3', title: 'uCode1 User Manual', type: 'manual', date: '3w ago' },
      { id: 'p4', title: 'Vault Integration', type: 'guide', date: '1m ago' },
    ],
  },
]);

// ─── Table Items ────────────────────────────────────────────────
const tableItems = ref([
  { id: '1', title: 'Getting Started Guide', status: 'draft', type: 'doc', date: '2026-05-14' },
  { id: '2', title: 'API Reference v2', status: 'draft', type: 'doc', date: '2026-05-13' },
  { id: '3', title: 'Architecture Overview', status: 'review', type: 'doc', date: '2026-05-15' },
  { id: '4', title: 'Workflow Automation', status: 'review', type: 'guide', date: '2026-05-14' },
  { id: '5', title: 'Quickstart Guide', status: 'published', type: 'doc', date: '2026-05-09' },
  { id: '6', title: 'USXD Format Spec', status: 'published', type: 'spec', date: '2026-05-02' },
  { id: '7', title: 'uCode1 User Manual', status: 'published', type: 'manual', date: '2026-04-25' },
  { id: '8', title: 'Vault Integration', status: 'published', type: 'guide', date: '2026-04-16' },
]);

// ─── Prose Document ─────────────────────────────────────────────
const proseDoc = ref({
  title: 'uCode2 Publish — Document Workspace',
  author: 'uDos System',
  date: '2026-05-16',
  status: 'Draft',
  body: `<p>Welcome to the <strong>uCode2 Publish</strong> surface. This is your publishing workspace for managing documents, guides, and content.</p>

<h2>Getting Started</h2>
<p>Use the tabs above to switch between views:</p>
<ul>
  <li><strong>Board</strong> — Kanban-style workflow for tracking document progress</li>
  <li><strong>List</strong> — Table view of all documents with status and metadata</li>
  <li><strong>Prose</strong> — Read and preview rendered content</li>
  <li><strong>Editor</strong> — Write and edit Markdown documents</li>
  <li><strong>GitHub</strong> — Repository browser with file tree and README</li>
  <li><strong>Story Wizard</strong> — Create step-by-step guides and walkthroughs</li>
</ul>

<h2>Publishing Workflow</h2>
<p>Documents move through three stages:</p>
<ol>
  <li><strong>Draft</strong> — Initial writing and editing</li>
  <li><strong>Review</strong> — Peer review and revision</li>
  <li><strong>Published</strong> — Final release to readers</li>
</ol>

<blockquote>
  <p>Use the command bar below to execute publishing commands like <code>publish</code>, <code>status</code>, or <code>help</code>.</p>
</blockquote>`,
});

// ─── Editor ─────────────────────────────────────────────────────
const editorContent = ref(`# New Document

Start writing your content here...

## Section 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

## Section 2

- Item one
- Item two
- Item three
`);

// ─── GitHub Files ──────────────────────────────────────────────
const githubFiles = ref([
  { name: 'src/', type: 'dir', message: 'Source code directory', date: '2d ago' },
  { name: 'docs/', type: 'dir', message: 'Documentation', date: '3d ago' },
  { name: 'ui/', type: 'dir', message: 'Vue.js frontend', date: '1d ago' },
  { name: 'package.json', type: 'file', message: 'Project dependencies', date: '1d ago' },
  { name: 'README.md', type: 'file', message: 'Project overview', date: '2d ago' },
  { name: 'tsconfig.json', type: 'file', message: 'TypeScript config', date: '5d ago' },
  { name: 'vite.config.ts', type: 'file', message: 'Vite build config', date: '5d ago' },
]);

// ─── Command Bar ────────────────────────────────────────────────
const cmdInput = ref<HTMLInputElement | null>(null);
const cmdBuffer = ref('');

function executeCmd() {
  const cmd = cmdBuffer.value.trim();
  if (!cmd) return;
  cmdBuffer.value = '';
  // Command execution placeholder
}
</script>

<style scoped>
.ucode2-surface {
  background: #0f172a;
  color: #e2e8f0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
}

/* ─── View Tabs ──────────────────────────────────────────────── */
.view-tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 0;
  flex-wrap: wrap;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.85rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #64748b;
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  color: #e2e8f0;
  background: #1e293b;
}

.tab-btn.active {
  color: #60a5fa;
  border-bottom-color: #60a5fa;
  font-weight: 500;
}

/* ─── Kanban Board ───────────────────────────────────────────── */
.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  flex: 1;
  min-height: 400px;
}

.kanban-col {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.kanban-col-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #334155;
  font-size: 0.85rem;
}

.col-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.col-title {
  font-weight: 600;
  color: #f8fafc;
}

.col-count {
  margin-left: auto;
  background: #334155;
  color: #94a3b8;
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
}

.kanban-col-body {
  padding: 0.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.kanban-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 0.75rem;
  cursor: grab;
  transition: border-color 0.15s ease;
}

.kanban-card:hover {
  border-color: #60a5fa;
}

.card-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #64748b;
}

.card-type {
  background: #334155;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

/* ─── Table View ──────────────────────────────────────────────── */
.table-view {
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 0;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}

.th {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 0;
  border-bottom: 1px solid #1e293b;
  transition: background 0.15s ease;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: #1e293b;
}

.td {
  padding: 0.65rem 1rem;
  font-size: 0.85rem;
}

.td.title {
  color: #f8fafc;
  font-weight: 500;
}

.td.type {
  color: #94a3b8;
}

.td.date {
  color: #64748b;
  font-family: monospace;
  font-size: 0.8rem;
}

.status-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.draft {
  background: #1e293b;
  color: #94a3b8;
  border: 1px solid #334155;
}

.status-badge.review {
  background: #451a03;
  color: #fbbf24;
  border: 1px solid #78350f;
}

.status-badge.published {
  background: #052e16;
  color: #4ade80;
  border: 1px solid #166534;
}

/* ─── Prose View ──────────────────────────────────────────────── */
.prose-view {
  max-width: 70ch;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.prose-content h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.prose-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #1e293b;
}

.prose-body {
  line-height: 1.75;
  color: #cbd5e1;
}

.prose-body h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f8fafc;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose-body p {
  margin-bottom: 1rem;
}

.prose-body ul,
.prose-body ol {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose-body li {
  margin-bottom: 0.25rem;
}

.prose-body code {
  background: #1e293b;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85em;
  color: #60a5fa;
}

.prose-body blockquote {
  border-left: 3px solid #60a5fa;
  padding-left: 1rem;
  margin-left: 0;
  color: #94a3b8;
  font-style: italic;
}

.prose-body strong {
  color: #f8fafc;
}

/* ─── Editor View ─────────────────────────────────────────────── */
.editor-view {
  display: flex;
  flex-direction: column;
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
  min-height: 400px;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.6rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #94a3b8;
  font-family: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolbar-btn:hover {
  background: #334155;
  color: #e2e8f0;
}

.toolbar-btn.primary {
  background: #2563eb;
  color: #fff;
  border-color: #1d4ed8;
}

.toolbar-btn.primary:hover {
  background: #3b82f6;
}

.toolbar-sep {
  width: 1px;
  height: 20px;
  background: #334155;
  margin: 0 0.25rem;
}

.editor-body {
  flex: 1;
  display: flex;
}

.editor-textarea {
  width: 100%;
  min-height: 350px;
  padding: 1rem;
  background: #0f172a;
  color: #e2e8f0;
  border: none;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  resize: vertical;
  outline: none;
}

.editor-textarea::placeholder {
  color: #475569;
}

/* ─── GitHub View ─────────────────────────────────────────────── */
.github-view {
  border: 1px solid #30363d;
  border-radius: 6px;
  overflow: hidden;
  background: #0d1117;
}

.gh-header {
  border-bottom: 1px solid #21262d;
  padding: 1rem;
}

.gh-repo-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #c9d1d9;
}

.gh-repo-name {
  font-size: 1rem;
  font-weight: 600;
  color: #58a6ff;
}

.gh-repo-desc {
  font-size: 0.8rem;
  color: #8b949e;
}

.gh-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #21262d;
}

.gh-tab {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  color: #8b949e;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.gh-tab.active {
  color: #c9d1d9;
  border-bottom-color: #f78166;
}

.gh-tab:hover {
  color: #c9d1d9;
}

.gh-content {
  display: flex;
  flex-direction: column;
}

.gh-file-list {
  border-bottom: 1px solid #21262d;
}

.gh-file-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #161b22;
  border-bottom: 1px solid #21262d;
  font-size: 0.8rem;
}

.gh-branch {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #8b949e;
}

.gh-file-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  font-size: 0.8rem;
  border-bottom: 1px solid #21262d;
  transition: background 0.1s;
}

.gh-file-row:hover {
  background: #161b22;
}

.gh-file-row:last-child {
  border-bottom: none;
}

.gh-file-icon {
  width: 16px;
  display: flex;
  align-items: center;
  color: #8b949e;
  flex-shrink: 0;
}

.gh-file-name {
  color: #58a6ff;
  font-weight: 500;
  min-width: 120px;
}

.gh-file-msg {
  flex: 1;
  color: #8b949e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gh-file-date {
  color: #8b949e;
  font-size: 0.75rem;
  white-space: nowrap;
}

.gh-readme {
  padding: 1.5rem;
}

.gh-readme-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #21262d;
  font-size: 0.85rem;
  font-weight: 600;
  color: #c9d1d9;
  margin-bottom: 1rem;
}

.gh-readme-body {
  color: #c9d1d9;
  line-height: 1.6;
  font-size: 0.9rem;
}

.gh-readme-body h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #21262d;
  padding-bottom: 0.5rem;
}

.gh-readme-body h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.gh-readme-body p {
  margin-bottom: 1rem;
}

.gh-readme-body ul {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.gh-readme-body li {
  margin-bottom: 0.25rem;
}

.gh-readme-body pre {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.gh-readme-body code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85em;
}

.gh-readme-body pre code {
  background: none;
  padding: 0;
}

/* ─── Story Wizard ────────────────────────────────────────────── */
.story-wrapper {
  flex: 1;
  min-height: 400px;
}

/* ─── Command Bar ─────────────────────────────────────────────── */
.command-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.cmd-prompt {
  color: #22c55e;
  font-size: 0.9rem;
  font-weight: bold;
}

.cmd-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-family: inherit;
  font-size: 0.85rem;
  outline: none;
}

.cmd-input::placeholder {
  color: #475569;
}
</style>
