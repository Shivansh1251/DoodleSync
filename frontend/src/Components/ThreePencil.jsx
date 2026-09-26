import { useEffect, useRef } from 'react'

export default function ThreePencil({ targetRef, className = 'three-pencil-layer', scale = 0.38 }) {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host || !window.WebGLRenderingContext) return undefined

    let disposed = false
    let cleanup = () => {}

    const initialize = async () => {
      const THREE = await import('three')
      if (disposed) return

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
      camera.position.z = 10
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setClearColor(0x000000, 0)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      host.appendChild(renderer.domElement)

      const pencil = new THREE.Group()
      const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xf9c928, metalness: 0.08, roughness: 0.3 })
      const stripeMaterial = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.06, roughness: 0.26 })
      const woodMaterial = new THREE.MeshStandardMaterial({ color: 0xd9b37b, roughness: 0.72 })
      const graphiteMaterial = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 })
      const eraserMaterial = new THREE.MeshStandardMaterial({ color: 0xf48bb6, roughness: 0.35 })
      const metalMaterial = new THREE.MeshStandardMaterial({ color: 0xd8ad55, metalness: 0.72, roughness: 0.24 })
      const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.28 })
      const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x3c2430, roughness: 0.34 })
      const blushMaterial = new THREE.MeshStandardMaterial({ color: 0xeb5e91, roughness: 0.44 })
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 1.22, 6), bodyMaterial)
      const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.112, 0.112, 0.16, 6), stripeMaterial)
      const wood = new THREE.Mesh(new THREE.ConeGeometry(0.108, 0.29, 6), woodMaterial)
      const graphite = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.11, 10), graphiteMaterial)
      const metal = new THREE.Mesh(new THREE.CylinderGeometry(0.116, 0.116, 0.14, 12), metalMaterial)
      const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.102, 0.102, 0.2, 12), eraserMaterial)
      const eyeGeometry = new THREE.SphereGeometry(0.042, 12, 10)
      const pupilGeometry = new THREE.SphereGeometry(0.021, 10, 8)
      const blushGeometry = new THREE.SphereGeometry(0.018, 10, 8)
      const leftEye = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial)
      const rightEye = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial)
      const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial)
      const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial)
      const leftBlush = new THREE.Mesh(blushGeometry, blushMaterial)
      const rightBlush = new THREE.Mesh(blushGeometry, blushMaterial)

      body.rotation.z = Math.PI / 2
      stripe.rotation.z = Math.PI / 2
      stripe.position.x = 0.26
      wood.rotation.z = -Math.PI / 2
      wood.position.x = -0.75
      graphite.rotation.z = -Math.PI / 2
      graphite.position.x = -0.94
      metal.rotation.z = Math.PI / 2
      metal.position.x = 0.68
      eraser.rotation.z = Math.PI / 2
      eraser.position.x = 0.85
      leftEye.position.set(0.8, 0.018, 0.098)
      rightEye.position.set(0.9, 0.018, 0.098)
      leftPupil.position.set(0.8, 0.018, 0.132)
      rightPupil.position.set(0.9, 0.018, 0.132)
      leftBlush.position.set(0.76, -0.045, 0.092)
      rightBlush.position.set(0.94, -0.045, 0.092)
      pencil.add(body, stripe, wood, graphite, metal, eraser, leftEye, rightEye, leftPupil, rightPupil, leftBlush, rightBlush)
      pencil.rotation.x = 0.34
      pencil.rotation.y = -0.24
      pencil.scale.setScalar(scale)
      scene.add(pencil)
      scene.add(new THREE.HemisphereLight(0xffffff, 0x4f46e5, 2.8))
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8)
      keyLight.position.set(-2, 3, 5)
      scene.add(keyLight)

      const resize = () => {
        const { width, height } = host.getBoundingClientRect()
        if (!width || !height) return
        renderer.setSize(width, height, false)
        const aspect = width / height
        camera.left = -aspect
        camera.right = aspect
        camera.top = 1
        camera.bottom = -1
        camera.updateProjectionMatrix()
      }

      const observer = new ResizeObserver(resize)
      observer.observe(host)
      resize()
      const desiredPosition = new THREE.Vector3()
      let frameId
      const render = (time) => {
        const bounds = host.getBoundingClientRect()
        const target = targetRef.current
        if (bounds.width && bounds.height && target?.visible) {
          const aspect = bounds.width / bounds.height
          const tipOffset = 0.36
          desiredPosition.set(
            (target.x / bounds.width - 0.5) * aspect * 2 + Math.cos(target.angle) * tipOffset,
            (0.5 - target.y / bounds.height) * 2 + Math.sin(target.angle) * tipOffset - 0.06 + (target.idle ? Math.sin(time * 0.0045) * 0.055 : 0),
            0.08 + Math.sin(time * 0.004) * 0.015,
          )
          pencil.position.lerp(desiredPosition, 0.16)
          const danceAngle = target.idle ? Math.sin(time * 0.0045) * 0.16 + Math.sin(time * 0.009) * 0.05 : 0
          pencil.rotation.z += (target.angle + danceAngle - pencil.rotation.z) * 0.14
          const danceScale = target.idle ? 1 + Math.sin(time * 0.0045) * 0.055 : 1
          pencil.scale.setScalar(scale * danceScale)
          pencil.visible = true
        } else {
          pencil.visible = false
        }
        renderer.render(scene, camera)
        frameId = requestAnimationFrame(render)
      }

      frameId = requestAnimationFrame(render)
      cleanup = () => {
        cancelAnimationFrame(frameId)
        observer.disconnect()
        renderer.dispose()
        body.geometry.dispose()
        stripe.geometry.dispose()
        wood.geometry.dispose()
        graphite.geometry.dispose()
        metal.geometry.dispose()
        eraser.geometry.dispose()
        eyeGeometry.dispose()
        pupilGeometry.dispose()
        blushGeometry.dispose()
        bodyMaterial.dispose()
        stripeMaterial.dispose()
        woodMaterial.dispose()
        graphiteMaterial.dispose()
        eraserMaterial.dispose()
        metalMaterial.dispose()
        eyeWhiteMaterial.dispose()
        pupilMaterial.dispose()
        blushMaterial.dispose()
        host.replaceChildren()
      }
    }

    initialize()
    return () => {
      disposed = true
      cleanup()
    }
  }, [scale, targetRef])

  return <div ref={hostRef} className={className} aria-hidden="true" />
}
