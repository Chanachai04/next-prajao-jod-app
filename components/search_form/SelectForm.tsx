import { Minimize2 } from "lucide-react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type SelectFormProps = {
  title?: string;
  placeholder?: string;
  itemList: Record<string, string>; // เปลี่ยนจาก JSON[] เป็น object
};
export default function SelectForm({
  title,
  placeholder,
  itemList,
}: SelectFormProps) {
  return (
    <div>
      <Label htmlFor="dateOut" className="text-lg">
        {title}
      </Label>
      <div className="relative ">
        <Minimize2 className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
        <Select>
          <SelectTrigger className="pl-10 text-lg h-12! w-full cursor-pointer">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="z-50">
            <SelectGroup>
              {Object.entries(itemList).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-lg py-3">
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
