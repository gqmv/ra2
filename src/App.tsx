import React from "react";
import XrHitCubeContainer from "./XrHitCubeContainer";
import type { MenuItem } from "./types";

const menuItem: MenuItem = { model_path: "/scene.gltf" };

const App: React.FC = () => {
  return <XrHitCubeContainer menuItem={menuItem} />;
};

export default App;
