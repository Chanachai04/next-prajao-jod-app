// interface Props สำหรับ Alert Modal Component (แสดงผลแจ้งเตือนสำเร็จ/ผิดพลาด)
export interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  type: "success" | "error";
  title?: string;
  description?: string;
}
