import { useState } from 'react';

/**
 * Re3Engine Panel — Deep reasoning, planning, and batch operations.
 * Designed for DevStudio IDE integration.
 */

function ExpandableSection({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 8, border: '1px solid #30363d', borderRadius: 6, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: '8px 12px', background: '#161b22', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 13, fontWeight: 600, color: '#c9d1d9',
        }}
      >
        <span>{title}</span>
        <span style={{ transform: open ? 'rotate(90deg)' : 'none', transition: '0.2s' }}>▶</span>
      </div>
      {open && <div style={{ padding: 12, background: '#0d1117' }}>{children}</div>}
    </div>
  );
}

function ReasoningStep({ step }) {
  return (
    <div style={{
      padding: '8px 12px', marginBottom: 4, borderRadius: 4,
      background: '#161b22', borderLeft: `3px solid ${step.color || '#58a6ff'}`,
      fontSize: 13, color: '#c9d1d9',
    }}>
      <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 2 }}>{step.step}</div>
      <div>{step.content}</div>
    </div>
  );
}

export default function Re3EnginePanel() {
  const [query, setQuery] = useState('');
  const [reasoning, setReasoning] = useState([]);
  const [loading, setLoading] = useState(false);

  const runPlanning = async () => {
    if (!query.trim()) return;
    setLoading(true);

    // Simulated reasoning trace
    const steps = [
      { step: 'Step 1: Parsing request', content: `Analyzing: "${query}"`, color: '#58a6ff' },
      { step: 'Step 2: Identifying constraints', content: 'Considering scope, dependencies, and requirements.', color: '#58a6ff' },
      { step: 'Step 3: Formulating plan', content: 'Breaking down into 3 sub-tasks with agent delegation.', color: '#d2a8ff' },
      { step: 'Step 4: Generating solution', content: 'Implementing across available agents.', color: '#3fb950' },
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setReasoning(prev => [...prev, steps[i]]);
    }

    setReasoning(prev => [...prev, {
      step: '✅ Complete',
      content: 'Plan generated. Review the reasoning trace above.',
      color: '#3fb950',
    }]);
    setLoading(false);
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0d1117', color: '#c9d1d9', fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px', borderBottom: '1px solid #30363d',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 13, fontWeight: 600,
      }}>
        <span>🧠 Re3Engine — Reasoning Engine</span>
        <span style={{ fontSize: 11, color: '#8b949e' }}>DevStudio Panel</span>
      </div>

      {/* Reasoning trace */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        <ExpandableSection title="Reasoning Trace" defaultOpen={true}>
          {reasoning.length === 0 && !loading && (
            <div style={{ color: '#8b949e', fontSize: 13 }}>
              Enter a prompt and run planning to see the reasoning trace.
            </div>
          )}
          {reasoning.map((step, i) => (
            <ReasoningStep key={i} step={step} />
          ))}
          {loading && (
            <div style={{ color: '#8b949e', fontSize: 13, padding: 8 }}>
              Reasoning in progress...
            </div>
          )}
        </ExpandableSection>

        <ExpandableSection title="Plan Output" defaultOpen={false}>
          <pre style={{ fontSize: 12, color: '#8b949e', whiteSpace: 'pre-wrap' }}>
            {reasoning.length > 0
              ? 'Plan:\n  1. Parse requirements\n  2. Design architecture\n  3. Implement solution\n  4. Verify correctness'
              : 'Run planning to generate a plan.'}
          </pre>
        </ExpandableSection>

        <ExpandableSection title="Batch Queue" defaultOpen={false}>
          <div style={{ fontSize: 13, color: '#8b949e' }}>
            No batch operations queued.
          </div>
        </ExpandableSection>

        <ExpandableSection title="Export to Vault" defaultOpen={false}>
          <div style={{ fontSize: 13, color: '#8b949e' }}>
            Reasoning traces can be saved to your vault for later reference.
          </div>
        </ExpandableSection>
      </div>

      {/* Input */}
      <div style={{
        padding: 12, borderTop: '1px solid #30363d',
        display: 'flex', gap: 8,
      }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && runPlanning()}
          placeholder="Enter a planning prompt..."
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 6,
            border: '1px solid #30363d', outline: 'none',
            background: '#161b22', color: '#c9d1d9', fontSize: 13,
          }}
        />
        <button onClick={runPlanning} disabled={loading}
          style={{
            padding: '8px 16px', borderRadius: 6, border: 'none',
            background: '#238636', color: '#fff', cursor: 'pointer',
            fontWeight: 600, fontSize: 13,
            opacity: loading ? 0.5 : 1,
          }}
        >Plan</button>
      </div>
    </div>
  );
}
