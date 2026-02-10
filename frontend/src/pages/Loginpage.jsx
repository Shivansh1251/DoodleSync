import { useState } from 'react'
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from '../context/AuthContext'
import AuthService from '../utils/AuthService'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login, guestLogin } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [tempEmail, setTempEmail] = useState('')
  const [useOTP, setUseOTP] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [guestName, setGuestName] = useState('')

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (useOTP) {
        if (!otpSent) {
          await AuthService.requestLoginOTP(form.email, form.password)
          setOtpSent(true)
          setTempEmail(form.email)
          setError('')
        } else {
          await AuthService.verifyLoginOTP(tempEmail, otp)
          await login(tempEmail, form.password)
          navigate('/')
        }
      } else {
        await login(form.email, form.password)
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
      if (otpSent && err.message.includes('OTP')) {
        setOtpSent(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    AuthService.initiateGoogleLogin()
  }

  const handleGuestLogin = async (e) => {
    e.preventDefault()
    if (!guestName.trim()) {
      setError('Please enter your name')
      return
    }
    try {
      setLoading(true)
      setError('')
      await guestLogin(guestName.trim())
      navigate('/room-entry')
    } catch (err) {
      setError(err.message || 'Failed to create guest session')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      {!showGuestForm ? (
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 transition-colors duration-300">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Log in</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Welcome back to DoodleSync.</p>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {!otpSent ? (
          <>
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={onChange} 
                  required 
                  disabled={loading}
                  className="mt-1 w-full border dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white transition-colors duration-300 disabled:opacity-50" 
                  placeholder="you@example.com" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password" 
                    value={form.password} 
                    onChange={onChange} 
                    required 
                    disabled={loading}
                    className="mt-1 w-full border dark:border-gray-600 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white transition-colors duration-300 disabled:opacity-50" 
                    placeholder="Enter your password" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useOTP"
                  checked={useOTP}
                  onChange={(e) => setUseOTP(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="useOTP" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Use OTP verification 🔐
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-6 w-full px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : useOTP ? 'Send OTP' : 'Log in'}
            </button>
          </>
        ) : (
          <>
            <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📧 OTP sent to <strong>{tempEmail}</strong>
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Check your email and enter the 6-digit code
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:text-white text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="mt-6 w-full px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp('');
                setError('');
              }}
              className="mt-3 w-full text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200"
            >
              ← Back to login
            </button>
          </>
        )}

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 dark:text-gray-300">Google</span>
          </button>

          <button
            type="button"
            onClick={() => setShowGuestForm(true)}
            disabled={loading}
            className="mt-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50"
          >
            <span className="text-gray-700 dark:text-gray-300">Continue as Guest</span>
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
          No account? <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors duration-300">Sign up</Link>
        </p>
      </form>
      ) : (
        <form onSubmit={handleGuestLogin} className="w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 transition-colors duration-300">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Continue as Guest</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Enter your name to join as a guest user.</p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Your Name</label>
            <input 
              type="text"
              value={guestName} 
              onChange={(e) => {
                setGuestName(e.target.value)
                setError('')
              }}
              required 
              disabled={loading}
              className="mt-1 w-full border dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white transition-colors duration-300 disabled:opacity-50" 
              placeholder="Enter your name" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !guestName.trim()}
            className="mt-6 w-full px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating session...' : 'Continue as Guest'}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowGuestForm(false)
              setGuestName('')
              setError('')
            }}
            className="mt-3 w-full text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200"
          >
            ← Back to login
          </button>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 text-center">
            Want a full account? <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors duration-300">Sign up</Link>
          </p>
        </form>
      )}
    </div>
  )
}