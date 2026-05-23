/* ═══════════════════════════════════════════════════════════════════
   opsui ChatSheet — Server Operations Surface Chat Panel
   ═══════════════════════════════════════════════════════════════════ */

import React, { useState, useRef, useEffect } from 'react'
import { useOpsUIStore } from './stores/opsUIStore'

export default function OpsUIChatSheet() {
  const store = useOpsUIStore()
  const [inputText, setInputText] = useState('')
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [store.chatMessages])

  const sendMessage = () => {
    const text = inputText.trim()
    if (!text) return

    store.addChatMessage('user', text)
    setInputText('')

    setTimeout(() => {
      const responses: Record<string, string> = {
        services: 'All services are running. snackbar-linux on :8484, secret-server on :30001, hivemind on :8485.',
        logs: 'Showing last 10 log entries. Use the Logs tab to filter by service or level.',
        restart: 'To restart a service, go to the Services tab and click the restart button next to the service.',
        help: 'Available commands: services, logs, restart, status, workflows, agents.',
      }

      const lower = text.toLowerCase()
      let reply = `I received your message: "${text}". This is a simulated response — wire to uServer APIs for real functionality.`

      for (const [key, val] of Object.entries(responses)) {
        if (lower.includes(key)) {
          reply = val
          break
        }
      }

      store.addChatMessage('assistant', reply)
    }, 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <aside className={`opsui-chat ${store.chatOpen ? 'open' : ''}`}>
      {/* Chat Header */}
      <div className="chat-header">
        <h3 className="chat-title">
          <span className="material-symbols-outlined chat-title-icon">smart_toy</span>
          Ops Assistant
        </h3>
        <button className="chat-close-btn" onClick={store.toggleChat}>
          <span className="material-symbols-outlined chat-close-icon">close</span>
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages" ref={messagesContainerRef}>
        {store.chatMessages.length === 0 ? (
          <div className="chat-empty">
            <span className="material-symbols-outlined chat-empty-icon">terminal</span>
            <p>Ask about service status, logs, workflows, or system health.</p>
            <div className="chat-suggestions">
              <button className="chat-suggestion" onClick={() => { store.addChatMessage('user', 'Show me service status'); setTimeout(() => store.addChatMessage('assistant', 'All services are running. snackbar-linux on :8484, secret-server on :30001, hivemind on :8485.'), 500) }}>
                Show service status
              </button>
              <button className="chat-suggestion" onClick={() => { store.addChatMessage('user', 'Any errors in logs?'); setTimeout(() => store.addChatMessage('assistant', 'Showing last 10 log entries. Use the Logs tab to filter by service or level.'), 500) }}>
                Any errors in logs?
              </button>
            </div>
          </div>
        ) : (
          store.chatMessages.map((msg, idx) => (
            <div key={idx} className={`chat-message chat-message--${msg.role}`}>
              <div className="chat-message-avatar">
                <span className="material-symbols-outlined chat-avatar-icon">
                  {msg.role === 'user' ? 'person' : 'smart_toy'}
                </span>
              </div>
              <div className="chat-message-content">{msg.content}</div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask about ops..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="chat-send-btn"
            onClick={sendMessage}
            disabled={!inputText.trim()}
          >
            <span className="material-symbols-outlined chat-send-icon">send</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
