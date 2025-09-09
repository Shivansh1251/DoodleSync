import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RoomEntry() {
  const [mode, setMode] = useState('public')
  const [roomId, setRoomId] = useState('')
  const [name, setName] = useState('')
  const [admin, setAdmin] = useState(false)
  const navigate = useNavigate()

  const handleJoin = (e) => {
    e.preventDefault()
    if (!name.trim()) return alert('Name required')
    let id = roomId
    let isAdmin = false
    if (mode === 'public') {
      id = 'public-' + Math.floor(Math.random() * 100000)
    }
    if (mode === 'create') {
      id = 'pvt-' + Math.random().toString(36).slice(2, 10)
      isAdmin = true
    }
    if (!id) return alert('Room ID required')
    localStorage.setItem('ds_user', name.trim())
    if (isAdmin) localStorage.setItem('ds_admin', '1')
    else localStorage.removeItem('ds_admin')
    navigate(`/board?room=${id}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-pink-100">
      <form onSubmit={handleJoin} className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center mb-2">Start or Join a Whiteboard Room</h2>
        <div className="flex gap-4 justify-center mb-4">
          <button type="button" className={`px-4 py-2 rounded-lg font-semibold ${mode==='public'?'bg-indigo-600 text-white':'bg-gray-100'}`} onClick={()=>setMode('public')}>Join Public Room</button>
          <button type="button" className={`px-4 py-2 rounded-lg font-semibold ${mode==='private'?'bg-purple-600 text-white':'bg-gray-100'}`} onClick={()=>setMode('private')}>Join Private Room</button>
          <button type="button" className={`px-4 py-2 rounded-lg font-semibold ${mode==='create'?'bg-green-600 text-white':'bg-gray-100'}`} onClick={()=>setMode('create')}>Create Private Room</button>
        </div>
        <input className="border rounded-md px-3 py-2" placeholder="Your Name" value={name} onChange={e=>setName(e.target.value)} />
        {(mode==='private') && (
          <input className="border rounded-md px-3 py-2" placeholder="Room ID" value={roomId} onChange={e=>setRoomId(e.target.value)} />
        )}
        <button type="submit" className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold">
          {mode==='public'?'Join Public Room':mode==='private'?'Join Private Room':'Create Private Room'}
        </button>
      </form>
    </div>
  )
}
