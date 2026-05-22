/* ═══════════════════════════════════════════════════════════════════
   UCode2ReasoningSurface — AI-powered reasoning assistant
   Ported from Vue uCode2ReasoningSurface.vue
   ═══════════════════════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Icon } from '@usx/styles/react/icon'

// ─── Types ──────────────────────────────────────────────────────
interface ToolCall {
  tool: string
  args: string
  result?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  status?: 'thinking' | 'streaming' | 'done' | 'error'
  toolCalls?: ToolCall[]
  sources?: string[]
}

interface Model {
  id: string
  label: string
  provider: string
}

interface MCPService {
  name: string
  url: string
  type: 'mcp' | 'snackbar' | 'vault'
  status: 'online' | 'offline' | 'unknown'
}

const MODELS: Model[] = [
  { id: 'mistral', label: 'Mistral 7B', provider: 'local' },
  { id: 'mistral-large', label: 'Mistral Large', provider: 'local' },
  { id: 'claude', label: 'Claude (MCP)', provider: 'mcp' },
  { id: 'snackbar', label: 'Snackbar AI', provider: 'snackbar' },
]

const SUGGESTIONS = [
  { icon: '📋', text: 'Summarize my current tasks' },
  { icon: '🔍', text: 'Search the vault for recent notes' },
  { icon: '📊', text: 'What is the status of my workspace?' },
  { icon: '💡', text: 'Suggest improvements to my workflow' },
  { icon: '🔧', text: 'List available MCP tools' },
]

const renderMarkdown = (text: string): string => {
  return text
    .replace(/### (.+)/g, '<h3>$1</h3>')
    .replace(/## (.+)/g, '<h2>$1</h2>')
    .replace(/# (.+)/g, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/- (.+)/g, '<li>$1</li>')
    .replace(/\n/g, '<br>')
}

const UCode2ReasoningSurface: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedModel, setSelectedModel] = useState('mistral')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [mcpConnected, setMcpConnected] = useState(false)
  const [vaultConnected, setVaultConnected] = useState(false)
  const [mcpServices] = useState<MCPService[]>([
    { name: 'Snackbar Daemon', url: 'http://linux-mint-server:5175', type: 'snackbar', status: 'unknown' },
    { name: 'MCP Bridge', url: 'http://localhost:5175', type: 'mcp', status: 'unknown' },
    { name: 'Vault API', url: 'http://localhost:5175/api/vault', type: 'vault', status: 'unknown' },
  ])

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  // ─── MCP Service Discovery ──────────────────────────────────────
  const checkMCPServices = useCallback(async () => {
    const updated = [...mcpServices]
    for (const svc of updated) {
      try {
        const response = await fetch(`${svc.url}/health`, {
          signal: AbortSignal.timeout(2000),
        })
        svc.status = response.ok ? 'online' : 'offline'
      } catch {
        svc.status = 'offline'
      }
    }
    setMcpConnected(updated.some(s => s.status === 'online'))
    setVaultConnected(updated.find(s => s.type === 'vault')?.status === 'online')
  }, [mcpServices])

  useEffect(() => {
    checkMCPServices()
    const interval = setInterval(checkMCPServices, 15000)
    return () => clearInterval(interval)
  }, [checkMCPServices])

  // ─── AI Response Simulation ─────────────────────────────────────
  const getAIResponse = async (prompt: string): Promise<{
    content: string
    toolCalls: ToolCall[]
    sources: string[]
  }> => {
    const toolCalls: ToolCall[] = []
    const sources: string[] = []
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes('task') || lowerPrompt.includes('workflow')) {
      toolCalls.push({ tool: 'get_tasks', args: '{}', result: 'Found 3 active tasks' })
      sources.push('Workflow Engine')
      return {
        content: 'Here are your current tasks:\n\n1. **Review PR #42** — In Progress\n2. **Update documentation** — Pending\n3. **Deploy v1.2** — Blocked\n\nWould you like me to take action on any of these?',
        toolCalls, sources,
      }
    }

    if (lowerPrompt.includes('vault') || lowerPrompt.includes('note') || lowerPrompt.includes('search')) {
      toolCalls.push({ tool: 'search_vault', args: `{ "query": "${prompt}" }`, result: 'Found 0 results' })
      return {
        content: 'I searched the vault but didn\'t find direct matches. Try a different query.',
        toolCalls, sources,
      }
    }

    if (lowerPrompt.includes('mcp') || lowerPrompt.includes('tool')) {
      const tools = ['search_vault', 'get_tasks', 'exec_command', 'read_file', 'list_files', 'analyze_code']
      toolCalls.push({ tool: 'list_mcp_tools', args: '{}', result: `Found ${tools.length} tools` })
      return {
        content: `Available MCP Tools:\n\n${tools.map(t => `- \`${t}\``).join('\n')}\n\nI can use these to help with your workspace tasks.`,
        toolCalls, sources: ['MCP Bridge'],
      }
    }

    if (lowerPrompt.includes('status') || lowerPrompt.includes('workspace')) {
      const onlineServices = mcpServices.filter(s => s.status === 'online').map(s => s.name)
      toolCalls.push({ tool: 'get_workspace_status', args: '{}', result: `${onlineServices.length} services online` })
      return {
        content: `**Workspace Status**\n\n- **Services Online:** ${onlineServices.join(', ') || 'None'}\n- **Model:** ${MODELS.find(m => m.id === selectedModel)?.label || selectedModel}\n- **Vault:** ${vaultConnected ? '✅ Connected' : '❌ Disconnected'}\n- **MCP:** ${mcpConnected ? '✅ Connected' : '❌ Disconnected'}`,
        toolCalls, sources: ['System'],
      }
    }

    return {
      content: `I understand you're asking about "${prompt}". I can help with:\n\n- 📋 Task management\n- 🔍 Vault search\n- 🔧 MCP tool execution\n- 📊 Workspace status\n\nWhat would you like me to do?`,
      toolCalls: [], sources: [],
    }
  }

  // ─── Message Handling ───────────────────────────────────────────
  const sendMessage = async () => {
    const text = inputText.trim()
    if (!text || isProcessing) return

    setInputText('')
    setIsProcessing(true)

    const userMsg: ChatMessage = { role: 'user', content: text }
    const thinkingMsg: ChatMessage = { role: 'assistant', content: '', status: 'thinking', toolCalls: [], sources: [] }

    setMessages(prev => [...prev, userMsg, thinkingMsg])

    try {
      const response = await getAIResponse(text)
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: response.content,
          status: 'done',
          toolCalls: response.toolCalls,
          sources: response.sources,
        }
        return updated
      })
    } catch (e: any) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `❌ Error: ${e.message}`,
          status: 'error',
        }
        return updated
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const sendSuggestion = (text: string) => {
    setInputText(text)
    setTimeout(() => sendMessage(), 50)
  }

  const newChat = () => {
    setMessages([])
    setInputText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  return (
    <div className="reasoning-surface">
      {/* Surface Header */}
      <div className="reasoning-header">
        <div className="reasoning-header-left">
          <h1 className="reasoning-title">uCode2 Reasoning</h1>
          <span className="reasoning-badge">AI</span>
        </div>
        <div className="reasoning-header-right">
          <div className={`reasoning-connection-status ${mcpConnected ? 'status-connected' : 'status-connecting'}`}>
            <span className="reasoning-status-dot" />
            <span className="reasoning-status-text">{mcpConnected ? 'Connected' : 'Connecting...'}</span>
          </div>
          <select className="reasoning-model-select" value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
            {MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <button className="reasoning-btn-icon" onClick={newChat} title="New Chat">
            <Icon name="add" size={16} />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="reasoning-chat-container" ref={chatContainerRef}>
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="reasoning-empty-state">
            <div className="reasoning-empty-icon">🧠</div>
            <h2>uCode2 Reasoning</h2>
            <p className="reasoning-empty-desc">AI-powered reasoning assistant connected to your workspace.</p>
            <div className="reasoning-suggestion-chips">
              {SUGGESTIONS.map(s => (
                <button key={s.text} className="reasoning-chip" onClick={() => sendSuggestion(s.text)}>
                  {s.icon} {s.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="reasoning-messages-list">
            {messages.map((msg, idx) => (
              <div key={idx} className={`reasoning-message ${msg.role} ${msg.status || 'done'}`}>
                {/* User Message */}
                {msg.role === 'user' && (
                  <div className="reasoning-msg-content user-msg">
                    <div className="reasoning-msg-avatar">👤</div>
                    <div className="reasoning-msg-bubble">{msg.content}</div>
                  </div>
                )}

                {/* Assistant Message */}
                {msg.role === 'assistant' && (
                  <div className="reasoning-msg-content assistant-msg">
                    <div className="reasoning-msg-avatar">🧠</div>
                    <div className="reasoning-msg-bubble">
                      {/* Thinking indicator */}
                      {msg.status === 'thinking' && (
                        <div className="reasoning-thinking-indicator">
                          <span className="reasoning-thinking-dot" />
                          <span className="reasoning-thinking-dot" />
                          <span className="reasoning-thinking-dot" />
                          <span className="reasoning-thinking-label">Reasoning...</span>
                        </div>
                      )}

                      {/* Tool calls */}
                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="reasoning-tool-calls">
                          {msg.toolCalls.map((tc, tci) => (
                            <div key={tci} className="reasoning-tool-call">
                              <span className="reasoning-tool-call-icon">🔧</span>
                              <span className="reasoning-tool-call-name">{tc.tool}</span>
                              <code className="reasoning-tool-call-args">{tc.args}</code>
                              {tc.result && <span className="reasoning-tool-call-result">{tc.result}</span>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Content */}
                      {msg.content && (
                        <div className="reasoning-msg-text" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                      )}

                      {/* Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="reasoning-msg-sources">
                          <span className="reasoning-sources-label">Sources:</span>
                          {msg.sources.map((src, si) => (
                            <span key={si} className="reasoning-source-tag">{src}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="reasoning-input-area">
        <div className="reasoning-input-wrapper">
          <textarea
            ref={inputRef}
            className="reasoning-msg-input"
            value={inputText}
            onChange={e => { setInputText(e.target.value); autoResize(e) }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your workspace..."
            rows={1}
          />
          <button className="reasoning-send-btn" disabled={!inputText.trim() || isProcessing} onClick={sendMessage}>
            {!isProcessing ? (
              <Icon name="send" size={18} />
            ) : (
              <span className="reasoning-send-spinner" />
            )}
          </button>
        </div>
        <div className="reasoning-input-footer">
          <span className={`reasoning-indicator ${mcpConnected ? 'active' : ''}`}>
            <span className="reasoning-indicator-dot" /> MCP {mcpConnected ? 'Connected' : 'Disconnected'}
          </span>
          <span className={`reasoning-indicator ${vaultConnected ? 'active' : ''}`}>
            <span className="reasoning-indicator-dot" /> Vault {vaultConnected ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default UCode2ReasoningSurface
