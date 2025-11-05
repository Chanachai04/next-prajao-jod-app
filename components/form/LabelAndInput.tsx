import { Label } from "../ui/label";
import { Input } from "../ui/input";

type SearchInputProps = {
  title?: string;
  type?: string;
  placeholder?: string;
  id?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
};

export default function LabelAndInput({
  title,
  type,
  placeholder,
  id,
  leadingIcon,
  trailingIcon,
}: SearchInputProps) {
  return (
    <div>
      <Label htmlFor={id} className="text-lg">
        {title}
      </Label>
      <div className="relative mt-2">
        {/* ด้านหน้า */}
        {leadingIcon && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6">
            {leadingIcon}
          </span>
        )}

        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          className="pl-10 pr-10 w-full text-sm md:text-lg h-12"
        />

        {/* ด้านหลัง */}
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
