export type PaymentData = {
  rentDetail: {
    id: string;
    name: string;
    district: string;
    subdistrict: string;
    province: string;
  };
  price: {
    price_per_hour: number | null;
    price_per_day: number | null;
    price_per_month: number | null;
    deposit: number | null;
  };
  image: string | null;
  user: {
    first_name: string;
    last_name: string;
    citizen_id: string;
    phone: string;
    line_id: string | null;
  } | null;
};
