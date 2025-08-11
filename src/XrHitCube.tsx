import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useXR, useXRHitTest } from "@react-three/xr";
import { useRef, useState } from "react";
import * as THREE from "three";
import Model from "./Model";
import type { MenuItem } from "./types";

interface XrHitCubeProps {
  onModelPlaced?: () => void;
  menuItem: MenuItem;
}

const XrHitCube = ({ onModelPlaced, menuItem }: XrHitCubeProps) => {
  const reticleRef = useRef<THREE.Mesh>(null);
  const [models, setModels] = useState<
    Array<{ position: THREE.Vector3; id: number }>
  >([]);
  const [hasPlacedModel, setHasPlacedModel] = useState(false);

  const xrState = useXR((state) => state);

  const activeModelPath = menuItem.model_path;

  useThree(({ camera }) => {
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
      setModels([{ position, id }]);
      setHasPlacedModel(true);
      reticleRef.current.visible = false;
      onModelPlaced?.();
    }
  };

  return (
    <>
      <OrbitControls enablePan enableZoom enableRotate />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />

      {!xrState.session && (
        <Model modelPath={activeModelPath} position={[0, 0, 0]} scale={2} />
      )}

      {xrState.session &&
        models.map(({ position, id }) => (
          <Model
            key={id}
            modelPath={activeModelPath}
            position={position}
            scale={1}
          />
        ))}

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
