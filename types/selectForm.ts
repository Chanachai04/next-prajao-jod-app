import { ReactNode } from "react";

// interface Props สำหรับ SelectForm Component (Dropdown)
export interface SelectFormProps {
  title?: string;
  placeholder?: string;
  itemList: Record<string, string>;
  leadingIcon?: ReactNode;
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}
