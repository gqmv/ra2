import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import { useEffect, useState } from "react";
import XrHitCube from "./XrHitCube";

const store = createXRStore({
  hand: true,
  controller: true,
});

const XrHitCubeContainer = () => {
  const [isXRSupported, setIsXRSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-ar").then(setIsXRSupported);
    } else {
      setIsXRSupported(false);
    }
  }, []);

  return (
    <>
      <button
        onClick={() => store.enterAR()}
        disabled={!isXRSupported}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: isXRSupported ? "#007acc" : "#666",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: isXRSupported ? "pointer" : "not-allowed",
        }}
      >
        {isXRSupported === null
          ? "Checking AR..."
          : isXRSupported
          ? "Enter AR"
          : "AR Not Available"}
      </button>

      {!isXRSupported && isXRSupported !== null && (
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "20px",
            right: "20px",
            padding: "16px",
            backgroundColor: "rgba(255, 193, 7, 0.9)",
            borderRadius: "8px",
            zIndex: 1000,
          }}
        >
          <strong>Mobile users:</strong> Try "Request desktop site" in your
          browser menu, or use Chrome/Edge with WebXR flags enabled.
        </div>
      )}

      <Canvas style={{ height: "100vh" }}>
        <XR store={store}>
          <XrHitCube />
        </XR>
      </Canvas>
    </>
  );
};

export default XrHitCubeContainer; 