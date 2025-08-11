import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import { useEffect, useState } from "react";
import XrHitCube from "./XrHitCube";
import type { MenuItem } from "./types";

const store = createXRStore({
  hand: true,
  controller: true,
});

interface XrHitCubeContainerProps {
  menuItem: MenuItem;
}

const XrHitCubeContainer = ({ menuItem }: XrHitCubeContainerProps) => {
  const [isXRSupported, setIsXRSupported] = useState<boolean | null>(null);
  const [isInAR, setIsInAR] = useState(false);
  const [hasPlacedModel, setHasPlacedModel] = useState(false);

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-ar").then(setIsXRSupported);
    } else {
      setIsXRSupported(false);
    }
  }, []);

  // Listen for XR session changes
  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      setIsInAR(!!state.session);
    });
    return unsubscribe;
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

      {/* AR Instruction Toast */}
      {isInAR && !hasPlacedModel && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(128, 128, 128, 0.9)",
            color: "white",
            padding: "16px 24px",
            borderRadius: "12px",
            fontSize: "18px",
            fontWeight: "500",
            zIndex: 2000,
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          Click the screen to place your dish
        </div>
      )}

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
          <XrHitCube
            menuItem={menuItem}
            onModelPlaced={() => setHasPlacedModel(true)}
          />
        </XR>
      </Canvas>
    </>
  );
};

export default XrHitCubeContainer; 