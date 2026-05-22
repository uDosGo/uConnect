/* ═══════════════════════════════════════════════════════════════════
   USXDRendererSurface — Interactive USX Component Builder
   Compose pages from real M3-styled React components.
   ═══════════════════════════════════════════════════════════════════ */
import React, { useState, useCallback } from 'react'
import { Icon } from '../../../../packages/usx/react/Icon'
import { Button } from '../../../../packages/usx/react/Button'
import { Card, CardHeader, CardBody, CardFooter } from '../../../../packages/usx/react/Card'
import { Input, TextArea, Select } from '../../../../packages/usx/react/Input'
import { Grid, GridItem } from '../../../../packages/usx/react/Grid'


/* ─── Block Types ──────────────────────────────────────────────── */
type BlockType =
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'card'
  | 'input'
  | 'select'
  | 'divider'
  | 'grid-2'
  | 'grid-3'

interface Block {
  id: string
  type: BlockType
  props: Record<string, any>
}

let _nextId = 100
const nextId = () => `block-${_nextId++}`

/* ─── Palette Items ────────────────────────────────────────────── */
interface PaletteItem {
  type: BlockType
  label: string
  icon: string
  defaultProps: Record<string, any>
}

const PALETTE: PaletteItem[] = [
  { type: 'heading', label: 'Heading', icon: 'title', defaultProps: { level: 2, text: 'Heading' } },
  { type: 'paragraph', label: 'Paragraph', icon: 'text_fields', defaultProps: { text: 'This is a paragraph of text. Click to edit.' } },
  { type: 'button', label: 'Button', icon: 'smart_button', defaultProps: { variant: 'primary', label: 'Click Me' } },
  { type: 'card', label: 'Card', icon: 'credit_card', defaultProps: { variant: 'default', header: 'Card Title', body: 'Card content goes here.', footer: '' } },
  { type: 'input', label: 'Input', icon: 'edit', defaultProps: { label: 'Label', placeholder: 'Enter text...' } },
  { type: 'select', label: 'Select', icon: 'arrow_drop_down', defaultProps: { label: 'Choose', options: 'Option 1,Option 2,Option 3' } },
  { type: 'divider', label: 'Divider', icon: 'horizontal_rule', defaultProps: {} },
  { type: 'grid-2', label: '2-Column Grid', icon: 'view_column', defaultProps: { left: 'Left column', right: 'Right column' } },
  { type: 'grid-3', label: '3-Column Grid', icon: 'grid_view', defaultProps: { col1: 'Column 1', col2: 'Column 2', col3: 'Column 3' } },
]

/* ─── Initial Demo Blocks ──────────────────────────────────────── */
const INITIAL_BLOCKS: Block[] = [
  { id: nextId(), type: 'heading', props: { level: 1, text: 'Welcome to USXD' } },
  { id: nextId(), type: 'paragraph', props: { text: 'This is a live component builder. Add blocks from the palette above, edit them inline, and see real M3-styled React components in action.' } },
  { id: nextId(), type: 'grid-2', props: { left: 'Left column content — try adding a button or card here.', right: 'Right column content — edit this text by clicking it.' } },
  { id: nextId(), type: 'divider', props: {} },
  { id: nextId(), type: 'card', props: { variant: 'elevated', header: 'Example Card', body: 'Cards can contain any content. This one is elevated.', footer: 'Card Footer' } },
  { id: nextId(), type: 'button', props: { variant: 'primary', label: 'Get Started' } },
]

