import { useEffect, useMemo, useState } from 'react'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import SideChat from './SideChat'

export default function BasicExample() {
  const [open, setOpen] = useState(true)
  // Simple room id from URL (?room=xyz). Defaults to 'default'
  const roomId = useMemo(() => new URLSearchParams(window.location.search).get('room') || 'default', [])

  // Persist/restore tldraw document by room (localStorage for now)
  const storageKey = `tldraw-doc-${roomId}`
  const onMount = (editor) => {
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
        } catch {}
      }, 400)
    }
    const unsub = editor.store.listen(save, { scope: 'document' })
    return () => {
      clearTimeout(t)
      unsub()
    }
  }
  return (
    <div className="w-full h-screen flex relative">
      <div className="tldraw__editor flex-1 h-full">
        <Tldraw onMount={onMount} />
      </div>
      {/* Sidebar on >= sm screens */}
      {open && (
        <div className="hidden sm:block h-full">
          <SideChat roomId={roomId} onClose={() => setOpen(false)} />
        </div>
      )}
      {/* Overlay panel on small screens */}
      {open && (
        <div className="sm:hidden absolute inset-0 bg-black/20">
          <div className="ml-auto h-full w-11/12 max-w-sm bg-white shadow-xl">
            <SideChat roomId={roomId} onClose={() => setOpen(false)} />
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
