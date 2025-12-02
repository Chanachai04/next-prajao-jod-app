// interface ข้อมูลราคา
export interface PriceInfo {
  id: string;
  rent_id: string;
  price_per_hour: number | null;
  price_per_day: number | null;
  price_per_month: number | null;
  deposit: number | null;
}

// interface ข้อมูลสิ่งอำนวยความสะดวก
export interface FacilityInfo {
  id: string;
  rent_id: string;
  name: string;
}

// interface ข้อมูลตารางเวลาการเปิด-ปิด
export interface ScheduleInfo {
  id: string;
  rent_id: string;
  available_days: string[] | null;
  open_time: string | null;
  close_time: string | null;
}

// interface ข้อมูลรูปภาพ
export interface ImageInfo {
  id: string;
  rent_id: string;
  image_url: string;
}

// interface ข้อมูลสถานที่จอดรถแบบรวม (สำหรับ Client/Component)
export interface RentSpot {
  id: string;
  name: string | null;
  type: string | null;
  description: string | null;
  total_slot: number | null;
  address: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string | null;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  price: PriceInfo | null;
  facilities: FacilityInfo[];
  schedules: ScheduleInfo[];
  images: ImageInfo[];
}

// interface ข้อมูล Payload การเปลี่ยนแปลงสถานที่ (สำหรับ Search Component)
export interface LocationChangePayload {
  provinceName: string | null;
  districtName: string | null;
  subdistrictName: string | null;
  displayText: string;
}

// interface Props สำหรับ Search Panel Component
export interface SearchPanelProps {
  dateIn: Date | undefined;
  setDateIn: React.Dispatch<React.SetStateAction<Date | undefined>>;
  dateOut: Date | undefined;
  setDateOut: React.Dispatch<React.SetStateAction<Date | undefined>>;
  timeIn: string;
  setTimeIn: React.Dispatch<React.SetStateAction<string>>;
  timeOut: string;
  setTimeOut: React.Dispatch<React.SetStateAction<string>>;
  selectedOption: "hourly" | "monthly";
  setSelectedOption: React.Dispatch<React.SetStateAction<"hourly" | "monthly">>;
  timeOptions: Record<string, string>;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  onSearch: () => void;
  spots: RentSpot[];
  onSelectSpot: (spot: RentSpot) => void;
  activeSpotId: string | null;
  isLoading: boolean;
  errorMessage?: string | null;
  emptyMessage?: string | null;
  onLocationChange: (payload: LocationChangePayload) => void;
  monthDurationKey: string;
  onMonthDurationChange: (value: string) => void;
  error?: string | null;
  loading?: boolean;
}

// type ข้อมูลแถวราคา (สำหรับ API/Database)
export type PriceRow = {
  id: string;
  rent_id: string;
  price_per_hour: number | null;
  price_per_day: number | null;
  price_per_month: number | null;
  deposit: number | null;
};

// type ข้อมูลแถวสิ่งอำนวยความสะดวก (สำหรับ API/Database)
export type FacilityRow = {
  id: string;
  rent_id: string;
  name: string;
};

// type ข้อมูลแถวตารางเวลา (สำหรับ API/Database)
export type ScheduleRow = {
  id: string;
  rent_id: string;
  available_days: string[] | null;
  open_time: string | null;
  close_time: string | null;
};

// type ข้อมูลแถวรูปภาพ (สำหรับ API/Database)
export type ImageRow = {
  id: string;
  rent_id: string;
  image_url: string;
};

// type ข้อมูลแถวรายละเอียดหลักของสถานที่จอดรถ (สำหรับ API/Database)
export type RentDetailRow = {
  id: string;
  name: string | null;
  type: string | null;
  description: string | null;
  total_slot: number | null;
  address: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string | null;
  landmark: string | null;
};
