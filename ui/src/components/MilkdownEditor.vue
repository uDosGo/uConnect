<template>
  <div class="milkdown-editor" :class="{ 'milkdown-editor--fullscreen': fullscreen }">
    <div v-if="!hideToolbar" class="milkdown-toolbar">
      <button @click="toggleFullscreen" class="milkdown-toolbar__button" title="Toggle fullscreen">
        {{ fullscreen ? '⛶' : '⤢' }}
      </button>
      <button @click="togglePreview" class="milkdown-toolbar__button" title="Toggle preview">
        {{ showPreview ? '📝' : '👁️' }}
      </button>
      <button @click="insertHeading" class="milkdown-toolbar__button" title="Insert heading">
        H
      </button>
      <button @click="insertBold" class="milkdown-toolbar__button" title="Bold">
        B
      </button>
      <button @click="insertItalic" class="milkdown-toolbar__button" title="Italic">
        I
      </button>
      <button @click="insertLink" class="milkdown-toolbar__button" title="Insert link">
        🔗
      </button>
      <button @click="insertImage" class="milkdown-toolbar__button" title="Insert image">
        🖼️
      </button>
      <button @click="insertCode" class="milkdown-toolbar__button" title="Insert code">
        </>
      </button>
      <button @click="saveContent" class="milkdown-toolbar__button milkdown-toolbar__button--primary" title="Save">
        💾
      </button>
    </div>
    
    <div class="milkdown-container" :class="{ 'milkdown-container--split': showPreview }">
      <div class="milkdown-editor-area">
        <div ref="editorRef"></div>
      </div>
      
      <div v-if="showPreview" class="milkdown-preview-area">
        <div class="milkdown-preview-content" v-html="previewContent"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { Editor, rootCtx } from '@milkdown/core';
import { vue } from '@milkdown/plugin-vue';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    hideToolbar?: boolean;
    fullscreen?: boolean;
  }>(),
  {
    modelValue: '',
    hideToolbar: false,
    fullscreen: false,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  save: [content: string];
}>();

const editorRef = ref<HTMLElement | null>(null);
const editor = ref<Editor | null>(null);
const showPreview = ref(false);
const fullscreen = ref(props.fullscreen);
const previewContent = ref('');

// Initialize editor
onMounted(() => {
  if (!editorRef.value) return;
  
  editor.value = Editor
    .make()
    .config((ctx) => {
      ctx.set(rootCtx, editorRef.value);
    })
    .use(nord)
    .use(commonmark)
    .use(vue)
    .create();
  
  // Set initial content
  if (props.modelValue) {
    editor.value.action((ctx) => {
      const editor = ctx.get(Editor);
      editor.view.dispatch({
        changes: {
          from: 0,
          to: editor.view.state.doc.content.size,
          insert: props.modelValue,
        },
      });
    });
  }
  
  // Update preview when content changes
  editor.value.action((ctx) => {
    const editor = ctx.get(Editor);
    editor.event.add('update', () => {
      const markdown = editor.action((ctx) => {
        const editor = ctx.get(Editor);
        return editor.view.state.doc.textContent;
      });
      
      emit('update:modelValue', markdown);
      updatePreview(markdown);
    });
  });
});

// Update editor content when prop changes
watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.action((ctx) => {
    const editor = ctx.get(Editor);
    return editor.view.state.doc.textContent;
  })) {
    editor.value.action((ctx) => {
      const editor = ctx.get(Editor);
      editor.view.dispatch({
        changes: {
          from: 0,
          to: editor.view.state.doc.content.size,
          insert: newValue || '',
        },
      });
    });
  }
});

