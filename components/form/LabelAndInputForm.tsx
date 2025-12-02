import { LabelAndInputFormProps } from "@/types/labelAndInputForm";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function LabelAndInputForm({
  title,
  id,
  value,
  onChange,
  disabled = false,
  placeholder,
  type = "text",
  className,
  labelClassName,
  maxLength,
}: LabelAndInputFormProps) {
  return (
    <div>
      {/* Label Component */}
      <Label
        htmlFor={id}
        className={`text-sm sm:text-base lg:text-lg ${labelClassName}`}
      >
        {title}
      </Label>

      {/* Input Component */}
      <Input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        // กำหนด style ตามสถานะ disabled และรวม class ที่รับเข้ามา
        className={`mt-1 sm:mt-2 h-9 sm:h-10 text-sm sm:text-base ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        } ${className}`}
      />
    </div>
  );
}
