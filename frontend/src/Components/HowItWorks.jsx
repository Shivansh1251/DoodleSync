export default function HowItWorks() {
  const steps = [
    { 
      number: '01',
      title: 'Start a board', 
      desc: 'Open a fresh infinite canvas or use a template.',
      icon: '🎨',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      number: '02',
      title: 'Invite & collaborate', 
      desc: 'Share a link and work together in real time.',
      icon: '👥',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      number: '03',
      title: 'Create & organize', 
      desc: 'Sketch, add shapes, sticky notes, and images.',
      icon: '✨',
      color: 'from-orange-500 to-red-500'
    },
    { 
      number: '04',
      title: 'Export or continue', 
      desc: 'Save snapshots or keep iterating—your work is autosaved.',
      icon: '💾',
      color: 'from-green-500 to-emerald-500'
    },
  ]
  
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
          How It Works
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Get started in seconds and collaborate instantly
        </p>
      </div>

      <div className="relative">
        {/* Connection Line (Desktop) */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 dark:from-blue-900 dark:via-purple-900 dark:to-green-900 -translate-y-1/2 z-0"></div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="group relative"
            >
              {/* Card */}
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
                {/* Number Badge */}
                <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-5xl mb-4 text-center transform group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed transition-colors duration-300">
                  {step.desc}
                </p>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300 pointer-events-none`}></div>
              </div>

              {/* Arrow (Desktop) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-20">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Note */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          ✨ <span className="font-semibold">No installation required</span> — Start creating in your browser
        </p>
      </div>
    </section>
  )
}
