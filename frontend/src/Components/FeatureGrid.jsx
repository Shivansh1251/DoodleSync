import { MessageCircle, Pencil, Shapes, StickyNote } from 'lucide-react'
import { createElement } from 'react'

const tools = [
  { icon: Pencil, label: 'Draw' },
  { icon: Shapes, label: 'Map ideas' },
  { icon: StickyNote, label: 'Add notes' },
  { icon: MessageCircle, label: 'Talk it through' },
]

export default function FeatureGrid() {
  return (
    <section id="templates" className="home-feature-section mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-labelledby="home-features-heading">
      <div className="home-feature-band">
        <div className="home-feature-heading">
          <span>ONE SHARED CANVAS</span>
          <h2 id="home-features-heading">Everything you need to create.</h2>
        </div>
        <ul className="home-feature-tools" aria-label="Canvas tools">
          {tools.map(({ icon, label }) => (
            <li key={label}>
              {createElement(icon, { size: 18, strokeWidth: 1.8, 'aria-hidden': true })}
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
