import { MapPin, X } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

type SearchInputProps = {
  title?: string;
  type?: string;
  placeholder?: string;
  id?: string;
};
export default function LocationInput({
  title,
  type,
  placeholder,
  id,
}: SearchInputProps) {
  return (
    <div>
      <div>
        <Label htmlFor={id} className="text-lg">
          {title}
        </Label>
        <div className="relative mt-2">
          <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
          <Input
            id={id}
            type={type}
            placeholder={placeholder}
            className="pl-10 pr-10 w-full text-sm md:text-lg h-12"
          />
          <button
            type="button"
            className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
