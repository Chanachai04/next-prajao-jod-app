import { RentSpot } from "./booking";

export interface ParkingItem {
  id: string;
  image_url: string | null;
  name: string;
  type: string;
  total_slot: string;
}
export interface ParkingCardProps {
  spot: RentSpot;
  onClick: () => void;
  isActive?: boolean;
  // เพิ่ม props เพื่อรับค่า state จาก parent
  currentSearchParams?: {
    dateIn?: string;
    dateOut?: string;
    timeIn?: string;
    timeOut?: string;
    mode?: string; // "hourly" | "daily" | "monthly"
    monthDurationKey?: string;
  };
}
