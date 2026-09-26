import { useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, ShieldCheck, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout, { AuthDivider, GoogleAuthButton } from '../Components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import AuthService from '../utils/AuthService'

const inputClass = 'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/20 dark:focus:border-violet-400 dark:focus:ring-violet-400/10'
const primaryButtonClass = 'group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 dark:bg-white dark:text-slate-950 dark:shadow-black/20 dark:hover:bg-slate-200 dark:focus-visible:ring-offset-black'
const secondaryButtonClass = 'flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/60 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/[0.07] dark:hover:text-white dark:focus-visible:ring-offset-black'

function FormError({ children }) {
  if (!children) return null
  return (
    <div role="alert" aria-live="polite" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/[0.08] dark:text-rose-200">
      {children}
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { login, verifyLoginOTP, guestLogin } = useAuth()
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

  const onChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
    setError('')
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (useOTP) {
        if (!otpSent) {
          await AuthService.requestLoginOTP(form.email, form.password)
          setOtpSent(true)
          setTempEmail(form.email)
        } else {
          await verifyLoginOTP(tempEmail, otp)
          navigate('/')
        }
      } else {
        await login(form.email, form.password)
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
      if (otpSent && err.message?.includes('OTP')) setOtpSent(false)
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async (event) => {
    event.preventDefault()
    if (!guestName.trim()) {
      setError('Please enter your name')
      return
    }

    setLoading(true)
    setError('')
    try {
      await guestLogin(guestName.trim())
      navigate('/room-entry')
    } catch (err) {
      setError(err.message || 'Failed to create guest session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="animate-[authRise_.45s_cubic-bezier(.2,.8,.2,1)_both]">
        {showGuestForm ? (
          <section aria-labelledby="guest-title">
            <button
              type="button"
              onClick={() => { setShowGuestForm(false); setError('') }}
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft size={16} /> Back to sign in
            </button>
            <div className="mb-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">Jump right in</p>
              <h1 id="guest-title" className="text-3xl font-semibold tracking-[-0.045em] text-slate-950 dark:text-white">Continue as a guest</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Pick a name and start sketching with your team.</p>
            </div>
            <FormError>{error}</FormError>
            <form onSubmit={handleGuestLogin} className="space-y-5">
              <div>
                <label htmlFor="guest-name" className="text-sm font-medium text-slate-700 dark:text-slate-200">Your name</label>
                <input
                  id="guest-name"
                  type="text"
                  name="name"
                  value={guestName}
                  onChange={(event) => { setGuestName(event.target.value); setError('') }}
                  autoComplete="nickname"
                  autoFocus
                  required
                  disabled={loading}
                  className={inputClass}
                  placeholder="What should we call you?"
                />
              </div>
              <button type="submit" disabled={loading || !guestName.trim()} className={primaryButtonClass}>
                {loading ? <LoaderCircle size={17} className="animate-spin" /> : <>Join the canvas <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" /></>}
              </button>
            </form>
            <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
              Want to save your work? <Link to="/signup" className="font-semibold text-violet-700 hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200">Create an account</Link>
            </p>
          </section>
        ) : (
          <section aria-labelledby="login-title">
            <div className="mb-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">Your canvas is waiting</p>
              <h1 id="login-title" className="text-3xl font-semibold tracking-[-0.045em] text-slate-950 dark:text-white">Welcome back</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Sign in and pick up where your ideas left off.</p>
            </div>

            {!otpSent && <GoogleAuthButton onClick={() => AuthService.initiateGoogleLogin()} disabled={loading} />}
            {!otpSent && <AuthDivider />}

            <FormError>{error}</FormError>

            {otpSent && (
              <div className="mb-5 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 dark:border-cyan-300/15 dark:bg-cyan-300/[0.06]">
                <p className="text-sm font-medium text-cyan-950 dark:text-cyan-100">Check your inbox</p>
                <p className="mt-1 text-xs leading-5 text-cyan-800/80 dark:text-cyan-100/65">A six-digit sign-in code was sent to <strong className="font-semibold">{tempEmail}</strong>.</p>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <label htmlFor="login-email" className="text-sm font-medium text-slate-700 dark:text-slate-200">Email address</label>
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      autoComplete="username"
                      autoFocus
                      required
                      disabled={loading}
                      className={inputClass}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label htmlFor="login-password" className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
                      <Link to="/forgot-password" className="text-xs font-semibold text-violet-700 transition-colors hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200">Forgot password?</Link>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={onChange}
                        autoComplete="current-password"
                        required
                        disabled={loading}
                        className={`${inputClass} pr-12`}
                        placeholder="Enter your password"
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
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/80 px-3.5 py-2.5 transition-colors hover:border-violet-200 dark:border-white/10 dark:hover:border-violet-400/30">
                    <input
                      type="checkbox"
                      checked={useOTP}
                      onChange={(event) => setUseOTP(event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-violet-600"
                    />
                    <span>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"><ShieldCheck size={14} className="text-violet-600 dark:text-violet-300" /> Add email verification</span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-slate-500 dark:text-slate-400">We’ll send a one-time code after your password.</span>
                    </span>
                  </label>
                </>
              ) : (
                <div>
                  <label htmlFor="login-otp" className="text-sm font-medium text-slate-700 dark:text-slate-200">One-time code</label>
                  <input
                    id="login-otp"
                    type="text"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    autoFocus
                    required
                    className={`${inputClass} text-center text-xl font-semibold tracking-[0.45em] tabular-nums`}
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); setError('') }}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200"
                  >
                    <ArrowLeft size={14} /> Change email or password
                  </button>
                </div>
              )}

              <button type="submit" disabled={loading || (otpSent && otp.length !== 6)} className={primaryButtonClass}>
                {loading ? <LoaderCircle size={17} className="animate-spin" /> : <>{otpSent ? 'Verify and sign in' : useOTP ? 'Continue with email code' : 'Sign in'} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" /></>}
              </button>
            </form>

            {!otpSent && (
              <>
                <AuthDivider>or keep it casual</AuthDivider>
                <button type="button" onClick={() => { setShowGuestForm(true); setError('') }} disabled={loading} className={secondaryButtonClass}>
                  <UserRound size={16} /> Continue as a guest
                </button>
              </>
            )}

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              New to DoodleSync? <Link to="/signup" className="font-semibold text-violet-700 transition-colors hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200">Create an account</Link>
            </p>
          </section>
        )}
      </div>
    </AuthLayout>
  )
}
