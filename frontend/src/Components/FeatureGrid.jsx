export default function FeatureGrid() {
  const features = [
    {
      key: 'draw',
      title: 'Draw',
      desc: 'Sketch, doodle, and draw with our free online drawing app.',
      href: '/board',
      swatch: 'from-blue-50 to-indigo-50',
      icon: '✏️',
    },
    {
      key: 'mindmaps',
      title: 'Mind Maps',
      desc: 'Boost ideas and learning with our collaborative mind map maker.',
      href: '/board',
      swatch: 'from-emerald-50 to-teal-50',
      icon: '🧠',
    },
    {
      key: 'flowcharts',
      title: 'Flowcharts',
      desc: 'Visualize processes and ideas with flowchart shapes and connectors.',
      href: '/board',
      swatch: 'from-amber-50 to-orange-50',
      icon: '🔀',
    },
    {
      key: 'wireframes',
      title: 'Wireframes',
      desc: 'Rough out product screens fast with boxes, text, and arrows.',
      href: '/board',
      swatch: 'from-slate-50 to-gray-50',
      icon: '📐',
    },
    {
      key: 'stickies',
      title: 'Sticky Notes',
      desc: 'Capture ideas with sticky notes and color tags on an infinite canvas.',
      href: '/board',
      swatch: 'from-yellow-50 to-lime-50',
      icon: '🗒️',
    },
    {
      key: 'chat',
      title: 'Real-time Chat',
      desc: 'Chat while you sketch to keep everyone in sync.',
      href: '/chat',
      swatch: 'from-fuchsia-50 to-pink-50',
      icon: '💬',
    },
  ]

  return (
    <section className="mx-auto max-w-6xl px-6 pt-4 pb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Create a whiteboard</h2>
        <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
          Start transforming your ideas into interactive visuals that engage audiences across various platforms—from widescreens to mobile devices.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <a
            key={f.key}
            href={f.href}
            className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            target={f.href === '/board' ? '_blank' : undefined}
            rel={f.href === '/board' ? 'noopener noreferrer' : undefined}
          >
            <div className={`h-40 w-full bg-gradient-to-br ${f.swatch} flex items-center justify-center`}>
              <div className="text-4xl drop-shadow-sm">{f.icon}</div>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{f.title}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">{f.desc}</p>
              <div className="mt-4">
                <span className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 font-medium transition-colors duration-300">
                  {f.href === '/chat' ? 'Open chat' : 'Start template'}
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h9.586L10.293 5.707a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 11H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
