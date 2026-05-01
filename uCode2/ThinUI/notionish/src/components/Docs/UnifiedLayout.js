import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteDoc, listDocs, readDoc, saveDoc } from '../../vault/VaultStorage';

/**
 * UnifiedLayout — Merged task + doc workspace with progressive panel disclosure.
 *
 * Panels:
 *   L0: File Picker (vault docs + task list)
 *   L1: Main content (task table/board or doc editor)
 *   L2: Detail side panel (frontmatter / properties)
 *   L3: Full editor (distraction-free, hides L0/L2)
 *   L4: Reader view (clean prose, hides all chrome)
 */

const PANEL_MODES = ['browse', 'detail', 'editor', 'reader'];

// ─── Sub-components ───

function FilePicker({ docs, currentDoc, onOpenDoc, onNewDoc, onDeleteDoc }) {
  return (
    <div style={{
      width: 220, minWidth: 220, borderRight: '1px solid var(--empty-font-color, rgba(255,255,255,0.08))',
      display: 'flex', flexDirection: 'column', background: 'var(--secondary-background-color, #252525)',
      overflow: 'hidden', height: '100%',
    }}>
      <div style={{ padding: '10px 12px 6px', fontSize: 11, fontWeight: 600, color: 'var(--secondary-font-color, rgba(255,255,255,0.35))', textTransform: 'uppercase', letterSpacing: 1 }}>
        📁 Vault / docs/
      </div>
      <div style={{ padding: '0 8px 4px' }}>
        <button onClick={onNewDoc} style={{
          width: '100%', padding: '5px 8px', border: '1px dashed var(--empty-font-color, rgba(255,255,255,0.15))',
          borderRadius: 4, background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: 12, textAlign: 'left',
        }}>+ New Document</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px' }}>
        {docs.map(d => (
          <div key={d.name} onClick={() => onOpenDoc(d.name)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px',
              borderRadius: 4, cursor: 'pointer', fontSize: 13,
              background: currentDoc === d.name ? 'var(--card-hover-background-color, rgba(255,255,255,0.08))' : 'transparent',
            }}
          >
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              📄 {d.name.replace('.md', '')}
            </span>
            <span onClick={(e) => { e.stopPropagation(); onDeleteDoc(d.name); }}
              style={{ color: 'var(--secondary-font-color)', cursor: 'pointer', fontSize: 11 }}>✕</span>
          </div>
        ))}
        {docs.length === 0 && (
          <div style={{ padding: 16, fontSize: 12, color: 'var(--secondary-font-color)', textAlign: 'center' }}>No documents</div>
        )}
      </div>
    </div>
  );
}

function FrontmatterEditor({ title, tags, onTitleChange, onTagsChange }) {
  return (
    <div style={{ padding: '0 0 12px 0', borderBottom: '1px solid var(--empty-font-color, rgba(255,255,255,0.08))', marginBottom: 12 }}>
      <input value={title} onChange={e => onTitleChange(e.target.value)}
        placeholder="Document title"
        style={{
          width: '100%', padding: '6px 0', border: 'none', outline: 'none',
          background: 'transparent', color: 'var(--main-font-color)',
          fontSize: 18, fontWeight: 600,
        }}
      />
      <input value={tags} onChange={e => onTagsChange(e.target.value)}
        placeholder="tags: comma, separated"
        style={{
          width: '100%', padding: '4px 0', border: 'none', outline: 'none',
          background: 'transparent', color: 'var(--secondary-font-color)',
          fontSize: 12,
        }}
      />
    </div>
  );
}

// ─── Toolbar (shared) ───

function TbBtn({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title}
      style={{
        padding: '4px 8px', border: 'none', borderRadius: 4,
        background: 'transparent', color: 'var(--secondary-font-color)',
        cursor: 'pointer', fontSize: 13, fontWeight: 500, lineHeight: 1, minWidth: 28,
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => e.target.style.background = 'var(--card-hover-background-color, rgba(255,255,255,0.06))'}
      onMouseLeave={e => e.target.style.background = 'transparent'}
    >{children}</button>
  );
}
function TbSep() { return <span style={{ width: 1, height: 20, background: 'var(--empty-font-color, rgba(255,255,255,0.1))', display: 'inline-block', margin: '0 2px' }} />; }

function insertMd(ta, syntax) {
  const s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.substring(s, e);
  const map = {
    bold: `**${sel||'bold'}**`, italic: `*${sel||'italic'}*`, heading: `\n### ${sel||'Heading'}\n`,
    bullet: `\n- ${sel||'item'}\n`, quote: `\n> ${sel||'quote'}\n`,
    code: '```\n'+(sel||'code')+'\n```\n', table: '\n| Col1 | Col2 |\n|------|------|\n| Cell | Cell |\n',
    slide: '\n---\n\n', link: `[${sel||'text'}](url)`, image: `![${sel||'alt'}](url)`,
  };
  const ins = map[syntax] || syntax;
  return { value: ta.value.substring(0,s) + ins + ta.value.substring(e), cursor: s + ins.length };
}

