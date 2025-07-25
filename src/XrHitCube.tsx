import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useXR, useXRHitTest } from "@react-three/xr";
import { useRef, useState } from "react";
import * as THREE from "three";
import Model from "./Model";

interface XrHitCubeProps {
  onModelPlaced?: () => void;
}

const XrHitCube = ({ onModelPlaced }: XrHitCubeProps) => {
  const reticleRef = useRef<THREE.Mesh>(null);
  const [models, setModels] = useState<
    Array<{ position: THREE.Vector3; id: number }>
  >([]);
  const [hasPlacedModel, setHasPlacedModel] = useState(false);

  const xrState = useXR((state) => state);

  useThree(({ camera }) => {
    // Always set camera position for non-XR mode
    camera.position.set(0, 1, 3);
    camera.lookAt(0, 0, 0);
  });

  useXRHitTest((results, getWorldMatrix) => {
    if (results.length > 0 && reticleRef.current && !hasPlacedModel) {
      const hit = results[0];
      const matrix = new THREE.Matrix4();
      if (getWorldMatrix(matrix, hit)) {
        reticleRef.current.visible = true;
        matrix.decompose(
          reticleRef.current.position,
          reticleRef.current.quaternion,
          reticleRef.current.scale
        );
        reticleRef.current.rotation.set(-Math.PI / 2, 0, 0);
      }
    } else if (reticleRef.current) {
      reticleRef.current.visible = false;
    }
  }, "viewer");

  const placeModel = () => {
    if (reticleRef.current && reticleRef.current.visible && !hasPlacedModel) {
      const position = reticleRef.current.position.clone();
      const id = Date.now();
      setModels([...models, { position, id }]);
      setHasPlacedModel(true);
      // Hide reticle immediately
      reticleRef.current.visible = false;
      // Notify parent component
      onModelPlaced?.();
    }
  };

  return (
    <>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />

      {/* Always show at least one model for testing */}
      {!xrState.session && <Model position={[0, 0, 0]} scale={2} />}

      {/* XR-specific content */}
      {xrState.session &&
        models.map(({ position, id }) => {
          return <Model key={id} position={position} scale={1} />;
        })}

      {xrState.session && !hasPlacedModel && (
        <mesh
          ref={reticleRef}
          rotation-x={-Math.PI / 2}
          visible={false}
          onPointerDown={placeModel}
        >
          <ringGeometry args={[0.1, 0.15, 32]} />
          <meshStandardMaterial color={"white"} />
        </mesh>
      )}
    </>
  );
};

export default XrHitCube;
