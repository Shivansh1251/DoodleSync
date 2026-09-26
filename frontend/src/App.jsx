import './index.css'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { flushSync } from 'react-dom'
import { animateView } from 'motion'
import { useAnimate } from 'motion/react-mini'
import { Analytics } from '@vercel/analytics/react'
import AppErrorBoundary from './Components/AppErrorBoundary'
import DoodleEye from './Components/DoodleEye'
import { useTheme } from './context/ThemeContext'
import PageTransitionContext from './context/PageTransitionContext'

const loadHomeModule = () => import('./pages/Home')
const loadRoomEntryModule = () => import('./pages/RoomEntry')
const Home = lazy(loadHomeModule)
const RoomEntry = lazy(loadRoomEntryModule)
const RoomBrowser = lazy(() => import('./Components/RoomBrowser'))
const Login = lazy(() => import('./pages/Loginpage'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const Templates = lazy(() => import('./pages/Templates'))
const Help = lazy(() => import('./pages/Help'))
const Chat = lazy(() => import('./pages/Chat'))
const loadBoardModule = () => import('./Components/BasicExample')
const BasicExample = lazy(loadBoardModule)
const ErrorPage = lazy(() => import('./pages/ErrorPage'))
const LOADER_MIN_HOLD_MS = 2000

function registerMaskWipeProperty() {
  if (typeof CSS === 'undefined' || typeof CSS.registerProperty !== 'function') return
  try {
    CSS.registerProperty({
      name: '--ds-mask-wipe-edge',
      syntax: '<percentage>',
      inherits: false,
      initialValue: '-14%',
    })
  } catch {
    // The property may already be registered by a previous navigation.
  }
  try {
    CSS.registerProperty({
      name: '--ds-mask-wipe-angle',
      syntax: '<angle>',
      inherits: false,
      initialValue: '108deg',
    })
  } catch {
    // The property may already be registered by a previous navigation.
  }
}

function trackLoaderEyes(event) {
  const eyes = event.currentTarget.querySelectorAll('.doodlesync-eye')
  eyes.forEach((eye) => {
    const bounds = eye.getBoundingClientRect()
    const horizontal = (event.clientX - (bounds.left + bounds.width / 2)) / (window.innerWidth / 2)
    const vertical = (event.clientY - (bounds.top + bounds.height / 2)) / (window.innerHeight / 2)
    const x = Math.max(-1, Math.min(1, horizontal)) * 4
    const y = Math.max(-1, Math.min(1, vertical)) * 3
    eye.style.setProperty('--doodlesync-eye-x', `${x.toFixed(2)}px`)
    eye.style.setProperty('--doodlesync-eye-y', `${y.toFixed(2)}px`)
  })
}

function resetLoaderEyes(event) {
  event.currentTarget.querySelectorAll('.doodlesync-eye').forEach((eye) => {
    eye.style.setProperty('--doodlesync-eye-x', '0px')
    eye.style.setProperty('--doodlesync-eye-y', '0px')
  })
}

function DoodleLoader({ theme, pageReady, onComplete }) {
  const [scope, animate] = useAnimate()
  const [wordmarkReady, setWordmarkReady] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setWordmarkReady(true)
      return undefined
    }

    let active = true
    const letters = [...scope.current.querySelectorAll('.app-loader-letter')]
    const reveals = letters.map((letter, index) => animate(
      letter,
      { opacity: [0, 1], transform: ['translateY(9px)', 'translateY(0px)'], filter: ['blur(5px)', 'blur(0px)'] },
      { duration: 0.42, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] },
    ))
    Promise.all(reveals.map((reveal) => reveal.finished)).then(() => {
      if (active) setWordmarkReady(true)
    }).catch(() => {})

    return () => {
      active = false
      reveals.forEach((reveal) => reveal.stop())
    }
  }, [animate, scope])

  useEffect(() => {
    if (!pageReady || !wordmarkReady) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete()
      return undefined
    }

    let active = true
    const holdTimer = window.setTimeout(async () => {
      const swipe = animate(scope.current, { transform: ['translateY(0%)', 'translateY(-100%)'] }, { duration: 0.82, ease: [0.76, 0, 0.24, 1] })
      try {
        await swipe.finished
        if (active) onComplete()
      } catch {
        // The loader may be removed during a route change.
      }
    }, LOADER_MIN_HOLD_MS)

    return () => {
      active = false
      window.clearTimeout(holdTimer)
    }
  }, [animate, onComplete, pageReady, scope, wordmarkReady])

  return (
    <div
      ref={scope}
      className={`app-loader${theme === 'dark' ? ' is-dark' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={!pageReady}
      onPointerMove={trackLoaderEyes}
      onPointerLeave={resetLoaderEyes}
    >
      <div className="app-loader-brand">
        <span className="app-loader-wordmark" aria-hidden="true">
          {'DoodleSync'.split('').map((letter, index) => (
          <span className="app-loader-letter" key={`${letter}-${index}`}>
              {letter === 'o' ? <DoodleEye /> : letter}
            </span>
          ))}
        </span>
      </div>
      <span className="sr-only">Preparing your canvas</span>
    </div>
  )
}

function RouteReady({ onReady }) {
  useEffect(() => onReady(), [onReady])
  return <div className="app-route-content"><Outlet /></div>
}

function App() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [pageReady, setPageReady] = useState(false)
  const [loaderVisible, setLoaderVisible] = useState(true)
  const pageTransitionInProgress = useRef(false)
  const markPageReady = useCallback(() => setPageReady(true), [])
  const removeLoader = useCallback(() => setLoaderVisible(false), [])
  const startPageTransition = useCallback(async (target, direction = 'forward') => {
    if (pageTransitionInProgress.current) return
    pageTransitionInProgress.current = true
    let didNavigate = false
    const navigateToTarget = () => {
      didNavigate = true
      flushSync(() => navigate(target))
    }

    try {
      const destination = target.split('?')[0]
      const preloaders = {
        '/': loadHomeModule,
        '/room': loadRoomEntryModule,
        '/room-entry': loadRoomEntryModule,
        '/board': loadBoardModule,
      }
      await preloaders[destination]?.()

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        navigateToTarget()
        return
      }

      registerMaskWipeProperty()
      if (typeof document.startViewTransition !== 'function') {
        navigateToTarget()
        return
      }

      await animateView(navigateToTarget, {
        duration: 1.08,
        ease: [0.76, 0, 0.24, 1],
      }).new({
        '--ds-mask-wipe-edge': ['-14%', '114%'],
        '--ds-mask-wipe-angle': direction === 'reverse' ? ['288deg', '288deg'] : ['108deg', '108deg'],
      })
    } catch {
      if (!didNavigate) navigateToTarget()
    } finally {
      pageTransitionInProgress.current = false
    }
  }, [navigate])
  const transitionContext = { startPageTransition }

  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-black dark:text-white">
        <PageTransitionContext.Provider value={transitionContext}>
          <Suspense fallback={null}>
            <Routes>
              <Route element={<RouteReady onReady={markPageReady} />}>
                <Route path="/" element={<Home />} />
                <Route path="/room" element={<RoomEntry />} />
                <Route path="/room-entry" element={<RoomEntry />} />
                <Route path="/rooms" element={<RoomBrowser />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/help" element={<Help />} />
                <Route path="/error" element={<ErrorPage />} />
                <Route path="/main" element={<Navigate to="/" replace />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/board" element={<BasicExample />} />
                <Route
                  path="*"
                  element={
                    <Navigate
                      to="/error"
                      replace
                      state={{
                        message: 'The page you are looking for does not exist.',
                        code: 404,
                      }}
                    />
                  }
                />
              </Route>
            </Routes>
          </Suspense>
        </PageTransitionContext.Provider>

        {loaderVisible && (
          <DoodleLoader theme={theme} pageReady={pageReady} onComplete={removeLoader} />
        )}
        <Analytics />
      </div>
    </AppErrorBoundary>
  )
}

export default App
