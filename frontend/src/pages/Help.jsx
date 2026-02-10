import Navbar from "../Components/Navbar"
import Footer from "../Components/Footer"
import { Link } from "react-router-dom"
import { useState } from 'react'

const faqs = [
  {
    question: "How do I create a new whiteboard?",
    answer: "Click on 'Start your whiteboard' on the home page or 'Join a Room' if you're logged in. You can choose to create a private room or join a public one. Give your room a name and you're ready to start!"
  },
  {
    question: "Can I collaborate with others in real-time?",
    answer: "Yes! DoodleSync is built for real-time collaboration. Share your room ID with others, and they can join instantly. You'll see everyone's cursors and changes happen live."
  },
  {
    question: "Do I need an account to use DoodleSync?",
    answer: "No, you can continue as a guest with just a name. However, creating an account lets you save your work, access it from anywhere, and manage your rooms more easily."
  },
  {
    question: "How do I share my whiteboard with others?",
    answer: "Simply copy the room ID from your whiteboard and share it with your team. They can enter this ID on the 'Join a Room' page to collaborate with you."
  },
  {
    question: "Is my work automatically saved?",
    answer: "Yes, all changes are automatically saved in real-time. Registered users can access their boards anytime by joining the same room ID."
  },
  {
    question: "Can I export my whiteboard?",
    answer: "Yes! You can export your whiteboard as an image (PNG/SVG) or JSON file. Use the export option in the tools menu while on your whiteboard."
  },
  {
    question: "How do I use the chat feature?",
    answer: "While in a room, click the chat icon to open the sidebar. You can send messages to all participants in real-time while collaborating on the whiteboard."
  },
  {
    question: "What drawing tools are available?",
    answer: "DoodleSync includes a full toolkit: pen, highlighter, shapes, text, sticky notes, arrows, and more. You can also change colors, line thickness, and opacity."
  },
  {
    question: "Can I use DoodleSync on mobile?",
    answer: "Yes! DoodleSync works on all devices - desktop, tablet, and mobile. The interface automatically adapts to your screen size."
  },
  {
    question: "Is DoodleSync free to use?",
    answer: "Yes, DoodleSync is completely free! Create unlimited rooms, invite unlimited collaborators, and enjoy all features without any cost."
  }
]

const guides = [
  {
    title: "Getting Started",
    description: "Learn the basics of creating and joining rooms",
    icon: "🚀",
    color: "bg-blue-500"
  },
  {
    title: "Drawing Tools",
    description: "Master all the drawing and editing tools",
    icon: "🎨",
    color: "bg-purple-500"
  },
  {
    title: "Collaboration",
    description: "Tips for effective team collaboration",
    icon: "👥",
    color: "bg-green-500"
  },
  {
    title: "Keyboard Shortcuts",
    description: "Work faster with keyboard shortcuts",
    icon: "⌨️",
    color: "bg-orange-500"
  }
]

const shortcuts = [
  { keys: ["V"], action: "Select Tool" },
  { keys: ["D"], action: "Draw/Pen Tool" },
  { keys: ["E"], action: "Eraser Tool" },
  { keys: ["H"], action: "Hand/Pan Tool" },
  { keys: ["R"], action: "Rectangle" },
  { keys: ["O"], action: "Ellipse/Circle" },
  { keys: ["A"], action: "Arrow" },
  { keys: ["T"], action: "Text Tool" },
  { keys: ["Ctrl", "Z"], action: "Undo" },
  { keys: ["Ctrl", "Y"], action: "Redo" },
  { keys: ["Ctrl", "C"], action: "Copy" },
  { keys: ["Ctrl", "V"], action: "Paste" },
  { keys: ["Delete"], action: "Delete Selection" },
  { keys: ["Ctrl", "+"], action: "Zoom In" },
  { keys: ["Ctrl", "-"], action: "Zoom Out" },
  { keys: ["Ctrl", "0"], action: "Reset Zoom" }
]

export default function Help() {
  const [openFAQ, setOpenFAQ] = useState(null)

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about DoodleSync. 
            Find answers, guides, and tips to get the most out of your whiteboard.
          </p>
        </div>

        {/* Quick Start Guides */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Quick Start Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className={`w-12 h-12 ${guide.color} rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {guide.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {guide.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {guide.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Keyboard Shortcuts
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shortcuts.map((shortcut, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {shortcut.action}
                  </span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, keyIdx) => (
                      <span key={keyIdx}>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 text-sm font-mono">
                          {key}
                        </kbd>
                        {keyIdx < shortcut.keys.length - 1 && (
                          <span className="mx-1 text-gray-500">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 flex-shrink-0 ${
                      openFAQ === idx ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFAQ === idx && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-gray-600 dark:text-gray-400">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Still need help?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
            Can't find the answer you're looking for? Our support team is here to help you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/room-entry"
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300 font-semibold"
            >
              Try DoodleSync Now
            </Link>
            <a
              href="mailto:doodlesync@gmail.com"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-2 border-purple-600 dark:border-purple-400 rounded-lg hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white transition-colors duration-300 font-semibold"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
