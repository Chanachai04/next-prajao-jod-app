"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Component ที่จับ click บนแผนที่
function ClickMarker({
  setPosition,
}: {
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function MapPickerInner({
  height,
  zoom,
}: {
  height: string;
  zoom: number;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  return (
    <div style={{ height, width: "100%" }}>
      <MapContainer
        center={[13.7563, 100.5018]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {/* เมื่อคลิกบนแผนที่ จะอัปเดต position */}
        <ClickMarker setPosition={setPosition} />
        {/* ถ้ามี position จะแสดง Marker */}
        {position && <Marker position={position} />}
      </MapContainer>
    </div>
  );
}
