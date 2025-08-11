import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ARView from "./ARView";
import Menu from "./Menu";
import type { MenuItem } from "./types";

const items: MenuItem[] = [
  { id: "dish-1", name: "Signature Dish", model_path: "/scene.gltf" },
];

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu items={items} />} />
        <Route path="/ar/:id" element={<ARView items={items} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
