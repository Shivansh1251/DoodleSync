import { useEffect, useRef, useState } from 'react'
import ThreePencil from './ThreePencil'

const FADE_AFTER_MS = 3 * 60 * 1000
const FADE_DURATION_MS = 1800

// User drawing is paused for this landing-page moment; enable this later with a dedicated control.
const USER_DRAWING_ENABLED = false

function normalizeGreetingName(name) {
  return String(name || '').trim().split(/\s+/)[0].slice(0, 16)
}

function createHelloStrokes(width, height) {
  const fontSize = Math.min(54, Math.max(38, height * 0.28))
  const origin = { x: width * 0.065, y: height * 0.57 }
  const angle = -0.08
  const scaleX = fontSize * 1.38
  const scaleY = fontSize
  const curve = (from, controlA, controlB, to, steps = 12) => Array.from({ length: steps + 1 }, (_, index) => {
    const progress = index / steps
    const inverse = 1 - progress
    return {
      x: inverse ** 3 * from.x + 3 * inverse ** 2 * progress * controlA.x + 3 * inverse * progress ** 2 * controlB.x + progress ** 3 * to.x,
      y: inverse ** 3 * from.y + 3 * inverse ** 2 * progress * controlA.y + 3 * inverse * progress ** 2 * controlB.y + progress ** 3 * to.y,
    }
  })
  const join = (...parts) => parts.flatMap((part, index) => (index ? part.slice(1) : part))
  const transform = ({ x, y }) => ({
    x: origin.x + x * scaleX * Math.cos(angle) - y * scaleY * Math.sin(angle),
    y: origin.y + x * scaleX * Math.sin(angle) + y * scaleY * Math.cos(angle),
  })

  // The first mark starts at the top of the h, like a real handwritten downstroke.
  return [
    join([{ x: 0, y: -0.43 }, { x: 0, y: 0.34 }], curve({ x: 0, y: 0.02 }, { x: 0.1, y: -0.12 }, { x: 0.22, y: -0.09 }, { x: 0.22, y: 0.12 }), curve({ x: 0.22, y: 0.12 }, { x: 0.22, y: 0.27 }, { x: 0.35, y: 0.27 }, { x: 0.38, y: 0.1 })),
    join(curve({ x: 0.46, y: 0.07 }, { x: 0.55, y: -0.1 }, { x: 0.66, y: -0.05 }, { x: 0.63, y: 0.07 }), curve({ x: 0.63, y: 0.07 }, { x: 0.59, y: 0.17 }, { x: 0.43, y: 0.17 }, { x: 0.48, y: 0.04 }), curve({ x: 0.48, y: 0.04 }, { x: 0.59, y: 0.17 }, { x: 0.68, y: 0.16 }, { x: 0.74, y: 0.09 })),
    join([{ x: 0.82, y: -0.42 }, { x: 0.82, y: 0.14 }], curve({ x: 0.82, y: 0.14 }, { x: 0.86, y: 0.22 }, { x: 0.94, y: 0.18 }, { x: 0.98, y: 0.1 })),
    join([{ x: 1.06, y: -0.42 }, { x: 1.06, y: 0.14 }], curve({ x: 1.06, y: 0.14 }, { x: 1.1, y: 0.22 }, { x: 1.18, y: 0.18 }, { x: 1.22, y: 0.1 })),
    join(curve({ x: 1.41, y: 0.03 }, { x: 1.35, y: -0.12 }, { x: 1.24, y: -0.04 }, { x: 1.27, y: 0.1 }), curve({ x: 1.27, y: 0.1 }, { x: 1.31, y: 0.24 }, { x: 1.48, y: 0.2 }, { x: 1.5, y: 0.04 }), curve({ x: 1.5, y: 0.04 }, { x: 1.51, y: -0.08 }, { x: 1.44, y: -0.09 }, { x: 1.41, y: 0.03 })),
  ].map((stroke) => stroke.map(transform))
}

