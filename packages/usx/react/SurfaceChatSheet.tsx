/* ═══════════════════════════════════════════════════════════════════
   @usx/react/surface — SurfaceChatSheet
   Shared chat sheet panel for all USX surfaces.
   Provides: message list, input, send, auto-scroll
   ═══════════════════════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react'
import { Icon } from './Icon'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface SurfaceChatSheetProps {
  open: boolean
  onClose: () => void
  messages: ChatMessage[]
  onSendMessage: (text: string) => void
  placeholder?: string
}

export const SurfaceChatSheet: React.FC<SurfaceChatSheetProps> = ({
  open,
  onClose,
  messages,
  onSendMessage,
  placeholder = 'Type a message...',
}) => {
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = () => {
    const text = inputText.trim()
    if (!text) return
    onSendMessage(text)
    setInputText('')
  }

  return (
    <aside className={`usx-chat ${open ? 'open' : ''}`}>
      {/* Chat Header */}
      <div className="chat-header">
        <h3 className="chat-title">
          <Icon name="chat" size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Assistant
        </h3>
        <button className="chat-close-btn" onClick={onClose}>
          <Icon name="close" size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <Icon name="smart_toy" size={48} className="chat-empty-icon" />
            <p>Ask me anything about your documents, tasks, or workspace.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`chat-message chat-message--${msg.role}`}>
              <div className="chat-message-avatar">
                <Icon name={msg.role === 'user' ? 'person' : 'smart_toy'} size={16} />
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
            placeholder={placeholder}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
          />
          <button
            className="chat-send-btn"
            onClick={sendMessage}
            disabled={!inputText.trim()}
          >
            <Icon name="send" size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
