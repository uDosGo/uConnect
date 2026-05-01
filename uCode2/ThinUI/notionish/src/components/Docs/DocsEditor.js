import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { deleteDoc, listDocs, readDoc, saveDoc } from '../../vault/VaultStorage';

/**
 * DocsEditor — Markdown editor with Notionish styling, flat SVG icons, react-markdown preview.
 */

// ─── Flat SVG Icons (Typo-style) ───

const Icons = {
  folder: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>,
  bold: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>,
  italic: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>,
  heading: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h5v16H3v-2h1.5V6H3V4zm7 0h2v7h5V4h2v16h-2v-7h-5v7h-2V4z"/></svg>,
  list: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  quote: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>,
  code: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>,
  table: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18"/></svg>,
  link: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  image: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
  hr: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12h18"/></svg>,
  open: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  save: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>,
  add: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14"/></svg>,
  html: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 15l-2-2 2-2M15 15l2-2-2-2M12 17l-2-4"/></svg>,
  print: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>,
  format: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h4"/></svg>,
  eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
};

// ─── Toolbar ───

function insertMarkdown(textarea, syntax) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const sel = textarea.value.substring(start, end);
  const map = {
    bold: `**${sel || 'bold'}**`, italic: `*${sel || 'italic'}*`,
    heading: `\n### ${sel || 'Heading'}\n`, bullet: `\n- ${sel || 'item'}\n`,
    quote: `\n> ${sel || 'quote'}\n`, code: '```\n' + (sel || 'code') + '\n```\n',
    table: '\n| Col1 | Col2 |\n|------|------|\n| Cell | Cell |\n',
    slide: '\n---\n\n', link: `[${sel || 'text'}](url)`, image: `![${sel || 'alt'}](url)`,
  };
  const ins = map[syntax] || syntax;
  return { value: textarea.value.substring(0, start) + ins + textarea.value.substring(end), cursor: start + ins.length };
}

function TbBtn({ onClick, title, icon, active }) {
  return (
    <button onClick={onClick} title={title}
      style={{
        padding: '5px 7px', border: 'none', borderRadius: 4,
        background: active ? 'var(--card-hover-background-color)' : 'transparent',
        color: active ? 'var(--main-font-color)' : 'var(--secondary-font-color)',
        cursor: 'pointer', fontSize: 14, lineHeight: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 28, height: 28,
        transition: 'all 0.12s',
      }}
      onMouseEnter={e => e.target.style.background = 'var(--card-hover-background-color)'}
      onMouseLeave={e => { if (!active) e.target.style.background = 'transparent'; }}
    >{icon}</button>
  );
}

function TbSep() { return <span style={{ width: 1, height: 22, background: 'var(--empty-font-color, rgba(255,255,255,0.08))', display: 'inline-block', margin: '0 1px' }} />; }

function formatMarkdown(raw) {
  return raw.split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n{3,}/g, '\n\n');
}

// ─── Docs Editor ───

