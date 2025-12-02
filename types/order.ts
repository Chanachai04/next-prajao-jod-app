// interface โครงสร้างข้อมูลรายละเอียดหลักของสถานที่จอดรถ
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

// type ข้อมูลราคาค่าเช่า
export type Price = {
  id: string;
  rent_id: string;
  price_per_hour: number;
  price_per_day: number;
  price_per_month: number;
  deposit: number;
};

// type ข้อมูลสิ่งอำนวยความสะดวก
export type Facility = {
  id: string;
  rent_id: string;
  name: string;
};

// type ข้อมูลตารางเวลาการเปิด-ปิด
export type Schedule = {
  id: string;
  rent_id: string;
  available_days: string[];
  open_time: string;
  close_time: string;
};

// type ข้อมูลรูปภาพ
export type Image = {
  id: string;
  rent_id: string;
  image_url: string;
};
