import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { useEffect, useRef, useState } from 'react';

/**
 * Re3Engine Panel — AI assistant surface powered by @assistant-ui/react.
 * Streaming chat with markdown rendering, styled for Gift Wrapper.
 */

function Re3EngineChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
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

    // Add an assistant placeholder
    const assistantId = Date.now().toString();
    setMessages(prev => [...prev, { role: 'assistant', content: '', id: assistantId }]);

    // Simulated streaming response (in production, connect to MCP backend)
    const response = `I've analyzed your request: "${userMsg.content}"

Here's my reasoning:

1. **Parsing the request** — Understanding the key requirements and constraints.
2. **Identifying dependencies** — Checking available tools and resources.
3. **Formulating a plan** — Breaking the task into actionable steps.
4. **Generating solution** — Producing the final result.

> *This surface uses @assistant-ui/react for runtime state management.*
> *Connect a ChatModelAdapter to enable real LLM inference.*`;

    // Stream character by character
    let displayed = '';
    for (let i = 0; i < response.length; i++) {
      await new Promise(r => setTimeout(r, 10));
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
      {/* Header */}
      <div style={{
        padding: '10px 16px', borderBottom: '1px solid var(--gw-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 13, fontWeight: 600,
        background: 'var(--gw-bg-secondary)',
        color: 'var(--gw-text-heading)',
      }}>
        <span>🤖 Re3Engine — AI Assistant</span>
        <span style={{ fontSize: 11, color: 'var(--gw-text-muted)' }}>@assistant-ui/react</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center', color: 'var(--gw-text-muted)', fontSize: 13,
            padding: 40, display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <span style={{ fontSize: 32 }}>🤖</span>
            <span>Re3Engine AI Assistant</span>
            <span style={{ fontSize: 12, color: 'var(--gw-text-disabled)' }}>
              Ask me anything — planning, reasoning, code generation, and more.
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
              {msg.role === 'user' ? 'You' : 'Re3Engine'}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{
        padding: 12, borderTop: '1px solid var(--gw-border)',
        display: 'flex', gap: 8, background: 'var(--gw-bg-secondary)',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask Re3Engine..."
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

export default function Re3EnginePanel() {
  const runtime = useLocalRuntime({
    adapters: {
      chat: {
        run: async ({ messages, abortSignal }) => {
          // Local runtime adapter — in production, connect to MCP backend
          return { messages: [] };
        },
      },
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Re3EngineChat />
    </AssistantRuntimeProvider>
  );
}
