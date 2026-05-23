/* ═══════════════════════════════════════════════════════════════════
   code4ui ChatSheet — Wireframe Surface Chat Panel
   ═══════════════════════════════════════════════════════════════════ */

import React, { useState, useRef, useEffect } from 'react'
import { useCode4UIStore } from './stores/code4UIStore'

export default function Code4UIChatSheet() {
  const store = useCode4UIStore()
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
      store.addChatMessage('assistant', `I received your message: "${text}". This is a simulated response — wire to an actual AI backend for real functionality.`)
    }, 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <aside className={`code4ui-chat ${store.chatOpen ? 'open' : ''}`}>
      {/* Chat Header */}
      <div className="chat-header">
        <h3 className="chat-title">
          <span className="material-symbols-outlined chat-title-icon">chat</span>
          Assistant
        </h3>
        <button className="chat-close-btn" onClick={store.toggleChat}>
          <span className="material-symbols-outlined chat-close-icon">close</span>
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages" ref={messagesContainerRef}>
        {store.chatMessages.length === 0 ? (
          <div className="chat-empty">
            <span className="material-symbols-outlined chat-empty-icon">smart_toy</span>
            <p>Ask me anything about your workspace, wireframes, or system status.</p>
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
            placeholder="Type a message..."
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
