import Navbar from "../Components/Navbar"
import FeatureGrid from "../Components/FeatureGrid"
import HowItWorks from "../Components/HowItWorks"
import Footer from "../Components/Footer"
import AuthModal from "../Components/AuthModal"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const navigate = useNavigate()

  const handleStartWhiteboard = () => {
    if (isAuthenticated) {
      navigate('/room-entry')
    } else {
      setShowAuthModal(true)
    }
  }

  const useCases = [
    {
      icon: "",
      title: "Business Teams",
      description: "Brainstorm ideas, plan sprints, and align on strategy with your remote team.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "",
      title: "Education",
      description: "Create interactive lessons, explain concepts visually, and engage students.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: "",
      title: "Designers",
      description: "Sketch wireframes, create user flows, and present design concepts.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "",
      title: "Startups",
      description: "Map out your product roadmap, pitch ideas, and collaborate on features.",
      color: "from-orange-500 to-red-500"
    }
  ]

  return (
    <main className="overflow-hidden">
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
            The infinite canvas whiteboard where teams brainstorm, design, and bring ideas to life together. 
            <span className="block mt-2 font-semibold text-purple-600 dark:text-purple-400">No limits. No costs. Just create.</span>
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartWhiteboard}
              className="group relative w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300"
            >
              Join Room
            </button>
          </div>
        </div>

        {/* Preview Image */}
        <div className="mt-16 relative">
          <img
            src="/tldrawFile.png"
              alt="DoodleSync board preview"
              className="mx-auto w-full max-w-4xl h-auto object-contain"
            />
          </div>
              </section>

      {/* Use Cases Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Perfect for Every Team
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            From classrooms to boardrooms, DoodleSync adapts to your needs
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, idx) => (
            <div
              key={idx}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${useCase.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <div id="templates">
        <FeatureGrid />
      </div>

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonial/Quote Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-12 md:p-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48"></div>
          
          <div className="relative z-10 text-center text-white">
            <svg className="w-12 h-12 mx-auto mb-6 opacity-50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
            <p className="text-2xl md:text-3xl font-medium mb-6 leading-relaxed">
              "The simplest and most powerful whiteboard tool we've used. It just works, instantly."
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              </div>
              <div className="text-left">
                <div className="font-semibold">Teams worldwide</div>
                <div className="text-sm opacity-75">Using DoodleSync daily</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12 md:p-20 border border-gray-200 dark:border-gray-700">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to bring your ideas to life?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of teams collaborating on DoodleSync. Start creating in seconds, no credit card required.
          </p>
          <button
            onClick={handleStartWhiteboard}
            className="px-10 py-5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            {isAuthenticated ? 'Create Your Whiteboard' : 'Start Free Now'}
          </button>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            ✓ No signup required for guests  ✓ Unlimited whiteboards  ✓ Forever free
          </p>
        </div>
      </section>

      <Footer />
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </main>
  )
}