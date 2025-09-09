import { useEffect, useMemo, useRef, useState } from 'react'

function getUser() {
  let name = localStorage.getItem('ds_user')
  if (!name) {
    name = `User-${Math.floor(Math.random() * 900 + 100)}`
    localStorage.setItem('ds_user', name)
  }
  return name
}

export default function SideChat({ onClose, roomId = 'default', socket }) {
  const [messages, setMessages] = useState([])
  const [present, setPresent] = useState([])
  const [activity, setActivity] = useState({})
  const [input, setInput] = useState('')
  const user = useMemo(() => getUser(), [])
  const channelRef = useRef(null)
  const storageKey = `board-chat-event-${roomId}`
  const listRef = useRef(null)
  const endRef = useRef(null)

  const formatTime = (iso) => {
    try {
      const d = new Date(iso)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  useEffect(() => {
    // socket backend chat
    const s = socket?.current
    const onSocketMsg = (msg) => {
      // normalize backend payload { author:{name}, text, ts, id }
      const normalized = {
        id: msg.id ?? Date.now(),
        user: msg.author?.name ?? 'Unknown',
        text: msg.text ?? '',
        ts: typeof msg.ts === 'number' ? new Date(msg.ts).toISOString() : (msg.ts || new Date().toISOString()),
      }
  setMessages((m) => (m.some((x) => x.id === normalized.id) ? m : [...m, normalized]))
    }
    const onPresence = (evt) => {
      if (!evt?.type || !evt?.user?.name) return
      const text = evt.type === 'join' ? `${evt.user.name} joined` : `${evt.user.name} left`
      const msg = { id: `presence-${evt.type}-${evt.user.name}-${Date.now()}`, user: 'system', text, ts: new Date().toISOString() }
      setMessages((m) => [...m, msg])
      // update present list
      if (evt.sockets) {
        setPresent(evt.sockets.map((sid) => evt.users?.[sid]?.name || sid))
      }
    }
    const onActivity = (evt) => {
      // evt: { user: {name}, type: 'drawing'|'writing', active: true|false }
      if (!evt?.user?.name || !evt?.type) return
      setActivity((a) => ({ ...a, [evt.user.name]: evt.active ? evt.type : null }))
    }
    if (s) {
      s.on('chat-message', onSocketMsg)
      s.on('presence-update', onPresence)
      s.on('activity', onActivity)
    }

    // BroadcastChannel for realtime across tabs (same origin)
    try {
      channelRef.current = new BroadcastChannel(`board-chat-${roomId}`)
      channelRef.current.onmessage = (e) => {
        const msg = e.data
  setMessages((m) => (m.some((x) => x.id === msg.id) ? m : [...m, msg]))
      }
    } catch (_) {
      channelRef.current = null
    }

    // Fallback via localStorage event
    const onStorage = (e) => {
      if (e.key === storageKey && e.newValue) {
        const msg = JSON.parse(e.newValue)
  setMessages((m) => (m.some((x) => x.id === msg.id) ? m : [...m, msg]))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      if (channelRef.current?.close) channelRef.current.close()
      if (s) {
        s.off('chat-message', onSocketMsg)
        s.off('presence-update', onPresence)
        s.off('activity', onActivity)
      }
    }
  }, [socket, roomId])

  // auto-scroll to the latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  const send = (e) => {
    e?.preventDefault?.()
    const text = input.trim()
    if (!text) return
    const msg = { id: Date.now(), user, text, ts: new Date().toISOString() }
    setMessages((m) => [...m, msg])
    try {
      const s = socket?.current
      if (s?.connected) {
        s.emit('chat-message', roomId, { author: { name: user }, text, ts: Date.now() })
      }
    } catch (_) { }
    try {
      channelRef.current?.postMessage(msg)
    } catch (_) { }
    try {
      localStorage.setItem(storageKey, JSON.stringify(msg))
    } catch (_) { }
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
    <aside className="h-full w-full sm:w-80 max-w-full border-l border-gray-200 bg-white flex flex-col cursor-auto">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="text-sm font-semibold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Live Chat</span>
          <span className="ml-2 inline-flex items-center text-[10px] text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1" />
            Room {roomId}
            {isAdmin && (
              <button onClick={handleCopy} className="ml-2 px-2 py-1 rounded bg-gray-200 text-xs hover:bg-gray-300">Copy</button>
            )}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xs px-2 py-1 rounded hover:bg-gray-100">Close</button>
        )}
      </div>
      {/* Presence list */}
      <div className="px-3 py-2 border-b text-xs text-gray-600 flex flex-wrap gap-2 items-center">
        <span className="font-semibold">Present:</span>
        {present.length === 0 ? <span>Loading...</span> : present.map((name) => (
          <span key={name} className="px-2 py-1 rounded bg-gray-100">{name}{activity[name] ? ` (${activity[name]})` : ''}</span>
        ))}
      </div>
      
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m) => {
          const mine = m.user === user
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%]">
                {!mine && (
                  <div className="text-[10px] text-gray-500 mb-0.5">{m.user}</div>
                )}
                <div
                  className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${mine
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}
                >
                  {m.text}
                </div>
                <div className={`mt-1 text-[10px] ${mine ? 'text-indigo-500/80 text-right' : 'text-gray-500'}`}>
                  {formatTime(m.ts)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="p-3 border-t flex flex-col gap-2">
        <textarea
          value={input}
          onChange={handleInput}
          onKeyDown={onKeyDown}
          rows={2}
          className="w-full resize-none border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Type a message..."
        />
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-3 py-1.5 rounded bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
            disabled={!input.trim()}
          >
            Send
          </button>
          <span className="text-[10px] text-gray-400">Enter to send • Shift+Enter newline</span>
        </div>
      </form>
    </aside>
  )
}
