import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ApiService from '../utils/ApiService'
import { useAuth } from '../context/AuthContext'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const PRESET_AVATARS = [
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_32.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_33.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_34.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_26.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_27.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_28.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_29.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_30.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_16.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_1.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_2.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_3.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_4.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_5.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_6.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_7.png',
  'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_8.png',
]

export default function RoomEntry() {
  const { user, isAuthenticated } = useAuth()
  const [mode, setMode] = useState('public')
  const [roomId, setRoomId] = useState('')
  const [name, setName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0])
  const [admin, setAdmin] = useState(false)
  const [existingRooms, setExistingRooms] = useState([])
  const [showExistingRooms, setShowExistingRooms] = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [apiError, setApiError] = useState(null)
  const navigate = useNavigate()

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null
    if (avatar.startsWith('http')) return avatar
    return `${API_URL.replace('/api', '')}${avatar}`
  }

  // Load existing rooms when component mounts
  useEffect(() => {
    loadExistingRooms()
    
    // Auto-fill from authenticated user
    if (isAuthenticated && user) {
      setName(user.name)
      // If user has a custom avatar from OAuth or upload, use it
      if (user.avatar) {
        const avatarUrl = getAvatarUrl(user.avatar)
        setSelectedAvatar(avatarUrl)
      }
    } else {
      // Try to load saved name and avatar from localStorage
      const savedName = localStorage.getItem('ds_user')
      if (savedName) setName(savedName)
      const savedAvatar = localStorage.getItem('ds_avatar')
      if (savedAvatar && PRESET_AVATARS.includes(savedAvatar)) setSelectedAvatar(savedAvatar)
    }
  }, [isAuthenticated, user])

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
    localStorage.setItem('ds_avatar', selectedAvatar)
    if (isAdmin) localStorage.setItem('ds_admin', '1')
    else localStorage.removeItem('ds_admin')
    navigate(`/board?room=${id}`)
  }

  const joinExistingRoom = (roomId) => {
    if (!name.trim()) return alert('Please enter your name first')
    localStorage.setItem('ds_user', name.trim())
    localStorage.setItem('ds_avatar', selectedAvatar)
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
      localStorage.setItem('ds_avatar', selectedAvatar)
      navigate(`/board?room=${result.roomId}`)
      
      // Refresh the rooms list to show the new room
      setTimeout(() => loadExistingRooms(), 1000)
      
    } catch (err) {
      console.error('Error creating test room:', err)
      alert(`Failed to create test room: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 w-full max-w-2xl flex flex-col gap-6 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white transition-colors duration-300">Start or Join a Whiteboard Room</h2>
        
        {/* Create/Join New Room Section */}
        <div className="border-b dark:border-gray-700 pb-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-300">Create New Room</h3>
          <div className="flex gap-2 justify-center mb-4 flex-wrap">
            <button 
              type="button" 
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-300 ${mode==='public'?'bg-indigo-600 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`} 
              onClick={()=>setMode('public')}
            >
              Join Public Room
            </button>
            <button 
              type="button" 
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-300 ${mode==='private'?'bg-purple-600 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`} 
              onClick={()=>setMode('private')}
            >
              Join Private Room
            </button>
            <button 
              type="button" 
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-300 ${mode==='create'?'bg-green-600 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`} 
              onClick={()=>setMode('create')}
            >
              Create Private Room
            </button>
          </div>
          
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Select Avatar</label>
              <div className="flex gap-4 overflow-x-auto py-3 px-2 pb-5 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {PRESET_AVATARS.map((avatar, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`relative flex-shrink-0 rounded-full transition-all duration-300 ${
                      selectedAvatar === avatar 
                        ? 'ring-4 ring-purple-500 scale-110 shadow-lg' 
                        : 'ring-2 ring-gray-300 dark:ring-gray-600 hover:ring-purple-400 hover:scale-105'
                    }`}
                  >
                    <img 
                      src={avatar} 
                      alt={`Avatar ${index + 1}`} 
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {selectedAvatar === avatar && (
                      <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full p-1 shadow-md">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <input 
              className="border dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-900 dark:text-white transition-colors duration-300" 
              placeholder="Your Name" 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              required
            />
            {(mode==='private') && (
              <input 
                className="border dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-900 dark:text-white transition-colors duration-300" 
                placeholder="Room ID" 
                value={roomId} 
                onChange={e=>setRoomId(e.target.value)} 
                required
              />
            )}
            <button 
              type="submit" 
              className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity duration-300"
            >
              {mode==='public'?'Join Public Room':mode==='private'?'Join Private Room':'Create Private Room'}
            </button>
          </form>
        </div>

        {/* Existing Rooms Section - Only show for joining modes */}
        {(mode === 'public' || mode === 'private') && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Existing Rooms</h3>
              <div className="flex gap-2">
                <button
                  onClick={createTestRoom}
                  className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-300"
                  title="Create a test room (will appear here after you use it)"
                >
                  Test Room
                </button>
                <button
                  onClick={loadExistingRooms}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setShowExistingRooms(!showExistingRooms)}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-300"
                >
                  {showExistingRooms ? 'Hide' : 'Show'} ({existingRooms.length})
                </button>
            </div>
          </div>

          {showExistingRooms && (
            <div className="max-h-60 overflow-y-auto">
              {apiError ? (
                <div className="text-center py-4">
                  <div className="text-red-600 dark:text-red-400 text-sm mb-2 transition-colors duration-300">{apiError}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Make sure backend server is running on port 4000</div>
                  <button
                    onClick={loadExistingRooms}
                    className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
                  >
                    Try Again
                  </button>
                </div>
              ) : loadingRooms ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 transition-colors duration-300">Loading rooms...</div>
              ) : existingRooms.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-gray-500 dark:text-gray-400 text-sm mb-2 transition-colors duration-300">No existing rooms found</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 transition-colors duration-300">Create a room and it will appear here</div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {existingRooms.map((room) => (
                    <div key={room.roomId} className="border dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm truncate text-gray-900 dark:text-white transition-colors duration-300">{room.roomId}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            Created by: {room.createdBy || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            Last active: {formatDate(room.lastModified)}
                          </div>
                        </div>
                        <button
                          onClick={() => joinExistingRoom(room.roomId)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-300"
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
