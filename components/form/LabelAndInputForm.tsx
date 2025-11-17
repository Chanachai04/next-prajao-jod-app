import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface LabelAndInputFormProps {
  title: string;
  id: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
  className?: string;
  labelClassName?: string;
  maxLength?: number;
}

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
      <Label htmlFor={id} className={`text-lg ${labelClassName}`}>
        {title}
      </Label>
      <Input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`mt-2 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        } ${className}`}
      />
    </div>
  );
}
