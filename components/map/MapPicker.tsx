/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Component ย่อย ใช้จับคลิกบนแผนที่
function LocationMarker({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

// Component หลัก
export default function MapPicker() {
  const [latlng, setLatlng] = useState<[number, number] | null>(null);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border">
      <MapContainer
        center={[13.736717, 100.523186]} // Bangkok
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onSelect={(lat, lng) => setLatlng([lat, lng])} />
      </MapContainer>

      {/* แสดงค่าพิกัด */}
      {latlng && (
        <p className="text-sm mt-2">
          📍 Latitude: {latlng[0].toFixed(6)}, Longitude: {latlng[1].toFixed(6)}
        </p>
      )}
    </div>
  );
}
