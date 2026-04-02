import './index.css'
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from "react-router-dom"
import CustomCursor from './Components/CustomCursor'
import AppErrorBoundary from './Components/AppErrorBoundary'
// import Whiteboard from './Components/Whiteboard'

const Home = lazy(() => import('./pages/Home'))
const RoomEntry = lazy(() => import('./pages/RoomEntry'))
const RoomBrowser = lazy(() => import('./Components/RoomBrowser'))
const ChatDebug = lazy(() => import('./Components/ChatDebug'))
const Login = lazy(() => import('./pages/Loginpage'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const Templates = lazy(() => import('./pages/Templates'))
const Help = lazy(() => import('./pages/Help'))
const Chat = lazy(() => import('./pages/Chat'))
const BasicExample = lazy(() => import('./Components/BasicExample'))
const ErrorPage = lazy(() => import('./pages/ErrorPage'))

function App() {
  return (
    <>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        {/*
          Global window error listeners were removed because they can trigger on many runtime
          issues (including async rejections), causing unexpected redirects to /error.
          Route-level 404 and React render errors are still handled by existing routes/boundary.
        */}
        <CustomCursor />
        <AppErrorBoundary>
          <Suspense
            fallback={
              <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-gray-600 dark:text-gray-300">
                Loading...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/room" element={<RoomEntry />} />
              <Route path="/room-entry" element={<RoomEntry />} />
              <Route path="/rooms" element={<RoomBrowser />} />
              <Route path="/debug-chat" element={<ChatDebug />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/help" element={<Help />} />
              <Route path="/error" element={<ErrorPage />} />
              {/* Redirect /main to home page */}
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
            </Routes>
          </Suspense>
        </AppErrorBoundary>
      </div>
    </>
  )
}

export default App
