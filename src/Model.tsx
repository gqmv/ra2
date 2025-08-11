import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

interface ModelProps {
  modelPath: string;
  position?: THREE.Vector3 | [number, number, number];
  scale?: number;
}

const Model = ({ modelPath, position = [0, 0, 0], scale = 1 }: ModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={scene.clone()} />
    </group>
  );
};

export default Model;
