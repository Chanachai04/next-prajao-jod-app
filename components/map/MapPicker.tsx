"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ dynamic imports เฉพาะ component จริง ๆ
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

// ✅ ส่วนนี้ import ปกติได้ (เพราะเป็น hook)
import { useMapEvents } from "react-leaflet";

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

export default function MapPicker() {
  const [position, setPosition] = useState<[number, number] | null>(null);

  return (
    <div className="h-[400px] w-full">
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
