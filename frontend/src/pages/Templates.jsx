import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import AuthModal from "../Components/AuthModal"

const templates = [
  {
    id: 1,
    title: "Brainstorming Session",
    description: "Organize ideas and collaborate with your team in real-time",
    icon: "💡",
    color: "from-yellow-400 to-orange-500",
    features: ["Mind maps", "Sticky notes", "Free-form drawing"]
  },
  {
    id: 2,
    title: "Project Planning",
    description: "Plan and track your project milestones visually",
    icon: "📊",
    color: "from-blue-400 to-cyan-500",
    features: ["Gantt charts", "Task lists", "Timeline view"]
  },
  {
    id: 3,
    title: "Design Mockup",
    description: "Create quick wireframes and UI/UX designs",
    icon: "🎨",
    color: "from-purple-400 to-pink-500",
    features: ["Shapes & icons", "Text boxes", "Color palette"]
  },
  {
    id: 4,
    title: "Teaching & Learning",
    description: "Interactive diagrams and educational content",
    icon: "📚",
    color: "from-green-400 to-teal-500",
    features: ["Diagrams", "Annotations", "Screen sharing"]
  },
  {
    id: 5,
    title: "Flowchart & Diagrams",
    description: "Create process flows and system architectures",
    icon: "🔄",
    color: "from-indigo-400 to-blue-500",
    features: ["Connectors", "Shapes library", "Auto-layout"]
  },
  {
    id: 6,
    title: "Agile Board",
    description: "Scrum and Kanban boards for agile teams",
    icon: "🎯",
    color: "from-red-400 to-pink-500",
    features: ["Drag & drop", "Sprint planning", "Backlog mgmt"]
  },
  {
    id: 7,
    title: "Meeting Notes",
    description: "Collaborative note-taking during meetings",
    icon: "📝",
    color: "from-gray-600 to-gray-800",
    features: ["Templates", "Action items", "Time stamps"]
  },
  {
    id: 8,
    title: "Math & Science",
    description: "Mathematical equations and scientific diagrams",
    icon: "🔬",
    color: "from-cyan-400 to-blue-600",
    features: ["Equation editor", "Graphs", "Formulas"]
  },
  {
    id: 9,
    title: "Blank Canvas",
    description: "Start from scratch with unlimited possibilities",
    icon: "✨",
    color: "from-gray-400 to-gray-600",
    features: ["Infinite canvas", "All tools", "Full freedom"]
  }
]

export default function Templates() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleTemplateClick = (template) => {
    if (isAuthenticated) {
      navigate('/room-entry')
    } else {
      setShowAuthModal(true)
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Template Gallery
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose from our curated templates to jumpstart your collaboration. 
            Each template is designed to help you work more efficiently.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleTemplateClick(template)}
            >
              {/* Icon Badge */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {template.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {template.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {template.description}
              </p>

              {/* Features */}
              <div className="space-y-2 mb-4">
                {template.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300 font-medium">
                Use Template
              </button>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Can't find what you need?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Start with a blank canvas and create your own custom template. 
            Save it for future use or share it with your team!
          </p>
          <button
            onClick={() => handleTemplateClick({ id: 'blank' })}
            className="px-8 py-3 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-2 border-purple-600 dark:border-purple-400 rounded-lg hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white transition-colors duration-300 font-semibold"
          >
            Start from Scratch
          </button>
        </div>
      </section>

      <Footer />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </main>
  )
}
