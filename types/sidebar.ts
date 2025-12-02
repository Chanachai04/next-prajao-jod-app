import { LucideIcon } from "lucide-react";

// interface โครงสร้างข้อมูลสำหรับรายการเมนู (ใช้ใน Sidebar หรือ Dropdown)
export interface MenuItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  action?: () => void;
}

// type โครงสร้างข้อมูลสถานะโปรไฟล์ผู้ใช้ (ใช้ใน Client Side State)
export type ProfileState = {
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
};
