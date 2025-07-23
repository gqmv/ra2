import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface SimpleWebXRState {
  isARSupported: boolean
  isARSession: boolean
  isLoading: boolean
  error: string | null
  instructions: string
  runtimeErrors: string[]
}

const SimpleWebXR: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<SimpleWebXRState>({
    isARSupported: false,
    isARSession: false,
    isLoading: true,
    error: null,
    instructions: 'Checking AR support...',
    runtimeErrors: []
  })

  // WebXR refs
  const sessionRef = useRef<XRSession | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.Camera | null>(null)
  const reticleRef = useRef<THREE.Object3D | null>(null)
  const hitTestSourceRef = useRef<XRHitTestSource | null>(null)
  const localSpaceRef = useRef<XRReferenceSpace | null>(null)
  const objectsRef = useRef<THREE.Object3D[]>([])

  // Error handling
  const addError = useCallback((error: Error | string) => {
    const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : error
    const timestamp = new Date().toLocaleTimeString()
    setState(prev => ({
      ...prev,
      runtimeErrors: [...prev.runtimeErrors, `[${timestamp}] ${errorMessage}`].slice(-5)
    }))
    console.error('WebXR Error:', error)
  }, [])

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, runtimeErrors: [] }))
  }, [])

  // Check AR support
  useEffect(() => {
    const checkARSupport = async () => {
      try {
        if (!navigator.xr) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'WebXR not supported',
            instructions: 'Use a WebXR-compatible browser'
          }))
          return
        }

        const supported = await navigator.xr.isSessionSupported('immersive-ar')
        setState(prev => ({
          ...prev,
          isARSupported: supported,
          isLoading: false,
          error: supported ? null : 'AR not supported',
          instructions: supported 
            ? 'AR is supported! Click "Start AR" to begin.' 
            : 'AR is not supported on this device'
        }))
      } catch (error) {
        addError(error instanceof Error ? error : 'Failed to check AR support')
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to check AR support',
          instructions: 'Unable to detect AR capabilities'
        }))
      }
    }

    checkARSupport()
  }, [addError])

  // Initialize 3D scene
  const initScene = useCallback(() => {
    try {
      if (!canvasRef.current) return null

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true
      })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.xr.enabled = true

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20)

      // Add lighting
      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
      light.position.set(0.5, 1, 0.25)
      scene.add(light)

      // Create reticle
      const reticleGeometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2)
      const reticleMaterial = new THREE.MeshBasicMaterial()
      const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial)
      reticle.matrixAutoUpdate = false
      reticle.visible = false
      scene.add(reticle)

      rendererRef.current = renderer
      sceneRef.current = scene
      cameraRef.current = camera
      reticleRef.current = reticle

      return { renderer, scene, camera, reticle }
    } catch (error) {
      addError(error instanceof Error ? error : 'Scene initialization failed')
      return null
    }
  }, [addError])

  // XR Frame handler
  const onXRFrame = useCallback((_time: number, frame: XRFrame) => {
    try {
      if (!frame || !frame.session) return

      const session = frame.session
      const renderer = rendererRef.current
      const scene = sceneRef.current
      const camera = cameraRef.current
      const reticle = reticleRef.current
      const hitTestSource = hitTestSourceRef.current
      const localSpace = localSpaceRef.current

      if (!renderer || !scene || !camera || !reticle || !localSpace) return
      if (!sessionRef.current || sessionRef.current !== session) return

      // Get camera pose
      const viewerPose = frame.getViewerPose(localSpace)
      if (!viewerPose) return

      // Handle hit testing
      if (hitTestSource) {
        const hitTestResults = frame.getHitTestResults(hitTestSource)
        
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0]
          const pose = hit.getPose(localSpace)
          
          if (pose) {
            reticle.visible = true
            reticle.matrix.fromArray(pose.transform.matrix)
          }
        } else {
          reticle.visible = false
        }
      }

      // Render for each view
      const baseLayer = session.renderState.baseLayer
      if (baseLayer) {
        renderer.setRenderTarget(null)
        const gl = renderer.getContext()
        gl.bindFramebuffer(gl.FRAMEBUFFER, baseLayer.framebuffer)

        for (const view of viewerPose.views) {
          const viewport = baseLayer.getViewport(view)
          if (viewport) {
            renderer.setViewport(viewport.x, viewport.y, viewport.width, viewport.height)
          }

          camera.matrix.fromArray(view.transform.matrix)
          camera.projectionMatrix.fromArray(view.projectionMatrix)
          camera.matrixWorldNeedsUpdate = true

          renderer.render(scene, camera)
        }
      }
    } catch (error) {
      // Sample occasional errors to avoid spam
      if (Math.random() < 0.01) {
        addError(`Frame error: ${error instanceof Error ? error.message : error}`)
      }
    }
  }, [addError])

  // Handle select (tap to place)
  const onSelect = useCallback(() => {
    try {
      const reticle = reticleRef.current
      const scene = sceneRef.current

      if (!reticle || !scene || !reticle.visible) return

      // Create a sphere at reticle position
      const geometry = new THREE.SphereGeometry(0.1, 32, 32)
      const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 })
      const sphere = new THREE.Mesh(geometry, material)

      sphere.position.setFromMatrixPosition(reticle.matrix)
      scene.add(sphere)
      objectsRef.current.push(sphere)

      setState(prev => ({
        ...prev,
        instructions: `Placed ${objectsRef.current.length} sphere(s). Tap to place more!`
      }))
    } catch (error) {
      addError(`Object placement error: ${error instanceof Error ? error.message : error}`)
    }
  }, [addError])

  // Start AR session
  const startAR = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, instructions: 'Starting AR...' }))

      if (!navigator.xr) {
        throw new Error('WebXR not available')
      }

      // Request AR session
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local-floor', 'hit-test']
      })
      sessionRef.current = session

      // Setup scene
      const sceneSetup = initScene()
      if (!sceneSetup) {
        throw new Error('Failed to setup scene')
      }

      const { renderer } = sceneSetup
      const gl = renderer.getContext() as WebGLRenderingContext

      // Make WebGL context XR compatible
      await gl.makeXRCompatible()

      // Create WebXR layer
      const xrLayer = new XRWebGLLayer(session, gl)
      await session.updateRenderState({ baseLayer: xrLayer })

      // Setup reference spaces
      const viewerSpace = await session.requestReferenceSpace('viewer')
      const localSpace = await session.requestReferenceSpace('local-floor')
      localSpaceRef.current = localSpace

      // Setup hit testing
      if (session.requestHitTestSource) {
        const hitTestSource = await session.requestHitTestSource({ space: viewerSpace })
        hitTestSourceRef.current = hitTestSource || null
      } else {
        throw new Error('Hit testing not supported')
      }

      // Setup event listeners
      session.addEventListener('select', onSelect)
      session.addEventListener('end', () => {
        setState(prev => ({
          ...prev,
          isARSession: false,
          instructions: 'AR session ended'
        }))

        // Cleanup
        if (hitTestSourceRef.current) {
          hitTestSourceRef.current.cancel()
          hitTestSourceRef.current = null
        }
        if (rendererRef.current) {
          rendererRef.current.setAnimationLoop(null)
        }
        sessionRef.current = null
        
        // Clear placed objects
        objectsRef.current.forEach(obj => sceneRef.current?.remove(obj))
        objectsRef.current = []
      })

      // Start render loop
      renderer.setAnimationLoop(onXRFrame)

      setState(prev => ({
        ...prev,
        isARSession: true,
        isLoading: false,
        instructions: 'Point at a surface and tap to place spheres!'
      }))

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      addError(`AR start failed: ${errorMessage}`)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to start AR: ${errorMessage}`,
        instructions: 'Failed to start AR session'
      }))
    }
  }, [initScene, onXRFrame, onSelect, addError])

  // End AR session
  const endAR = useCallback(async () => {
    try {
      const session = sessionRef.current
      if (session) {
        await session.end()
      }
    } catch (error) {
      addError(`Error ending session: ${error}`)
    }
  }, [addError])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          touchAction: 'none'
        }}
      />
      
      {/* UI */}
      <div className="ui-overlay">
        {/* Header */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '15px',
          borderRadius: '10px'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#fff' }}>
            Simple WebXR AR
          </h1>
          <p style={{ margin: '0', fontSize: '16px', color: '#ccc' }}>
            Based on Official Samples
          </p>
        </div>

        {/* Instructions */}
        <div style={{
          position: 'absolute',
          bottom: '120px',
          left: '20px',
          right: '20px',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '15px',
          borderRadius: '10px'
        }}>
          <p style={{ margin: '0', fontSize: '16px', color: '#fff' }}>
            {state.instructions}
          </p>
          {state.error && (
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#ff6b6b' }}>
              {state.error}
            </p>
          )}
        </div>

        {/* Runtime Errors */}
        {state.runtimeErrors.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100px',
            left: '20px',
            right: '20px',
            background: 'rgba(139, 0, 0, 0.9)',
            padding: '15px',
            borderRadius: '10px',
            border: '2px solid #ff6b6b',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <h3 style={{ margin: '0', fontSize: '16px', color: '#fff' }}>
                Errors ({state.runtimeErrors.length})
              </h3>
              <button
                onClick={clearErrors}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid #fff',
                  color: '#fff',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
            {state.runtimeErrors.map((error, index) => (
              <div key={index} style={{
                fontSize: '12px',
                color: '#ffcccc',
                marginBottom: '5px',
                fontFamily: 'monospace',
                textAlign: 'left',
                wordBreak: 'break-word'
              }}>
                {error}
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          textAlign: 'center'
        }}>
          {!state.isARSession ? (
            <button
              onClick={startAR}
              disabled={!state.isARSupported || state.isLoading}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                background: state.isARSupported && !state.isLoading 
                  ? 'linear-gradient(45deg, #00ff88, #00ccff)' 
                  : '#666',
                color: state.isARSupported && !state.isLoading ? '#000' : '#ccc',
                border: 'none',
                borderRadius: '25px',
                cursor: state.isARSupported && !state.isLoading ? 'pointer' : 'not-allowed',
                minWidth: '150px'
              }}
            >
              {state.isLoading ? 'Loading...' : 'Start AR'}
            </button>
          ) : (
            <button
              onClick={endAR}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                color: '#fff',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                minWidth: '150px'
              }}
            >
              End AR
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SimpleWebXR 