import { Label } from "../ui/label";
import { Input } from "../ui/input";

type LabelAndInputProps = {
  title?: string;
  type?: string;
  placeholder?: string;
  id?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  textLabelSize?: string;
  labelClassName?: string;
  className?: string;
  onClick?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
};

export default function LabelAndInputForm({
  title,
  type,
  placeholder,
  id,
  leadingIcon,
  trailingIcon,
  textLabelSize = "text-lg",
  className,
  onClick,
  labelClassName,
  onChange,
  value,
}: LabelAndInputProps) {
  return (
    <div>
      <Label htmlFor={id} className={`${textLabelSize} ${labelClassName}`}>
        {title}
      </Label>
      <div className="relative mt-2">
        {leadingIcon && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6">
            {leadingIcon}
          </span>
        )}

        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onClick={onClick}
          onChange={onChange}
          required
          className={
            leadingIcon
              ? `pl-10 pr-10 w-full text-sm md:text-lg h-10 ${className}`
              : `w-full text-sm md:text-lg h-10 ${className}`
          }
        />

        {trailingIcon && (
          <button
            type="button"
            className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {trailingIcon}
          </button>
        )}
      </div>
    </div>
  );
}
