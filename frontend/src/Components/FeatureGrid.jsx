export default function FeatureGrid() {
  const features = [
    {
      key: 'draw',
      title: 'Draw',
      desc: 'Sketch, doodle, and draw with our free online drawing app.',
      href: '/board',
      swatch: 'from-blue-50 to-indigo-100',
      image: '/afb68fd4-3068-4b06-8fca-dae745f906b1.png',
    },
    {
      key: 'flowcharts',
      title: 'Flowcharts',
      desc: 'Visualize processes and ideas with flowchart shapes and connectors.',
      href: '/board',
      swatch: 'from-orange-50 to-amber-100',
      image: '/6874e087d180d96e9c429fd2_tldraw-asset.png',
    },
    {
      key: 'stickies',
      title: 'Sticky Notes',
      desc: 'Capture ideas with sticky notes and color tags on an infinite canvas.',
      href: '/board',
      swatch: 'from-yellow-50 to-amber-100',
      image: '/sticky-notes-hero.png',
    },
    {
      key: 'chat',
      title: 'Real-time Chat',
      desc: 'Chat while you sketch to keep everyone in sync.',
      href: '/chat',
      swatch: 'from-purple-50 to-pink-100',
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop&q=85',
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
          Everything You Need to Create
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
          Start transforming your ideas into interactive visuals that engage audiences across various platforms—from widescreens to mobile devices.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <a
            key={f.key}
            href={f.href}
            className="group relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
            target={f.href === '/board' ? '_blank' : undefined}
            rel={f.href === '/board' ? 'noopener noreferrer' : undefined}
          >
            {/* Image Header */}
            <div className={`relative h-48 w-full bg-gradient-to-br ${f.swatch} overflow-hidden`}>
              <img 
                src={f.image} 
                alt={f.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
              />
              {/* Subtle gradient overlay for better text readability on hover */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                {f.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed transition-colors duration-300">
                {f.desc}
              </p>
            </div>

            {/* Hover Border Effect */}
            <div className="absolute inset-0 rounded-2xl border-2 border-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </a>
        ))}
      </div>
    </section>
  )
}
