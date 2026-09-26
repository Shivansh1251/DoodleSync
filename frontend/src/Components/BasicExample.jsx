import { useEffect, useMemo, useRef, useState } from 'react'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import SideChat from './SideChat'
import { io } from 'socket.io-client'
import { useTheme } from '../context/ThemeContext'
import { usePageTransition } from '../context/PageTransitionContext'
import { Check, Copy, LogOut, MessageCircle } from 'lucide-react'

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'

function getUser() {
  let name = localStorage.getItem('ds_user')
  let avatar = localStorage.getItem('ds_avatar')
  if (!name) {
    name = `User-${Math.floor(Math.random() * 900 + 100)}`
    localStorage.setItem('ds_user', name)
  }
  if (!avatar) {
    // Default avatar if none selected
    avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    localStorage.setItem('ds_avatar', avatar)
  }
  return { name, avatar }
}

export default function BasicExample() {
  const { theme } = useTheme()
  const [open, setOpen] = useState(() => window.matchMedia('(min-width: 640px)').matches)
  const [socketConnected, setSocketConnected] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [copied, setCopied] = useState(false)
  const [roomUnavailable, setRoomUnavailable] = useState(false)
  const { startPageTransition } = usePageTransition()
  
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
    editor.user.updateUserPreferences({ colorScheme: theme })
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const snapshot = JSON.parse(raw)
        editor.store.loadSnapshot(snapshot)
      }
    } catch {
      editor.store.clearHistory?.()
    }

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
        } catch {
          // Local persistence is best effort; the board remains usable.
        }
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

  useEffect(() => {
    editorRef.current?.user.updateUserPreferences({ colorScheme: theme })
  }, [theme])

  // connect sockets and wire server -> editor
  useEffect(() => {
    const s = io(SERVER, { transports: ['websocket'] })
    socketRef.current = s
    
    s.on('connect', () => {
      setSocketConnected(true)
      // join after connect so socket.id is available on server
      s.emit('join-room', roomId, { id: s.id, name: user.name, avatar: user.avatar })
      
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
      setSocketConnected(false)
    })

    s.on('room-unavailable', () => {
      setRoomUnavailable(true)
      setSocketConnected(false)
      s.disconnect()
    })

    // Handle chat messages in BasicExample
    s.on('chat-message', (message) => {
      setChatMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) return prev
        return [...prev, message]
      })
    })

    // Handle chat history
    s.on('chat-history', (history) => {
      setChatMessages(history || [])
    })

    // Handle presence updates
    s.on('presence-update', (evt) => {
      
      if (evt?.type === 'join' && evt.roomUsers && Array.isArray(evt.roomUsers)) {
        // Process the users and add (you) label
        const usersWithLabels = evt.roomUsers.map(user => ({
          ...user,
          name: user.id === s.id ? `${user.name} (you)` : user.name
        }))
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
  }, [roomId, user.name, user.avatar])

  // Function to send chat messages
  const sendChatMessage = (text) => {
    const s = socketRef.current
    if (!s?.connected || !text.trim()) return

    const message = {
      id: Date.now().toString(),
      author: { id: s.id, name: user.name, avatar: user.avatar },
      text: text.trim(),
      timestamp: new Date()
    }

    s.emit('chat-message', roomId, message)
  }

  // Function to copy room ID to clipboard
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  // Function to leave room properly
  const leaveRoom = () => {
    if (confirm('Are you sure you want to leave this room?')) {
      const s = socketRef.current
      if (s?.connected) {
        // Emit leave-room event - server will handle chat message and notifications
        s.emit('leave-room', roomId)
        
        // Small delay to ensure leave event is processed
        setTimeout(() => {
          // Clear localStorage for this room
          const storageKey = `tldraw-doc-${roomId}`
          localStorage.removeItem(storageKey)
          
          // Disconnect socket
          s.disconnect()
          
          // Navigate back to room selection
          startPageTransition('/room-entry', 'reverse')
        }, 200)
      } else {
        // If not connected, just navigate away
        startPageTransition('/room-entry', 'reverse')
      }
    }
  }
  let boardContent
  try {
    boardContent = <Tldraw onMount={onMount} />
  } catch {
    boardContent = <div className="flex items-center justify-center h-full text-red-600 text-lg">Whiteboard failed to load. Check console for errors.</div>
  }
  return (
    <div className="room-workspace">
      <div className="room-topbar" aria-label="Room controls">
        <div className="room-topbar-info">
          <span className={`room-topbar-presence${socketConnected ? ' is-connected' : ''}`} aria-label={socketConnected ? 'Connected' : 'Connecting'} />
          <span className="room-topbar-copy">
            <strong title={roomId}>{roomId}</strong>
          </span>
          <button type="button" className="room-topbar-copy-button" onClick={copyRoomId} title={copied ? 'Copied room code' : 'Copy room code'} aria-label={copied ? 'Room code copied' : 'Copy room code'}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <span className="room-topbar-divider" aria-hidden="true" />
        <button type="button" onClick={leaveRoom} className="room-leave-button" title="Leave Room">
          <LogOut size={15} aria-hidden="true" />
          <span>Leave room</span>
        </button>
      </div>
      <main className="room-workspace-main">
        <div className="tldraw__editor room-canvas-pane">
          {boardContent}
        </div>
        {open && (
          <div className="room-chat-desktop hidden sm:block">
            <SideChat 
              roomId={roomId} 
              socket={socketRef} 
              onClose={() => setOpen(false)}
              onLeaveRoom={leaveRoom}
              messages={chatMessages}
              onSendMessage={sendChatMessage}
              user={user}
              connected={socketConnected}
              onlineUsers={onlineUsers}
            />
          </div>
        )}
        {open && (
          <div className="room-chat-mobile-dock sm:hidden">
            <SideChat
              roomId={roomId}
              socket={socketRef}
              onClose={() => setOpen(false)}
              onLeaveRoom={leaveRoom}
              messages={chatMessages}
              onSendMessage={sendChatMessage}
              user={user}
              connected={socketConnected}
              onlineUsers={onlineUsers}
            />
          </div>
        )}
      </main>

      {roomUnavailable && (
        <div className="room-unavailable-overlay" role="alertdialog" aria-modal="true" aria-labelledby="room-unavailable-title">
          <section>
            <span>ROOM UNAVAILABLE</span>
            <h1 id="room-unavailable-title">This room has expired or doesn’t exist.</h1>
            <p>Guest rooms are kept for seven days. Create a new room or check the room code.</p>
            <button type="button" onClick={() => startPageTransition('/room-entry', 'reverse')}>Back to rooms</button>
          </section>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="room-chat-toggle"
          title="Open room chat"
          aria-label="Open room chat"
        >
          <MessageCircle size={19} />
          <span>Chat</span>
          {chatMessages.length > 0 && <i aria-label={`${chatMessages.length} messages`} />}
        </button>
      )}
    </div>
  )
}
