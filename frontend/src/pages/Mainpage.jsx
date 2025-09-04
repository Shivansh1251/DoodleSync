import FeatureGrid from "../Components/FeatureGrid"
import HowItWorks from "../Components/HowItWorks"
import Footer from "../Components/Footer"

export default function MainPage() {
  return (
    <main className="relative">
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
          Free Online Whiteboard Tool
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600">
          DoodleSync Whiteboards gives you infinite space to collaborate. Brainstorm, run a strategy session, or plan out a project. It's never been easier — or more fun — to work together. Capture your team’s best ideas and turn them into action plans in an instant with AI tools.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href="/board"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start a whiteboard
          </a>
          
        </div>
      </section>
      <div id="templates">
        <FeatureGrid />
      </div>
  <HowItWorks />
  <Footer />
    </main>
  )
}
