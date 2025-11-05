"use client";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ✅ Fix: ทำให้ Marker icon แสดงใน Next.js
Reflect.deleteProperty(L.Icon.Default.prototype, "_getIconUrl");
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({
  setPosition,
}: {
  setPosition: (pos: [number, number]) => void;
}) {
  const [position, setLocalPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setLocalPosition(newPos);
      setPosition(newPos);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPickerInner({ height }: { height: string }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  return (
    <div style={{ height, width: "100%" }}>
      <MapContainer
        center={[13.7563, 100.5018]}
        zoom={13}
        className="h-full w-full z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <LocationMarker setPosition={setPosition} />
      </MapContainer>
    </div>
  );
}
