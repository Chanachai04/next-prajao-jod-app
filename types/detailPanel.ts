import { RentSpot } from "./booking";
// type Key สำหรับราคาต่อหน่วย (ชั่วโมง, วัน, เดือน)
export type PriceKey = "hourly" | "daily" | "monthly";

// interface Props สำหรับ DetailPanel Component
export interface DetailPanelProps {
  spot: RentSpot;
  currentIndex: number;
  selectedOptionDetail: PriceKey;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
  onSelectImage: (index: number) => void;
  onSelectOption: (option: PriceKey) => void;
  monthDurationKey?: string;
}
