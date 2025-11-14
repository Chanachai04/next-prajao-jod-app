export interface RentDetail {
  id: string;
  name: string;
  type: string;
  description: string;
  total_slot: number;
  province: string;
  address: string;
  district: string;
  subdistrict: string;
  landmark: string;
  latitude: number;
  longitude: number;
  owner_id: string;
  facilities_id: string;
  price_id: string;
  schedule_id: string;
  image_id: string;
  created_at: string;
}
export type Price = {
  id: string;
  rent_id: string;
  price_per_hour: number;
  price_per_day: number;
  price_per_month: number;
  deposit: number;
};

export type Facility = {
  id: string;
  rent_id: string;
  name: string;
};

export type Schedule = {
  id: string;
  rent_id: string;
  available_days: string[];
  open_time: string;
  close_time: string;
};

export type Image = {
  id: string;
  rent_id: string;
  image_url: string;
};
