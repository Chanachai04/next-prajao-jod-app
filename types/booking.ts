export interface PriceInfo {
  id: string;
  rent_id: string;
  price_per_hour: number | null;
  price_per_day: number | null;
  price_per_month: number | null;
  deposit: number | null;
}

export interface FacilityInfo {
  id: string;
  rent_id: string;
  name: string;
}

export interface ScheduleInfo {
  id: string;
  rent_id: string;
  available_days: string[] | null;
  open_time: string | null;
  close_time: string | null;
}

export interface ImageInfo {
  id: string;
  rent_id: string;
  image_url: string;
}

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

export interface LocationChangePayload {
  provinceName: string | null;
  districtName: string | null;
  subdistrictName: string | null;
  displayText: string;
}

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

export type PriceRow = {
  id: string;
  rent_id: string;
  price_per_hour: number | null;
  price_per_day: number | null;
  price_per_month: number | null;
  deposit: number | null;
};

export type FacilityRow = {
  id: string;
  rent_id: string;
  name: string;
};

export type ScheduleRow = {
  id: string;
  rent_id: string;
  available_days: string[] | null;
  open_time: string | null;
  close_time: string | null;
};

export type ImageRow = {
  id: string;
  rent_id: string;
  image_url: string;
};

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
