import { useEffect, useRef, useState } from 'react'

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'system', text: 'Welcome to DoodleSync Chat!', ts: new Date().toISOString() },
  ])
  const [input, setInput] = useState('')
  const listRef = useRef(null)

  const send = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages((m) => [...m, { id: Date.now(), from: 'me', text: input.trim(), ts: new Date().toISOString() }])
    setInput('')
  }

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = listRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages])

  const formatTime = (iso) => {
    try {
      const d = new Date(iso)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10 cursor-auto">
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-purple-600">Chat</span>
        </h1>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500" /> Online
        </div>
      </div>
      <div ref={listRef} className="border rounded-xl h-[60vh] sm:h-[65vh] overflow-y-auto p-3 sm:p-4 bg-white shadow-sm">
        {messages.map((m) => (
          <div key={m.id} className={`my-2 flex ${m.from === 'me' ? 'justify-end' : (m.from === 'system' ? 'justify-center' : 'justify-start')}`}>
            {m.from === 'system' ? (
              <div className="px-3 py-1.5 rounded-full text-xs bg-gray-100 text-gray-600">
                {m.text}
              </div>
            ) : (
              <div className={`max-w-[80%] sm:max-w-[70%] px-3 py-2 rounded-2xl text-sm shadow ${m.from === 'me' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                <div className="flex items-end gap-2">
                  <span className="block leading-relaxed">{m.text}</span>
                  <span className={`text-[10px] opacity-70 whitespace-nowrap ${m.from === 'me' ? 'text-white' : 'text-gray-600'}`}>{formatTime(m.ts)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={send} className="mt-4 flex gap-2">
        <input
          className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="px-4 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:opacity-95 shadow">
          Send
        </button>
      </form>
    </div>
  )
}