function drawCursiveHello(context, progress, width, height) {
  const strokes = createHelloStrokes(width, height)
  const totalSegments = strokes.reduce((sum, stroke) => sum + stroke.length - 1, 0)
  let remaining = Math.floor(totalSegments * Math.min(progress, 1))

  context.save()
  context.lineJoin = 'round'
  context.lineCap = 'round'
  context.shadowColor = 'rgba(109, 93, 252, 0.42)'
  context.shadowBlur = 7

  strokes.forEach((stroke, strokeIndex) => {
    const segmentCount = Math.min(remaining, stroke.length - 1)
    remaining -= segmentCount
    if (!segmentCount) return
    for (let index = 0; index < segmentCount; index += 1) {
      const start = stroke[index]
      const end = stroke[index + 1]
      const pressure = 1.65 + Math.sin((index / Math.max(1, stroke.length - 1)) * Math.PI) * 0.92 + (strokeIndex === 0 && index < 5 ? 0.5 : 0)
      context.beginPath()
      context.moveTo(start.x, start.y)
      context.lineTo(end.x, end.y)
      context.lineWidth = pressure
      context.strokeStyle = '#765ff4'
      context.stroke()
      context.globalAlpha = 0.28
      context.lineWidth = Math.max(0.55, pressure * 0.28)
      context.strokeStyle = '#d8d1ff'
      context.stroke()
      context.globalAlpha = 1
    }
  })
  context.restore()
}

function getHelloPencilTarget(progress, width, height) {
  const points = createHelloStrokes(width, height).flat()
  const index = Math.min(points.length - 1, Math.floor(Math.min(progress, 1) * (points.length - 1)))
  const current = points[index]
  const previous = points[Math.max(0, index - 1)]
  return { ...current, angle: Math.atan2(current.y - previous.y, current.x - previous.x), visible: true }
}

function getNameStart(width, height) {
  const fontSize = Math.min(54, Math.max(38, height * 0.28))
  return { x: width * 0.065 + fontSize * 2.65, y: height * 0.57 - fontSize * 0.01, fontSize }
}

function createShivanshStrokes(width, height) {
  const { x, y, fontSize } = getNameStart(width, height)
  const angle = -0.08
  const scaleX = fontSize * 0.52
  const scaleY = fontSize * 0.82
  const curve = (from, controlA, controlB, to, steps = 14) => Array.from({ length: steps + 1 }, (_, index) => {
    const progress = index / steps
    const inverse = 1 - progress
    return {
      x: inverse ** 3 * from.x + 3 * inverse ** 2 * progress * controlA.x + 3 * inverse * progress ** 2 * controlB.x + progress ** 3 * to.x,
      y: inverse ** 3 * from.y + 3 * inverse ** 2 * progress * controlA.y + 3 * inverse * progress ** 2 * controlB.y + progress ** 3 * to.y,
    }
  })
  const transform = (point) => ({
    x: x + point.x * scaleX * Math.cos(angle) - point.y * scaleY * Math.sin(angle),
    y: y + point.x * scaleX * Math.sin(angle) + point.y * scaleY * Math.cos(angle),
  })

  const join = (...parts) => parts.flatMap((part, index) => (index ? part.slice(1) : part))

  // Every letter in “Shivansh” is a real pencil path, not revealed font text.
  return [
    join(curve({ x: 0.2, y: -0.43 }, { x: -0.2, y: -0.48 }, { x: -0.34, y: -0.12 }, { x: 0.08, y: -0.04 }), curve({ x: 0.08, y: -0.04 }, { x: 0.42, y: 0.03 }, { x: 0.29, y: 0.34 }, { x: -0.08, y: 0.32 })),
    join([{ x: 0.53, y: -0.44 }, { x: 0.53, y: 0.32 }], curve({ x: 0.53, y: 0.01 }, { x: 0.67, y: -0.14 }, { x: 0.88, y: -0.1 }, { x: 0.87, y: 0.11 }), curve({ x: 0.87, y: 0.11 }, { x: 0.87, y: 0.28 }, { x: 1.02, y: 0.25 }, { x: 1.05, y: 0.08 })),
    [{ x: 1.28, y: -0.12 }, { x: 1.28, y: 0.25 }],
    [{ x: 1.28, y: -0.33 }, { x: 1.285, y: -0.33 }],
    join([{ x: 1.53, y: -0.12 }, { x: 1.72, y: 0.27 }, { x: 1.96, y: -0.12 }]),
    join(curve({ x: 2.32, y: -0.08 }, { x: 2.04, y: -0.08 }, { x: 2.03, y: 0.3 }, { x: 2.28, y: 0.25 }), curve({ x: 2.28, y: 0.25 }, { x: 2.47, y: 0.22 }, { x: 2.48, y: -0.08 }, { x: 2.32, y: -0.08 }), [{ x: 2.48, y: -0.12 }, { x: 2.48, y: 0.25 }]),
    join([{ x: 2.78, y: 0.25 }, { x: 2.78, y: -0.11 }], curve({ x: 2.78, y: -0.11 }, { x: 2.95, y: -0.24 }, { x: 3.16, y: -0.13 }, { x: 3.15, y: 0.25 })),
    join(curve({ x: 3.65, y: -0.1 }, { x: 3.42, y: -0.2 }, { x: 3.32, y: 0.02 }, { x: 3.56, y: 0.06 }), curve({ x: 3.56, y: 0.06 }, { x: 3.79, y: 0.12 }, { x: 3.68, y: 0.33 }, { x: 3.43, y: 0.23 })),
    join([{ x: 4.04, y: -0.44 }, { x: 4.04, y: 0.32 }], curve({ x: 4.04, y: 0.01 }, { x: 4.18, y: -0.14 }, { x: 4.4, y: -0.1 }, { x: 4.39, y: 0.11 }), curve({ x: 4.39, y: 0.11 }, { x: 4.39, y: 0.28 }, { x: 4.54, y: 0.25 }, { x: 4.58, y: 0.08 })),
  ].map((stroke) => stroke.map(transform))
}

