// type โครงสร้างข้อมูลที่ใช้ในการแสดงผลและประมวลผลในหน้า Payment
export type PaymentData = {
  rentDetail: {
    // ข้อมูลรายละเอียดสถานที่จอดรถแบบย่อ
    id: string;
    name: string;
    district: string;
    subdistrict: string;
    province: string;
  };
  price: {
    // ข้อมูลราคาที่จำเป็นสำหรับการคำนวณ
    price_per_hour: number | null;
    price_per_day: number | null;
    price_per_month: number | null;
    deposit: number | null;
  };
  image: string | null;
  user: {
    // ข้อมูลผู้ใช้ปัจจุบัน (ถ้ามี) สำหรับเติมในฟอร์มผู้จอง
    first_name: string;
    last_name: string;
    citizen_id: string;
    phone: string;
    line_id: string | null;
  } | null;
};