// ─── Main Unified Layout ───

export default function UnifiedLayout() {
  // Core state
  const [docs, setDocs] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [content, setContent] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [panelMode, setPanelMode] = useState('browse'); // browse | detail | editor | reader
  const [showFiles, setShowFiles] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [frontmatter, setFrontmatter] = useState({ title: '', tags: '' });
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const refreshDocs = useCallback(async () => { setDocs(await listDocs()); }, []);
  useEffect(() => { refreshDocs(); }, [refreshDocs]);

  const openDoc = async (name) => {
    const text = await readDoc(name);
    setCurrentDoc(name);
    setContent(text);
    setIsNew(false);
    setPanelMode('detail');
    setShowFiles(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const name = isNew ? (newName.endsWith('.md') ? newName : `${newName}.md`) : currentDoc;
    await saveDoc(name, content);
    setCurrentDoc(name); setIsNew(false); setNewName('');
    await refreshDocs(); setSaving(false);
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await deleteDoc(name);
    if (currentDoc === name) { setCurrentDoc(null); setContent(''); setPanelMode('browse'); }
    await refreshDocs();
  };

  const handleNew = () => {
    setIsNew(true); setCurrentDoc(null);
    setContent('# New Document\n\nStart writing...');
    setPanelMode('editor'); setShowFiles(true);
  };

  const handleTb = (syntax) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { value, cursor } = insertMd(ta, syntax);
    setContent(value);
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(cursor, cursor); });
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); if (currentDoc || newName) handleSave(); }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setContent(await file.text()); setCurrentDoc(file.name); setIsNew(false);
  };

  const copyHtml = () => { navigator.clipboard.writeText(renderProseHtml(content)).catch(() => {}); };
  const printDoc = () => {
    const w = window.open('', '', 'width=800,height=600');
    w.document.write(`<html><head><title>${currentDoc||'doc'}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>body{font-family:Inter,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.7;color:#1a1a2e}img{max-width:100%}code{background:#f0f0f0;padding:2px 6px;border-radius:3px}pre code{background:none;padding:0}blockquote{border-left:3px solid #ddd;margin:12px 0;padding:4px 16px;color:#666}</style></head><body>${renderProseHtml(content)}</body></html>`);
    w.document.close(); w.print();
  };

  const isReader = panelMode === 'reader';
  const isEditor = panelMode === 'editor' || panelMode === 'detail';

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--main-background-color, #191919)',
      color: 'var(--main-font-color, rgba(255,255,255,0.81))',
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 14,
    }}>
      {/* ═══ Top Toolbar ═══ */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2,
        padding: '6px max(8px, calc((100vw - 800px) / 2))',
        borderBottom: '1px solid var(--empty-font-color, rgba(255,255,255,0.08))',
        background: 'var(--section-background-color, #1c1c1c)',
        minHeight: 38, flexShrink: 0,
      }}>
        {!isReader && (
          <>
            <TbBtn onClick={() => setShowFiles(!showFiles)} title="Toggle file browser">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
            </TbBtn>
            <div style={{ flex: 1, padding: '0 8px', fontSize: 13, fontWeight: 500, color: 'var(--secondary-font-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isNew ? (newName || 'untitled.md') : (currentDoc || 'Browse documents')}
            </div>
            <input ref={fileInputRef} type="file" accept=".md,.txt" onChange={handleFileSelected} style={{ display: 'none' }} />
            <TbBtn onClick={() => fileInputRef.current?.click()} title="Open local file">Open</TbBtn>
            <TbBtn onClick={handleSave} title="Save (⌘S)">{saving ? '...' : 'Save'}</TbBtn>
            <TbBtn onClick={handleNew} title="New doc">New</TbBtn>
            <TbSep />
            <TbBtn onClick={copyHtml} title="Copy as HTML">HTML</TbBtn>
            <TbBtn onClick={printDoc} title="Print">Print</TbBtn>
          </>
        )}
        <div style={{ flex: 1 }} />
        {/* Panel mode controls */}
        <TbBtn onClick={() => setShowDetail(!showDetail)} title="Toggle detail panel">
          {showDetail ? '☰' : '☷'}
        </TbBtn>
        <TbBtn onClick={() => setPanelMode(isReader ? 'editor' : 'reader')} title={isReader ? 'Edit mode' : 'Reader view'}>
          {isReader ? '✎ Edit' : '📖 Read'}
        </TbBtn>
      </div>

      {/* ═══ Body ═══ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* L0: File Picker */}
        {showFiles && !isReader && (
          <FilePicker docs={docs} currentDoc={currentDoc}
            onOpenDoc={openDoc} onNewDoc={handleNew} onDeleteDoc={handleDelete} />
        )}

        {/* L1–L4: Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {isReader ? (
            /* ─── L4: Reader View ─── */
            <div style={{ flex: 1, overflow: 'auto', padding: '32px max(16px, calc((100vw - 800px) / 2))' }}>
              <ProsePreview content={content} />
            </div>

          ) : (
            <>
              {/* ─── L2/L3: Formatting Toolbar ─── */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap',
                padding: '4px max(8px, calc((100vw - 800px) / 2))',
                borderBottom: '1px solid var(--empty-font-color, rgba(255,255,255,0.06))',
                background: 'var(--secondary-background-color, #252525)',
                flexShrink: 0,
              }}>
                <TbBtn onClick={() => handleTb('heading')} title="Heading">H</TbBtn>
                <TbBtn onClick={() => handleTb('bold')} title="Bold (⌘B)"><b>B</b></TbBtn>
                <TbBtn onClick={() => handleTb('italic')} title="Italic (⌘I)"><i>I</i></TbBtn>
                <TbSep />
                <TbBtn onClick={() => handleTb('bullet')} title="Bullet list">≡</TbBtn>
                <TbBtn onClick={() => handleTb('quote')} title="Blockquote">❝</TbBtn>
                <TbBtn onClick={() => handleTb('code')} title="Code block">&lt;/&gt;</TbBtn>
                <TbBtn onClick={() => handleTb('table')} title="Table">⊞</TbBtn>
                <TbSep />
                <TbBtn onClick={() => handleTb('link')} title="Link">🔗</TbBtn>
                <TbBtn onClick={() => handleTb('image')} title="Image">🖼</TbBtn>
                <TbBtn onClick={() => handleTb('slide')} title="Slide (hr)">—</TbBtn>
                <div style={{ flex: 1 }} />
                <TbBtn onClick={() => setShowPreview(!showPreview)} title="Toggle preview">
                  {showPreview ? 'Preview' : 'Source'}
                </TbBtn>
                {isNew && (
                  <input value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder="filename.md"
                    style={{
                      padding: '3px 8px', borderRadius: 4, border: '1px solid var(--empty-font-color)',
                      background: 'var(--card-background-color)', color: 'inherit', fontSize: 12, width: 120,
                    }}
                  />
                )}
              </div>

              {/* L2: Frontmatter Editor (in detail mode) */}
              {panelMode === 'detail' && (
                <div style={{
                  padding: '12px max(8px, calc((100vw - 800px) / 2))',
                  background: 'var(--section-background-color, #1c1c1c)',
                  borderBottom: '1px solid var(--empty-font-color, rgba(255,255,255,0.06))',
                  flexShrink: 0,
                }}>
                  <FrontmatterEditor
                    title={frontmatter.title}
                    tags={frontmatter.tags}
                    onTitleChange={t => setFrontmatter(f => ({...f, title: t}))}
                    onTagsChange={t => setFrontmatter(f => ({...f, tags: t}))}
                  />
                </div>
              )}

              {/* L3: Full Editor or Reader */}
              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="# Start writing..."
                  style={{
                    flex: showPreview ? '0 0 50%' : 1,
                    padding: '20px max(8px, calc((100vw - 800px) / 2))',
                    border: 'none', outline: 'none', resize: 'none',
                    background: 'transparent',
                    color: 'var(--main-font-color, rgba(255,255,255,0.81))',
                    fontFamily: "'JetBrains Mono', 'SF Mono', 'Menlo', monospace",
                    fontSize: 14, lineHeight: 1.8, overflow: 'auto',
                  }}
                />
                {showPreview && (
                  <div style={{
                    flex: '0 0 50%', overflow: 'auto', padding: '20px max(8px, calc((100vw - 800px) / 2))',
                    borderLeft: '1px solid var(--empty-font-color, rgba(255,255,255,0.06))',
                    background: 'var(--main-background-color, #191919)',
                  }}>
                    <ProsePreview content={content} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* L2: Detail Panel (right sidebar) */}
        {showDetail && !isReader && (
          <div style={{
            width: 240, minWidth: 240, borderLeft: '1px solid var(--empty-font-color, rgba(255,255,255,0.08))',
            background: 'var(--secondary-background-color, #252525)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 14px', fontSize: 11, fontWeight: 600, color: 'var(--secondary-font-color)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--empty-font-color, rgba(255,255,255,0.08))' }}>
              ℹ️ Properties
            </div>
            <div style={{ padding: 12, fontSize: 13, color: 'var(--secondary-font-color)' }}>
              <div style={{ marginBottom: 8 }}><span style={{ fontWeight: 500, color: 'var(--main-font-color)' }}>File:</span> {currentDoc || '—'}</div>
              <div style={{ marginBottom: 8 }}><span style={{ fontWeight: 500, color: 'var(--main-font-color)' }}>Words:</span> {content.split(/\s+/).filter(Boolean).length}</div>
              <div style={{ marginBottom: 8 }}><span style={{ fontWeight: 500, color: 'var(--main-font-color)' }}>Lines:</span> {content.split('\n').length}</div>
              <div style={{ marginBottom: 8 }}><span style={{ fontWeight: 500, color: 'var(--main-font-color)' }}>Size:</span> {new Blob([content]).size} bytes</div>
              <FrontmatterEditor
                title={frontmatter.title}
                tags={frontmatter.tags}
                onTitleChange={t => setFrontmatter(f => ({...f, title: t}))}
                onTagsChange={t => setFrontmatter(f => ({...f, tags: t}))}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Prose Preview ───

function renderProseHtml(md) {
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    .replace(/^---$/gm, '<hr />')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*(?:\n<li>.*)*)/g, '<ul>$1</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/(?:^<li>.*\n?)+/gm, m => m.includes('<ol>') ? m : '<ol>' + m + '</ol>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[houplbchra])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<blockquote><p>(.*?)<\/p><\/blockquote>/g, '<blockquote>$1</blockquote>');
  return html;
}

function ProsePreview({ content }) {
  const html = renderProseHtml(content);
  return (
    <div className="docs-prose" style={{
      maxWidth: 720, margin: '0 auto',
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 15, lineHeight: 1.8,
      color: 'var(--main-font-color, rgba(255,255,255,0.81))',
    }}
      dangerouslySetInnerHTML={{ __html: `<div class="prose-wrapper">${html}</div>` }}
    />
  );
}

// ─── Prose Stylesheet ───

const proseStyles = `
.docs-prose h1 { font-size: 1.75em; font-weight: 700; margin: 1.5em 0 0.5em; color: var(--main-font-color); line-height: 1.3; }
.docs-prose h2 { font-size: 1.4em; font-weight: 600; margin: 1.4em 0 0.4em; color: var(--main-font-color); line-height: 1.35; border-bottom: 1px solid var(--empty-font-color); padding-bottom: 0.3em; }
.docs-prose h3 { font-size: 1.2em; font-weight: 600; margin: 1.2em 0 0.3em; color: var(--main-font-color); line-height: 1.4; }
.docs-prose h4 { font-size: 1.05em; font-weight: 600; margin: 1em 0 0.3em; color: var(--main-font-color); }
.docs-prose p { margin: 0.6em 0; color: var(--main-font-color); }
.docs-prose a { color: #60a5fa; text-decoration: none; }
.docs-prose a:hover { text-decoration: underline; }
.docs-prose strong { color: #fff; font-weight: 600; }
.docs-prose code { background: var(--card-hover-background-color); padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.875em; color: #60a5fa; }
.docs-prose pre { background: var(--secondary-background-color); padding: 16px 20px; border-radius: 8px; overflow-x: auto; border: 1px solid var(--empty-font-color); margin: 1em 0; }
.docs-prose pre code { background: none; padding: 0; border-radius: 0; color: var(--main-font-color); font-size: 0.85em; }
.docs-prose blockquote { border-left: 3px solid #60a5fa; margin: 1em 0; padding: 0.3em 1em; color: var(--secondary-font-color); font-style: italic; }
.docs-prose ul, .docs-prose ol { margin: 0.5em 0; padding-left: 1.5em; }
.docs-prose li { margin: 0.2em 0; }
.docs-prose hr { border: none; border-top: 1px solid var(--empty-font-color); margin: 2em 0; }
.docs-prose img { max-width: 100%; border-radius: 6px; margin: 1em 0; }
.docs-prose table { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 0.9em; }
.docs-prose th, .docs-prose td { border: 1px solid var(--empty-font-color); padding: 8px 12px; text-align: left; }
.docs-prose th { background: var(--secondary-background-color); font-weight: 600; color: var(--main-font-color); }
.docs-prose tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
`;

if (typeof document !== 'undefined' && !document.getElementById('docs-prose-style')) {
  const style = document.createElement('style');
  style.id = 'docs-prose-style';
  style.textContent = proseStyles;
  document.head.appendChild(style);
}