function drawInkPath(context, points, progress) {
  const segments = Math.floor((points.length - 1) * Math.min(progress, 1))
  if (!segments) return
  context.save()
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.shadowColor = 'rgba(109, 93, 252, 0.42)'
  context.shadowBlur = 7
  for (let index = 0; index < segments; index += 1) {
    const pressure = 1.75 + Math.sin((index / Math.max(1, points.length - 1)) * Math.PI) * 0.9
    context.beginPath()
    context.moveTo(points[index].x, points[index].y)
    context.lineTo(points[index + 1].x, points[index + 1].y)
    context.lineWidth = pressure
    context.strokeStyle = '#765ff4'
    context.stroke()
    context.globalAlpha = 0.25
    context.lineWidth = Math.max(0.5, pressure * 0.3)
    context.strokeStyle = '#d8d1ff'
    context.stroke()
    context.globalAlpha = 1
  }
  context.restore()
}

function drawGreetingName(context, name, progress, width, height) {
  if (!name || !progress) return
  const handwrittenStrokes = name.toLowerCase() === 'shivansh' ? createShivanshStrokes(width, height) : null
  if (handwrittenStrokes) {
    const totalSegments = handwrittenStrokes.reduce((sum, stroke) => sum + stroke.length - 1, 0)
    let remaining = Math.floor(totalSegments * Math.min(progress, 1))
    handwrittenStrokes.forEach((stroke) => {
      const segments = Math.min(remaining, stroke.length - 1)
      remaining -= segments
      if (segments) drawInkPath(context, stroke, segments / (stroke.length - 1))
    })
    return
  }

  const { x, y, fontSize } = getNameStart(width, height)
  context.save()
  context.translate(x, y)
  context.rotate(-0.08)
  context.font = `italic ${fontSize * 0.82}px "Segoe Print", "Bradley Hand", "Comic Sans MS", cursive`
  context.textBaseline = 'middle'
  context.lineCap = 'round'
  context.lineJoin = 'round'
  const nameWidth = context.measureText(name).width
  context.beginPath()
  context.rect(-2, -fontSize, nameWidth * progress + 4, fontSize * 1.8)
  context.clip()
  context.shadowColor = 'rgba(109, 93, 252, 0.38)'
  context.shadowBlur = 8
  context.lineWidth = 1.1
  context.strokeStyle = '#9487fb'
  context.fillStyle = '#765ff4'
  context.strokeText(name, 0, 0)
  context.fillText(name, 0, 0)
  context.restore()
}

