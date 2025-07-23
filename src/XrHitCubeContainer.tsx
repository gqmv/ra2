import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import XrHitCube from "./XrHitCube";

const store = createXRStore({
  hand: true,
  controller: true,
});

const XrHitCubeContainer = () => {
  return (
    <>
      <button
        onClick={() => store.enterAR()}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: "#007acc",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Enter AR
      </button>
      <Canvas style={{ height: "100vh" }}>
        <XR store={store}>
          <XrHitCube />
        </XR>
      </Canvas>
    </>
  );
};

export default XrHitCubeContainer; 