import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, LoaderCircle, Pencil, Sparkles, UserRound, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { guestLogin } = useAuth()
  const [guestName, setGuestName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const closeTimer = useRef(null)
  const closeModalRef = useRef(null)
  const nameInput = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    nameInput.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeModalRef.current?.()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(closeTimer.current)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [isOpen])

  if (!isOpen) return null

  const closeModal = (afterClose) => {
    if (isClosing) return
    setIsClosing(true)
    closeTimer.current = window.setTimeout(() => {
      setIsClosing(false)
      setLoading(false)
      setError('')
      setGuestName('')
      onClose()
      afterClose?.()
    }, 190)
  }
  closeModalRef.current = closeModal

  const handleGuestContinue = async (event) => {
    event.preventDefault()
    if (!guestName.trim()) {
      setError('Enter your name to continue.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await guestLogin(guestName.trim())
      closeModal(() => navigate('/room-entry'))
    } catch (err) {
      setError(err.message || 'Could not start your guest session. Try again.')
      setLoading(false)
    }
  }

  const goTo = (path) => closeModal(() => navigate(path))

  return (
    <div
      className={`join-room-backdrop${isClosing ? ' is-closing' : ''}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) closeModal()
      }}
      aria-hidden="false"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-room-title"
        aria-describedby="join-room-description"
        className={`join-room-dialog relative w-full max-w-[456px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-[#fbfbff] text-slate-900 shadow-[0_36px_110px_rgba(10,8,20,0.38)] dark:border-white/10 dark:bg-[#111014] dark:text-white${isClosing ? ' is-closing' : ''}`}
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-violet-300/30 blur-[75px] dark:bg-violet-500/20" />
        <div className="relative p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-950">
                <Pencil size={17} strokeWidth={2.1} />
              </span>
              <span className="text-sm font-extrabold tracking-[-0.04em]">DoodleSync</span>
            </div>
            <button
              type="button"
              onClick={() => closeModal()}
              disabled={loading}
              aria-label="Close join dialog"
              className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white/80 text-slate-500 transition-all duration-200 hover:rotate-90 hover:border-slate-300 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X size={17} />
            </button>
          </div>

          <div className="join-room-art relative mt-5 h-[116px] overflow-hidden rounded-[19px] border border-violet-100/80 bg-violet-50/80 dark:border-white/[0.07] dark:bg-white/[0.035]">
            <div aria-hidden="true" className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(103,80,190,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(103,80,190,.07)_1px,transparent_1px)] [background-size:19px_19px] dark:opacity-40" />
            <span className="absolute left-3.5 top-3.5 rounded-full border border-white/80 bg-white/80 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm dark:border-white/10 dark:bg-black/25 dark:text-slate-400">a fresh canvas</span>
            <svg aria-hidden="true" viewBox="0 0 380 116" className="absolute inset-0 h-full w-full">
              <path className="join-room-ink" d="M26 84c19-43 31 31 50-8 13-27 24-31 31-4 6 22 14 28 23 4 8-20 15-22 21-4 5 16 14 21 25 3 12-20 21-24 28-4 6 18 15 22 26 4 13-20 23-17 31 2 8 17 15 21 34 1 13-14 20-16 32-2" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M73 41c17-12 32-12 46 0m122-2c15-11 30-10 43 2" fill="none" stroke="#8b79e6" strokeWidth="2.3" strokeLinecap="round" strokeDasharray="1 7" />
              <path d="m320 75 13 3-8 11" fill="none" stroke="#16a6b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="328" cy="80" r="4" fill="#16a6b8" />
            </svg>
            <div className="absolute bottom-3 right-3.5 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[9px] font-semibold text-violet-700 shadow-sm dark:border-white/10 dark:bg-black/35 dark:text-violet-200">
              <Sparkles size={11} /> Made together
            </div>
          </div>

          <div className="mb-5 mt-5">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">Your room is one step away</p>
            <h2 id="join-room-title" className="text-[26px] font-semibold leading-tight tracking-[-0.05em]">Come make a mark.</h2>
            <p id="join-room-description" className="mt-1.5 text-sm leading-5 text-slate-500 dark:text-slate-400">Jump in as a guest, or sign in to keep your work.</p>
          </div>

          {error && (
            <div role="alert" aria-live="polite" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 dark:border-rose-300/15 dark:bg-rose-300/[0.07] dark:text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleGuestContinue}>
            <label htmlFor="join-guest-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Your name</label>
            <div className="mt-1.5 flex gap-2">
              <div className="relative min-w-0 flex-1">
                <UserRound size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={nameInput}
                  id="join-guest-name"
                  type="text"
                  value={guestName}
                  onChange={(event) => { setGuestName(event.target.value); setError('') }}
                  autoComplete="nickname"
                  placeholder="How should we call you?"
                  required
                  disabled={loading || isClosing}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/20 dark:focus:border-violet-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading || isClosing || !guestName.trim()}
                className="group flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus-visible:ring-offset-[#111014]"
              >
                {loading ? <><LoaderCircle size={16} className="animate-spin" /> Joining</> : <>Join <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></>}
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-slate-400 dark:text-slate-500">No account needed. You can change this later.</p>
          </form>

          <div className="my-4 flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            or use your account
            <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => goTo('/login')}
              disabled={loading || isClosing}
              className="group flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/70 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/[0.08] dark:hover:text-white"
            >
              Sign in <ArrowUpRight size={14} className="text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => goTo('/signup')}
              disabled={loading || isClosing}
              className="group flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/70 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/[0.08] dark:hover:text-white"
            >
              Create account <ArrowUpRight size={14} className="text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
            <span className="flex -space-x-1.5" aria-hidden="true">
              <span className="h-4 w-4 rounded-full border-2 border-[#fbfbff] bg-violet-300 dark:border-[#111014] dark:bg-violet-400" />
              <span className="h-4 w-4 rounded-full border-2 border-[#fbfbff] bg-violet-400 dark:border-[#111014] dark:bg-violet-300" />
              <span className="h-4 w-4 rounded-full border-2 border-[#fbfbff] bg-violet-200 dark:border-[#111014] dark:bg-violet-500" />
            </span>
            Made for teams who think out loud
          </div>
        </div>
      </section>
    </div>
  )
}
