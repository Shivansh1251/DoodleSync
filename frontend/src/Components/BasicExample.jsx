import { useEffect, useMemo, useRef, useState } from 'react'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import SideChat from './SideChat'
import { io } from 'socket.io-client'

const SERVER = 'https://doodlesync-backend.onrender.com'

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
    const s = io(SERVER, { transports: ['websocket'] })
    socketRef.current = s
    s.on('connect', () => {
      // join after connect so socket.id is available on server
      s.emit('join-room', roomId, { id: s.id, name: user.name })
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
  let boardContent
  try {
    boardContent = <Tldraw onMount={onMount} />
  } catch (e) {
    boardContent = <div className="flex items-center justify-center h-full text-red-600 text-lg">Whiteboard failed to load. Check console for errors.</div>
  }
  return (
    <div className="w-full h-screen flex relative">
      <div className="tldraw__editor flex-1 h-full">
        {boardContent}
      </div>
      {/* Sidebar on >= sm screens */}
      {open && (
        <div className="hidden sm:block h-full">
          <SideChat roomId={roomId} socket={socketRef} onClose={() => setOpen(false)} />
        </div>
      )}
      {/* Overlay panel on small screens */}
      {open && (
        <div className="sm:hidden absolute inset-0 bg-black/20">
          <div className="ml-auto h-full w-11/12 max-w-sm bg-white shadow-xl">
            <SideChat roomId={roomId} socket={socketRef} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
      {/* Floating toggle button for small screens */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-4 z-50 rounded-full bg-purple-600 text-white shadow-lg px-4 py-2 text-sm hover:bg-purple-700"
        >
          Open Chat
        </button>
      )}
    </div>
  )
}
