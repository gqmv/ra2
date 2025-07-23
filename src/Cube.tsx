import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface CubeProps {
  position?: THREE.Vector3 | [number, number, number];
}

const Cube = ({ position }: CubeProps) => {
  const cubeRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.y += delta;
    }
  });

  return (
    <>
      <mesh ref={cubeRef} position={position}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={"mediumpurple"} />
      </mesh>
    </>
  );
};

export default Cube; 