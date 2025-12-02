// type Props สำหรับ TimeForm Component (Dropdown เลือกเวลา)
export type TimeProps = {
  title?: string;
  time: string;
  setTime: (time: string) => void;
  className?: string;
};
