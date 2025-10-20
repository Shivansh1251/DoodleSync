import { useEffect, useMemo, useRef, useState } from 'react'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import SideChat from './SideChat'
import ConnectionStatus from './ConnectionStatus'
import OnlineUsers from './OnlineUsers'
import { io } from 'socket.io-client'

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'

function getUser() {
  let name = localStorage.getItem('ds_user')
  if (!name) {
    name = `User-${Math.floor(Math.random() * 900 + 100)}`
    localStorage.setItem('ds_user', name)
  }
  return { name }
}

export default function BasicExample() {
  const [open, setOpen] = useState(true)
  const [socketConnected, setSocketConnected] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  
  // Simple room id from URL (?room=xyz). Defaults to 'default'
  const roomId = useMemo(() => new URLSearchParams(window.location.search).get('room') || 'default', [])
  const user = useMemo(() => getUser(), [])

  // sockets and editor refs
  const socketRef = useRef(null)
  const editorRef = useRef(null)
  const applyingRemote = useRef(false)

  // Persist/restore tldraw document by room (localStorage for now)
  const storageKey = `tldraw-doc-${roomId}`
  const onMount = (editor) => {
    editorRef.current = editor
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const snapshot = JSON.parse(raw)
        editor.store.loadSnapshot(snapshot)
      }
    } catch {}

    // save on changes (debounced)
    let t
    const save = () => {
      clearTimeout(t)
      t = setTimeout(() => {
        try {
          const snapshot = editor.store.getSnapshot()
          localStorage.setItem(storageKey, JSON.stringify(snapshot))
          // emit over socket if connected and not applying a remote update
          const s = socketRef.current
          if (s?.connected && !applyingRemote.current) {
            s.emit('doc-update', roomId, snapshot)
          }
        } catch {}
      }, 400)
    }
    const unsub = editor.store.listen(save, { scope: 'document' })

    // Emit activity when user draws (any document change)
    const activityHandler = () => {
      const s = socketRef.current
      if (s?.connected) {
        s.emit('activity', roomId, { user: { name: user.name }, type: 'drawing', active: true })
        clearTimeout(activityHandler._timeout)
        activityHandler._timeout = setTimeout(() => {
          s.emit('activity', roomId, { user: { name: user.name }, type: 'drawing', active: false })
        }, 1200)
      }
    }
    const unsubActivity = editor.store.listen(activityHandler, { scope: 'document' })

    return () => {
      clearTimeout(t)
      unsub()
      unsubActivity()
    }
  }

  // connect sockets and wire server -> editor
  useEffect(() => {
    console.log('BasicExample: Creating socket connection to', SERVER) // DEBUG
    const s = io(SERVER, { transports: ['websocket'] })
    socketRef.current = s
    
    s.on('connect', () => {
      console.log('BasicExample: Socket connected, joining room', roomId) // DEBUG
      setSocketConnected(true)
      // join after connect so socket.id is available on server
      s.emit('join-room', roomId, { id: s.id, name: user.name })
      
      // Send join message to chat
      const joinMessage = {
        id: Date.now().toString(),
        author: { id: 'system', name: 'System' },
        text: `${user.name} has joined the room`,
        timestamp: new Date(),
        isSystemMessage: true
      }
      // Small delay to ensure room is joined first
      setTimeout(() => {
        s.emit('chat-message', roomId, joinMessage)
      }, 200)
    })
    
    s.on('disconnect', () => {
      console.log('BasicExample: Socket disconnected') // DEBUG
      setSocketConnected(false)
    })

    // Handle chat messages in BasicExample
    s.on('chat-message', (message) => {
      console.log('BasicExample: Received chat message:', message) // DEBUG
      setChatMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) return prev
        return [...prev, message]
      })
    })

    // Handle chat history
    s.on('chat-history', (history) => {
      console.log('BasicExample: Received chat history:', history?.length, 'messages') // DEBUG
      setChatMessages(history || [])
    })

    // Handle presence updates
    s.on('presence-update', (evt) => {
      console.log('BasicExample: Presence update:', evt) // DEBUG
      
      if (evt?.type === 'join' && evt.roomUsers && Array.isArray(evt.roomUsers)) {
        // Process the users and add (you) label
        const usersWithLabels = evt.roomUsers.map(user => ({
          ...user,
          name: user.id === s.id ? `${user.name} (you)` : user.name
        }))
        console.log('BasicExample: Setting online users:', usersWithLabels)
        setOnlineUsers(usersWithLabels)
      } else if (evt?.type === 'leave' && evt?.user) {
        setOnlineUsers(prev => prev.filter(u => u.id !== evt.user.id))
      }
    })

    s.on('doc-init', (doc) => {
      const editor = editorRef.current
      if (!editor || !doc) return
      // Only load if different from current
      try {
        const current = editor.store.getSnapshot()
        if (JSON.stringify(current) !== JSON.stringify(doc)) {
          applyingRemote.current = true
          editor.store.loadSnapshot(doc)
        }
      } finally {
        setTimeout(() => (applyingRemote.current = false), 50)
      }
    })

    s.on('doc-update', (doc) => {
      const editor = editorRef.current
      if (!editor || !doc) return
      // Only load if different from current
      try {
        const current = editor.store.getSnapshot()
        if (JSON.stringify(current) !== JSON.stringify(doc)) {
          applyingRemote.current = true
          editor.store.loadSnapshot(doc)
        }
      } finally {
        setTimeout(() => (applyingRemote.current = false), 50)
      }
    })

    return () => {
      s.disconnect()
    }
  }, [roomId, user.name])

  // Function to send chat messages
  const sendChatMessage = (text) => {
    const s = socketRef.current
    if (!s?.connected || !text.trim()) return

    const message = {
      id: Date.now().toString(),
      author: { id: s.id, name: user.name },
      text: text.trim(),
      timestamp: new Date()
    }

    console.log('BasicExample: Sending chat message:', message) // DEBUG
    s.emit('chat-message', roomId, message)
  }

  // Function to leave room
  const leaveRoom = () => {
    if (confirm('Are you sure you want to leave this room?')) {
      // Send leave message to chat
      const s = socketRef.current
      if (s?.connected) {
        const leaveMessage = {
          id: Date.now().toString(),
          author: { id: 'system', name: 'System' },
          text: `${user.name} has left the room`,
          timestamp: new Date(),
          isSystemMessage: true
        }
        s.emit('chat-message', roomId, leaveMessage)
      }
      
      // Small delay to ensure leave message is sent
      setTimeout(() => {
        // Clear localStorage for this room
        const storageKey = `tldraw-doc-${roomId}`
        localStorage.removeItem(storageKey)
        
        // Disconnect socket
        socketRef.current?.disconnect()
        
        // Navigate back to home or room selection
        window.location.href = '/room-entry'
      }, 100)
    }
  }
  let boardContent
  try {
    boardContent = <Tldraw onMount={onMount} />
  } catch (e) {
    boardContent = <div className="flex items-center justify-center h-full text-red-600 text-lg">Whiteboard failed to load. Check console for errors.</div>
  }
  return (
    <div className="w-full h-screen flex relative">
      {/* Connection Status and Controls - Top Center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 bg-white/95 backdrop-blur rounded-lg px-4 py-2 shadow-lg border">
        <div className="flex items-center gap-4">
          <ConnectionStatus socket={socketRef} />
          <div className="text-xs text-gray-600 font-medium">Room: {roomId}</div>
          <button
            onClick={leaveRoom}
            className="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            title="Leave Room"
          >
            Leave Room
          </button>
        </div>
      </div>
      
      <div className="tldraw__editor flex-1 h-full">
        {boardContent}
      </div>
      {/* Sidebar on >= sm screens */}
      {open && (
        <div className="hidden sm:block h-full">
          <SideChat 
            roomId={roomId} 
            socket={socketRef} 
            onClose={() => setOpen(false)}
            messages={chatMessages}
            onSendMessage={sendChatMessage}
            user={user}
            connected={socketConnected}
            onlineUsers={onlineUsers}
          />
        </div>
      )}
      {/* Overlay panel on small screens */}
      {open && (
        <div className="sm:hidden absolute inset-0 bg-black/20">
          <div className="ml-auto h-full w-11/12 max-w-sm bg-white shadow-xl">
            <SideChat 
              roomId={roomId} 
              socket={socketRef} 
              onClose={() => setOpen(false)}
              messages={chatMessages}
              onSendMessage={sendChatMessage}
              user={user}
              connected={socketConnected}
              onlineUsers={onlineUsers}
            />
          </div>
        </div>
      )}
      
      {/* Chat toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed right-6 bottom-6 z-[100] rounded-lg bg-white/90 backdrop-blur text-purple-600 shadow-lg px-3 py-2 text-sm font-medium hover:bg-white border border-purple-200 transition-all duration-200"
        style={{ zIndex: 9999 }}
        title={open ? 'Close Chat' : 'Open Chat'}
      >
        {open ? '✕' : '💬'} {open ? 'Close' : 'Chat'}
      </button>
    </div>
  )
}
