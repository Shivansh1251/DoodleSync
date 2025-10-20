import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ApiService from '../utils/ApiService'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'

export default function RoomEntry() {
  const [mode, setMode] = useState('public')
  const [roomId, setRoomId] = useState('')
  const [name, setName] = useState('')
  const [admin, setAdmin] = useState(false)
  const [existingRooms, setExistingRooms] = useState([])
  const [showExistingRooms, setShowExistingRooms] = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [apiError, setApiError] = useState(null)
  const navigate = useNavigate()

  // Load existing rooms when component mounts
  useEffect(() => {
    loadExistingRooms()
  }, [])

  const loadExistingRooms = async () => {
    setLoadingRooms(true)
    setApiError(null)
    try {
      // First test if server is running
      console.log('Testing server connection...')
      const healthResponse = await fetch(`${SERVER_URL}/api/health`)
      if (!healthResponse.ok) {
        throw new Error('Server health check failed')
      }
      const healthData = await healthResponse.json()
      console.log('Server health:', healthData)
      
      // Now load rooms
      console.log('Loading existing rooms from:', `${SERVER_URL}/api/rooms`)
      const response = await fetch(`${SERVER_URL}/api/rooms`)
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('API result:', result)
      
      setExistingRooms(result.rooms || [])
      console.log('Loaded rooms:', result.rooms?.length || 0)
      
    } catch (err) {
      console.error('Error loading rooms:', err)
      setApiError(`Cannot connect to server: ${err.message}\nMake sure backend server is running on port 4000`)
      setExistingRooms([])
    } finally {
      setLoadingRooms(false)
    }
  }

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

  const joinExistingRoom = (roomId) => {
    if (!name.trim()) return alert('Please enter your name first')
    localStorage.setItem('ds_user', name.trim())
    navigate(`/board?room=${roomId}`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Create a test room to help with testing
  const createTestRoom = async () => {
    try {
      if (!name.trim()) {
        alert('Please enter your name first')
        return
      }
      
      console.log('Creating test room via API...')
      const response = await fetch(`${SERVER_URL}/api/create-test-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create test room: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('Test room created:', result)
      
      localStorage.setItem('ds_user', name.trim())
      navigate(`/board?room=${result.roomId}`)
      
      // Refresh the rooms list to show the new room
      setTimeout(() => loadExistingRooms(), 1000)
      
    } catch (err) {
      console.error('Error creating test room:', err)
      alert(`Failed to create test room: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-pink-100 p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center mb-2">Start or Join a Whiteboard Room</h2>
        
        {/* Create/Join New Room Section */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Room</h3>
          <div className="flex gap-2 justify-center mb-4 flex-wrap">
            <button 
              type="button" 
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${mode==='public'?'bg-indigo-600 text-white':'bg-gray-100'}`} 
              onClick={()=>setMode('public')}
            >
              Join Public Room
            </button>
            <button 
              type="button" 
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${mode==='private'?'bg-purple-600 text-white':'bg-gray-100'}`} 
              onClick={()=>setMode('private')}
            >
              Join Private Room
            </button>
            <button 
              type="button" 
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${mode==='create'?'bg-green-600 text-white':'bg-gray-100'}`} 
              onClick={()=>setMode('create')}
            >
              Create Private Room
            </button>
          </div>
          
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <input 
              className="border rounded-md px-3 py-2" 
              placeholder="Your Name" 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              required
            />
            {(mode==='private') && (
              <input 
                className="border rounded-md px-3 py-2" 
                placeholder="Room ID" 
                value={roomId} 
                onChange={e=>setRoomId(e.target.value)} 
                required
              />
            )}
            <button 
              type="submit" 
              className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90"
            >
              {mode==='public'?'Join Public Room':mode==='private'?'Join Private Room':'Create Private Room'}
            </button>
          </form>
        </div>

        {/* Existing Rooms Section - Only show for joining modes */}
        {(mode === 'public' || mode === 'private') && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Existing Rooms</h3>
              <div className="flex gap-2">
                <button
                  onClick={createTestRoom}
                  className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  title="Create a test room (will appear here after you use it)"
                >
                  Test Room
                </button>
                <button
                  onClick={loadExistingRooms}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setShowExistingRooms(!showExistingRooms)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  {showExistingRooms ? 'Hide' : 'Show'} ({existingRooms.length})
                </button>
            </div>
          </div>

          {showExistingRooms && (
            <div className="max-h-60 overflow-y-auto">
              {apiError ? (
                <div className="text-center py-4">
                  <div className="text-red-600 text-sm mb-2">{apiError}</div>
                  <div className="text-xs text-gray-500">Make sure backend server is running on port 4000</div>
                  <button
                    onClick={loadExistingRooms}
                    className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : loadingRooms ? (
                <div className="text-center py-4 text-gray-500">Loading rooms...</div>
              ) : existingRooms.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-gray-500 text-sm mb-2">No existing rooms found</div>
                  <div className="text-xs text-gray-400">Create a room and it will appear here</div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {existingRooms.map((room) => (
                    <div key={room.roomId} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm truncate">{room.roomId}</div>
                          <div className="text-xs text-gray-500">
                            Created by: {room.createdBy || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Last active: {formatDate(room.lastModified)}
                          </div>
                        </div>
                        <button
                          onClick={() => joinExistingRoom(room.roomId)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}
