"use client";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// ✅ import MapPickerInner ผ่าน dynamic ทั้งหมด (ไม่มี SSR)
const MapPickerInner = dynamic(() => import("./MapPickerInner"), {
  ssr: false,
  loading: () => <div>Loading map...</div>,
});

export default function MapPicker({ height }: { height?: string }) {
  return <MapPickerInner height={height ?? "400px"} />;
}
