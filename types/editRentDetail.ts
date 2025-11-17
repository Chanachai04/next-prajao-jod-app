export type EditRentDetailPayload = {
  name?: string;
  type?: string;
  description?: string;
  total_slot?: number;
  address?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  landmark?: string;
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

export type SubmitStatus = {
  type: "success" | "error";
  message: string;
} | null;

export type ScheduleItem = {
  day: string;
  selected: boolean;
  allDay: boolean;
  open_time: string;
  close_time: string;
};
