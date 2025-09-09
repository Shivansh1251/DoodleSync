import Navbar from "../Components/Navbar"
import FeatureGrid from "../Components/FeatureGrid"
import HowItWorks from "../Components/HowItWorks"
import Footer from "../Components/Footer"
import { Link } from "react-router-dom"

export default function Home() {
  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20 text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
          Free Online Whiteboard Tool
        </h2>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          DoodleSync Whiteboards gives you infinite space to collaborate. Brainstorm, run a strategy session, or plan out a project. It's never been easier — or more fun — to work together.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/room"
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start your whiteboard
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