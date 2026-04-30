import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the map editor to disable SSR since Leaflet requires window
export const MapEditor = dynamic(
  () => import("./MapEditor"),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: "400px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream-100)", border: "1px solid var(--gold-600)", borderRadius: 6 }}>
        <Loader2 className="animate-spin" color="var(--gold-500)" />
        <span style={{ marginLeft: 8, fontFamily: '"Cormorant Garamond", serif', color: "var(--ink-soft)" }}>Memuat Peta...</span>
      </div>
    ),
  }
);
