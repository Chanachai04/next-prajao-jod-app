import { RentSpot } from "./booking";

export type PriceKey = "hourly" | "daily" | "monthly";

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
