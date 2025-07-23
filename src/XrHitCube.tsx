import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useXR, useXRHitTest } from "@react-three/xr";
import { useRef, useState } from "react";
import * as THREE from "three";
import Cube from "./Cube";

const XrHitCube = () => {
  const reticleRef = useRef<THREE.Mesh>(null);
  const [cubes, setCubes] = useState<Array<{ position: THREE.Vector3; id: number }>>([]);

  const xrState = useXR((state) => state);

  useThree(({ camera }) => {
    if (!xrState.session) {
      camera.position.z = 3;
    }
  });

  useXRHitTest((results, getWorldMatrix) => {
    if (results.length > 0 && reticleRef.current) {
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

  const placeCube = () => {
    if (reticleRef.current && reticleRef.current.visible) {
      const position = reticleRef.current.position.clone();
      const id = Date.now();
      setCubes([...cubes, { position, id }]);
    }
  };

  return (
    <>
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {xrState.session &&
        cubes.map(({ position, id }) => {
          return <Cube key={id} position={position} />;
        })}

      {xrState.session && (
        <mesh
          ref={reticleRef}
          rotation-x={-Math.PI / 2}
          visible={false}
          onPointerDown={placeCube}
        >
          <ringGeometry args={[0.1, 0.15, 32]} />
          <meshStandardMaterial color={"white"} />
        </mesh>
      )}

      {!xrState.session && <Cube position={[0, 0, 0]} />}
    </>
  );
};

export default XrHitCube; 