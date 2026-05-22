/* ═══════════════════════════════════════════════════════════════════
   VibeSurface — AI-powered chat interface for uDOS
   Ported from Vue VibeTUI.vue
   ═══════════════════════════════════════════════════════════════════ */
import React, { useState, useRef, useEffect } from 'react'
import { Icon } from '@usx/styles/react/icon'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const RESPONSES = [
  'I understand. Let me check that for you.',
  'That sounds interesting. I can help with that.',
  'I see. What would you like me to do next?',
  'Understood. Processing your request...',
  'I can help with that. What specific information do you need?',
  'Let me look into that for you.',
  'I\'m on it! Give me a moment to process...',
  'That makes sense. How can I assist further?',
]

const formatTime = (isoString: string): string => {
  const date = new Date(isoString)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

const VibeSurface: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am your uDOS assistant. How can I help you today?', timestamp: new Date().toISOString() },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages])

  const connectVibe = () => {
    setIsLoading(true)
    setError(null)
    setTimeout(() => {
      setIsConnected(true)
      setIsLoading(false)
    }, 500)
  }

  const sendMessage = async () => {
    const text = inputMessage.trim()
    if (!text) return

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInputMessage('')

    // Simulate assistant response
    await new Promise(resolve => setTimeout(resolve, 500))
    const randomResponse = RESPONSES[Math.floor(Math.random() * RESPONSES.length)]
    const assistantMsg: ChatMessage = { role: 'assistant', content: randomResponse, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, assistantMsg])
  }

  const clearChat = () => {
    setMessages([
      { role: 'assistant', content: 'Chat cleared. How can I help you?', timestamp: new Date().toISOString() },
    ])
  }

  const signOut = () => {
    setIsConnected(false)
    setError(null)
  }

  const retryConnection = () => {
    setError(null)
    connectVibe()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(150, textareaRef.current.scrollHeight)}px`
    }
  }

  return (
    <div className="vibe-surface">
      {/* Surface Header */}
      <div className="surface-header">
        <div className="header-left">
          <Icon name="chat" size={24} className="header-icon" />
          <div>
            <h1>Vibe Terminal</h1>
            <p className="surface-tagline">AI-powered chat interface for uDOS.</p>
            <p className="surface-definition">
              <strong>What's Vibe?</strong> A conversational interface that lets you talk to uDOS like a chatbot.
              Ask questions, get help, and interact with your system through natural language.
            </p>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-secondary btn-sm" onClick={clearChat}>
            <Icon name="delete" size={16} />
            Clear
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && !isLoading && !error && (
        <div className="connection-panel">
          <div className="connection-icon">
            <Icon name="lock" size={48} />
          </div>
          <h3>Sign in to Vibe</h3>
          <p>To chat with uDOS, you'll need to connect first.</p>
          <button className="btn-primary" onClick={connectVibe}>
            <Icon name="chat" size={16} />
            Connect Vibe
          </button>
          <p className="helper-text">
            <Icon name="info" size={14} />
            Vibe connects to your local uDOS services
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading Vibe terminal...</p>
          <p className="helper-text">This usually takes a few seconds.</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="error-state">
          <div className="error-icon">
            <Icon name="error" size={48} />
          </div>
          <h3>Couldn't connect to Vibe</h3>
          <p>{error}</p>
          <p className="helper-text">
            Try:<br />
            • Refreshing the page<br />
            • Checking your internet connection<br />
            • Making sure uDOS services are running
          </p>
          <div className="error-actions">
            <button onClick={retryConnection} className="btn-primary">
              <Icon name="refresh" size={16} />
              Try Again
            </button>
            <button onClick={signOut} className="btn-secondary">
              <Icon name="logout" size={16} />
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {isConnected && !isLoading && !error && messages.length === 1 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="chat" size={48} />
          </div>
          <h3>No messages yet</h3>
          <p>Start a conversation with uDOS!</p>
          <p className="helper-text">
            <Icon name="info" size={14} />
            Type a message below and press Enter
          </p>
        </div>
      )}

      {/* Main Chat */}
      {isConnected && !isLoading && !error && (
        <div className="vibe-chat-container">
          <div className="vibe-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`vibe-message ${msg.role}`}>
                <div className="vibe-message-avatar">
                  <Icon name={msg.role === 'user' ? 'person' : 'smart_toy'} size={20} />
                </div>
                <div className="vibe-message-content">
                  <p className="vibe-message-text">{msg.content}</p>
                  <p className="vibe-message-time">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="vibe-chat-input">
            <div className="vibe-input-area">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={e => { setInputMessage(e.target.value); adjustHeight() }}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                rows={1}
              />
              <button className="vibe-send-btn" onClick={sendMessage} disabled={!inputMessage.trim()}>
                <Icon name="send" size={20} />
              </button>
            </div>
            <p className="vibe-input-hint">
              <Icon name="info" size={14} />
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default VibeSurface
