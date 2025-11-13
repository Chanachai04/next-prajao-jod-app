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

// Component ที่จับ click บนแผนที่
function ClickMarker({
  setPosition,
  onPositionChange,
}: {
  setPosition: (pos: [number, number]) => void;
  onPositionChange?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(latlng);
      onPositionChange?.(latlng[0], latlng[1]);
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
  const [position, setPosition] = useState<[number, number] | null>(null);

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
  }, [markerAt?.[0], markerAt?.[1]]);

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
        {interactive && (
          <ClickMarker
            setPosition={setPosition}
            onPositionChange={onPositionChange}
          />
        )}
        {/* Marker แสดงตำแหน่งที่เลือกหรือที่ได้รับมา */}
        {(() => {
          const markerPosition = position ?? markerAt ?? null;
          return markerPosition ? <Marker position={markerPosition} /> : null;
        })()}
      </MapContainer>
    </div>
  );
}
