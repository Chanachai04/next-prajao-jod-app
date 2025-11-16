import { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SelectFormProps {
  title?: string;
  placeholder?: string;
  itemList: Record<string, string>;
  leadingIcon?: ReactNode;
  className?: string;
  value?: string; // <--- เพิ่ม prop นี้
  onValueChange?: (value: string) => void;
}

export default function SelectForm({
  title,
  placeholder,
  itemList,
  leadingIcon,
  className = "",
  value,
  onValueChange,
}: SelectFormProps) {
  return (
    <div className="relative mt-2">
      {title && (
        <Label htmlFor="select" className="text-lg">
          {title}
        </Label>
      )}
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger
          className={`w-full h-10!  pr-3 bg-white ${className} text-lg`}
        >
          <div className="flex items-center">
            {leadingIcon && <span className="mr-2">{leadingIcon}</span>}
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(itemList).map(([key, value]) => (
              <SelectItem key={key} value={key} className="text-lg">
                {value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
