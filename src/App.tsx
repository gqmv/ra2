import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ARView from "./ARView";
import Menu from "./Menu";
import type { MenuItem } from "./types";

const items: MenuItem[] = [
  {
    id: "sushi",
    name: "Sushi",
    model_path: "/sushi.gltf",
    description: "Simple but delicious sushi platter.",
  },
  {
    id: "salad",
    name: "Salad",
    model_path: "/salad.gltf",
    description: "Homemade salad with lettuce, tomatoes and carrots.",
  },
  {
    id: "chicken",
    name: "Chicken",
    model_path: "/chicken.gltf",
    description: "Chicken with rice. As simple as it gets.",
  },
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
