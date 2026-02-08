import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import AuthService from '../utils/AuthService'

export default function UserProfile() {
  const { user, logout, updateProfile, uploadAvatar } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    theme: user?.preferences?.theme || 'system',
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    soundEnabled: user?.preferences?.soundEnabled ?? true
  })
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await updateProfile({
        name: form.name,
        bio: form.bio,
        preferences: {
          theme: form.theme,
          emailNotifications: form.emailNotifications,
          soundEnabled: form.soundEnabled
        }
      })
      setMessage('Profile updated successfully')
      setEditing(false)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      await uploadAvatar(file)
      setMessage('Avatar updated successfully')
    } catch (err) {
      setError(err.message || 'Failed to upload avatar')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const loadActivity = async () => {
    try {
      const data = await AuthService.getActivity()
      setActivity(data)
    } catch (err) {
      console.error('Failed to load activity:', err)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-32"></div>
          
          {/* Profile Section */}
          <div className="px-6 pb-6">
            <div className="flex items-start -mt-16 mb-4">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:4000${user.avatar}`}
                    alt={user.name}
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                {!user.isGuest && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50"
                    title="Change avatar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="ml-6 flex-1 mt-16">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.name}
                      {user.isGuest && (
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                          (Guest)
                        </span>
                      )}
                    </h1>
                    {user.email && (
                      <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                    )}
                  </div>
                  {!editing ? (
                    <div className="space-x-2">
                      {!user.isGuest && (
                        <button
                          onClick={() => setEditing(true)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Edit Profile
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={() => setEditing(false)}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {message && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {user.isGuest && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  You are using a guest account. <Link to="/signup" className="font-medium underline">Create an account</Link> to save your work and access more features.
                </p>
              </div>
            )}

            {/* Profile Content */}
            <div className="mt-6 space-y-6">
              {/* Bio Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Bio</h2>
                {editing ? (
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={onChange}
                    maxLength={500}
                    rows={3}
                    className="w-full border dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:text-white resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    {user.bio || 'No bio yet'}
                  </p>
                )}
              </div>

              {/* Preferences */}
              {!user.isGuest && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Theme
                      </label>
                      <select
                        name="theme"
                        value={form.theme}
                        onChange={onChange}
                        disabled={!editing}
                        className="w-full border dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:text-white disabled:opacity-60"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={form.emailNotifications}
                        onChange={onChange}
                        disabled={!editing}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-60"
                      />
                      <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Email notifications
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="soundEnabled"
                        checked={form.soundEnabled}
                        onChange={onChange}
                        disabled={!editing}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-60"
                      />
                      <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Sound effects
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Account Information</h2>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Account type:</span> {user.isGuest ? 'Guest' : 'Registered'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Member since:</span>{' '}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Last active:</span>{' '}
                    {new Date(user.lastActive).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Activity History */}
              {!user.isGuest && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                    <button
                      onClick={loadActivity}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Load activity
                    </button>
                  </div>
                  {activity.length > 0 ? (
                    <div className="space-y-2">
                      {activity.map((item, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                          <p className="text-sm text-gray-900 dark:text-gray-200">{item.action}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/main" className="text-purple-600 dark:text-purple-400 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