/* ─── Component ────────────────────────────────────────────────── */
const USXDRendererSurface: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  /* ── Add Block ─────────────────────────────────────────────── */
  const addBlock = useCallback((item: PaletteItem) => {
    const newBlock: Block = { id: nextId(), type: item.type, props: { ...item.defaultProps } }
    setBlocks(prev => [...prev, newBlock])
    setSelectedId(newBlock.id)
  }, [])

  /* ── Remove Block ──────────────────────────────────────────── */
  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id))
    if (selectedId === id) setSelectedId(null)
  }, [selectedId])

  /* ── Update Block Props ────────────────────────────────────── */
  const updateBlock = useCallback((id: string, patch: Record<string, any>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, props: { ...b.props, ...patch } } : b))
  }, [])

  /* ── Start Editing ─────────────────────────────────────────── */
  const startEdit = (id: string, currentText: string) => {
    setEditingId(id)
    setEditValue(currentText)
  }

  const finishEdit = (id: string) => {
    updateBlock(id, { text: editValue })
    setEditingId(null)
    setEditValue('')
  }

  /* ── Drag & Drop ───────────────────────────────────────────── */
  const onDragStart = (idx: number) => { setDraggedIndex(idx) }
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setDragOverIndex(idx)
  }
  const onDrop = (idx: number) => {
    if (draggedIndex === null || draggedIndex === idx) {
      setDraggedIndex(null); setDragOverIndex(null); return
    }
    setBlocks(prev => {
      const arr = [...prev]
      const [moved] = arr.splice(draggedIndex, 1)
      arr.splice(idx, 0, moved)
      return arr
    })
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  /* ── Render a single block to JSX ──────────────────────────── */
  const renderBlock = (block: Block, idx: number): React.ReactNode => {
    const p = block.props
    const isSelected = selectedId === block.id
    const isEditing = editingId === block.id
    const isDragOver = dragOverIndex === idx

    const wrapperClasses = [
      'usxd-canvas-block',
      isSelected ? 'usxd-block-selected' : '',
      isDragOver ? 'usxd-block-dragover' : '',
    ].filter(Boolean).join(' ')

    const handleSelect = () => setSelectedId(block.id)

    const renderEditableText = (value: string, field = 'text') => {
      if (isEditing && editingId === block.id) {
        return (
          <input
            className="usxd-inline-edit"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={() => finishEdit(block.id)}
            onKeyDown={e => { if (e.key === 'Enter') finishEdit(block.id) }}
            autoFocus
          />
        )
      }
      return (
        <span onClick={() => startEdit(block.id, value)} className="usxd-editable-text">
          {value}
        </span>
      )
    }

    let content: React.ReactNode = null

    switch (block.type) {
      case 'heading': {
        const Tag = `h${p.level || 2}` as keyof JSX.IntrinsicElements
        content = <Tag className="usxd-block-heading">{renderEditableText(p.text || 'Heading')}</Tag>
        break
      }
      case 'paragraph':
        content = <p className="usxd-block-paragraph">{renderEditableText(p.text || '')}</p>
        break
      case 'button':
        content = (
          <Button variant={p.variant || 'primary'} size={p.size || 'medium'} icon={p.icon}>
            {renderEditableText(p.label || 'Button')}
          </Button>
        )
        break
      case 'card':
        content = (
          <Card variant={p.variant || 'default'} padding={p.padding || 'md'}>
            {p.header && <CardHeader>{renderEditableText(p.header, 'header')}</CardHeader>}
            <CardBody>{renderEditableText(p.body || 'Body', 'body')}</CardBody>
            {p.footer && <CardFooter>{renderEditableText(p.footer, 'footer')}</CardFooter>}
          </Card>
        )
        break
      case 'input':
        content = (
          <Input label={p.label || 'Label'} placeholder={p.placeholder || 'Enter...'} size={p.size || 'medium'} />
        )
        break
      case 'select':
        content = (
          <Select
            label={p.label || 'Choose'}
            options={(p.options || 'Option 1,Option 2').split(',').map((s: string) => ({ value: s.trim().toLowerCase(), label: s.trim() }))}
          />
        )
        break
      case 'divider':
        content = <hr className="usxd-block-divider" />
        break
      case 'grid-2':
        content = (
          <Grid columns={{ xs: 1, sm: 1, md: 2, lg: 2 }} gap="md">
            <GridItem><div className="usxd-grid-cell">{renderEditableText(p.left || 'Left', 'left')}</div></GridItem>
            <GridItem><div className="usxd-grid-cell">{renderEditableText(p.right || 'Right', 'right')}</div></GridItem>
          </Grid>
        )
        break
      case 'grid-3':
        content = (
          <Grid columns={{ xs: 1, sm: 1, md: 3, lg: 3 }} gap="md">
            <GridItem><div className="usxd-grid-cell">{renderEditableText(p.col1 || 'Col 1', 'col1')}</div></GridItem>
            <GridItem><div className="usxd-grid-cell">{renderEditableText(p.col2 || 'Col 2', 'col2')}</div></GridItem>
            <GridItem><div className="usxd-grid-cell">{renderEditableText(p.col3 || 'Col 3', 'col3')}</div></GridItem>
          </Grid>
        )
        break
    }

    return (
      <div
        key={block.id}
        className={wrapperClasses}
        onClick={handleSelect}
        draggable
        onDragStart={() => onDragStart(idx)}
        onDragOver={(e) => onDragOver(e, idx)}
        onDrop={() => onDrop(idx)}
        onDragLeave={() => setDragOverIndex(null)}
      >
        <div className="usxd-block-tools">
          <span className="usxd-block-type-label">{block.type}</span>
          <button className="usxd-block-delete" onClick={(e) => { e.stopPropagation(); removeBlock(block.id) }} title="Remove">
            ✕
          </button>
        </div>
        <div className="usxd-block-content">
          {content}
        </div>
      </div>
    )
  }

  /* ── Property Panel for selected block ─────────────────────── */
  const selectedBlock = blocks.find(b => b.id === selectedId)

  const renderPropertyPanel = () => {
    if (!selectedBlock) return null
    const p = selectedBlock.props

    const setProp = (key: string, value: any) => updateBlock(selectedBlock.id, { [key]: value })

    const fields: React.ReactNode[] = []

    switch (selectedBlock.type) {
      case 'heading':
        fields.push(
          <div key="level" className="usxd-prop-field">
            <label>Level</label>
            <select value={p.level || 2} onChange={e => setProp('level', Number(e.target.value))}>
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
            </select>
          </div>
        )
        fields.push(
          <div key="text" className="usxd-prop-field">
            <label>Text</label>
            <input value={p.text || ''} onChange={e => setProp('text', e.target.value)} />
          </div>
        )
        break
      case 'paragraph':
        fields.push(
          <div key="text" className="usxd-prop-field">
            <label>Text</label>
            <textarea value={p.text || ''} onChange={e => setProp('text', e.target.value)} rows={3} />
          </div>
        )
        break
      case 'button':
        fields.push(
          <div key="label" className="usxd-prop-field">
            <label>Label</label>
            <input value={p.label || ''} onChange={e => setProp('label', e.target.value)} />
          </div>
        )
        fields.push(
          <div key="variant" className="usxd-prop-field">
            <label>Variant</label>
            <select value={p.variant || 'primary'} onChange={e => setProp('variant', e.target.value)}>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="ghost">Ghost</option>
              <option value="danger">Danger</option>
            </select>
          </div>
        )
        fields.push(
          <div key="size" className="usxd-prop-field">
            <label>Size</label>
            <select value={p.size || 'medium'} onChange={e => setProp('size', e.target.value)}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        )
        break
      case 'card':
        fields.push(
          <div key="variant" className="usxd-prop-field">
            <label>Variant</label>
            <select value={p.variant || 'default'} onChange={e => setProp('variant', e.target.value)}>
              <option value="default">Default</option>
              <option value="elevated">Elevated</option>
              <option value="bordered">Bordered</option>
              <option value="flat">Flat</option>
            </select>
          </div>
        )
        fields.push(
          <div key="padding" className="usxd-prop-field">
            <label>Padding</label>
            <select value={p.padding || 'md'} onChange={e => setProp('padding', e.target.value)}>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>
        )
        fields.push(
          <div key="header" className="usxd-prop-field">
            <label>Header</label>
            <input value={p.header || ''} onChange={e => setProp('header', e.target.value)} />
          </div>
        )
        fields.push(
          <div key="body" className="usxd-prop-field">
            <label>Body</label>
            <textarea value={p.body || ''} onChange={e => setProp('body', e.target.value)} rows={2} />
          </div>
        )
        fields.push(
          <div key="footer" className="usxd-prop-field">
            <label>Footer</label>
            <input value={p.footer || ''} onChange={e => setProp('footer', e.target.value)} />
          </div>
        )
        break
      case 'input':
        fields.push(
          <div key="label" className="usxd-prop-field">
            <label>Label</label>
            <input value={p.label || ''} onChange={e => setProp('label', e.target.value)} />
          </div>
        )
        fields.push(
          <div key="placeholder" className="usxd-prop-field">
            <label>Placeholder</label>
            <input value={p.placeholder || ''} onChange={e => setProp('placeholder', e.target.value)} />
          </div>
        )
        break
      case 'select':
        fields.push(
          <div key="label" className="usxd-prop-field">
            <label>Label</label>
            <input value={p.label || ''} onChange={e => setProp('label', e.target.value)} />
          </div>
        )
        fields.push(
          <div key="options" className="usxd-prop-field">
            <label>Options (comma-separated)</label>
            <input value={p.options || ''} onChange={e => setProp('options', e.target.value)} />
          </div>
        )
        break
      case 'grid-2':
        fields.push(
          <div key="left" className="usxd-prop-field">
            <label>Left Column</label>
            <textarea value={p.left || ''} onChange={e => setProp('left', e.target.value)} rows={2} />
          </div>
        )
        fields.push(
          <div key="right" className="usxd-prop-field">
            <label>Right Column</label>
            <textarea value={p.right || ''} onChange={e => setProp('right', e.target.value)} rows={2} />
          </div>
        )
        break
      case 'grid-3':
        fields.push(
          <div key="c1" className="usxd-prop-field">
            <label>Column 1</label>
            <textarea value={p.col1 || ''} onChange={e => setProp('col1', e.target.value)} rows={2} />
          </div>
        )
        fields.push(
          <div key="c2" className="usxd-prop-field">
            <label>Column 2</label>
            <textarea value={p.col2 || ''} onChange={e => setProp('col2', e.target.value)} rows={2} />
          </div>
        )
        fields.push(
          <div key="c3" className="usxd-prop-field">
            <label>Column 3</label>
            <textarea value={p.col3 || ''} onChange={e => setProp('col3', e.target.value)} rows={2} />
          </div>
        )
        break
    }

    return (
      <div className="usxd-property-panel">
        <div className="usxd-prop-header">
          <Icon name="tune" size={16} />
          <span>Properties</span>
          <span className="usxd-prop-type">{selectedBlock.type}</span>
        </div>
        <div className="usxd-prop-body">
          {fields.length > 0 ? fields : <p className="usxd-prop-empty">No properties for this block.</p>}
        </div>
      </div>
    )
  }

  /* ── Export JSON ────────────────────────────────────────────── */
  const exportJSON = () => {
    const data = blocks.map(b => ({ type: b.type, props: b.props }))
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    alert('Copied to clipboard!')
  }

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="usxd-surface">
      {/* Header */}
      <div className="surface-header">
        <div className="header-left">
          <Icon name="widgets" size={24} className="header-icon" />
          <div>
            <h1>USXD Component Builder</h1>
            <p className="surface-tagline">Compose pages from real M3-styled React components. Drag to reorder, click to edit.</p>
          </div>
        </div>
        <div className="header-right">
          <Button variant="secondary" size="small" icon="content_copy" onClick={exportJSON}>
            Export JSON
          </Button>
          <Button variant="ghost" size="small" icon="delete_sweep" onClick={() => { setBlocks([]); setSelectedId(null) }}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Palette */}
      <div className="usxd-palette">
        {PALETTE.map(item => (
          <button key={item.type} className="usxd-palette-btn" onClick={() => addBlock(item)} title={item.label}>
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Body: Canvas + Property Panel */}
      <div className="usxd-body">
        <div className="usxd-canvas">
          {blocks.length === 0 ? (
            <div className="usxd-canvas-empty">
              <Icon name="add_circle_outline" size={48} />
              <h3>Canvas is empty</h3>
              <p>Click a component from the palette above to add it here.</p>
            </div>
          ) : (
            blocks.map((block, idx) => renderBlock(block, idx))
          )}
        </div>

        {/* Property Panel */}
        {selectedBlock && (
          <div className="usxd-property-panel-wrapper">
            {renderPropertyPanel()}
          </div>
        )}
      </div>
    </div>
  )
}

export default USXDRendererSurface
