export default function HowItWorks() {
  const steps = [
    { title: '1. Start a board', desc: 'Open a fresh infinite canvas or use a template.' },
    { title: '2. Invite & collaborate', desc: 'Share a link and work together in real time.' },
    { title: '3. Create & organize', desc: 'Sketch, add shapes, sticky notes, and images.' },
    { title: '4. Export or continue', desc: 'Save snapshots or keep iterating—your work is autosaved.' },
  ]
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">How it works</h2>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s) => (
          <div key={s.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">{s.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
