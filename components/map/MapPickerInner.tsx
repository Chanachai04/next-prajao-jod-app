"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
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
  center,
  markerAt,
}: {
  height: string;
  zoom: number;
  center?: [number, number];
  markerAt?: [number, number] | null;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  function RecenterOnChange({
    targetCenter,
  }: {
    targetCenter?: [number, number];
  }) {
    const map = useMap();
    if (targetCenter) {
      map.setView(targetCenter, zoom);
    }
    return null;
  }

  return (
    <div style={{ height, width: "100%" }}>
      <MapContainer
        center={[13.7563, 100.5018]}
        zoom={zoom}
        minZoom={7}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <RecenterOnChange targetCenter={center} />
        {/* เมื่อคลิกบนแผนที่ จะอัปเดต position */}
        <ClickMarker setPosition={setPosition} />
        {/* ถ้ามี position จะแสดง Marker */}
        {position && <Marker position={position} />}
        {/* ถ้ามี markerAt จากการค้นหา แสดง Marker ตำแหน่งค้นหา */}
        {markerAt && <Marker position={markerAt} />}
      </MapContainer>
    </div>
  );
}