export default function DocsEditor() {
  const [docs, setDocs] = useState([]);
  const [showFiles, setShowFiles] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [content, setContent] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const refreshDocs = useCallback(async () => { setDocs(await listDocs()); }, []);
  useEffect(() => {
    // On first load, open Welcome.md or create it
    (async () => {
      const items = await listDocs();
      setDocs(items);
      const welcome = items.find(d => d.name === 'Welcome.md');
      if (welcome) {
        setContent(await readDoc('Welcome.md'));
        setCurrentDoc('Welcome.md');
      } else {
        const defaultContent = `# Welcome to Taskview\n\nThis is your **markdown document editor**. Start writing or open a file from the sidebar.\n\n## Features\n\n- **Typo-style toolbar** with flat SVG icons\n- **Prose preview** powered by react-markdown\n- **Vault-backed** storage at \`~/Code/Vault/docs/\`\n- **Gift Wrapper** responsive font sizing\n\n---\n\n> Start by creating a new document or opening an existing one from the file browser (📁 icon above).`;
        await saveDoc('Welcome.md', defaultContent);
        setContent(defaultContent);
        setCurrentDoc('Welcome.md');
        setDocs(await listDocs());
      }
      setInitializing(false);
    })();
  }, []);

  const openDoc = async (name) => {
    setContent(await readDoc(name)); setCurrentDoc(name); setIsNew(false); setShowFiles(false);
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
    if (currentDoc === name) { setCurrentDoc(null); setContent(''); }
    await refreshDocs();
  };

  const handleNew = () => { setIsNew(true); setCurrentDoc(null); setContent('# New Document\n\nStart writing...'); };

  const handleTb = (s) => {
    const ta = textareaRef.current; if (!ta) return;
    const { value, cursor } = insertMarkdown(ta, s);
    setContent(value);
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(cursor, cursor); });
  };

  const kd = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); if (currentDoc || newName) handleSave(); } };

  const handleOpenLocal = () => fileInputRef.current?.click();
  const handleFile = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setContent(await f.text()); setCurrentDoc(f.name); setIsNew(false);
  };

  const copyHtml = () => navigator.clipboard.writeText(content).catch(() => {});
  const printDoc = () => {
    const w = window.open('', '', 'width=800,height=600');
    w.document.write(`<html><head><title>${currentDoc || 'doc'}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>body{font-family:Inter,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.8;color:#1a1a2e}img{max-width:100%}code{background:#f0f0f0;padding:2px 6px;border-radius:3px;font-size:.9em}pre{background:#f5f5f5;padding:16px;border-radius:6px;overflow-x:auto}blockquote{border-left:3px solid #ddd;margin:12px 0;padding:4px 16px;color:#666}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left}</style></head><body>${content}</body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--main-background-color, #191919)',
      color: 'var(--main-font-color, rgba(255,255,255,0.81))',
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 'var(--gw-font-base, 14px)',
    }}>
      {/* Top Navbar — flat icons */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 1,
        padding: '4px max(8px, calc((100vw - 800px) / 2))',
        borderBottom: '1px solid var(--empty-font-color, rgba(255,255,255,0.06))',
        background: 'var(--section-background-color, #1c1c1c)',
        minHeight: 36, flexShrink: 0,
      }}>
        <TbBtn onClick={() => setShowFiles(!showFiles)} title="Toggle file browser" icon={Icons.folder} />
        <div style={{ flex: 1, padding: '0 8px', fontSize: 'var(--gw-font-sm, 13px)', fontWeight: 500, color: 'var(--secondary-font-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isNew ? (newName || 'untitled.md') : (currentDoc || 'No document')}
        </div>
        <input ref={fileInputRef} type="file" accept=".md,.txt" onChange={handleFile} style={{ display: 'none' }} />
        <TbBtn onClick={handleOpenLocal} title="Open file" icon={Icons.open} />
        <TbBtn onClick={handleSave} title="Save (⌘S)" icon={Icons.save} />
        <TbBtn onClick={handleNew} title="New document" icon={Icons.add} />
        <TbSep />
        <TbBtn onClick={copyHtml} title="Copy markdown" icon={Icons.html} />
        <TbBtn onClick={printDoc} title="Print" icon={Icons.print} />
        <TbBtn onClick={() => setContent(formatMarkdown(content))} title="Format document" icon={Icons.format} />
        <TbBtn onClick={() => setShowPreview(!showPreview)} title="Toggle preview" icon={Icons.eye} active={showPreview} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Files sidebar */}
        {showFiles && (
          <div style={{
            width: 200, borderRight: '1px solid var(--empty-font-color, rgba(255,255,255,0.08))',
            display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
            background: 'var(--secondary-background-color, #252525)',
          }}>
            <div style={{ padding: '10px 12px', fontSize: 'var(--gw-font-xs, 11px)', fontWeight: 600, color: 'var(--secondary-font-color)', textTransform: 'uppercase', letterSpacing: 1 }}>
              ~/Vault/docs/
            </div>
            <div style={{ padding: '0 8px' }}>
              <button onClick={handleNew} style={{
                width: '100%', padding: '5px 8px', marginBottom: 4,
                border: '1px dashed var(--empty-font-color, rgba(255,255,255,0.15))', borderRadius: 4,
                background: 'transparent', color: 'var(--secondary-font-color)', cursor: 'pointer',
                fontSize: 'var(--gw-font-sm, 12px)', textAlign: 'left',
              }}>+ New</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px' }}>
              {docs.map(d => (
                <div key={d.name} onClick={() => openDoc(d.name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px',
                    borderRadius: 4, cursor: 'pointer', fontSize: 'var(--gw-font-sm, 13px)',
                    background: currentDoc === d.name ? 'var(--card-hover-background-color)' : 'transparent',
                    color: currentDoc === d.name ? 'var(--main-font-color)' : 'var(--secondary-font-color)',
                  }}
                >
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📄 {d.name.replace('.md', '')}
                  </span>
                  <span onClick={(e) => { e.stopPropagation(); handleDelete(d.name); }}
                    style={{ color: 'var(--empty-font-color)', cursor: 'pointer', fontSize: 'var(--gw-font-xs, 11px)' }}>✕</span>
                </div>
              ))}
              {docs.length === 0 && (
                <div style={{ padding: 16, fontSize: 'var(--gw-font-sm, 12px)', color: 'var(--secondary-font-color)', textAlign: 'center' }}>No documents</div>
              )}
            </div>
          </div>
        )}

        {/* Formatting toolbar — flat icons */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap',
          padding: '3px max(8px, calc((100vw - 800px) / 2))',
          borderBottom: '1px solid var(--empty-font-color, rgba(255,255,255,0.05))',
          background: 'var(--secondary-background-color, #252525)',
          width: '100%', position: 'absolute', zIndex: 1,
        }}>
          <TbBtn onClick={() => handleTb('heading')} title="Heading" icon={Icons.heading} />
          <TbBtn onClick={() => handleTb('bold')} title="Bold (⌘B)" icon={Icons.bold} />
          <TbBtn onClick={() => handleTb('italic')} title="Italic (⌘I)" icon={Icons.italic} />
          <TbSep />
          <TbBtn onClick={() => handleTb('bullet')} title="Bullet list" icon={Icons.list} />
          <TbBtn onClick={() => handleTb('quote')} title="Blockquote" icon={Icons.quote} />
          <TbBtn onClick={() => handleTb('code')} title="Code block" icon={Icons.code} />
          <TbBtn onClick={() => handleTb('table')} title="Table" icon={Icons.table} />
          <TbSep />
          <TbBtn onClick={() => handleTb('link')} title="Link" icon={Icons.link} />
          <TbBtn onClick={() => handleTb('image')} title="Image" icon={Icons.image} />
          <TbBtn onClick={() => handleTb('slide')} title="Horizontal rule" icon={Icons.hr} />
          <div style={{ flex: 1 }} />
          {isNew && (
            <input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="filename.md"
              style={{
                padding: '3px 8px', borderRadius: 4, border: '1px solid var(--empty-font-color)',
                background: 'var(--card-background-color)', color: 'inherit',
                fontSize: 'var(--gw-font-sm, 12px)', width: 130,
              }}
            />
          )}
        </div>

        {/* Editor + Preview — seamless, no border */}
        <div style={{ flex: 1, display: 'flex', paddingTop: 33, overflow: 'hidden' }}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={kd}
            placeholder="# Start writing..."
            style={{
              flex: showPreview ? '0 0 50%' : 1,
              padding: '20px max(8px, calc((100vw - 800px) / 2))',
              border: 'none', outline: 'none', resize: 'none',
              background: 'var(--card-background-color, #2f2f2f)',
              color: 'var(--main-font-color, rgba(255,255,255,0.81))',
              fontFamily: "'JetBrains Mono', 'SF Mono', 'Menlo', monospace",
              fontSize: 'var(--gw-font-base, 14px)', lineHeight: 1.8, overflow: 'auto',
            }}
          />
          {showPreview && (
            <div style={{
              flex: '0 0 50%', overflow: 'auto', padding: '20px max(8px, calc((100vw - 800px) / 2))',
              background: 'var(--main-background-color, #191919)',
            }}>
              <div className="docs-prose" style={{
                maxWidth: 720, margin: '0 auto',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 'var(--gw-font-base, 15px)', lineHeight: 1.8,
                color: 'var(--main-font-color, rgba(255,255,255,0.81))',
              }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || '*Start writing...*'}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
