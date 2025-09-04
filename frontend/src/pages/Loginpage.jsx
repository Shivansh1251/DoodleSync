import { useState } from 'react'
import { useNavigate, Link } from "react-router-dom"

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onSubmit = (e) => {
    e.preventDefault()
    // TODO: replace with real auth; navigate for now
    navigate('/main')
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900">Log in</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back to DoodleSync.</p>
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} required className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" value={form.password} onChange={onChange} required className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
          </div>
        </div>
        <button type="submit" className="mt-6 w-full px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700">Log in</button>
        <p className="mt-3 text-sm text-gray-600">No account? <Link to="/signup" className="text-blue-600 hover:text-blue-700 underline">Sign up</Link></p>
      </form>
    </div>
  )
}