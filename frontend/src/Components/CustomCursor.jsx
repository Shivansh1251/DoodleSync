import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation } from "react-router-dom"

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [trail, setTrail] = useState([])
  const [sparks, setSparks] = useState([])
  const [hovering, setHovering] = useState(false)
  const sparkIdRef = useRef(0)
  const rafRef = useRef()
  const lastPointRef = useRef(null)

  // Tunables
  const LIFESPAN = 800 // ms the spark lasts before disappearing
  const MAX_POINTS = 0 // no line path anymore
  const BASE_COLOR = '#4D96FF' // DoodleSync-like blue
  const HOVER_COLOR = '#06B6D4' // cyan accent on hover
  const GRADIENT = 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)'

  const location = useLocation()

  useEffect(() => {
    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY })
      // no path: only sparkles

      // add sparkles occasionally
      if (Math.random() < 0.9) {
        const id = sparkIdRef.current++
        const angle = Math.random() * Math.PI * 2
        const distance = 6 + Math.random() * 26
        const dx = Math.cos(angle) * distance
        const dy = Math.sin(angle) * distance
        setSparks((prev) => [
          ...prev.slice(-48), // keep last 48 sparks
          { id, x: e.clientX, y: e.clientY, dx, dy }
        ])
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
      setSparks((prev) => prev.filter((s) => now - (s.t || now) < LIFESPAN))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // SVG line path for smooth stroke
  const getLinePath = (points) => {
    if (points.length < 2) return "";
    return points
      .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
      .join(" ");
  };

  const strokeColor = hovering ? HOVER_COLOR : BASE_COLOR
  const isBoard = location.pathname.startsWith('/board')

  return (
    <>
      {/* Disable effects on /board */}
      {!isBoard && (
        <>
          {/* Gradient cursor dot */}
          <div
            className="fixed pointer-events-none z-50 rounded-full shadow-md"
            style={{
              transform: `translate(${pos.x - 10}px, ${pos.y - 10}px)`,
              width: 20,
              height: 20,
              backgroundImage: GRADIENT,
              border: '2px solid rgba(0,0,0,0.05)',
            }}
          />

          {/* Subtle sparkles near the cursor position */}
          {sparks.map((s) => (
            <div
              key={s.id}
              className="fixed pointer-events-none z-40"
              style={{
                left: 0,
                top: 0,
                transform: `translate(${s.x}px, ${s.y}px)`,
              }}
            >
              <div
                className="rounded-full"
                style={{
                  width: 10,
                  height: 10,
                  background: `radial-gradient(circle, rgba(255,255,255,1) 0%, ${strokeColor} 40%, ${strokeColor}00 100%)`,
                  animation: "sparkle 600ms ease-out forwards",
                  "--x": `${s.dx}px`,
                  "--y": `${s.dy}px`,
                  boxShadow: `0 0 14px ${strokeColor}99`,
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
