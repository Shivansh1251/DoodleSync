import './index.css'
import BasicExample from './Components/BasicExample'
import RoomEntry from './pages/RoomEntry'
import { Routes, Route, Navigate } from "react-router-dom"
import Home from './pages/Home'
import Login from './pages/Loginpage'
import CustomCursor from './Components/CustomCursor'
import Chat from './pages/Chat'
import Signup from './pages/Signup'
import RoomBrowser from './Components/RoomBrowser'
import ChatDebug from './Components/ChatDebug'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import OAuthCallback from './pages/OAuthCallback'
import UserProfile from './pages/UserProfile'
// import Whiteboard from './Components/Whiteboard'

function App() {
  return (
    <>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <CustomCursor />
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
          {/* Redirect /main to home page */}
          <Route path="/main" element={<Navigate to="/" replace />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/board" element={<BasicExample />} />
        </Routes>
      </div>
    </>
  )
}

export default App
