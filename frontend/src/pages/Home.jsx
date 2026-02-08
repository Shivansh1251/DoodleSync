import Navbar from "../Components/Navbar"
import FeatureGrid from "../Components/FeatureGrid"
import HowItWorks from "../Components/HowItWorks"
import Footer from "../Components/Footer"
import { Link } from "react-router-dom"
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, isAuthenticated } = useAuth()

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20 text-center">
        {isAuthenticated && user && (
          <div className="mb-6 inline-block px-6 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 dark:border-purple-800 rounded-full">
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
              Welcome back, <span className="font-bold text-purple-600 dark:text-purple-400">{user.name}</span>! 👋
            </p>
          </div>
        )}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white transition-colors duration-300">
          Free Online Whiteboard Tool
        </h2>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
          DoodleSync Whiteboards gives you infinite space to collaborate. Brainstorm, run a strategy session, or plan out a project. It's never been easier — or more fun — to work together.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/room-entry"
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-blue-600 dark:bg-blue-500 text-white font-semibold shadow hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-300"
          >
            {isAuthenticated ? 'Join a Room' : 'Start your whiteboard'}
          </Link>

        </div>
        <img
          src="/tldrawFile.png"
          alt="DoodleSync board preview"
          className="mt-8 sm:mt-10 mx-auto w-full max-w-[900px] h-auto object-contain"
        />

      </section>
      <div id="templates">
        <FeatureGrid />
      </div>
      <HowItWorks />
      <Footer />
    </main>
  )
}