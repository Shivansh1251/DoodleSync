import { useState, useEffect } from 'react'

export default function OnlineUsers({ socket, roomId, onlineUsers = [] }) {
  const [activeUsers, setActiveUsers] = useState(new Set()) // Users currently drawing/active

  // Get current user info
  const getCurrentUser = () => {
    let name = localStorage.getItem('ds_user')
    if (!name) {
      name = `User-${Math.floor(Math.random() * 900 + 100)}`
      localStorage.setItem('ds_user', name)
    }
    return { name }
  }

  useEffect(() => {
    console.log('OnlineUsers: Component mounted with', onlineUsers.length, 'users:', onlineUsers)
    if (!socket?.current) {
      console.log('OnlineUsers: No socket available')
      return
    }

    const s = socket.current

    // Handle user activity (drawing, moving, etc.)
    s.on('user-activity', (data) => {
      console.log('OnlineUsers: User activity:', data)
      if (data?.userId) {
        if (data.active) {
          setActiveUsers(prev => new Set([...prev, data.userId]))
          
          // Remove from active after 3 seconds of inactivity
          setTimeout(() => {
            setActiveUsers(prev => {
              const newSet = new Set(prev)
              newSet.delete(data.userId)
              return newSet
            })
          }, 3000)
        } else {
          // Immediately remove if explicitly set to inactive
          setActiveUsers(prev => {
            const newSet = new Set(prev)
            newSet.delete(data.userId)
            return newSet
          })
        }
      }
    })

    s.on('disconnect', () => {
      console.log('OnlineUsers: Socket disconnected, clearing activity')
      setActiveUsers(new Set())
    })

    return () => {
      s.off('user-activity')
      s.off('disconnect')
    }
  }, [socket, roomId])

  // Debug: Log when onlineUsers prop changes
  useEffect(() => {
    console.log('OnlineUsers: Props changed - onlineUsers:', onlineUsers)
  }, [onlineUsers])

  const formatTime = (date) => {
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  if (onlineUsers.length === 0) {
    const s = socket?.current
    
    const handleRefresh = () => {
      console.log('OnlineUsers: Manual refresh triggered - current props:', onlineUsers)
      // The refresh now just logs current state since users come from props
    }
    
    return (
      <div className="text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Present:</span>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span>No users online</span>
          <button 
            onClick={handleRefresh}
            className="text-blue-600 hover:text-blue-800 ml-1"
            title="Refresh users"
          >
            🔄
          </button>
        </div>
        <div className="text-[10px] text-gray-400 mt-1">
          Socket: {s?.connected ? 'Connected' : 'Disconnected'} | ID: {s?.id || 'None'}
        </div>
      </div>
    )
  }

  return (
    <div className="text-xs text-gray-600">
      <div className="font-semibold mb-1">Present ({onlineUsers.length}):</div>
      <div className="flex flex-wrap gap-1">
        {onlineUsers.slice(0, 8).map((user) => {
          const isActive = activeUsers.has(user.id)
          return (
            <div key={user.id} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isActive ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
              }`}></div>
              <span className={`truncate max-w-20 ${
                isActive ? 'text-green-700 font-medium' : 'text-gray-700'
              }`}>
                {user.name}
              </span>
              {isActive && (
                <span className="text-green-600 text-[9px]">✏️</span>
              )}
            </div>
          )
        })}
        {onlineUsers.length > 8 && (
          <div className="text-xs text-gray-500 px-2 py-1">
            +{onlineUsers.length - 8}
          </div>
        )}
      </div>
    </div>
  )
}