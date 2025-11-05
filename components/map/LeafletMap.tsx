"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type LeafletMapProps = {
  onMapReady?: () => void;
};

export default function LeafletMap({ onMapReady }: LeafletMapProps) {
  return (
    <MapContainer
      center={[13.736717, 100.523186]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      whenReady={() => onMapReady?.()}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
    </MapContainer>
  );
}
