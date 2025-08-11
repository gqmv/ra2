import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import XrHitCubeContainer from "./XrHitCubeContainer";
import type { MenuItem } from "./types";

export default function ARView({ items }: { items: MenuItem[] }) {
  const { id } = useParams<{ id: string }>();

  const item = useMemo(() => items.find((i) => i.id === id), [items, id]);

  if (!item) {
    return (
      <div style={{ padding: 24 }}>
        <p>Item not found.</p>
        <Link to="/">Back to Menu</Link>
      </div>
    );
  }

  return <XrHitCubeContainer menuItem={item} />;
} 