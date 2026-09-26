import { useEffect, useRef } from 'react'

const TOSS_DURATION_MS = 4280

function makeCrumpleGeometry(THREE, seed) {
  const geometry = new THREE.IcosahedronGeometry(0.27, 3)
  const positions = geometry.attributes.position
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index)
    const y = positions.getY(index)
    const z = positions.getZ(index)
    const variation = 0.91
      + Math.sin((x * 29 + y * 13 + seed * 3.1) * 2.4) * 0.095
      + Math.sin((y * 37 - z * 17 + seed * 5.7) * 2.1) * 0.055
      + Math.sin((z * 43 + x * 19 + seed * 7.3) * 1.8) * 0.035
    positions.setXYZ(index, positions.getX(index) * variation, positions.getY(index) * variation, positions.getZ(index) * variation)
  }
  geometry.computeVertexNormals()
  return geometry
}

function makeFoldableSheet(THREE) {
  const geometry = new THREE.PlaneGeometry(1.55, 1.38, 18, 16)
  geometry.userData.flatPositions = geometry.attributes.position.array.slice()
  return geometry
}

function easeInOut(value) {
  const progress = Math.max(0, Math.min(1, value))
  return progress * progress * (3 - 2 * progress)
}

function foldSheet(geometry, progress) {
  const positions = geometry.attributes.position
  const flat = geometry.userData.flatPositions
  const sideFold = easeInOut(progress / 0.42)
  const endFold = easeInOut((progress - 0.12) / 0.46)
  const squeeze = easeInOut((progress - 0.36) / 0.62)

  for (let index = 0; index < positions.count; index += 1) {
    const offset = index * 3
    const x = flat[offset]
    const y = flat[offset + 1]
    const accordionX = Math.sin(y * 13.5 + x * 3.2) * 0.048 * sideFold
    const accordionY = Math.sin(x * 14.5 - y * 2.7) * 0.045 * endFold
    const wrinkles = Math.sin(x * 19 + y * 13) * Math.cos(y * 23 - x * 8) * squeeze
    const foldedX = x * (1 - sideFold * 0.7) + accordionX
    const foldedY = y * (1 - endFold * 0.72) + accordionY
    const foldedZ = Math.abs(x) * sideFold * 0.07
      + Math.abs(y) * endFold * 0.06
      + wrinkles * 0.075
      + Math.sin((x + y) * 25) * squeeze * 0.025
    positions.setXYZ(index, foldedX, foldedY, foldedZ)
  }

  positions.needsUpdate = true
  geometry.computeVertexNormals()
}

function getPilePosition(index) {
  const perLayer = 5
  const layer = Math.floor(index / perLayer)
  const slot = index % perLayer
  const angle = slot * ((Math.PI * 2) / perLayer) + layer * 0.54
  const radius = slot === 0 ? 0.01 : 0.095 + (slot % 2) * 0.035
  return {
    x: Math.cos(angle) * radius,
    y: -0.68 + layer * 0.43 + (slot % 2) * 0.012,
    z: 0.43 + Math.sin(angle) * radius,
  }
}

