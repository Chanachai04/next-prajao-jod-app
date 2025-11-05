import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";

type DateProps = {
  title?: string;
  date?: Date;
  setDate?: (date: Date) => void;
  placeholder?: string;
  id: string;
  className?: string;
};

export default function DateForm({
  title,
  date,
  setDate,
  placeholder,
  id,
  className,
}: DateProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedDate: Date) => {
    setDate!(selectedDate);
    setOpen(false); // ปิด Popover อัตโนมัติ
  };

  return (
    <div>
      <Label htmlFor={id} className="text-lg">
        {title}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full h-12 justify-start text-left font-normal ${className}`}
          >
            <CalendarIcon className="text-gray-500 w-6! h-6!" />
            {date ? (
              format(date, "dd/MM/yyyy")
            ) : (
              <span className="text-lg">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            required
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
