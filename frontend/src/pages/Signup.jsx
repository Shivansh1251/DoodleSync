import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout, { AuthDivider, GoogleAuthButton } from '../Components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import AuthService from '../utils/AuthService'

const inputClass = 'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/20 dark:focus:border-violet-400 dark:focus:ring-violet-400/10'
const primaryButtonClass = 'group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 dark:bg-white dark:text-slate-950 dark:shadow-black/20 dark:hover:bg-slate-200 dark:focus-visible:ring-offset-black'

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const onChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
    setError('')
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Use at least 6 characters for your password.')
      return
    }

    setLoading(true)
    try {
      await signup(form.name.trim(), form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <section className="animate-[authRise_.45s_cubic-bezier(.2,.8,.2,1)_both]" aria-labelledby="signup-title">
        <div className="mb-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">A fresh page</p>
          <h1 id="signup-title" className="text-3xl font-semibold tracking-[-0.045em] text-slate-950 dark:text-white">Make an account</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Bring your team in and make something together.</p>
        </div>

        <GoogleAuthButton onClick={() => AuthService.initiateGoogleLogin()} disabled={loading} label="Sign up with Google" />
        <AuthDivider />

        {error && (
          <div role="alert" aria-live="polite" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/[0.08] dark:text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label htmlFor="signup-name" className="text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
            <input
              id="signup-name"
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              autoComplete="name"
              autoFocus
              required
              disabled={loading}
              className={inputClass}
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="signup-email" className="text-sm font-medium text-slate-700 dark:text-slate-200">Email address</label>
            <input
              id="signup-email"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              required
              disabled={loading}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="signup-password" className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">6 characters minimum</span>
            </div>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={onChange}
                autoComplete="new-password"
                minLength={6}
                required
                disabled={loading}
                className={`${inputClass} pr-12`}
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`${primaryButtonClass} !mt-5`}>
            {loading ? <LoaderCircle size={17} className="animate-spin" /> : <>Create account <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" /></>}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account? <Link to="/login" className="font-semibold text-violet-700 transition-colors hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200">Sign in</Link>
        </p>
      </section>
    </AuthLayout>
  )
}
