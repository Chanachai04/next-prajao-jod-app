"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapPickerInner = dynamic(() => import("./MapPickerInner"), {
  ssr: false,
});

type MapPickerProps = {
  height?: string;
  zoom: number;
  onMapReady?: () => void;
  center?: [number, number];
  markerAt?: [number, number] | null;
  onPositionChange?: (lat: number, lng: number) => void;
};

export default function MapPicker({
  height = "400px",
  zoom,
  onMapReady,
  center,
  markerAt,
  onPositionChange,
}: MapPickerProps) {
  useEffect(() => {
    const timer = setTimeout(() => onMapReady?.(), 100);
    return () => clearTimeout(timer);
  }, [onMapReady]);

  return (
    <div style={{ height }}>
      <MapPickerInner
        zoom={zoom}
        height={height}
        center={center}
        markerAt={markerAt}
        onPositionChange={onPositionChange}
      />
    </div>
  );
}
