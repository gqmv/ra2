import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface AppState {
  isARSupported: boolean
  isARSession: boolean
  isLoading: boolean
  error: string | null
  instructions: string
  runtimeErrors: string[]
}

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<AppState>({
    isARSupported: false,
    isARSession: false,
    isLoading: true,
    error: null,
    instructions: 'Checking AR support...',
    runtimeErrors: []
  })

  // WebXR and Three.js refs
  const sessionRef = useRef<XRSession | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const sphereRef = useRef<THREE.Mesh | null>(null)
  const reticleRef = useRef<THREE.Mesh | null>(null)
  const hitTestSourceRef = useRef<XRHitTestSource | null>(null)
  const viewerSpaceRef = useRef<XRReferenceSpace | null>(null)
  const localSpaceRef = useRef<XRReferenceSpace | null>(null)
  const spherePlacedRef = useRef<boolean>(false)

  // Error handling utility
  const addError = useCallback((error: Error | string) => {
    const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : error
    const timestamp = new Date().toLocaleTimeString()
    setState(prev => ({
      ...prev,
      runtimeErrors: [...prev.runtimeErrors, `[${timestamp}] ${errorMessage}`].slice(-5) // Keep last 5 errors
    }))
    console.error('WebXR Error:', error)
  }, [])

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, runtimeErrors: [] }))
  }, [])

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      addError(`Global Error: ${event.message} at ${event.filename}:${event.lineno}`)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addError(`Unhandled Promise Rejection: ${event.reason}`)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [addError])

  // Stage 1: Feature & permission check
  useEffect(() => {
    const checkARSupport = async () => {
      try {
        if (!navigator.xr) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'WebXR not supported in this browser',
            instructions: 'Please use a WebXR-compatible browser'
          }))
          return
        }

        const supported = await navigator.xr.isSessionSupported('immersive-ar')
        setState(prev => ({
          ...prev,
          isARSupported: supported,
          isLoading: false,
          error: supported ? null : 'AR not supported on this device',
          instructions: supported 
            ? 'AR is supported! Click "Start AR" to begin.' 
            : 'AR is not supported on this device or browser'
        }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to check AR support',
          instructions: 'Unable to detect AR capabilities'
        }))
      }
    }

    checkARSupport()
  }, [])

  // Stage 3: Build the 3D scene
  const setupScene = useCallback(() => {
    try {
      if (!canvasRef.current) return null

      // Create WebGL renderer
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true
      })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.xr.enabled = true
      renderer.xr.cameraAutoUpdate = false

      // Create scene
      const scene = new THREE.Scene()

      // Create camera (will be controlled by WebXR)
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(0, 10, 5)
      scene.add(directionalLight)

      // Create sphere mesh (but don't add to scene yet)
      const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32)
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        metalness: 0.3,
        roughness: 0.4
      })
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)

      // Create reticle to show hit test results
      const reticleGeometry = new THREE.RingGeometry(0.02, 0.04, 32)
      const reticleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      })
      const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial)
      reticle.matrixAutoUpdate = false
      reticle.visible = false
      scene.add(reticle)

      // Store references
      rendererRef.current = renderer
      sceneRef.current = scene
      cameraRef.current = camera
      sphereRef.current = sphere
      reticleRef.current = reticle

      return { renderer, scene, camera, sphere, reticle }
    } catch (error) {
      addError(error instanceof Error ? error : `Scene setup error: ${error}`)
      return null
    }
  }, [addError])

  // Stage 6: Per-frame loop
  const onXRFrame = useCallback((_time: number, frame: XRFrame) => {
    try {
      const session = frame.session
      const renderer = rendererRef.current
      const scene = sceneRef.current
      const camera = cameraRef.current
      const reticle = reticleRef.current
      const hitTestSource = hitTestSourceRef.current
      const localSpace = localSpaceRef.current

      if (!renderer || !scene || !camera || !reticle || !localSpace) return

      // Get the WebXR layer and bind to its framebuffer
      const layer = session.renderState.baseLayer
      if (layer) {
        renderer.setRenderTarget(null)
        const gl = renderer.getContext()
        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer)
      }

      // Get viewer pose for the local reference space
      const viewerPose = frame.getViewerPose(localSpace)
      if (viewerPose) {
        // Handle hit testing
        if (hitTestSource) {
          const hitTestResults = frame.getHitTestResults(hitTestSource)
          
          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0]
            const pose = hit.getPose(localSpace)
            
            if (pose) {
              // Update reticle position to show where sphere can be placed
              reticle.matrix.fromArray(pose.transform.matrix)
              reticle.visible = true
            }
          } else {
            reticle.visible = false
          }
        }

        // Render each view (eye)
        for (const view of viewerPose.views) {
          if (layer) {
            const viewport = layer.getViewport(view)
            if (viewport) {
              renderer.setViewport(viewport.x, viewport.y, viewport.width, viewport.height)
            }
          }

          // Update camera for this view
          camera.matrix.fromArray(view.transform.matrix)
          camera.projectionMatrix.fromArray(view.projectionMatrix)
          camera.matrixWorldNeedsUpdate = true

          // Render the scene for this view
          renderer.render(scene, camera)
        }
      }
    } catch (error) {
      // Only log frame errors occasionally to avoid spam
      if (Math.random() < 0.01) { // 1% chance to log
        addError(`Frame render error: ${error instanceof Error ? error.message : error}`)
      }
    }
  }, [addError])

  // Stage 7: Place the sphere on select input
  const onSelect = useCallback((event: XRInputSourceEvent) => {
    try {
      const hitTestSource = hitTestSourceRef.current
      const localSpace = localSpaceRef.current
      const sphere = sphereRef.current
      const scene = sceneRef.current

      if (!hitTestSource || !localSpace || !sphere || !scene) return
      if (spherePlacedRef.current) return // Only place one sphere

      const frame = event.frame
      const hitTestResults = frame.getHitTestResults(hitTestSource)

      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0]
        const pose = hit.getPose(localSpace)

        if (pose) {
          // Position sphere at hit location
          sphere.position.set(
            pose.transform.position.x,
            pose.transform.position.y,
            pose.transform.position.z
          )
          sphere.quaternion.set(
            pose.transform.orientation.x,
            pose.transform.orientation.y,
            pose.transform.orientation.z,
            pose.transform.orientation.w
          )

          // Add sphere to scene
          scene.add(sphere)
          spherePlacedRef.current = true

          setState(prev => ({
            ...prev,
            instructions: 'Sphere placed! Move around to see it from different angles.'
          }))

          // Try to create an anchor for stability (optional)
          if (frame.createAnchor && hit.createAnchor) {
            const anchorPromise = hit.createAnchor(pose.transform)
            if (anchorPromise) {
              anchorPromise
                .then(() => {
                  console.log('Anchor created successfully')
                })
                .catch((error) => {
                  addError(`Anchor creation failed: ${error}`)
                })
            }
          }
        }
      }
    } catch (error) {
      addError(`Sphere placement error: ${error instanceof Error ? error.message : error}`)
    }
  }, [addError])

  // Stage 2: Kick-off AR session
  const startAR = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        instructions: "Starting AR session...",
      }));

      if (!navigator.xr) {
        throw new Error("WebXR not available");
      }

      // Request AR session with required features
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["local-floor", "hit-test"],
      });

      sessionRef.current = session;

      // Setup the 3D scene
      const sceneSetup = setupScene();
      if (!sceneSetup) {
        throw new Error("Failed to setup 3D scene");
      }

      const { renderer } = sceneSetup;

      // Set up WebXR layer for camera feed
      const gl = renderer.getContext() as WebGLRenderingContext;

      // Make the WebGL context XR compatible - this is crucial!
      await gl.makeXRCompatible();

      const xrLayer = new XRWebGLLayer(session, gl, {
        antialias: true,
        alpha: true,
        depth: true,
        stencil: false,
        framebufferScaleFactor: 1.0,
      });

      // Update session render state with the layer
      await session.updateRenderState({ baseLayer: xrLayer });

      // Stage 4: Get reference spaces
      const viewerSpace = await session.requestReferenceSpace("viewer");
      const localSpace = await session.requestReferenceSpace("local-floor");

      viewerSpaceRef.current = viewerSpace;
      localSpaceRef.current = localSpace;

      // Stage 5: Setup hit testing
      if (session.requestHitTestSource) {
        const hitTestSource = await session.requestHitTestSource({
          space: viewerSpace,
        });
        hitTestSourceRef.current = hitTestSource || null;
      } else {
        throw new Error("Hit testing not supported");
      }

      // Setup event listeners
      session.addEventListener("select", onSelect);
      session.addEventListener("end", () => {
        setState((prev) => ({
          ...prev,
          isARSession: false,
          instructions: 'AR session ended. Click "Start AR" to begin again.',
        }));

        // Clean up
        if (hitTestSourceRef.current) {
          hitTestSourceRef.current.cancel();
          hitTestSourceRef.current = null;
        }
        sessionRef.current = null;
        spherePlacedRef.current = false;

        // Remove sphere from scene if it was placed
        if (sphereRef.current && sceneRef.current) {
          sceneRef.current.remove(sphereRef.current);
        }
      });

      // Start the render loop
      renderer.setAnimationLoop(onXRFrame);

      setState((prev) => ({
        ...prev,
        isARSession: true,
        isLoading: false,
        instructions:
          "Point your camera at a flat surface and tap to place a sphere!",
      }));
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : String(error)
       addError(`AR Session Start Failed: ${errorMessage}`)
       setState(prev => ({
         ...prev,
         isLoading: false,
         error: `Failed to start AR: ${errorMessage}`,
         instructions: 'Failed to start AR session. Please try again.'
       }))
     }
     }, [setupScene, onXRFrame, onSelect, addError])

  // Stage 9: End session
  const endAR = useCallback(async () => {
    const session = sessionRef.current
    if (session) {
      try {
        await session.end()
      } catch (error) {
        console.warn('Error ending session:', error)
      }
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Canvas for Three.js rendering */}
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
      
      {/* UI Overlay */}
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
          borderRadius: '10px',
          backdropFilter: 'blur(10px)'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>
            WebXR AR Demo
          </h1>
          <p style={{ margin: '0', fontSize: '16px', color: '#ccc' }}>
            Sphere on Table
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
          borderRadius: '10px',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ margin: '0', fontSize: '16px' }}>
            {state.instructions}
          </p>
          {state.error && (
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#ff6b6b' }}>
              {state.error}
            </p>
          )}
        </div>

        {/* Runtime Errors Display */}
        {state.runtimeErrors.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100px',
            left: '20px',
            right: '20px',
            background: 'rgba(139, 0, 0, 0.9)',
            padding: '15px',
            borderRadius: '10px',
            backdropFilter: 'blur(10px)',
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
                Runtime Errors ({state.runtimeErrors.length})
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
                transition: 'all 0.3s ease',
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
                transition: 'all 0.3s ease',
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

export default App 