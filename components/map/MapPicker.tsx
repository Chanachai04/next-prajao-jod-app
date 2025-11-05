"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// ✅ ต้องระบุว่าใช้ default export ของไฟล์
const LeafletMap = dynamic(
  () => import("./LeafletMap").then((mod) => mod.default),
  {
    ssr: false,
  }
);

type MapPickerProps = {
  height?: string;
  onMapReady?: () => void;
};

export default function MapPicker({
  height = "400px",
  onMapReady,
}: MapPickerProps) {
  useEffect(() => {
    const timer = setTimeout(() => onMapReady?.(), 500);
    return () => clearTimeout(timer);
  }, [onMapReady]);

  return (
    <div style={{ height }}>
      <LeafletMap onMapReady={onMapReady} />
    </div>
  );
}
