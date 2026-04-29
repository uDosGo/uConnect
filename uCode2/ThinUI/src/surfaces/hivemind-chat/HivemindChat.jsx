import React, { useState, useCallback } from 'react';

/**
 * Hivemind Chat — Multi-agent orchestration surface.
 *
 * In a production build this would use @assistant-ui/react for:
 *   - Streaming chat via MCP backend
 *   - Tool call approve/reject/edit UI
 *   - Markdown / code rendering
 *   - Multi-skin support (teletext, modern, dark)
 *
 * This is a self-contained demo that works without external dependencies.
 */

const SKINS = {
  teletext: {
    bg: '#000', fg: '#0ff', accent: '#ff0',
    font: "'VT323', 'Courier New', monospace",
    name: 'Teletext',
  },
  modern: {
    bg: '#1a1a2e', fg: '#e0e0e0', accent: '#e94560',
    font: 'system-ui, sans-serif',
    name: 'Modern',
  },
  dark: {
    bg: '#0d1117', fg: '#c9d1d9', accent: '#58a6ff',
    font: 'system-ui, sans-serif',
    name: 'Dark',
  },
};

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content: 'Hello! I\'m Hivemind, your multi-agent orchestrator. I can coordinate multiple AI agents to complete complex tasks. How can I help?',
  },
];

function ToolCallCard({ toolCall, onApprove, onReject, skin }) {
  const s = SKINS[skin] || SKINS.modern;
  return (
    <div style={{
      border: `1px solid ${s.accent}`, borderRadius: 8, padding: 12,
      margin: '8px 0', background: `${s.accent}10`,
    }}>
      <div style={{ fontSize: 12, color: s.accent, marginBottom: 6, fontWeight: 600 }}>
        🔧 Tool Call: {toolCall.name}
      </div>
      <pre style={{ fontSize: 13, margin: '4px 0 8px', whiteSpace: 'pre-wrap', color: s.fg }}>
        {JSON.stringify(toolCall.args, null, 2)}
      </pre>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onApprove} style={btnStyle(s.accent, s.bg)}>✓ Approve</button>
        <button onClick={onReject} style={{ ...btnStyle('#e94560', s.bg), background: '#e94560' }}>✗ Reject</button>
        <button onClick={() => {}} style={btnStyle(s.fg, s.bg)}>✏️ Edit</button>
      </div>
    </div>
  );
}

function btnStyle(accent, bg) {
  return {
    padding: '6px 14px', border: `1px solid ${accent}`, borderRadius: 6,
    cursor: 'pointer', fontSize: 12, fontWeight: 600,
    color: accent, background: bg,
  };
}

function Message({ msg, skin }) {
  const s = SKINS[skin] || SKINS.modern;
  const isUser = msg.role === 'user';

  if (msg.toolCall) {
    return <ToolCallCard toolCall={msg.toolCall} skin={skin} />;
  }

  return (
    <div style={{
      display: 'flex', marginBottom: 12,
      justifyContent: isUser ? 'flex-end' : 'flex-start',
    }}>
      <div style={{
        maxWidth: '80%', padding: '10px 14px', borderRadius: 12,
        background: isUser ? s.accent : `${s.bg}80`,
        color: isUser ? '#fff' : s.fg,
        border: isUser ? 'none' : `1px solid ${s.accent}40`,
        fontFamily: s.font, fontSize: 14, lineHeight: 1.5,
      }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function HivemindChat() {
  const [skin, setSkin] = useState('teletext');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const s = SKINS[skin] || SKINS.teletext;

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulated agent response with tool call
    setTimeout(() => {
      const responses = [
        {
          role: 'assistant',
          content: 'I\'ll orchestrate this task across my available agents.',
        },
        {
          toolCall: {
            name: 'generate_code',
            args: { prompt: input.trim(), language: 'python' },
          },
        },
        {
          role: 'assistant',
          content: `✓ Task completed. I used 2 agents to fulfill your request.`,
        },
      ];
      setMessages(prev => [...prev, ...responses]);
      setLoading(false);
    }, 800);
  }, [input, loading]);

  return (
    <div style={{
      display: 'flex', height: '100%', background: s.bg, color: s.fg,
      fontFamily: s.font,
    }}>
      {/* Sidebar */}
      <div style={{
        width: 180, padding: 12, borderRight: `1px solid ${s.accent}30`,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ fontSize: 11, color: s.accent, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
          🧠 Agents
        </div>
        {['OK Agent', 'Code Assistant', 'Vault Searcher', 'Device Manager'].map(a => (
          <div key={a} style={{
            padding: '8px 10px', borderRadius: 6, fontSize: 13,
            background: `${s.accent}15`, cursor: 'pointer',
          }}>
            {a}
          </div>
        ))}
        <div style={{ marginTop: 'auto', fontSize: 11, color: `${s.fg}60` }}>
          Skin:
          <select value={skin} onChange={e => setSkin(e.target.value)}
            style={{
              display: 'block', marginTop: 4, padding: '4px 8px',
              background: s.bg, color: s.fg, border: `1px solid ${s.accent}40`,
              borderRadius: 4, fontFamily: s.font, fontSize: 12,
            }}
          >
            {Object.entries(SKINS).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '8px 16px', borderBottom: `1px solid ${s.accent}30`,
          fontSize: 12, color: `${s.fg}70`,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>🤖 Hivemind Chat — {SKINS[skin].name} Skin</span>
          <span>MCP • Ollama • Swarm</span>
        </div>

        <div style={{
          flex: 1, overflowY: 'auto', padding: 16,
          display: 'flex', flexDirection: 'column',
        }}>
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} skin={skin} />
          ))}
          {loading && (
            <div style={{ color: `${s.fg}60`, fontSize: 13, padding: 8 }}>
              Hivemind is thinking...
            </div>
          )}
        </div>

        <div style={{
          padding: 12, borderTop: `1px solid ${s.accent}30`,
          display: 'flex', gap: 8,
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 8,
              border: `1px solid ${s.accent}40`, outline: 'none',
              background: s.bg, color: s.fg,
              fontFamily: s.font, fontSize: 14,
            }}
          />
          <button onClick={sendMessage} disabled={loading}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: s.accent, color: '#fff', cursor: 'pointer',
              fontWeight: 600, fontSize: 14,
              opacity: loading ? 0.5 : 1,
            }}
          >Send</button>
        </div>
      </div>
    </div>
  );
}"""
Hivemind Chat — ThinUI browser surface for multi-agent orchestration.

Uses @assistant-ui/react for streaming, tool calls, and skin support.
"""
