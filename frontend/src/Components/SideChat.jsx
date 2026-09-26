import { useEffect, useRef, useState } from 'react'
import { Check, Clipboard, LogOut, MessageCircle, Send, UsersRound, X } from 'lucide-react'
import OnlineUsers from './OnlineUsers'

export default function SideChat({
  onClose,
  onLeaveRoom,
  roomId = 'default',
  socket,
  messages = [],
  onSendMessage,
  user = { name: 'Anonymous' },
  connected = false,
  onlineUsers = [],
}) {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const endRef = useRef(null)

  const formatTime = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  const send = (event) => {
    event?.preventDefault?.()
    const text = input.trim()
    if (!text || !connected) return
    onSendMessage?.(text)
    setInput('')
  }

  const handleInput = (event) => {
    setInput(event.target.value)
    const currentSocket = socket?.current
    if (currentSocket?.connected) {
      currentSocket.emit('activity', roomId, { user: { name: user.name }, type: 'writing', active: true })
      clearTimeout(handleInput.timeout)
      handleInput.timeout = setTimeout(() => {
        currentSocket.emit('activity', roomId, { user: { name: user.name }, type: 'writing', active: false })
      }, 1200)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send(event)
    }
  }

  return (
    <aside className="room-chat-panel" aria-label="Room chat">
      <header className="room-chat-header">
        <div className="room-chat-heading">
          <span className="room-chat-heading-icon"><MessageCircle size={18} strokeWidth={2.1} /></span>
          <div className="room-chat-heading-copy">
            <div className="room-chat-title-line">
              <h2>Room chat</h2>
              <span className={`room-chat-connection${connected ? ' is-connected' : ''}`}>
                <i />{connected ? 'Live' : 'Connecting'}
              </span>
            </div>
            <span className="room-chat-room-line">
              <span className="room-chat-room-label">Room <b>{roomId}</b></span>
              <button type="button" className="room-chat-room-copy" onClick={handleCopy} aria-label={copied ? 'Room code copied' : 'Copy room code'} title={copied ? 'Copied' : 'Copy room code'}>
                {copied ? <Check size={13} /> : <Clipboard size={13} />}
              </button>
            </span>
          </div>
        </div>
        <div className="room-chat-header-actions">
          {onLeaveRoom && (
            <button type="button" className="room-chat-leave" onClick={onLeaveRoom} aria-label="Leave room" title="Leave room">
              <LogOut size={15} />
              <span>Leave</span>
            </button>
          )}
          {onClose && (
            <button type="button" className="room-chat-icon-button room-chat-close" onClick={onClose} aria-label="Close chat" title="Close chat">
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      <section className="room-chat-people" aria-label="People in this room">
        <div className="room-chat-section-heading">
          <span><UsersRound size={14} /> In this room</span>
          <b>{onlineUsers.length}</b>
        </div>
        <OnlineUsers socket={socket} roomId={roomId} onlineUsers={onlineUsers} />
      </section>

      <div className="room-chat-messages" role="log" aria-label="Chat messages" aria-live="polite" aria-relevant="additions">
        {messages.length === 0 ? (
          <div className="room-chat-empty">
            <span className="room-chat-empty-icon"><MessageCircle size={22} /></span>
            <strong>Start the conversation</strong>
            <p>Share a thought or ask your team a question.</p>
          </div>
        ) : messages.map((message, index) => {
          const authorName = message.author?.name || message.user || 'Unknown'
          const mine = authorName === user.name
          const system = message.isSystemMessage || authorName === 'System'
          const timestamp = formatTime(message.timestamp || message.ts)
          const messageId = message.id || message._id || `${timestamp}-${index}`

          if (system) {
            return <div key={messageId} className="room-chat-system-message"><span>{message.text}</span></div>
          }

          const avatar = mine ? user.avatar : message.author?.avatar
          const initial = authorName.trim().charAt(0).toUpperCase() || '?'

          return (
            <article key={messageId} className={`room-chat-message${mine ? ' is-mine' : ''}`}>
              {!mine && (
                <span className="room-chat-avatar" aria-hidden="true">
                  {avatar ? <img src={avatar} alt="" loading="lazy" /> : initial}
                </span>
              )}
              <div className="room-chat-message-content">
                {!mine && <span className="room-chat-author">{authorName}</span>}
                <div className="room-chat-bubble">{message.text}</div>
                {timestamp && <time className="room-chat-time">{timestamp}</time>}
              </div>
              {mine && <span className="room-chat-avatar is-mine" aria-hidden="true">
                {avatar ? <img src={avatar} alt="" loading="lazy" /> : initial}
              </span>}
            </article>
          )
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="room-chat-composer">
        <div className="room-chat-input-wrap">
          <textarea
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={2}
            aria-label="Write a message"
            className="room-chat-input"
            placeholder={connected ? 'Message your room…' : 'Connecting to room…'}
            disabled={!connected}
          />
          <button type="submit" className="room-chat-send" disabled={!input.trim() || !connected} aria-label="Send message" title="Send message">
            <Send size={17} />
          </button>
        </div>
        <div className="room-chat-composer-footer">
          <span>Enter to send <i>·</i> Shift + Enter for a new line</span>
        </div>
      </form>
    </aside>
  )
}
