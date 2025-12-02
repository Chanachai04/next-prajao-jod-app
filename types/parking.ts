import { RentSpot } from "./booking";

// interface โครงสร้างข้อมูลสำหรับรายการที่จอดรถแบบย่อ (ใช้ในการแสดงผลรายการ)
export interface ParkingItem {
  id: string;
  image_url: string | null;
  name: string;
  type: string;
  total_slot: string;
}

// interface Props สำหรับ ParkingCard Component
export interface ParkingCardProps {
  spot: RentSpot;
  onClick: () => void;
  isActive?: boolean;
  currentSearchParams?: {
    dateIn?: string;
    dateOut?: string;
    timeIn?: string;
    timeOut?: string;
    mode?: string;
    monthDurationKey?: string;
  };
}
