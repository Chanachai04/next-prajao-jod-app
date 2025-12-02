// interface โครงสร้างข้อมูลสำหรับรายการประวัติการจองที่จอดรถ
export interface HistoryItem {
  id: string | number;
  name: string;
  imageUrl: string | null;
  parkingTime: number | null;
  parkingType: string | null;
  totalPrice: number;
  createdAt: string;
}
