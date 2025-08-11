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
    description:
      "Sushi is a Japanese dish of prepared vinegared rice, usually with some sugar and salt, accompanying a variety of ingredients, such as seafood, vegetables, and occasionally tropical fruits.",
    scale: 2,
  },
  {
    id: "salad",
    name: "Salad",
    model_path: "/salad.gltf",
    description:
      "A salad is a dish consisting of mixed, mostly natural ingredients with a dressing (such as a vinegar or oil-based sauce) used to enhance their flavor.",
    scale: 0.17,
  },
  {
    id: "chicken",
    name: "Chicken",
    model_path: "/chicken.gltf",
    description:
      "Chicken is a type of domesticated fowl, a subspecies of the red junglefowl (Gallus gallus). Chickens are one of the most common and widespread domestic animals, with a total population of 23.7 billion as of 2018.",
    scale: 0.3,
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
