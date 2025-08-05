import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

interface ModelProps {
  position?: THREE.Vector3 | [number, number, number];
  scale?: number;
}

const Model = ({ position = [0, 0, 0], scale = 1 }: ModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/result.gltf");

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={scene.clone()} />
    </group>
  );
};

// Preload the GLTF model
useGLTF.preload("/scene.gltf");

export default Model;
