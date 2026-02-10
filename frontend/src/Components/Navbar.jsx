import { Link, useNavigate } from "react-router-dom"
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null
    if (avatar.startsWith('http')) return avatar
    return `${API_URL.replace('/api', '')}${avatar}`
  }
  
  return (
    <nav className="bg-transparent">
      <div className="mx-auto w-full max-w-4xl px-3 md:px-4 py-2">
        <div className="flex items-center justify-between h-14 rounded-full bg-white/90 dark:bg-gray-800/90 supports-[backdrop-filter]:backdrop-blur border border-gray-200 dark:border-gray-700 shadow-sm px-3 md:px-4 transition-colors duration-300">
          {/* Logo / Name */}
          <Link to="/" className="text-lg md:text-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
            DoodleSync
          </Link>

          {/* Center Links */}
          <ul className="hidden md:flex gap-4 text-gray-700 dark:text-gray-200 font-medium text-sm">
            <li><Link to="/board" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 dark:hover:text-purple-400">Design</Link></li>
            <li><Link to="/templates" className="hover:text-purple-600 dark:hover:text-purple-400">Templates</Link></li>
            <li><Link to="/help" className="hover:text-purple-600 dark:hover:text-purple-400">Help</Link></li>
          </ul>

          {/* Right Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              )}
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md"
                >
                  {user.avatar ? (
                    <img
                      src={getAvatarUrl(user.avatar)}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500 shadow-lg hover:ring-purple-400 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-base ring-2 ring-purple-400 shadow-lg">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        {user.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        )}
                        {user.isGuest && (
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded">
                            Guest
                          </span>
                        )}
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        View Profile
                      </Link>
                      <Link
                        to="/room-entry"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Join Room
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false)
                          handleLogout()
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/signup" className="px-2.5 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Sign up
                </Link>
                <Link to="/login" className="px-2.5 py-1 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                  Log in
                </Link>
              </>
            )}
          </div>
          <div className="sm:hidden flex items-center gap-2">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              )}
            </button>
            {isAuthenticated && user && (
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
              >
                {user.avatar ? (
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500 shadow-lg"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-base ring-2 ring-purple-400 shadow-lg">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </button>
            )}
            <button onClick={() => setOpen(!open)} className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
              <span className="sr-only">Toggle menu</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-3 transition-colors duration-300">
            {isAuthenticated && user && (
              <div className="pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  {user.avatar ? (
                    <img
                      src={getAvatarUrl(user.avatar)}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500 shadow-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-purple-400 shadow-lg">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    {user.email && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <ul className="flex flex-col gap-2 text-gray-700 dark:text-gray-200 font-medium text-sm">
              <li><Link to="/board" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 dark:hover:text-purple-400">Design</Link></li>
              <li><Link to="/templates" className="hover:text-purple-600 dark:hover:text-purple-400">Templates</Link></li>
              <li><Link to="/help" className="hover:text-purple-600 dark:hover:text-purple-400">Help</Link></li>
            </ul>
            {isAuthenticated && user ? (
              <div className="mt-3 flex flex-col gap-2">
                <Link to="/profile" className="text-center px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Profile
                </Link>
                <Link to="/room-entry" className="text-center px-3 py-2 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                  Join Room
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-center px-3 py-2 text-sm rounded-md border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2">
                <Link to="/signup" className="flex-1 text-center px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Sign up</Link>
                <Link to="/login" className="flex-1 text-center px-3 py-2 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors">Log in</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
