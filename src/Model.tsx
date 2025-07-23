import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface ModelProps {
  position?: THREE.Vector3 | [number, number, number];
  scale?: number;
}

const Model = ({ position = [0, 0, 0], scale = 1 }: ModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/scene.gltf");

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={scene.clone()} />
    </group>
  );
};

// Preload the GLTF model
useGLTF.preload("/scene.gltf");

export default Model; 