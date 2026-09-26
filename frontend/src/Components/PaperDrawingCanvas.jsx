import { useCallback, useEffect, useRef } from 'react'

function drawStroke(context, stroke, width, height) {
  if (!stroke.points.length) return
  context.beginPath()
  context.strokeStyle = stroke.color
  context.lineWidth = stroke.size
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.moveTo(stroke.points[0].x * width, stroke.points[0].y * height)
  for (let index = 1; index < stroke.points.length; index += 1) {
    const point = stroke.points[index]
    context.lineTo(point.x * width, point.y * height)
  }
  if (stroke.points.length === 1) {
    context.lineTo(stroke.points[0].x * width + 0.01, stroke.points[0].y * height + 0.01)
  }
  context.stroke()
}

export default function PaperDrawingCanvas({ strokes, active, color, onStroke }) {
  const canvasRef = useRef(null)
  const currentStrokeRef = useRef(null)
  const redrawRef = useRef(() => {})

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const bounds = canvas.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    const pixelWidth = Math.round(bounds.width * ratio)
    const pixelHeight = Math.round(bounds.height * ratio)
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth
      canvas.height = pixelHeight
    }
    const context = canvas.getContext('2d')
    if (!context) return
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.clearRect(0, 0, bounds.width, bounds.height)
    strokes.forEach((stroke) => drawStroke(context, stroke, bounds.width, bounds.height))
  }, [strokes])

  redrawRef.current = redraw

  useEffect(() => {
    redraw()
    const canvas = canvasRef.current
    if (!canvas || !('ResizeObserver' in window)) return undefined
    const observer = new ResizeObserver(() => redrawRef.current())
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [redraw])

  const getPoint = (event) => {
    const bounds = canvasRef.current.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
      y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
    }
  }

  const handlePointerDown = (event) => {
    if (!active) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = getPoint(event)
    const bounds = event.currentTarget.getBoundingClientRect()
    currentStrokeRef.current = { color, size: 2.4, points: [point] }
    const context = event.currentTarget.getContext('2d')
    if (context) {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      drawStroke(context, currentStrokeRef.current, bounds.width, bounds.height)
    }
  }

  const handlePointerMove = (event) => {
    const stroke = currentStrokeRef.current
    if (!active || !stroke) return
    const point = getPoint(event)
    const previous = stroke.points[stroke.points.length - 1]
    if (Math.hypot(point.x - previous.x, point.y - previous.y) < 0.0012) return
    stroke.points.push(point)
    const bounds = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    const context = event.currentTarget.getContext('2d')
    if (!context) return
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.beginPath()
    context.strokeStyle = stroke.color
    context.lineWidth = stroke.size
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.moveTo(previous.x * bounds.width, previous.y * bounds.height)
    context.lineTo(point.x * bounds.width, point.y * bounds.height)
    context.stroke()
  }

  const finishStroke = () => {
    const stroke = currentStrokeRef.current
    if (!stroke) return
    currentStrokeRef.current = null
    onStroke(stroke)
  }

  return (
    <canvas
      ref={canvasRef}
      className={`paper-drawing-canvas${active ? ' is-drawing' : ''}`}
      aria-label={active ? 'Draw on the page' : 'Page drawing layer'}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishStroke}
      onPointerCancel={finishStroke}
    />
  )
}
