import { useCallback, useEffect, useState } from 'react';
import { deleteDoc, listDocs, readDoc } from '../../vault/VaultStorage';

/**
 * Fileview — Vault file browser in Notionish style.
 */

export default function Fileview({ onOpenDoc }) {
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState('');

  const refresh = useCallback(async () => { setDocs(await listDocs()); }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const openDoc = async (name) => {
    setSelected(name);
    const text = await readDoc(name);
    setPreview(text.slice(0, 500));
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await deleteDoc(name);
    if (selected === name) { setSelected(null); setPreview(''); }
    refresh();
  };

  return (
    <div style={{
      height: '100%', display: 'flex', overflow: 'hidden',
      background: 'var(--main-background-color, #191919)',
      color: 'var(--main-font-color, rgba(255,255,255,0.81))',
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 'var(--gw-font-base, 14px)',
    }}>
      {/* File list */}
      <div style={{
        width: 260, minWidth: 260, borderRight: '1px solid var(--empty-font-color, rgba(255,255,255,0.08))',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: 'var(--secondary-background-color, #252525)',
        padding: '12px 0',
      }}>
        <div style={{ padding: '0 14px 8px', fontSize: 'var(--gw-font-xs, 11px)', fontWeight: 600, color: 'var(--secondary-font-color)', textTransform: 'uppercase', letterSpacing: 1 }}>
          📁 Vault / docs/
        </div>
        <div style={{ padding: '0 10px', overflowY: 'auto', flex: 1 }}>
          {docs.map(d => (
            <div key={d.name}
              onClick={() => openDoc(d.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px',
                borderRadius: 6, cursor: 'pointer', marginBottom: 2,
                fontSize: 'var(--gw-font-sm, 13px)',
                background: selected === d.name ? 'var(--card-hover-background-color, rgba(255,255,255,0.08))' : 'transparent',
                color: selected === d.name ? 'var(--main-font-color)' : 'var(--secondary-font-color)',
              }}
            >
              <span>📄</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {d.name.replace('.md', '')}
              </span>
              <span onClick={(e) => { e.stopPropagation(); handleDelete(d.name); }}
                style={{ color: 'var(--empty-font-color)', cursor: 'pointer', fontSize: 'var(--gw-font-xs, 11px)' }}>✕</span>
            </div>
          ))}
          {docs.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--secondary-font-color)', fontSize: 'var(--gw-font-sm, 12px)' }}>
              No documents in vault
            </div>
          )}
        </div>
      </div>

      {/* Preview pane */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        padding: '24px max(16px, calc((100vw - 800px) / 2))',
      }}>
        {selected ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 'var(--gw-font-lg, 16px)', fontWeight: 600 }}>{selected.replace('.md', '')}</span>
              <span style={{ fontSize: 'var(--gw-font-xs, 11px)', color: 'var(--secondary-font-color)' }}>.md</span>
              <button onClick={() => onOpenDoc(selected)}
                style={{
                  marginLeft: 'auto', padding: '6px 14px', borderRadius: 6, border: 'none',
                  background: 'var(--card-hover-background-color)', color: 'var(--main-font-color)',
                  cursor: 'pointer', fontSize: 'var(--gw-font-sm, 12px)', fontWeight: 500,
                }}
              >Open in Docs</button>
            </div>
            <div style={{
              background: 'var(--card-background-color, #2f2f2f)', borderRadius: 8,
              padding: 20, overflow: 'auto', flex: 1,
              fontSize: 'var(--gw-font-base, 14px)', lineHeight: 1.7, whiteSpace: 'pre-wrap',
              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              color: 'var(--secondary-font-color)',
            }}>
              {preview}{preview.length >= 500 ? '...' : ''}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--secondary-font-color)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
            <div style={{ fontSize: 'var(--gw-font-lg, 16px)', fontWeight: 500 }}>Vault File Browser</div>
            <div style={{ fontSize: 'var(--gw-font-sm, 13px)', marginTop: 6 }}>Select a document to preview</div>
          </div>
        )}
      </div>
    </div>
  );
}
