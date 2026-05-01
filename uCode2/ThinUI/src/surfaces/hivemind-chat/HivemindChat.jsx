import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { useEffect, useRef, useState } from 'react';
import { sendMessage, checkMCP } from '../mcpBridge';

/**
 * Hivemind Chat — Multi-agent orchestration surface.
 * Uses MCP backend when available, simulated responses as fallback.
 */

function HivemindChatInner() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [mcpOnline, setMcpOnline] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { checkMCP().then(setMcpOnline); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const assistantId = Date.now().toString();
    setMessages(prev => [...prev, { role: 'assistant', content: '', id: assistantId }]);

    const response = await sendMessage('hivemind', userMsg.content);

    let displayed = '';
    for (let i = 0; i < response.length; i++) {
      await new Promise(r => setTimeout(r, 8));
      displayed += response[i];
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: displayed } : m
      ));
    }

    setIsStreaming(false);
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--gw-bg-primary)', color: 'var(--gw-text-body)',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        padding: '10px 16px', borderBottom: '1px solid var(--gw-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 13, fontWeight: 600,
        background: 'var(--gw-bg-secondary)',
        color: 'var(--gw-text-heading)',
      }}>
        <span>🧠 Hivemind — Multi-Agent Chat</span>
        <span style={{ fontSize: 11, color: mcpOnline ? 'var(--gw-success)' : 'var(--gw-text-muted)' }}>
          {mcpOnline ? '● MCP Online' : '○ Simulated'}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center', color: 'var(--gw-text-muted)', fontSize: 13,
            padding: 40, display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <span style={{ fontSize: 32 }}>🧠</span>
            <span>Hivemind — Multi-Agent Orchestrator</span>
            <span style={{ fontSize: 12, color: 'var(--gw-text-disabled)' }}>
              Coordinate multiple AI agents to complete complex tasks.
            </span>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              padding: '8px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user' ? 'var(--gw-accent)' : 'var(--gw-bg-secondary)',
              color: msg.role === 'user' ? '#fff' : 'var(--gw-text-body)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--gw-border)',
              fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {msg.content || (isStreaming && msg.role === 'assistant' ? '▊' : '')}
            </div>
            <div style={{ fontSize: 10, color: 'var(--gw-text-disabled)', marginTop: 2, padding: '0 4px' }}>
              {msg.role === 'user' ? 'You' : 'Hivemind'}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{
        padding: 12, borderTop: '1px solid var(--gw-border)',
        display: 'flex', gap: 8, background: 'var(--gw-bg-secondary)',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask Hivemind..."
          disabled={isStreaming}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--gw-border)', outline: 'none',
            background: 'var(--gw-bg-primary)', color: 'var(--gw-text)',
            fontSize: 13, fontFamily: 'var(--font-sans)',
          }}
        />
        <button type="submit" disabled={isStreaming || !input.trim()}
          style={{
            padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none',
            background: isStreaming ? 'var(--gw-text-disabled)' : 'var(--gw-accent)',
            color: '#fff', cursor: 'pointer',
            fontWeight: 600, fontSize: 13,
            opacity: (!input.trim() || isStreaming) ? 0.6 : 1,
          }}
        >{isStreaming ? '...' : 'Send'}</button>
      </form>
    </div>
  );
}

export default function HivemindChat() {
  const runtime = useLocalRuntime({
    adapters: {
      chat: {
        run: async ({ messages, abortSignal }) => {
          return { messages: [] };
        },
      },
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <HivemindChatInner />
    </AssistantRuntimeProvider>
  );
}
