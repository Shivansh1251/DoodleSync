import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePageTransition } from '../context/PageTransitionContext'
import AuthService from '../utils/AuthService'
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Globe2, KeyRound, LoaderCircle, Plus, RefreshCw, UsersRound } from 'lucide-react'

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

function getGuestOwnerKey() {
  const storageKey = 'ds_guest_owner_key'
  let ownerKey = localStorage.getItem(storageKey)
  if (!ownerKey) {
    const bytes = new Uint8Array(32)
    window.crypto.getRandomValues(bytes)
    ownerKey = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
    localStorage.setItem(storageKey, ownerKey)
  }
  return ownerKey
}

export default function RoomEntry() {
  const { user, isAuthenticated } = useAuth()
  const [mode, setMode] = useState('public')
  const [roomId, setRoomId] = useState('')
  const [name, setName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0])
  const [existingRooms, setExistingRooms] = useState([])
  const [showExistingRooms, setShowExistingRooms] = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [roomError, setRoomError] = useState('')
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [transitioningToBoard, setTransitioningToBoard] = useState(false)
  const { startPageTransition } = usePageTransition()

  const transitionToBoard = (target) => {
    if (transitioningToBoard) return
    setTransitioningToBoard(true)
    startPageTransition(target, 'forward')
  }

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
      const healthResponse = await fetch(`${SERVER_URL}/api/health`)
      if (!healthResponse.ok) {
        throw new Error('Server health check failed')
      }
      await healthResponse.json()
      
      // Now load rooms
      const token = AuthService.getToken()
      const response = await fetch(`${SERVER_URL}/api/rooms`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'X-Room-Owner': getGuestOwnerKey()
        }
      })
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      
      setExistingRooms(result.rooms || [])
      
    } catch (err) {
      setApiError(`Cannot connect to server: ${err.message}\nMake sure backend server is running on port 4000`)
      setExistingRooms([])
    } finally {
      setLoadingRooms(false)
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setRoomError('Please enter your name.')
    if (creatingRoom || transitioningToBoard) return
    setRoomError('')
    let id = roomId
    let isAdmin = false
    if (mode === 'public') {
      id = 'public-' + Math.floor(Math.random() * 100000)
    }
    if (mode === 'create') {
      id = 'pvt-' + Math.random().toString(36).slice(2, 10)
      isAdmin = true
    }
    if (!id) return setRoomError('Enter a room code to join.')

    setCreatingRoom(true)
    try {
      if (mode !== 'private') {
        const token = AuthService.getToken()
        const response = await fetch(`${SERVER_URL}/api/rooms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            roomId: id,
            visibility: mode === 'create' ? 'private' : 'public',
            name: name.trim(),
            avatar: selectedAvatar,
            ownerKey: getGuestOwnerKey()
          })
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not create the room.')
      }

      localStorage.setItem('ds_user', name.trim())
      localStorage.setItem('ds_avatar', selectedAvatar)
      if (isAdmin) localStorage.setItem('ds_admin', '1')
      else localStorage.removeItem('ds_admin')
      transitionToBoard(`/board?room=${encodeURIComponent(id)}`)
    } catch (error) {
      setRoomError(error.message || 'Could not create the room. Please try again.')
    } finally {
      setCreatingRoom(false)
    }
  }

  const joinExistingRoom = (roomId) => {
    if (!name.trim()) return alert('Please enter your name first')
    localStorage.setItem('ds_user', name.trim())
    localStorage.setItem('ds_avatar', selectedAvatar)
    transitionToBoard(`/board?room=${encodeURIComponent(roomId)}`)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'recently'
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return 'recently'
    return date.toLocaleDateString() + ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Create a test room to help with testing
  const createTestRoom = async () => {
    try {
      if (!name.trim()) {
        alert('Please enter your name first')
        return
      }
      
      const token = AuthService.getToken()
      const response = await fetch(`${SERVER_URL}/api/create-test-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name: name.trim(), avatar: selectedAvatar })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create test room: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      localStorage.setItem('ds_user', name.trim())
      localStorage.setItem('ds_avatar', selectedAvatar)
      transitionToBoard(`/board?room=${encodeURIComponent(result.roomId)}`)
      
      // Refresh the rooms list to show the new room
      setTimeout(() => loadExistingRooms(), 1000)
      
    } catch (err) {
      alert(`Failed to create test room: ${err.message}`)
    }
  }

  return (
    <div className="room-entry-page">
      <header className="room-entry-nav">
        <button type="button" onClick={() => startPageTransition('/', 'reverse')} className="room-entry-home">
          <ArrowLeft size={16} />
          <span>DoodleSync</span>
        </button>
      </header>

      <main className={`room-entry-layout${mode === 'create' ? ' is-create' : ''}`}>
        <section className="room-entry-primary">
          <div className="room-entry-intro">
            <span className="room-entry-eyebrow">YOUR WORKSPACE</span>
            <h1>Join a room<span>.</span></h1>
            <p>One shared canvas, ready when you are.</p>
          </div>

          <section className="room-entry-card" aria-label="Room access">
            <div className="room-entry-card-label"><span>ROOM ACCESS</span><span>01 / 02</span></div>
            <div className="room-entry-mode-picker" role="group" aria-label="Choose how to enter a room">
              <button type="button" onClick={() => setMode('public')} aria-pressed={mode === 'public'} className={mode === 'public' ? 'is-selected' : ''}>
                <Globe2 size={17} /><span>Public</span>
              </button>
              <button type="button" onClick={() => setMode('private')} aria-pressed={mode === 'private'} className={mode === 'private' ? 'is-selected' : ''}>
                <KeyRound size={17} /><span>Private</span>
              </button>
              <button type="button" onClick={() => setMode('create')} aria-pressed={mode === 'create'} className={mode === 'create' ? 'is-selected' : ''}>
                <Plus size={17} /><span>+ Private room</span>
              </button>
            </div>

            <form onSubmit={handleJoin} className="room-entry-form">
              <div className="room-entry-avatar-heading">
                <label>Choose your avatar</label>
                <span>Swipe to explore</span>
              </div>
              <div className="room-entry-avatars" aria-label="Choose an avatar">
                {PRESET_AVATARS.map((avatar, index) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`room-entry-avatar${selectedAvatar === avatar ? ' is-selected' : ''}`}
                    aria-label={`Choose avatar ${index + 1}`}
                    aria-pressed={selectedAvatar === avatar}
                  >
                    <img src={avatar} alt="" loading="lazy" />
                    {selectedAvatar === avatar && <span><Check size={13} /></span>}
                  </button>
                ))}
              </div>

              <label className="room-entry-field">
                <span>Your name</span>
                <input autoComplete="name" maxLength={80} placeholder="What should we call you?" value={name} onChange={(event) => { setName(event.target.value); setRoomError('') }} required />
              </label>
              {mode === 'private' && (
                <label className="room-entry-field room-entry-code-field">
                  <span>Room code</span>
                  <input autoComplete="off" maxLength={80} placeholder="Paste the room code" value={roomId} onChange={(event) => { setRoomId(event.target.value); setRoomError('') }} required />
                </label>
              )}
              {roomError && <p className="room-entry-error" role="alert">{roomError}</p>}
              <button type="submit" className="room-entry-submit" disabled={creatingRoom || transitioningToBoard}>
                <span>{creatingRoom ? 'Saving room…' : transitioningToBoard ? 'Opening room…' : mode === 'public' ? 'Start public room' : mode === 'private' ? 'Join room' : 'Create private room'}</span>
                <ArrowRight size={17} />
              </button>
              <p className="room-entry-retention-note">
                {isAuthenticated && !user?.isGuest ? 'Your rooms stay saved to your account.' : 'Guest rooms and chat are kept for seven days.'}
              </p>
            </form>
          </section>
        </section>

          <aside className="room-entry-rooms" aria-label="Existing rooms">
            <div className="room-entry-rooms-header">
              <span className="room-entry-rooms-icon"><UsersRound size={17} /></span>
              <div><h2>Browse rooms</h2><p>{loadingRooms ? 'Checking availability' : `${existingRooms.length} available`}</p></div>
              <span className="room-entry-rooms-count">{existingRooms.length}</span>
            </div>
            <div className="room-entry-room-actions">
              <button type="button" onClick={() => setShowExistingRooms((shown) => !shown)} aria-expanded={showExistingRooms}>
                {showExistingRooms ? 'Hide rooms' : 'Browse rooms'}
                {showExistingRooms ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              <button type="button" onClick={loadExistingRooms} disabled={loadingRooms} aria-label="Refresh rooms" title="Refresh rooms">
                <RefreshCw size={15} className={loadingRooms ? 'is-spinning' : ''} />
              </button>
              <button type="button" onClick={createTestRoom} className="room-entry-test-room">Test room</button>
            </div>

            {showExistingRooms && (
              <div className="room-entry-room-list">
                {apiError ? (
                  <div className="room-entry-room-state is-error">
                    <span>Couldn’t load rooms right now.</span>
                    <button type="button" onClick={loadExistingRooms}>Try again</button>
                  </div>
                ) : loadingRooms ? (
                  <div className="room-entry-room-state"><LoaderCircle size={18} className="is-spinning" /><span>Finding open rooms…</span></div>
                ) : existingRooms.length === 0 ? (
                  <div className="room-entry-room-state"><span>No open rooms yet.</span><small>Create a public room or join with a code.</small></div>
                ) : (
                  existingRooms.map((room) => (
                    <article key={room.roomId} className="room-entry-room-item">
                      {room.creatorAvatar
                        ? <img className="room-entry-room-avatar" src={getAvatarUrl(room.creatorAvatar)} alt="" loading="lazy" />
                        : <div className="room-entry-room-mark"><UsersRound size={15} /></div>}
                      <div className="room-entry-room-details">
                        <div className="room-entry-room-title"><strong title={room.roomId}>{room.roomId}</strong><span className={`room-entry-room-visibility${room.visibility === 'private' ? ' is-private' : ''}`}>{room.visibility === 'private' ? 'Private' : 'Public'}</span></div>
                        <span>Created by <b>{room.createdBy || 'Guest'}</b><i>·</i>{room.creatorType === 'user' ? 'Account' : 'Guest'}</span>
                        <small>Created {formatDate(room.createdAt)} <i>·</i> Updated {formatDate(room.lastModified)}</small>
                      </div>
                      <button type="button" onClick={() => joinExistingRoom(room.roomId)} disabled={transitioningToBoard} aria-label={`Join ${room.roomId}`}><ArrowRight size={16} /></button>
                    </article>
                  ))
                )}
              </div>
            )}
            {!showExistingRooms && <p className="room-entry-rooms-hint">Join a shared space or invite your team with a room code.</p>}
          </aside>
      </main>
    </div>
  )
}
