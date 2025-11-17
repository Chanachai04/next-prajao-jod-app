import { ReactNode } from "react";

export interface SelectFormProps {
  title?: string;
  placeholder?: string;
  itemList: Record<string, string>;
  leadingIcon?: ReactNode;
  className?: string;
  value?: string; // <--- เพิ่ม prop นี้
  onValueChange?: (value: string) => void;
}
