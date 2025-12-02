"use client";

import { useEffect, useState } from "react";
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

// Component ที่จับ click บนแผนที่และอัปเดต position
function ClickMarker({
  setPosition,
  onPositionChange,
}: {
  setPosition: (pos: [number, number]) => void;
  onPositionChange?: (lat: number, lng: number) => void;
}) {
  // Hook สำหรับดักจับ Map Events
  useMapEvents({
    click(e) {
      const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(latlng);
      onPositionChange?.(latlng[0], latlng[1]); // ส่งพิกัดใหม่กลับไป Parent
    },
  });
  return null;
}

export default function MapPickerInner({
  height,
  zoom,
  center,
  markerAt,
  onPositionChange,
  interactive = true,
}: {
  height: string;
  zoom: number;
  center?: [number, number];
  markerAt?: [number, number] | null;
  onPositionChange?: (lat: number, lng: number) => void;
  interactive?: boolean;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null); // สถานะ Marker ภายใน

  // Effect สำหรับ Sync markerAt (Prop) กับ position (State)
  useEffect(() => {
    if (
      markerAt &&
      (markerAt[0] || markerAt[0] === 0) &&
      (markerAt[1] || markerAt[1] === 0)
    ) {
      setPosition(markerAt);
    } else {
      setPosition(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerAt?.[0], markerAt?.[1]]);

  // Component สำหรับย้ายจุดศูนย์กลางแผนที่เมื่อ Prop center เปลี่ยน
  function RecenterOnChange({
    targetCenter,
  }: {
    targetCenter?: [number, number];
  }) {
    const map = useMap(); // เข้าถึง instance ของแผนที่
    if (targetCenter) {
      map.setView(targetCenter, zoom); // ย้ายศูนย์กลางแผนที่
    }
    return null;
  }

  return (
    <div style={{ height, width: "100%" }}>
      <MapContainer
        center={[13.7563, 100.5018]} // พิกัดศูนย์กลางเริ่มต้น (กรุงเทพฯ)
        zoom={zoom}
        minZoom={7}
        zoomControl={false}
        scrollWheelZoom={interactive} // ควบคุมการซูมด้วย scroll ตาม interactive
        dragging={interactive} // ควบคุมการลากแผนที่ตาม interactive
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {/* Component ย้ายศูนย์กลางตาม Prop center */}
        <RecenterOnChange targetCenter={center} />

        {/* เมื่อคลิกบนแผนที่ จะอัปเดต position (เฉพาะเมื่อ interactive เป็น true) */}
        {interactive && (
          <ClickMarker
            setPosition={setPosition}
            onPositionChange={onPositionChange}
          />
        )}

        {/* Marker แสดงตำแหน่งที่เลือกหรือที่ได้รับมา */}
        {(() => {
          // ใช้ position ล่าสุด, หรือ fallback ไปใช้ markerAt, หรือ null
          const markerPosition = position ?? markerAt ?? null;
          return markerPosition ? <Marker position={markerPosition} /> : null;
        })()}
      </MapContainer>
    </div>
  );
}