function getGreetingProgress(progress, name) {
  if (!name) return { hello: progress, name: 0 }
  return {
    hello: Math.min(1, progress / 0.58),
    name: Math.max(0, Math.min(1, (progress - 0.58) / 0.42)),
  }
}

function getGreetingPencilTarget(progress, name, width, height) {
  const greetingProgress = getGreetingProgress(progress, name)
  if (!name || !greetingProgress.name) return getHelloPencilTarget(greetingProgress.hello, width, height)
  const { x, y, fontSize } = getNameStart(width, height)
  const handwrittenStrokes = name.toLowerCase() === 'shivansh' ? createShivanshStrokes(width, height) : null
  if (handwrittenStrokes) {
    const totalSegments = handwrittenStrokes.reduce((sum, stroke) => sum + stroke.length - 1, 0)
    let remaining = Math.floor(totalSegments * greetingProgress.name)
    for (const stroke of handwrittenStrokes) {
      const segments = stroke.length - 1
      if (remaining <= segments) {
        const index = Math.max(0, remaining)
        const current = stroke[index]
        const previous = stroke[Math.max(0, index - 1)]
        return { ...current, angle: Math.atan2(current.y - previous.y, current.x - previous.x), visible: true }
      }
      remaining -= segments
    }
    const finalStroke = handwrittenStrokes[handwrittenStrokes.length - 1]
    const current = finalStroke[finalStroke.length - 1]
    const previous = finalStroke[finalStroke.length - 2]
    return { ...current, angle: Math.atan2(current.y - previous.y, current.x - previous.x), visible: true }
  }
  const estimatedNameWidth = name.length * fontSize * 0.47
  return {
    x: x + estimatedNameWidth * greetingProgress.name,
    y: y + Math.sin(greetingProgress.name * Math.PI * 2) * 1.5,
    angle: -0.08,
    visible: true,
  }
}

