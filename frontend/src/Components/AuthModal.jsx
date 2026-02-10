import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { X } from 'lucide-react'

export default function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { guestLogin } = useAuth()
  const [guestName, setGuestName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleGuestContinue = async (e) => {
    e.preventDefault()
    if (!guestName.trim()) {
      setError('Please enter your name')
      return
    }
    
    try {
      setLoading(true)
      setError('')
      await guestLogin(guestName.trim())
      onClose()
      navigate('/room-entry')
    } catch (err) {
      setError(err.message || 'Failed to create guest session')
      setLoading(false)
    }
  }

  const handleLogin = () => {
    onClose()
    navigate('/login')
  }

  const handleSignup = () => {
    onClose()
    navigate('/signup')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md" onClick={onClose}>
      <div 
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Get Started with DoodleSync
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Choose how you'd like to continue
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Guest Login Form */}
        <form onSubmit={handleGuestContinue} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Continue as Guest
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value)
                setError('')
              }}
              placeholder="Enter your name"
              className="flex-1 border dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:text-white transition-colors duration-300"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !guestName.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Start'}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            No account needed, jump right in!
          </p>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Or use an account
            </span>
          </div>
        </div>

        {/* Login/Signup Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            Log in to existing account
          </button>
          <button
            onClick={handleSignup}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            Create a new account
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
          With an account, you can save your work and access it from anywhere
        </p>
      </div>
    </div>
  )
}
