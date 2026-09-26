import { useEffect, useRef, useState } from 'react'
import OnlineUsers from './OnlineUsers'

export default function SideChat({ 
  onClose, 
  roomId = 'default', 
  socket, 
  messages = [], 
  onSendMessage, 
  user = { name: 'Anonymous' }, 
  connected = false,
  onlineUsers = []
}) {
  const [input, setInput] = useState('')
  const endRef = useRef(null)

  const formatTime = (iso) => {
    try {
      const d = new Date(iso)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  // auto-scroll to the latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  const send = (e) => {
    e?.preventDefault?.()
    const text = input.trim()
    if (!text) return
    
    // Use the passed onSendMessage function
    if (onSendMessage) {
      onSendMessage(text)
    }
    setInput('')
  }

  const handleInput = (e) => {
    setInput(e.target.value)
    const s = socket?.current
    if (s?.connected) {
      s.emit('activity', roomId, { user: { name: user }, type: 'writing', active: true })
      clearTimeout(handleInput._timeout)
      handleInput._timeout = setTimeout(() => {
        s.emit('activity', roomId, { user: { name: user }, type: 'writing', active: false })
      }, 1200)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('ds_admin') === '1'
  const handleCopy = () => {
    navigator.clipboard.writeText(roomId)
  }
  return (
    <aside className="h-full w-full sm:w-80 max-w-full border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col cursor-auto transition-colors duration-300">
      <div className="flex items-center justify-between px-3 py-2 border-b dark:border-gray-700 transition-colors duration-300">
        <div className="text-sm font-semibold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Live Chat</span>
          <span className="ml-2 inline-flex items-center text-[10px] text-gray-500 dark:text-gray-400 transition-colors duration-300">
            <span className={`w-2 h-2 rounded-full mr-1 ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            Room {roomId} ({messages.length} messages)
            {isAdmin && (
              <button onClick={handleCopy} className="ml-2 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300">Copy</button>
            )}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors duration-300">Close</button>
        )}
      </div>
      {/* Online Users */}
      <div className="px-3 py-2 border-b dark:border-gray-700 transition-colors duration-300">
        <OnlineUsers socket={socket} roomId={roomId} onlineUsers={onlineUsers} />
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4 transition-colors duration-300">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((m) => {
            const authorName = m.author?.name || m.user || 'Unknown'
            const mine = authorName === user.name
            const isSystem = m.isSystemMessage || authorName === 'System'
            
            // Render system messages differently
            if (isSystem) {
              return (
                <div key={m.id} className="flex justify-center my-2">
                  <div className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800 transition-colors duration-300">
                    {m.text}
                  </div>
                </div>
              )
            }
            
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {!mine && (
                  <div className="flex-shrink-0 mb-4">
                    {m.author?.avatar ? (
                      <img 
                        src={m.author.avatar} 
                        alt={authorName} 
                        className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
                <div className={`max-w-[85%] ${mine ? '' : ''}`}>
                  {!mine && (
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 ml-1 transition-colors duration-300">{authorName}</div>
                  )}
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words transition-colors duration-300 ${mine
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                      }`}
                  >
                    {m.text}
                  </div>
                  <div className={`mt-1 text-[10px] transition-colors duration-300 ${mine ? 'text-indigo-500/80 dark:text-indigo-300/80 text-right' : 'text-gray-500 dark:text-gray-400 ml-1'}`}>
                    {formatTime(m.timestamp || m.ts)}
                  </div>
                </div>
                {mine && (
                  <div className="flex-shrink-0 mb-4">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="p-3 border-t dark:border-gray-700 flex flex-col gap-2 transition-colors duration-300">
        <textarea
          value={input}
          onChange={handleInput}
          onKeyDown={onKeyDown}
          rows={2}
          className="w-full resize-none border dark:border-gray-600 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-900 dark:text-white transition-colors duration-300"
          placeholder="Type a message..."
        />
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-3 py-1.5 rounded bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-300"
            disabled={!input.trim() || !connected}
          >
            {connected ? 'Send' : 'Connecting...'}
          </button>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 transition-colors duration-300">Enter to send • Shift+Enter newline</span>
        </div>
      </form>
    </aside>
  )
}
