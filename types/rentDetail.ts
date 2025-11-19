export type RentDetailPayload = {
  name?: string;
  type?: string;
  description?: string;
  total_slot?: number ;
  address?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  landmark?: string;
  owner_id?: string;
  price?: {
    price_per_hour?: number | null;
    price_per_day?: number | null;
    price_per_month?: number | null;
    deposit?: number | null;
  };
  facilities?: string[];
  schedule?: Array<{
    day: string;
    open_time: string;
    close_time: string;
  }>;
};
