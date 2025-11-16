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
  onValueChange?: (value: string) => void;
}

export default function SelectForm({
  title,
  placeholder,
  itemList,
  leadingIcon,
  className = "",
  onValueChange,
}: SelectFormProps) {
  return (
    <div className={className}>
      {title && (
        <Label htmlFor="select" className="text-lg">
          {title}
        </Label>
      )}
      <Select onValueChange={onValueChange}>
        <SelectTrigger className="mt-2 bg-white">
          <div className="flex items-center">
            {leadingIcon && <span className="mr-2">{leadingIcon}</span>}
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(itemList).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
