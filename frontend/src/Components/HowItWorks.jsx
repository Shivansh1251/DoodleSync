import { ArrowRight, Link2, MousePointer2, Pencil } from 'lucide-react'
import { createElement } from 'react'

const steps = [
  { label: 'Open a room', icon: MousePointer2 },
  { label: 'Make a mark', icon: Pencil },
  { label: 'Share the board', icon: Link2 },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="home-how-section mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-labelledby="home-how-heading">
      <div className="home-how-flow">
        <div className="home-how-heading">
          <span>HOW IT WORKS</span>
          <h2 id="home-how-heading">Ideas move better together.</h2>
        </div>
        <ol className="home-how-steps">
          {steps.map(({ label, icon }, index) => (
            <li key={label}>
              <span className="home-how-number">0{index + 1}</span>
              {createElement(icon, { size: 19, strokeWidth: 1.8, 'aria-hidden': true })}
              <span className="home-how-label">{label}</span>
              {index < steps.length - 1 && <ArrowRight className="home-how-arrow" size={16} aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
