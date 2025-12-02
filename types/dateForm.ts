// type Props สำหรับ DateForm Component
export type DateProps = {
  title?: string;
  date?: Date;
  setDate?: (date: Date) => void;
  placeholder?: string;
  id: string;
  className?: string;
  onClick?: () => void;
  onChange?: () => void;
  value?: string;
};
