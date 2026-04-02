import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [sparks, setSparks] = useState([])
  const [hovering, setHovering] = useState(false)
  const sparkIdRef = useRef(0)
  const rafRef = useRef()
  const lastMoveRef = useRef({ x: 0, y: 0, t: 0 })

  // Tunables
  const LIFESPAN = 700 // ms each spark lasts before disappearing
  const BASE_COLOR = '#4D96FF' // DoodleSync-like blue
  const HOVER_COLOR = '#06B6D4' // cyan accent on hover
  const GRADIENT = 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)'

  const location = useLocation()

  useEffect(() => {
    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY })

      const now = performance.now()
      const prev = lastMoveRef.current
      const dt = Math.max(16, now - prev.t || 16)
      const dist = Math.hypot(e.clientX - prev.x, e.clientY - prev.y)
      const speed = dist / dt
      lastMoveRef.current = { x: e.clientX, y: e.clientY, t: now }

      // Emit more particles at higher movement speed for a richer trail.
      if (Math.random() < 0.95) {
        const burstCount = speed > 1.4 ? 3 : speed > 0.8 ? 2 : 1
        const nextSparks = Array.from({ length: burstCount }, () => {
          const id = sparkIdRef.current++
          const angle = Math.random() * Math.PI * 2
          const distance = 8 + Math.random() * 30
          const dx = Math.cos(angle) * distance
          const dy = Math.sin(angle) * distance
          return { id, x: e.clientX, y: e.clientY, dx, dy, t: now }
        })

        setSparks((current) => [...current.slice(-90), ...nextSparks])
      }
    }

    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [])

  // Hover detection for interactive elements
  useEffect(() => {
    const isInteractive = (el) => {
      if (!el) return false
      const selector = 'a, button, [role="button"], input, textarea, select, .interactive'
      return el.matches?.(selector) || el.closest?.(selector)
    }
    const onOver = (e) => setHovering(isInteractive(e.target))
    const onOut = (e) => setHovering(isInteractive(e.relatedTarget))
    window.addEventListener('mouseover', onOver)
    window.addEventListener('mouseout', onOut)
    return () => {
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mouseout', onOut)
    }
  }, [])

  // Clean up sparks over time
  useEffect(() => {
    const tick = () => {
      const now = performance.now()
      setSparks((prev) => prev.filter((s) => now - s.t < LIFESPAN))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const strokeColor = hovering ? HOVER_COLOR : BASE_COLOR
  const isBoard = location.pathname.startsWith('/board')

  return (
    <>
      {/* Disable effects on /board */}
      {!isBoard && (
        <>
          {/* Gradient cursor dot */}
          <div
            className="fixed pointer-events-none z-[9999] rounded-full shadow-md"
            style={{
              transform: `translate(${pos.x - 10}px, ${pos.y - 10}px)`,
              width: 20,
              height: 20,
              backgroundImage: GRADIENT,
              border: '2px solid rgba(0,0,0,0.05)',
              boxShadow: `0 0 0 2px ${strokeColor}22, 0 0 20px ${strokeColor}99`,
            }}
          />

          {/* Outer ring gives a stronger cursor feel and reacts on hover */}
          <div
            className="fixed pointer-events-none z-[9998] rounded-full"
            style={{
              transform: `translate(${pos.x - 18}px, ${pos.y - 18}px) scale(${hovering ? 1.15 : 1})`,
              width: 36,
              height: 36,
              border: `1.5px solid ${strokeColor}99`,
              transition: 'transform 120ms ease-out, border-color 120ms ease-out',
              animation: 'cursorPulse 1.6s ease-in-out infinite',
            }}
          />

          {/* Subtle sparkles near the cursor position */}
          {sparks.map((s) => (
            <div
              key={s.id}
              className="fixed pointer-events-none z-[9998]"
              style={{
                left: 0,
                top: 0,
                transform: `translate(${s.x}px, ${s.y}px)`,
              }}
            >
              <div
                className="rounded-full"
                style={{
                  width: 12,
                  height: 12,
                  background: `radial-gradient(circle, rgba(255,255,255,1) 0%, ${strokeColor} 40%, ${strokeColor}00 100%)`,
                  animation: "sparkle 700ms ease-out forwards",
                  "--x": `${s.dx}px`,
                  "--y": `${s.dy}px`,
                  boxShadow: `0 0 16px ${strokeColor}bb`,
                }}
              />
            </div>
          ))}
        </>
      )}

  {/* removed old halo and path; effects are in the gated block above */}
    </>
  );
}