function drawDoodleConstellation(context, progress, time, width, height) {
  const visibility = Math.max(0, Math.min(1, (progress - 0.76) / 0.24))
  if (!visibility) return
  const pulse = 0.75 + Math.sin(time * 0.003) * 0.25
  const starX = width * 0.62
  const starY = height * 0.36
  const orbitX = width * 0.8
  const orbitY = height * 0.61

  context.save()
  context.globalAlpha = visibility * 0.65
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.strokeStyle = '#12b8a6'
  context.lineWidth = 1.5
  context.setLineDash([3, 8])
  context.beginPath()
  context.moveTo(width * 0.45, height * 0.56)
  context.bezierCurveTo(width * 0.54, height * 0.72, width * 0.7, height * 0.25, orbitX, orbitY)
  context.stroke()
  context.setLineDash([])

  context.strokeStyle = '#8b7cff'
  context.shadowColor = 'rgba(139, 124, 255, 0.65)'
  context.shadowBlur = 10 * pulse
  context.beginPath()
  for (let index = 0; index < 10; index += 1) {
    const radius = index % 2 ? 5 : 12
    const angle = -Math.PI / 2 + index * (Math.PI / 5)
    const x = starX + Math.cos(angle) * radius
    const y = starY + Math.sin(angle) * radius
    if (!index) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
  context.closePath()
  context.stroke()

  context.strokeStyle = '#f2c94c'
  context.beginPath()
  context.arc(orbitX, orbitY, 11 + pulse * 2, 0, Math.PI * 2)
  context.stroke()
  context.fillStyle = '#f48bb6'
  context.beginPath()
  context.arc(orbitX + 15, orbitY - 13, 2.5 + pulse, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

export default function InteractiveSketch({ userName = '' }) {
  const greetingName = normalizeGreetingName(userName)
  const canvasRef = useRef(null)
  const boundsRef = useRef({ width: 1, height: 1, left: 0, top: 0 })
  const autoRef = useRef({ progress: 0, complete: false })
  const lastActivityRef = useRef(performance.now())
  const expiredRef = useRef(false)
  const revealStartedRef = useRef(false)
  const helloStartAtRef = useRef(null)
  const pencilTargetRef = useRef({ x: 0, y: 0, angle: 0, visible: false, idle: false })
  const [pencilEnabled, setPencilEnabled] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    autoRef.current = { progress: 0, complete: false }
    expiredRef.current = false
    revealStartedRef.current = false
    helloStartAtRef.current = null
    pencilTargetRef.current = { x: 0, y: 0, angle: 0, visible: false, idle: false }
    const context = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frameId
    let previousTime = performance.now()

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(bounds.width * ratio))
      canvas.height = Math.max(1, Math.round(bounds.height * ratio))
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      boundsRef.current = { width: bounds.width, height: bounds.height, left: bounds.left, top: bounds.top }
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    if (!('IntersectionObserver' in window)) {
      revealStartedRef.current = true
      helloStartAtRef.current = performance.now()
      setPencilEnabled(true)
    }

    const revealObserver = 'IntersectionObserver' in window
      ? new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting || revealStartedRef.current) return
            revealStartedRef.current = true
            helloStartAtRef.current = performance.now() + 320
            setPencilEnabled(true)
          },
          { rootMargin: '0px 0px -14% 0px', threshold: 0.2 },
        )
      : null
    revealObserver?.observe(canvas)

    const draw = (time) => {
      const delta = Math.min(time - previousTime, 64)
      previousTime = time
      const { width, height } = boundsRef.current
      const canRevealHello = revealStartedRef.current && time >= (helloStartAtRef.current || 0)
      if (!autoRef.current.complete && canRevealHello && !reduceMotion) {
        autoRef.current.progress += delta * 0.00016
        if (autoRef.current.progress >= 1) {
          autoRef.current.progress = 1
          autoRef.current.complete = true
          lastActivityRef.current = time
        }
      } else if (!autoRef.current.complete && canRevealHello) {
        autoRef.current.progress = 1
        autoRef.current.complete = true
        lastActivityRef.current = time
      }

      if (canRevealHello) {
        pencilTargetRef.current = { ...getGreetingPencilTarget(autoRef.current.progress, greetingName, width, height), idle: autoRef.current.complete }
      }

      const age = time - lastActivityRef.current
      const fadeProgress = Math.max(0, (age - FADE_AFTER_MS) / FADE_DURATION_MS)
      if (fadeProgress >= 1) {
        expiredRef.current = true
        pencilTargetRef.current = { ...pencilTargetRef.current, visible: false }
      }

      context.clearRect(0, 0, width, height)
      if (!expiredRef.current) {
        context.save()
        context.globalAlpha = 1 - fadeProgress
        context.lineCap = 'round'
        context.lineJoin = 'round'

        const greetingProgress = getGreetingProgress(autoRef.current.progress, greetingName)
        drawCursiveHello(context, greetingProgress.hello, width, height)
        drawGreetingName(context, greetingName, greetingProgress.name, width, height)
        drawDoodleConstellation(context, autoRef.current.complete ? 1 : 0, time, width, height)
        context.restore()
      }

      frameId = requestAnimationFrame(draw)
    }

    frameId = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      revealObserver?.disconnect()
    }
  }, [greetingName])

  return (
    <section id="live-sketch" className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16" aria-label="Interactive drawing space">
      <div className="sketch-panel sketch-strip overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/80 shadow-[0_20px_70px_rgba(66,51,160,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
        <div className="sketch-canvas-shell relative min-h-[210px] sm:min-h-[250px]">
          <canvas ref={canvasRef} className="sketch-canvas pointer-events-none relative z-10 block h-[210px] w-full sm:h-[250px]" aria-label={USER_DRAWING_ENABLED ? 'Interactive drawing canvas' : 'Animated pencil writing hello'} />
          {pencilEnabled && <ThreePencil targetRef={pencilTargetRef} />}
        </div>
      </div>
    </section>
  )
}
