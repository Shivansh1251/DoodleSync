import Navbar from "../Components/Navbar"
import FeatureGrid from "../Components/FeatureGrid"
import HowItWorks from "../Components/HowItWorks"
import Footer from "../Components/Footer"
import AuthModal from "../Components/AuthModal"
import InteractiveSketch from "../Components/InteractiveSketch"
import PaperBinExperience from "../Components/PaperBinExperience"
import RevealOnScroll from "../Components/RevealOnScroll"
import SeoHead from "../Components/SeoHead"
import { LiquidMetalButton } from "../components/ui/liquid-metal-button"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

function HomeTemplatePreview({ template }) {
  if (template === 'planner') {
    return (
      <div className="home-preview-planner" aria-hidden="true">
        {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day, index) => (
          <div className="home-preview-day" key={day}>
            <b>{day}</b>
            <i className={index % 2 ? 'is-short' : ''} />
            <i />
            <i className="is-faint" />
          </div>
        ))}
      </div>
    )
  }

  if (template === 'storyboard') {
    return (
      <div className="home-preview-storyboard" aria-hidden="true">
        {[0, 1, 2].map((frame) => <div className={`home-preview-frame frame-${frame + 1}`} key={frame}><i /><b /><span /></div>)}
      </div>
    )
  }

  return (
    <div className="home-preview-moodboard" aria-hidden="true">
      <div className="home-preview-tile tile-wide"><i /><b /></div>
      <div className="home-preview-tile tile-orbit"><i /><b /></div>
      <div className="home-preview-tile tile-lines"><i /><b /></div>
      <div className="home-preview-tile tile-shape"><i /><b /></div>
    </div>
  )
}

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [activePreview, setActivePreview] = useState('moodboard')
  const navigate = useNavigate()

  const handleStartWhiteboard = () => {
    if (isAuthenticated) {
      navigate('/room-entry')
    } else {
      setShowAuthModal(true)
    }
  }

  return (
    <PaperBinExperience>
    <main className="overflow-hidden">
      <SeoHead />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-900/20 dark:to-blue-900/20 blur-3xl"></div>
        </div>

        <div className="text-center">
          {isAuthenticated && user && (
            <div className="mb-6 inline-block px-6 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 dark:border-purple-800 rounded-full animate-fade-in">
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                Welcome back, <span className="font-bold text-purple-600 dark:text-purple-400">{user.name}</span>!
              </p>
            </div>
          )}
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 dark:from-white dark:via-purple-400 dark:to-white bg-clip-text text-transparent transition-colors duration-300">
            Collaborate Visually<br />In Real-Time
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
            A shared canvas for drawing, planning, and thinking together.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="ink-button"><LiquidMetalButton label="Join Room" onClick={handleStartWhiteboard} /></span>
          </div>
        </div>

        {/* Lightweight board preview: CSS keeps the critical path free of a large raster image. */}
        <div className="relative mx-auto mt-16 w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 text-left shadow-[0_24px_80px_rgba(66,51,160,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80" role="img" aria-label="DoodleSync collaborative board preview">
          <div className="flex items-center gap-2 border-b border-slate-200/80 px-5 py-4 dark:border-white/10">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="ml-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">live board / brainstorm</span>
          </div>
          <div className="relative min-h-[250px] overflow-hidden bg-[#fbfbff] p-7 dark:bg-slate-950/60 sm:min-h-[330px] sm:p-12">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(109,93,252,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(109,93,252,0.06)_1px,transparent_1px)] bg-[size:32px_32px]" aria-hidden="true" />
            <div className="relative flex h-full min-h-[190px] flex-col justify-between sm:min-h-[245px]">
              <div className="max-w-md rotate-[-1deg] font-mono text-sm font-semibold text-indigo-500 dark:text-indigo-300 sm:text-base">✦ Everyone starts with a blank canvas.</div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                <div className="rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/70 px-5 py-4 text-sm font-semibold text-indigo-700 shadow-sm dark:border-indigo-400/50 dark:bg-indigo-400/10 dark:text-indigo-200 sm:px-8 sm:py-6">Think<br /><span className="text-xs font-normal opacity-70">together</span></div>
                <div className="text-3xl text-teal-500 sm:text-5xl" aria-hidden="true">→</div>
                <div className="rounded-2xl bg-teal-400/90 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 rotate-[2deg] sm:px-8 sm:py-6">Make<br /><span className="text-xs font-normal text-white/80">it real</span></div>
              </div>
              <div className="self-end rounded-full border border-amber-300 bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-800 rotate-[-3deg] dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200">real-time ideas ✎</div>
            </div>
          </div>
        </div>
              </section>

      <RevealOnScroll>
        <InteractiveSketch userName={isAuthenticated ? user?.name : ''} />
      </RevealOnScroll>

      <RevealOnScroll>
        <section className="home-audience-section mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-labelledby="home-audience-heading">
          <div className="home-audience-band">
            <h2 id="home-audience-heading">One canvas. Every kind of team.</h2>
            <ul aria-label="Who DoodleSync is for">
              <li>Teams</li><li>Classrooms</li><li>Studios</li><li>Startups</li>
            </ul>
          </div>
        </section>
      </RevealOnScroll>

      {/* Features Section */}
      <RevealOnScroll>
        <FeatureGrid />
      </RevealOnScroll>

      {/* How It Works */}
      <RevealOnScroll>
        <HowItWorks />
      </RevealOnScroll>

      {/* Interactive template preview */}
      <RevealOnScroll>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="home-template-heading">
          <div className="home-template-spotlight">
            <div className="home-template-copy">
              <span className="home-template-eyebrow">ON ONE SHARED CANVAS</span>
              <h2 id="home-template-heading">Start with a page.<br />See where it goes.</h2>
              <p>Pick a layout, then make it yours.</p>
              <div className="home-template-switcher" role="group" aria-label="Preview a template">
                {[
                  ['moodboard', 'Moodboard'],
                  ['planner', 'Planner'],
                  ['storyboard', 'Storyboard'],
                ].map(([id, label]) => (
                  <button key={id} type="button" onClick={() => setActivePreview(id)} aria-pressed={activePreview === id}>
                    {label}
                  </button>
                ))}
              </div>
              <Link to="/templates" className="home-template-link">Open templates <span aria-hidden="true">↗</span></Link>
            </div>

            <div className="home-template-window" role="img" aria-label={`${activePreview} template preview`}>
              <div className="home-template-window-bar" aria-hidden="true">
                <span /><span /><span />
                <b>{activePreview === 'planner' ? 'weekly planner' : activePreview}</b>
                <i>•••</i>
              </div>
              <div className="home-template-canvas">
                <div className="home-canvas-caption" key={activePreview}>{activePreview === 'planner' ? 'A little room for the week' : activePreview === 'storyboard' ? 'A story, frame by frame' : 'Gather what inspires you'}</div>
                <div className={`home-template-art home-art-${activePreview}`} key={`${activePreview}-art`}>
                  <HomeTemplatePreview template={activePreview} />
                </div>
                <span className="home-template-pencil" aria-hidden="true">✎</span>
              </div>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* Final CTA */}
      <RevealOnScroll>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12 md:p-20 border border-gray-200 dark:border-gray-700">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Got an idea?
          </h2>
          <span className="ink-button"><LiquidMetalButton
              label={isAuthenticated ? 'Create Board' : 'Start Free'}
              onClick={handleStartWhiteboard}
            /></span>
        </div>
      </section>
      </RevealOnScroll>

      <Footer />
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </main>
    </PaperBinExperience>
  )
}
