import { useRef, useState } from 'react';

const DOCS = [
  { id: 'welcome', name: 'Welcome.md', content: `# Welcome to DocView

This is the **Notionish-style** Markdown editor with live preview.

## Getting Started

- **Bold** and *italic* text
- Inline \`code\` blocks
- Lists and tables

### Features

| Feature | Status |
| :--- | :---: |
| Split panel | ✅ |
| Live preview | ✅ |
| File browser | ✅ |

> Write your docs here.
` },
  { id: 'tasks', name: 'Tasks.md', content: `# Task Dashboard

## Current Sprint

- [x] Gift Wrapper rebrand
- [ ] Vault integration
- [ ] Kanban drag-drop
- [ ] DocView editor
- [ ] Reader prose layout
` },
];

const FORMATTERS = [
  { label: 'B',   title: 'Bold',      wrap: ['**', '**'] },
  { label: '<i>I</i>', title: 'Italic', wrap: ['*', '*'] },
  { label: 'H',   title: 'Heading',   prefix: '## ' },
  { label: '🔗',  title: 'Link',      wrap: ['[', '](url)'] },
  { label: '•',   title: 'List',      prefix: '- ' },
  { label: '<>',  title: 'Code',      wrap: ['`', '`'] },
  { label: '▦',   title: 'Code block',prefix: '```\n', suffix: '\n```' },
];

function applyFormat(textarea, formatter) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = text.substring(start, end);

  let insert;
  if (formatter.wrap) {
    insert = formatter.wrap[0] + (selected || 'text') + formatter.wrap[1];
  } else if (formatter.prefix || formatter.suffix) {
    insert = (formatter.prefix || '') + (selected || '') + (formatter.suffix || '');
  }
  return { start, end: start + insert.length, insert };
}

function renderMarkdown(md) {
  let html = md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- \[x\] (.+)$/gm, '<li class="task-done">☑ $1</li>')
    .replace(/^- \[ \] (.+)$/gm, '<li class="task-todo">◻ $1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/```[\s\S]*?```/g, (m) => {
      const code = m.replace(/```/g, '').trim();
      return `<pre><code>${code}</code></pre>`;
    })
    .replace(/\|(.+)\|/g, (m) => {
      if (m.includes('---')) return '';
      return '<tr><td>' + m.split('|').filter(Boolean).map(c => c.trim()).join('</td><td>') + '</td></tr>';
    })
    .replace(/\n{2,}/g, '</p><p>');
  html = html.replace(/^(.+)$/gm, (m) => m.startsWith('<') ? m : `<p>${m}</p>`);
  html = '<div class="doc-prose">' + html + '</div>';
  return html;
}

export default function DocView() {
  const [docs] = useState(DOCS);
  const [currentDoc, setCurrentDoc] = useState(DOCS[0]);
  const [md, setMd] = useState(DOCS[0].content);
  const [sideBySide, setSideBySide] = useState(true);
  const [showFiles, setShowFiles] = useState(true);
  const textareaRef = useRef(null);

  const switchDoc = (doc) => {
    setCurrentDoc(doc);
    setMd(doc.content);
  };

  const handleFormat = (formatter) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = md.substring(start, end);

    let insert;
    if (formatter.wrap) {
      insert = formatter.wrap[0] + (selected || 'text') + formatter.wrap[1];
    } else if (formatter.prefix) {
      insert = formatter.prefix + (selected || '');
    }

    const newMd = md.substring(0, start) + insert + md.substring(end);
    setMd(newMd);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start, start + insert.length);
    }, 0);
  };

  return (
    <div className="docview">
      <div className="docview-toolbar">
        <button className={`tb-btn${showFiles ? ' active' : ''}`} onClick={() => setShowFiles(!showFiles)} title="Files">📁</button>
        <span className="tb-divider" />
        <button className={`tb-btn${sideBySide ? ' active' : ''}`} onClick={() => setSideBySide(true)} title="Split">⊞</button>
        <button className={`tb-btn${!sideBySide ? ' active' : ''}`} onClick={() => setSideBySide(false)} title="Preview">⊟</button>
        <span className="tb-divider" />
        <span className="docview-name">{currentDoc.name}</span>
        <div style={{ flex: 1 }} />
        <span className="docview-words">{md.split(/\s+/).filter(Boolean).length} words</span>
      </div>
      {sideBySide && (
        <div className="docview-format-bar">
          {FORMATTERS.map((f, i) => (
            <button key={i} className="fmt-btn" onClick={() => handleFormat(f)} title={f.title} dangerouslySetInnerHTML={f.label.includes('<') ? { __html: f.label } : undefined}>
              {f.label.includes('<') ? null : f.label}
            </button>
          ))}
        </div>
      )}
      <div className="docview-body">
        {showFiles && (
          <div className="docview-files">
            <div className="docview-files-header">Files</div>
            {docs.map(d => (
              <div key={d.id} className={`docview-file${currentDoc.id === d.id ? ' active' : ''}`} onClick={() => switchDoc(d)}>
                📄 {d.name}
              </div>
            ))}
          </div>
        )}
        <div className={`docview-panels${!sideBySide ? ' preview-only' : ''}${showFiles ? ' with-files' : ''}`}>
          {sideBySide && (
            <div className="docview-editor">
              <textarea ref={textareaRef} className="docview-textarea" value={md} onChange={e => setMd(e.target.value)} placeholder="Write Markdown..." spellCheck={false} />
            </div>
          )}
          <div className="docview-preview" dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }} />
        </div>
      </div>
    </div>
  );
}
