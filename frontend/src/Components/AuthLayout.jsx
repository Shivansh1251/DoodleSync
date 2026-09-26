import { Moon, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export function GoogleAuthButton({ onClick, disabled = false, label = 'Continue with Google' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/20 dark:hover:bg-white/[0.07] dark:focus-visible:ring-offset-black"
    >
      <svg aria-hidden="true" className="h-[18px] w-[18px]" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      <span>{label}</span>
    </button>
  )
}

export function AuthDivider({ children = 'or continue with email' }) {
  return (
    <div className="my-5 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
      <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
    </div>
  )
}

export default function AuthLayout({ children }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <main className="min-h-screen bg-[#fbfbff] text-slate-900 transition-colors duration-300 dark:bg-black dark:text-slate-100 lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)]">
        <aside className="relative hidden min-h-screen overflow-hidden bg-[#111014] px-10 py-9 text-white lg:flex lg:h-full lg:min-h-0 lg:flex-col xl:px-16 xl:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:radial-gradient(#aaa_0.7px,transparent_0.7px)] [background-size:22px_22px]" />
          <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/4 h-[26rem] w-[26rem] rounded-full bg-violet-600/20 blur-[110px]" />

          <Link to="/" className="group relative z-10 inline-flex w-fit items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#17151b] shadow-lg shadow-black/20 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path d="M5 17.5 16.8 5.7a2.3 2.3 0 0 1 3.25 3.25L8.25 20.75 4 21.5 5 17.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="m14.9 7.6 3.25 3.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-xl font-black tracking-[-0.06em]">DoodleSync</span>
          </Link>

          <div className="relative z-10 my-auto max-w-xl">
            <h2 className="max-w-lg text-4xl font-semibold leading-[1.08] tracking-[-0.055em] xl:text-[3.5rem]">
              Make a mark.<br />
              <span className="bg-gradient-to-r from-cyan-200 via-blue-200 to-violet-300 bg-clip-text text-transparent">Make it together.</span>
            </h2>

            <div className="relative mt-10 max-w-[33rem] -rotate-[1.5deg] rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-3 shadow-2xl shadow-black/30 transition-transform duration-500 hover:rotate-0">
              <div className="relative overflow-hidden rounded-[1.1rem] bg-[#f8f7f3] p-5 sm:p-7">
                <div aria-hidden="true" className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(28,24,34,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(28,24,34,.06)_1px,transparent_1px)] [background-size:24px_24px]" />
                <div className="relative flex items-center justify-between">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold tracking-wide text-slate-500 shadow-sm">Untitled board</span>
                  <span className="flex -space-x-2" aria-label="A team working together">
                    <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#f8f7f3] bg-cyan-200 text-[9px] font-bold text-cyan-900">S</span>
                    <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#f8f7f3] bg-violet-200 text-[9px] font-bold text-violet-900">A</span>
                    <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#f8f7f3] bg-amber-200 text-[9px] font-bold text-amber-900">J</span>
                  </span>
                </div>
                <svg aria-hidden="true" viewBox="0 0 460 190" className="relative mt-4 h-auto w-full overflow-visible">
                  <path d="M28 128c29-72 46 57 76-14 21-51 32-50 42-6 7 31 17 39 30 7 11-27 19-32 29-5 8 22 21 29 37 2 17-30 29-35 38-8 10 28 23 34 42 8 20-28 37-21 49 4 12 24 21 31 49-5" fill="none" stroke="#25212d" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M65 53c31-20 58-19 79 0M305 53c22-17 41-16 58 1" fill="none" stroke="#7564d8" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 8" />
                  <circle cx="409" cy="114" r="6" fill="#23b4c5" />
                  <path d="m402 107 10 2-5 9" fill="none" stroke="#23b4c5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="relative mt-1 flex items-center justify-between text-[10px] font-medium text-slate-400">
                  <span>sketches, notes, next steps</span>
                  <span className="rounded-full bg-violet-100 px-2.5 py-1 text-violet-700">Live together</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-white/40">
            <span>Draw it out. Figure it out.</span>
            <span>© DoodleSync</span>
          </div>
        </aside>

        <section className="relative flex min-h-screen items-center justify-center px-5 py-24 sm:px-10 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:px-12 lg:py-8">
          <Link to="/" className="absolute left-5 top-6 inline-flex items-center gap-2 text-base font-black tracking-[-0.06em] text-slate-900 lg:hidden dark:text-white">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
                <path d="M5 17.5 16.8 5.7a2.3 2.3 0 0 1 3.25 3.25L8.25 20.75 4 21.5 5 17.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="m14.9 7.6 3.25 3.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            DoodleSync
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="absolute right-5 top-6 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:border-violet-400/50 dark:hover:text-violet-200"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <div className="w-full max-w-[420px]">{children}</div>
        </section>
      </div>
    </main>
  )
}
