/* ═══════════════════════════════════════════════════════════════════
   code3ui — Chat Sheet Panel (React)
   ═══════════════════════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react'
import { useCode3UIStore } from './stores/code3UIStore'

const Code3UIChatSheet: React.FC = () => {
  const store = useCode3UIStore()
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [store.chatMessages])

  const sendMessage = () => {
    const text = inputText.trim()
    if (!text) return

    store.addChatMessage('user', text)
    setInputText('')

    // Simulate assistant response
    setTimeout(() => {
      store.addChatMessage('assistant', `I received your message: "${text}". This is a simulated response — wire to an actual AI backend for real functionality.`)
    }, 500)
  }

  return (
    <aside className={`code3ui-chat ${store.chatOpen ? 'open' : ''}`}>
      {/* Chat Header */}
      <div className="chat-header">
        <h3 className="chat-title">
          <span className="material-symbol" style={{ fontSize: 16, marginRight: 6, verticalAlign: 'middle' }}>chat</span>
          Assistant
        </h3>
        <button className="chat-close-btn" onClick={store.toggleChat}>
          <span className="material-symbol">close</span>
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {store.chatMessages.length === 0 ? (
          <div className="chat-empty">
            <span className="material-symbol chat-empty-icon">smart_toy</span>
            <p>Ask me anything about your documents, tasks, or workspace.</p>
          </div>
        ) : (
          store.chatMessages.map((msg, idx) => (
            <div key={idx} className={`chat-message chat-message--${msg.role}`}>
              <div className="chat-message-avatar">
                <span className="material-symbol" style={{ fontSize: 16 }}>
                  {msg.role === 'user' ? 'person' : 'smart_toy'}
                </span>
              </div>
              <div className="chat-message-content">{msg.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
          />
          <button
            className="chat-send-btn"
            onClick={sendMessage}
            disabled={!inputText.trim()}
          >
            <span className="material-symbol">send</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Code3UIChatSheet
