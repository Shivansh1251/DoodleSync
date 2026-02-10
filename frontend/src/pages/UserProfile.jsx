import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import AuthService from '../utils/AuthService'

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

export default function UserProfile() {
  const { user, logout, updateProfile, uploadAvatar, setPresetAvatar } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [editing, setEditing] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
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

  const handlePresetAvatarSelect = async (avatarUrl) => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await setPresetAvatar(avatarUrl)
      setMessage('Avatar updated successfully')
      setShowAvatarPicker(false)
    } catch (err) {
      setError(err.message || 'Failed to set avatar')
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
            <div className="flex items-start -mt-16 mb-6">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'}${user.avatar}`}
                    alt={user.name}
                    className="w-36 h-36 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-2xl ring-4 ring-purple-500/30 hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-36 h-36 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl ring-4 ring-purple-400/30">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                {!user.isGuest && (
                  <div className="absolute bottom-1 right-1 flex gap-2">
                    <button
                      onClick={() => setShowAvatarPicker(true)}
                      disabled={loading}
                      className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-110 ring-4 ring-white dark:ring-gray-800"
                      title="Choose preset avatar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="bg-purple-600 text-white p-2.5 rounded-full hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-110 ring-4 ring-white dark:ring-gray-800"
                      title="Upload custom avatar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="ml-8 flex-1 mt-16">
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

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
          onClick={() => setShowAvatarPicker(false)}
        >
          <div 
            className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAvatarPicker(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Choose Your Avatar
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Select one of these preset avatars or upload your own
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
              {PRESET_AVATARS.map((avatarUrl, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetAvatarSelect(avatarUrl)}
                  disabled={loading}
                  className={`relative aspect-square rounded-full overflow-hidden border-4 hover:border-purple-500 transition-all duration-300 hover:scale-110 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                    user.avatar === avatarUrl 
                      ? 'border-purple-600 ring-4 ring-purple-400/50' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <img
                    src={avatarUrl}
                    alt={`Avatar ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {user.avatar === avatarUrl && (
                    <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowAvatarPicker(false)
                  fileInputRef.current?.click()
                }}
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Custom Avatar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
