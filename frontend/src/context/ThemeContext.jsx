/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useLayoutEffect, useState } from 'react'

const ThemeContext = createContext(null)

function getInitialThemePreference() {
  if (typeof window === 'undefined') return 'light'

  try {
    const savedPreference = window.localStorage.getItem('theme-preference')
    if (savedPreference === 'light' || savedPreference === 'dark' || savedPreference === 'system') return savedPreference
    const savedTheme = window.localStorage.getItem('theme')
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  } catch {
    // The theme still works when browser storage is unavailable.
  }

  return 'system'
}

function resolveTheme(preference) {
  if (preference === 'light' || preference === 'dark') return preference
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [themePreference, setThemePreferenceState] = useState(getInitialThemePreference)
  const [theme, setTheme] = useState(() => resolveTheme(themePreference))

  useLayoutEffect(() => {
    if (themePreference !== 'system') return undefined
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return undefined
    const syncSystemTheme = (event) => setTheme(event.matches ? 'dark' : 'light')
    setTheme(media.matches ? 'dark' : 'light')
    media.addEventListener?.('change', syncSystemTheme)
    return () => media.removeEventListener?.('change', syncSystemTheme)
  }, [themePreference])

  useLayoutEffect(() => {
    const root = window.document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.classList.toggle('light', theme === 'light')
    root.style.colorScheme = theme

    const themeColor = window.document.querySelector('meta[name="theme-color"]')
    themeColor?.setAttribute('content', theme === 'dark' ? '#000000' : '#fbfbff')

    try {
      window.localStorage.setItem('theme', theme)
      window.localStorage.setItem('theme-preference', themePreference)
    } catch {
      // Keep theme switching functional when storage is blocked or full.
    }
  }, [theme, themePreference])

  const setThemePreference = (preference) => {
    const nextPreference = ['light', 'dark', 'system'].includes(preference) ? preference : 'system'
    setThemePreferenceState(nextPreference)
    setTheme(resolveTheme(nextPreference))
  }

  const toggleTheme = () => setThemePreference(theme === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
