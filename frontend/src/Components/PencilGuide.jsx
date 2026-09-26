import { useEffect, useRef } from 'react'
import ThreePencil from './ThreePencil'

export default function PencilGuide({ heroRef }) {
  const targetRef = useRef({ x: 0, y: 0, angle: 0, visible: false })

  useEffect(() => {
    const hero = heroRef.current
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!hero || !media.matches || reducedMotion.matches) return undefined

    let hoveringHero = false
    let frameId

    const setTrailPosition = () => {
      if (hoveringHero) return
      const progress = Math.min(1, window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight))
      const x = window.innerWidth * (0.1 + progress * 0.8)
      const y = window.innerHeight * (0.16 + Math.sin(progress * Math.PI) * 0.12)
      targetRef.current = { x, y, angle: 0.26 + Math.sin(progress * Math.PI * 2) * 0.18, visible: true }
    }

    const onMove = (event) => {
      const rect = hero.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return
      hoveringHero = true
      targetRef.current = { x: event.clientX, y: event.clientY, angle: -0.18, visible: true }
    }

    const onLeave = () => {
      hoveringHero = false
      setTrailPosition()
    }

    const onScroll = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(setTrailPosition)
    }

    setTrailPosition()
    hero.addEventListener('pointermove', onMove, { passive: true })
    hero.addEventListener('pointerleave', onLeave, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', setTrailPosition, { passive: true })

    return () => {
      cancelAnimationFrame(frameId)
      hero.removeEventListener('pointermove', onMove)
      hero.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', setTrailPosition)
    }
  }, [heroRef])

  return <ThreePencil targetRef={targetRef} className="three-pencil-guide" scale={0.18} />
}
