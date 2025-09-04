import { useEffect, useMemo, useRef, useState } from 'react'

function getUser() {
  let name = localStorage.getItem('ds_user')
  if (!name) {
    name = `User-${Math.floor(Math.random() * 900 + 100)}`
    localStorage.setItem('ds_user', name)
  }
  return name
}

export default function SideChat({ onClose, roomId = 'default' }) {
  const [messages, setMessages] = useState([])
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
    // BroadcastChannel for realtime across tabs (same origin)
    try {
  channelRef.current = new BroadcastChannel(`board-chat-${roomId}`)
      channelRef.current.onmessage = (e) => {
        const msg = e.data
        setMessages((m) => [...m, msg])
      }
    } catch (_) {
      channelRef.current = null
    }

    // Fallback via localStorage event
    const onStorage = (e) => {
      if (e.key === storageKey && e.newValue) {
        const msg = JSON.parse(e.newValue)
        setMessages((m) => [...m, msg])
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      if (channelRef.current?.close) channelRef.current.close()
    }
  }, [])

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
      channelRef.current?.postMessage(msg)
    } catch (_) {}
    try {
      localStorage.setItem(storageKey, JSON.stringify(msg))
    } catch (_) {}
    setInput('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <aside className="h-full w-full sm:w-80 max-w-full border-l border-gray-200 bg-white flex flex-col cursor-auto">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="text-sm font-semibold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Live Chat</span>
          <span className="ml-2 inline-flex items-center text-[10px] text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1" />
            Room {roomId}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xs px-2 py-1 rounded hover:bg-gray-100">Close</button>
        )}
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
                  className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                    mine
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
      <form onSubmit={send} className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
          placeholder="Message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm hover:from-indigo-700 hover:to-purple-700"
        >
          Send
        </button>
      </form>
    </aside>
  )
}
