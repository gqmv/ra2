import { Link } from "react-router-dom";
import type { MenuItem } from "./types";

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "16px",
  borderRadius: "12px",
  background: "#1f2937",
  color: "#fff",
  boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "16px",
  padding: "20px",
};

export default function Menu({ items }: { items: MenuItem[] }) {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", padding: 16 }}>Restaurant Menu</h1>
      <div style={gridStyle}>
        {items.map((item) => (
          <div key={item.id} style={cardStyle}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{item.name}</div>
            <div style={{ opacity: 0.8, fontSize: 12 }}>{item.description}</div>
            <Link
              to={`/ar/${encodeURIComponent(item.id)}`}
              style={{
                marginTop: "auto",
                display: "block",
                background: "#10b981",
                color: "#111827",
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: 8,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              View in AR
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
} 