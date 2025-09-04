import './index.css'
import BasicExample from './Components/BasicExample'
import { Routes, Route } from "react-router-dom"
import Home from './pages/Home'
import Login from './pages/Loginpage'
import MainPage from './pages/Mainpage'
import CustomCursor from './Components/CustomCursor'
import Chat from './pages/Chat'
import Signup from './pages/Signup'

function App() {
  return (
    <>
      <div className="min-h-screen bg-white">
        <CustomCursor />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/board" element={<BasicExample />} />
        </Routes>
      </div>
    </>
  )
}

export default App
