// type โครงสร้าง Payload สำหรับการแก้ไขรายละเอียดที่จอดรถ (ใช้ส่งข้อมูลไปยัง API)
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

// type สำหรับสถานะผลลัพธ์ของการส่งข้อมูล (Success/Error Message)
export type SubmitStatus = {
  type: "success" | "error";
  message: string;
} | null;

// type โครงสร้างข้อมูลตารางเวลาที่ใช้จัดการภายใน Component State
export type ScheduleItem = {
  day: string;
  selected: boolean;
  allDay: boolean;
  open_time: string;
  close_time: string;
};
