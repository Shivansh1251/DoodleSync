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
      <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Present:</span>
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full transition-colors duration-300"></div>
          <span>No users online</span>
          <button 
            onClick={handleRefresh}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 ml-1 transition-colors duration-300"
            title="Refresh users"
          >
            🔄
          </button>
        </div>
        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 transition-colors duration-300">
          Socket: {s?.connected ? 'Connected' : 'Disconnected'} | ID: {s?.id || 'None'}
        </div>
      </div>
    )
  }

  return (
    <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
      <div className="font-semibold mb-1">Present ({onlineUsers.length}):</div>
      <div className="flex flex-wrap gap-1">
        {onlineUsers.slice(0, 8).map((user) => {
          const isActive = activeUsers.has(user.id)
          return (
            <div key={user.id} className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs transition-colors duration-300 border border-gray-200 dark:border-gray-600">
              <div className="relative">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-4 h-4 rounded-full bg-white dark:bg-gray-800"
                  />
                ) : (
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                    isActive ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
                  }`}></div>
                )}
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-gray-800"></span>
                )}
              </div>
              <span className={`truncate max-w-20 transition-colors duration-300 ${
                isActive ? 'text-green-700 dark:text-green-300 font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {user.name}
              </span>
            </div>
          )
        })}
        {onlineUsers.length > 8 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 transition-colors duration-300">
            +{onlineUsers.length - 8}
          </div>
        )}
      </div>
    </div>
  )
}