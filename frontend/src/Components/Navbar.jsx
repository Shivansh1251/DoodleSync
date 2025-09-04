import { Link } from "react-router-dom"
import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="bg-transparent">
      <div className="mx-auto w-full max-w-4xl px-3 md:px-4 py-2">
        <div className="flex items-center justify-between h-14 rounded-full bg-white/90 supports-[backdrop-filter]:backdrop-blur border border-gray-200 shadow-sm px-3 md:px-4">
          {/* Logo / Name */}
          <div className="text-lg md:text-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
            DoodleSync
          </div>

          {/* Center Links */}
          <ul className="hidden md:flex gap-4 text-gray-700 font-medium text-sm">
            <li><Link to="/board" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">Design</Link></li>
            {/* <li><a href="#" className="hover:text-purple-600">Product</a></li>
            <li><a href="#" className="hover:text-purple-600">Plans</a></li>
            <li><a href="#" className="hover:text-purple-600">Business</a></li> */}
            <li><a href="#templates" className="hover:text-purple-600">Templates</a></li>
            <li><Link to="/" className="hover:text-purple-600">Help</Link></li>
          </ul>

          {/* Right Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <Link to="/signup" className="px-2.5 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100">
              Sign up
            </Link>
            <Link to="/login" className="px-2.5 py-1 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700">
              Log in
            </Link>
          </div>
          <button onClick={() => setOpen(!open)} className="sm:hidden inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100">
            <span className="sr-only">Toggle menu</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-2 rounded-xl border border-gray-200 bg-white shadow-sm p-3">
            <ul className="flex flex-col gap-2 text-gray-700 font-medium text-sm">
              <li><Link to="/board" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">Design</Link></li>
              <li><a href="#templates" className="hover:text-purple-600">Templates</a></li>
              <li><Link to="/" className="hover:text-purple-600">Help</Link></li>
            </ul>
            <div className="mt-3 flex items-center gap-2">
              <Link to="/signup" className="flex-1 text-center px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100">Sign up</Link>
              <Link to="/login" className="flex-1 text-center px-3 py-2 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700">Log in</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
