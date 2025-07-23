// WebXR type definitions to supplement DOM types

interface Navigator {
  xr?: XRSystem;
}

interface XRSystem {
  isSessionSupported(mode: XRSessionMode): Promise<boolean>;
  requestSession(mode: XRSessionMode, options?: XRSessionInit): Promise<XRSession>;
}

type XRSessionMode = 'immersive-ar' | 'immersive-vr' | 'inline';

interface XRSessionInit {
  requiredFeatures?: string[];
  optionalFeatures?: string[];
}

interface XRSession extends EventTarget {
  requestAnimationFrame(callback: XRFrameRequestCallback): number;
  cancelAnimationFrame(handle: number): void;
  requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>;
  requestHitTestSource(options: XRHitTestOptionsInit): Promise<XRHitTestSource>;
  end(): Promise<void>;
  renderState: XRRenderState;
  inputSources: XRInputSourceArray;
  addEventListener(type: 'select', listener: (event: XRInputSourceEvent) => void): void;
  addEventListener(type: 'end', listener: (event: Event) => void): void;
}

type XRFrameRequestCallback = (time: DOMHighResTimeStamp, frame: XRFrame) => void;

type XRReferenceSpaceType = 'viewer' | 'local' | 'local-floor' | 'bounded-floor' | 'unbounded';

interface XRReferenceSpace extends XRSpace {}

interface XRSpace extends EventTarget {}

interface XRFrame {
  session: XRSession;
  getPose(space: XRSpace, baseSpace: XRSpace): XRPose | undefined;
  getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | undefined;
  getHitTestResults(hitTestSource: XRHitTestSource): XRHitTestResult[];
  createAnchor?(pose: XRRigidTransform, space: XRSpace): Promise<XRAnchor>;
}

interface XRPose {
  transform: XRRigidTransform;
  emulatedPosition: boolean;
}

interface XRViewerPose extends XRPose {
  views: XRView[];
}

interface XRView {
  eye: XREye;
  projectionMatrix: Float32Array;
  transform: XRRigidTransform;
}

type XREye = 'left' | 'right' | 'none';

interface XRRigidTransform {
  position: DOMPointReadOnly;
  orientation: DOMPointReadOnly;
  matrix: Float32Array;
  inverse: XRRigidTransform;
}

interface XRHitTestOptionsInit {
  space: XRSpace;
  entityTypes?: XRHitTestTrackableType[];
}

type XRHitTestTrackableType = 'point' | 'plane' | 'mesh';

interface XRHitTestSource {
  cancel(): void;
}

interface XRHitTestResult {
  getPose(baseSpace: XRSpace): XRPose | undefined;
  createAnchor?(): Promise<XRAnchor>;
}

interface XRAnchor {
  anchorSpace: XRSpace;
  delete(): void;
}

interface XRRenderState {
  depthNear: number;
  depthFar: number;
  inlineVerticalFieldOfView?: number;
  baseLayer?: XRWebGLLayer;
}

interface XRWebGLLayer {
  framebuffer: WebGLFramebuffer | null;
  framebufferWidth: number;
  framebufferHeight: number;
  getViewport(view: XRView): XRViewport;
}

interface XRViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface XRInputSourceArray extends Array<XRInputSource> {
  [Symbol.iterator](): IterableIterator<XRInputSource>;
}

interface XRInputSource {
  handedness: XRHandedness;
  targetRayMode: XRTargetRayMode;
  targetRaySpace: XRSpace;
  gripSpace?: XRSpace;
  profiles: string[];
  gamepad?: Gamepad;
}

type XRHandedness = 'none' | 'left' | 'right';
type XRTargetRayMode = 'gaze' | 'tracked-pointer' | 'screen';

interface XRInputSourceEvent extends Event {
  frame: XRFrame;
  inputSource: XRInputSource;
} 