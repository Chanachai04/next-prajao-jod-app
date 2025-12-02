"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic"; // Hook สำหรับ Dynamic Import
import "leaflet/dist/leaflet.css"; // CSS พื้นฐานของ Leaflet

// 1. Dynamic Import คอมโพเนนต์แผนที่จริง
const MapPickerInner = dynamic(() => import("./MapPickerInner"), {
  ssr: false, // ปิด Server-Side Rendering (สำคัญสำหรับไลบรารีที่ต้องใช้ DOM/Window object)
});

// กำหนด Type ของ Props ที่คอมโพเนนต์รับ
type MapPickerProps = {
  height?: string; // ความสูงของแผนที่ (เช่น '400px', '100vh')
  zoom: number; // ระดับการซูมเริ่มต้น
  onMapReady?: () => void; // Callback เมื่อแผนที่พร้อมใช้งาน
  center?: [number, number]; // พิกัดศูนย์กลางของแผนที่ ([lat, lng])
  markerAt?: [number, number] | null; // พิกัดสำหรับแสดง Marker
  onPositionChange?: (lat: number, lng: number) => void; // Callback เมื่อตำแหน่งมีการเปลี่ยนแปลง
  interactive?: boolean; // แฟล็กกำหนดว่าแผนที่สามารถโต้ตอบได้หรือไม่ (ซูม/เลื่อน)
};

export default function MapPicker({
  height = "400px",
  zoom,
  onMapReady,
  center,
  markerAt,
  onPositionChange,
  interactive = true,
}: MapPickerProps) {
  // 2. Effect สำหรับเรียก onMapReady
  useEffect(() => {
    // ใช้ setTimeout เพื่อให้แน่ใจว่า MapPickerInner ได้โหลดและเรนเดอร์บน DOM ก่อน
    const timer = setTimeout(() => onMapReady?.(), 100);
    return () => clearTimeout(timer); // Cleanup function
  }, [onMapReady]);

  // 3. การแสดงผล
  return (
    // กำหนดความสูงของ Container ตาม Prop ที่รับมา
    <div style={{ height }}>
      {/* เรนเดอร์คอมโพเนนต์แผนที่หลักที่ถูกโหลดแบบ Dynamic */}
      <MapPickerInner
        zoom={zoom}
        height={height}
        center={center}
        markerAt={markerAt}
        onPositionChange={onPositionChange}
        interactive={interactive}
      />
    </div>
  );
}