// Update preview content
function updatePreview(markdown: string) {
  if (!editor.value) return;
  
  // Simple markdown to HTML conversion for preview
  // In a real app, you might want to use a proper markdown parser
  previewContent.value = markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%">')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

// Toolbar actions
function toggleFullscreen() {
  fullscreen.value = !fullscreen.value;
}

function togglePreview() {
  showPreview.value = !showPreview.value;
  if (showPreview.value && editor.value) {
    const markdown = editor.value.action((ctx) => {
      const editor = ctx.get(Editor);
      return editor.view.state.doc.textContent;
    });
    updatePreview(markdown);
  }
}

function insertHeading() {
  if (editor.value) {
    editor.value.action((ctx) => {
      const editor = ctx.get(Editor);
      const { view } = editor;
      const { from, to } = view.state.selection;
      
      view.dispatch({
        changes: {
          from,
          to,
          insert: '# Heading\n',
        },
      });
    });
  }
}

function insertBold() {
  if (editor.value) {
    editor.value.action((ctx) => {
      const editor = ctx.get(Editor);
      const { view } = editor;
      const { from, to } = view.state.selection;
      const text = view.state.doc.textBetween(from, to, '\n');
      
      view.dispatch({
        changes: {
          from,
          to,
          insert: `**${text}**`,
        },
      });
    });
  }
}

function insertItalic() {
  if (editor.value) {
    editor.value.action((ctx) => {
      const editor = ctx.get(Editor);
      const { view } = editor;
      const { from, to } = view.state.selection;
      const text = view.state.doc.textBetween(from, to, '\n');
      
      view.dispatch({
        changes: {
          from,
          to,
          insert: `*${text}*`,
        },
      });
    });
  }
}

function insertLink() {
  if (editor.value) {
    editor.value.action((ctx) => {
      const editor = ctx.get(Editor);
      const { view } = editor;
      const { from, to } = view.state.selection;
      const text = view.state.doc.textBetween(from, to, '\n') || 'link text';
      const url = prompt('Enter URL:', 'https://');
      
      if (url) {
        view.dispatch({
          changes: {
            from,
            to,
            insert: `[${text}](${url})`,
          },
        });
      }
    });
  }
}

function insertImage() {
  if (editor.value) {
    editor.value.action((ctx) => {
      const editor = ctx.get(Editor);
      const { view } = editor;
      const { from, to } = view.state.selection;
      const url = prompt('Enter image URL:', 'https://');
      const alt = prompt('Enter alt text:', 'Image');
      
      if (url && alt) {
        view.dispatch({
          changes: {
            from,
            to,
            insert: `![${alt}](${url})`,
          },
        });
      }
    });
  }
}

function insertCode() {
  if (editor.value) {
    editor.value.action((ctx) => {
      const editor = ctx.get(Editor);
      const { view } = editor;
      const { from, to } = view.state.selection;
      const text = view.state.doc.textBetween(from, to, '\n');
      
      view.dispatch({
        changes: {
          from,
          to,
          insert: '\`\`\`\n' + text + '\n\`\`\`',
        },
      });
    });
  }
}

function saveContent() {
  if (editor.value) {
    const markdown = editor.value.action((ctx) => {
      const editor = ctx.get(Editor);
      return editor.view.state.doc.textContent;
    });
    emit('save', markdown);
  }
}

// Cleanup editor on unmount
import { onUnmounted } from 'vue';
onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});
</script>

<style scoped>
.milkdown-editor {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  display: flex;
  flex-direction: column;
}

.milkdown-editor--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3000;
  border: none;
  border-radius: 0;
}

.milkdown-toolbar {
  background: #f3f4f6;
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.milkdown-toolbar__button {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
}

.milkdown-toolbar__button:hover {
  background: #e5e7eb;
}

.milkdown-toolbar__button--primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.milkdown-toolbar__button--primary:hover {
  background: #2563eb;
}

.milkdown-container {
  display: flex;
  flex: 1;
  min-height: 300px;
}

.milkdown-container--split {
  flex-direction: row;
}

.milkdown-editor-area {
  flex: 1;
  overflow: auto;
  min-height: 300px;
}

.milkdown-preview-area {
  flex: 1;
  overflow: auto;
  border-left: 1px solid #e5e7eb;
  padding: 16px;
  background: #f9fafb;
  min-height: 300px;
}

.milkdown-preview-content {
  line-height: 1.6;
}

.milkdown-preview-content h1 {
  font-size: 1.5em;
  margin: 1em 0 0.5em;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.milkdown-preview-content h2 {
  font-size: 1.3em;
  margin: 1.2em 0 0.5em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.milkdown-preview-content h3 {
  font-size: 1.1em;
  margin: 1em 0 0.5em;
}

.milkdown-preview-content code {
  background: #f3f4f6;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.milkdown-preview-content pre {
  background: #1e293b;
  color: #f1f5f9;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
}

.milkdown-preview-content pre code {
  background: transparent;
  padding: 0;
}

.milkdown-preview-content img {
  max-width: 100%;
  height: auto;
}

.milkdown-preview-content a {
  color: #3b82f6;
  text-decoration: underline;
}

.milkdown-preview-content a:hover {
  color: #2563eb;
}

.milkdown-preview-content strong {
  font-weight: 600;
}

.milkdown-preview-content em {
  font-style: italic;
}
</style>