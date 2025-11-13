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
