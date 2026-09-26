import { useEffect, useState } from 'react'

export default function OnlineUsers({ socket, onlineUsers = [] }) {
  const [activeUsers, setActiveUsers] = useState(new Set())

  useEffect(() => {
    const currentSocket = socket?.current
    if (!currentSocket) return undefined

    const handleActivity = (data) => {
      if (!data?.userId) return

      if (!data.active) {
        setActiveUsers((current) => {
          const next = new Set(current)
          next.delete(data.userId)
          return next
        })
        return
      }

      setActiveUsers((current) => new Set([...current, data.userId]))
      window.setTimeout(() => {
        setActiveUsers((current) => {
          const next = new Set(current)
          next.delete(data.userId)
          return next
        })
      }, 3000)
    }
    const handleDisconnect = () => setActiveUsers(new Set())

    currentSocket.on('user-activity', handleActivity)
    currentSocket.on('disconnect', handleDisconnect)
    return () => {
      currentSocket.off('user-activity', handleActivity)
      currentSocket.off('disconnect', handleDisconnect)
    }
  }, [socket])

  if (onlineUsers.length === 0) {
    const connected = Boolean(socket?.current?.connected)
    return (
      <div className="room-chat-no-people">
        <span className={connected ? 'is-connected' : ''} />
        {connected ? 'You’re here — invite someone to join' : 'Reconnecting to your room…'}
      </div>
    )
  }

  return (
    <div className="room-chat-people-list">
      {onlineUsers.slice(0, 7).map((person) => {
        const active = activeUsers.has(person.id)
        const initial = person.name?.trim().charAt(0).toUpperCase() || '?'
        return (
          <span className="room-chat-person" key={person.id} title={`${person.name || 'Guest'}${active ? ' is active' : ''}`}>
            <span className="room-chat-person-avatar">
              {person.avatar ? <img src={person.avatar} alt="" loading="lazy" /> : initial}
              <i className={active ? 'is-active' : ''} />
            </span>
            <span>{person.name || 'Guest'}</span>
          </span>
        )
      })}
      {onlineUsers.length > 7 && <span className="room-chat-person-more">+{onlineUsers.length - 7}</span>}
    </div>
  )
}