export default function DustbinModel({ tossing, enabled, pageCount = 0, throwStartedAt = null }) {
  const hostRef = useRef(null)
  const tossingRef = useRef(tossing)
  tossingRef.current = tossing
  const throwStartedAtRef = useRef(throwStartedAt)
  throwStartedAtRef.current = throwStartedAt
  const pageCountRef = useRef(pageCount)
  pageCountRef.current = pageCount
  const wakeRenderRef = useRef(null)

  useEffect(() => {
    wakeRenderRef.current?.()
  }, [tossing, pageCount, throwStartedAt])

  useEffect(() => {
    const host = hostRef.current
    if (!host || !enabled) return undefined

    let disposed = false
    let frameId
    let observer
    let renderer
    let scene
    let paper
    let renderedPageCount = 0
    const depositedPages = []

    const initialize = async () => {
      const [THREE, { GLTFLoader }] = await Promise.all([
        import('three'),
        import('three/addons/loaders/GLTFLoader.js'),
      ])
      if (disposed) return

      scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1.5, 1.5, 1.5, -1.5, 0.1, 50)
      camera.position.set(3.1, 3.2, 6)
      camera.lookAt(0, 0.05, 0)
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.1))
      renderer.setClearColor(0x000000, 0)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      host.appendChild(renderer.domElement)
      scene.add(new THREE.HemisphereLight(0xffffff, 0x25243a, 2.1))
      const keyLight = new THREE.DirectionalLight(0xffffff, 3.2)
      keyLight.position.set(-3, 5, 5)
      scene.add(keyLight)

      const modelRoot = new THREE.Group()
      scene.add(modelRoot)
      const loader = new GLTFLoader()
      loader.load('/models/pen-holder/scene.gltf', (gltf) => {
        if (disposed) return
        const model = gltf.scene
        const initialBounds = new THREE.Box3().setFromObject(model)
        const initialSize = initialBounds.getSize(new THREE.Vector3())
        const scale = 2.05 / Math.max(initialSize.x, initialSize.y, initialSize.z)
        model.scale.setScalar(scale)
        const bounds = new THREE.Box3().setFromObject(model)
        const center = bounds.getCenter(new THREE.Vector3())
        model.position.set(-center.x, -1.02 - bounds.min.y, -center.z)
        model.traverse((object) => {
          if (object.isMesh) {
            object.castShadow = true
            object.receiveShadow = true
            if (object.material) {
              object.material = object.material.clone()
              object.material.roughness = Math.max(0.38, object.material.roughness ?? 0.7)
              object.material.metalness = Math.min(0.32, object.material.metalness ?? 0)
            }
          }
        })
        modelRoot.add(model)
        scheduleRender()
      }, undefined, (error) => {
        console.error('Unable to load the pen holder model.', error)
      })

      paper = new THREE.Mesh(
        makeFoldableSheet(THREE),
        new THREE.MeshStandardMaterial({ color: 0xfaf8f2, roughness: 0.94, side: THREE.DoubleSide }),
      )
      paper.castShadow = true
      paper.visible = false
      scene.add(paper)

      const addDepositedPage = (index) => {
        const position = getPilePosition(index)
        const colors = [0xf5f2ff, 0xe8e2ff, 0xfaf4e9, 0xdcecf0]
        const material = new THREE.MeshStandardMaterial({ color: colors[index % colors.length], roughness: 1, flatShading: true })
        const crumple = new THREE.Mesh(makeCrumpleGeometry(THREE, index + 1), material)
        crumple.position.set(position.x, position.y + 0.25, position.z)
        const size = 1.02 + (index % 3) * 0.1
        crumple.scale.set(size * (0.88 + (index % 2) * 0.15), size, size * (0.9 + (index % 4) * 0.06))
        crumple.rotation.set(index * 0.73, index * 1.17, index * 0.91)
        crumple.castShadow = true
        crumple.receiveShadow = true
        crumple.userData.depositStarted = performance.now()
        crumple.userData.depositTargetY = position.y
        scene.add(crumple)
        depositedPages.push(crumple)
      }

      const resize = () => {
        const { width, height } = host.getBoundingClientRect()
        if (!width || !height) return
        renderer.setSize(width, height, false)
        const aspect = width / height
        camera.left = -1.5 * aspect
        camera.right = 1.5 * aspect
        camera.updateProjectionMatrix()
      }
      observer = new ResizeObserver(() => {
        resize()
        scheduleRender()
      })
      observer.observe(host)
      resize()

      const render = (time) => {
        frameId = undefined
        while (renderedPageCount > pageCountRef.current) {
          const deposited = depositedPages.pop()
          if (deposited) {
            scene.remove(deposited)
            deposited.geometry.dispose()
            deposited.material.dispose()
          }
          renderedPageCount -= 1
        }
        while (renderedPageCount < pageCountRef.current) {
          addDepositedPage(renderedPageCount)
          renderedPageCount += 1
        }
        const throwStarted = throwStartedAtRef.current
        const elapsed = tossingRef.current && throwStarted
          ? Math.max(0, Math.min(1, (time - throwStarted) / TOSS_DURATION_MS))
          : 1
        paper.visible = Boolean(tossingRef.current)
        if (tossingRef.current) {
          const foldProgress = easeInOut(elapsed / 0.43)
          const throwProgress = easeInOut((elapsed - 0.43) / 0.57)
          foldSheet(paper.geometry, foldProgress)
          const destination = getPilePosition(pageCountRef.current)
          const bounceArc = Math.sin(Math.PI * throwProgress) * 0.38
          paper.position.set(
            -0.34 + (destination.x + 0.34) * throwProgress,
            1.48 + (destination.y - 1.48) * throwProgress + bounceArc,
            0.35 + (destination.z - 0.35) * throwProgress,
          )
          paper.rotation.set(
            0.08 + throwProgress * 8.4,
            -0.12 + throwProgress * 6.7,
            0.04 + throwProgress * 9.2,
          )
          paper.scale.setScalar(0.96 - foldProgress * 0.48)
        }
        depositedPages.forEach((deposited) => {
          const settleProgress = Math.min(1, (time - deposited.userData.depositStarted) / 380)
          const settle = 1 - (1 - settleProgress) ** 3
          const bounce = settleProgress < 1 ? Math.sin(settleProgress * Math.PI * 2) * (1 - settleProgress) * 0.045 : 0
          deposited.position.y = deposited.userData.depositTargetY + (1 - settle) * 0.25 + bounce
          if (settleProgress < 1) deposited.rotation.z += 0.016 * (1 - settleProgress)
        })
        modelRoot.rotation.y = tossingRef.current ? Math.sin(time * 0.00075) * 0.025 : 0
        renderer.render(scene, camera)
        const settling = depositedPages.some((deposited) => time - deposited.userData.depositStarted < 480)
        if (tossingRef.current || settling) scheduleRender()
      }
      function scheduleRender() {
        if (frameId === undefined && !disposed) frameId = requestAnimationFrame(render)
      }
      wakeRenderRef.current = scheduleRender
      scheduleRender()
    }

    initialize().catch((error) => {
      console.error('Unable to initialize the dustbin scene.', error)
    })

    return () => {
      disposed = true
      if (frameId !== undefined) cancelAnimationFrame(frameId)
      wakeRenderRef.current = null
      observer?.disconnect()
      if (scene) scene.traverse((object) => {
        if (object.isMesh) {
          object.geometry?.dispose()
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose())
          else object.material?.dispose()
        }
      })
      renderer?.dispose()
      host.replaceChildren()
    }
  }, [enabled])

  return <div ref={hostRef} className="dustbin-model" aria-hidden="true" />
}
