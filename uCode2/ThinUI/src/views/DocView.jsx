import { useState } from 'react';

const SAMPLE_MD = `# Welcome to DocView

This is the **Typo-style** Markdown editor.

## Features

- Live preview as you type
- Split-panel layout
- Responsive prose typography

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Blockquote

> The quick brown fox jumps over the lazy dog.

| Left | Center | Right |
| :--- | :---: | ---: |
| 1    | 2     | 3     |

- [ ] Task item
- [x] Done item

[Link to uDos](https://udos.dev)
`;

function renderMarkdown(md) {
  let html = md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/<li>.+<\/li>/g, m => `<ul>${m}</ul>`)
    .replace(/<blockquote>.+<\/blockquote>/g, m => m);
  html = html.replace(/^(.+)$/gm, (m) => {
    if (m.startsWith('<')) return m;
    return `<p>${m}</p>`;
  });
  return `<div class="prose-content">${html}</div>`;
}

export default function DocView() {
  const [md, setMd] = useState(SAMPLE_MD);
  const [sideBySide, setSideBySide] = useState(true);

  return (
    <div className="docview">
      <div className="docview-toolbar">
        <div className="docview-toolbar-left">
          <button className={`tb-btn${sideBySide ? ' active' : ''}`} onClick={() => setSideBySide(true)} title="Split view">⊞</button>
          <button className={`tb-btn${!sideBySide ? ' active' : ''}`} onClick={() => setSideBySide(false)} title="Preview only">⊟</button>
        </div>
        <span className="docview-wordcount">{md.split(/\s+/).filter(Boolean).length} words</span>
        <span className="docview-filename">untitled.md</span>
      </div>
      <div className={`docview-panels${sideBySide ? '' : ' preview-only'}`}>
        {sideBySide && (
          <div className="docview-editor">
            <textarea
              className="docview-textarea"
              value={md}
              onChange={e => setMd(e.target.value)}
              placeholder="Write Markdown here..."
              spellCheck={false}
            />
          </div>
        )}
        <div className="docview-preview" dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }} />
      </div>
    </div>
  );
}
