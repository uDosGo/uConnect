import { useState } from 'react';

const SAMPLE_ARTICLE = `# The Art of Wrapping

*Serving up gifts, all wrapped up.*

---

**Gift Wrapper** is a content delivery system that reimagines how we serve
digital experiences. By focusing on the presentation layer — the "wrap" —
we can create interfaces that are both beautiful and functional.

## The Philosophy

At its core, the idea is simple: every piece of content deserves to be
presented with care, like a gift. The wrapping — the UI chrome, the
typography, the spacing — should enhance the experience without
distracting from the content itself.

## Key Principles

- **Distraction-free reading**: Centre content, generous margins, no clutter.
- **Responsive typography**: Font sizes that adapt from mobile to wide desktop.
- **Consistent rhythm**: Same spacing, same line-height, same voice.

> "Design is not just what it looks like and feels like. Design is how it works."
> — *Steve Jobs*

### Implementation

The current implementation uses a 5-level font size system across four
breakpoints, from 6px on mobile up to 24px on wide screens. Line-height
is set at 1.75 for optimal readability, with a max line length of 65
characters — the classic typographic standard.

\`\`\`
                     ┌──────────────────────┐
                     │  GIFT WRAPPER        │
                     │  Serving up content, │
                     │  gift wrapped!       │
                     └──────────────────────┘
\`\`\`

| Level | Mobile | Desktop | Wide |
|-------|:-----:|:-------:|:----:|
| 0     | 6px   | 14px    | 16px |
| 2     | 10px  | 18px    | 20px |
| 4     | 14px  | 22px    | 24px |

The future of content delivery is wrapped.`;

const LEVELS = [
  { label: 'XS', mobile: 6,  desktop: 14,  wide: 16 },
  { label: 'S',  mobile: 8,  desktop: 16,  wide: 18 },
  { label: 'M',  mobile: 10, desktop: 18,  wide: 20 },
  { label: 'L',  mobile: 12, desktop: 20,  wide: 22 },
  { label: 'XL', mobile: 14, desktop: 22,  wide: 24 },
];

function renderProse(md) {
  let html = md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/<li>.+<\/li>/g, m => `<ul>${m}</ul>`);
  return `<div class="prose-content">${html}</div>`;
}

export default function Reader() {
  const [level, setLevel] = useState(2);
  const [showGrid, setShowGrid] = useState(false);

  return (
    <div className="reader" style={{ '--reader-level': level }}>
      <div className="reader-controls">
        <div className="reader-level-group">
          {LEVELS.map((l, i) => (
            <button key={i} className={`reader-level-btn${i === level ? ' active' : ''}`} onClick={() => setLevel(i)}>
              {l.label}
            </button>
          ))}
        </div>
        <button className={`reader-grid-toggle${showGrid ? ' active' : ''}`} onClick={() => setShowGrid(!showGrid)} title="Toggle grid overlay">
          ▦
        </button>
        <span className="reader-progress">Page 1/3</span>
      </div>
      <div className="reader-content" dangerouslySetInnerHTML={{ __html: renderProse(SAMPLE_ARTICLE) }} />
      {showGrid && <div className="reader-grid-overlay"><pre>{`┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘`}</pre></div>}
    </div>
  );
}
