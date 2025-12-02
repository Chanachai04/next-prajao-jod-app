import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SelectFormProps } from "@/types/selectForm";

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
    <div className="relative">
      {/* แสดง Label หากมี title */}
      {title && (
        <Label htmlFor="select" className="text-sm sm:text-base lg:text-lg">
          {title}
        </Label>
      )}

      {/* Select Component หลัก */}
      <Select onValueChange={onValueChange} value={value}>
        {/* Select Trigger (ส่วนที่แสดงผลก่อนเปิด Dropdown) */}
        <SelectTrigger
          className={`w-full h-9 sm:h-10! pr-3 bg-white ${className} text-sm sm:text-base lg:text-lg mt-1 sm:mt-2
        `}
        >
          <div className="flex items-center">
            {/* Leading Icon (ไอคอนนำหน้า) */}
            {leadingIcon && (
              <span className="mr-1 sm:mr-2 text-gray-500 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
                {leadingIcon}
              </span>
            )}
            {/* แสดงค่าที่ถูกเลือก หรือ Placeholder */}
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>

        {/* Select Content (รายการ Dropdown) */}
        <SelectContent>
          <SelectGroup>
            {/* Loop สร้างรายการตัวเลือก (SelectItem) จาก itemList Object */}
            {Object.entries(itemList).map(([key, value]) => (
              <SelectItem
                key={key}
                value={key} // ค่าที่ถูกส่งออกเมื่อเลือก (Key ของ Object)
                className="text-sm sm:text-base lg:text-lg"
              >
                {value} {/* ข้อความที่แสดงในรายการ (Value ของ Object) */}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
