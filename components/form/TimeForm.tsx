import { Clock } from "lucide-react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type TimeProps = {
  title?: string;
  time: string;
  setTime: (time: string) => void;
};
export default function TimeForm({ title, time, setTime }: TimeProps) {
  // กำหนดเวลาช่วงละ 30 นาที
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    times.push(`${hour.toString().padStart(2, "0")}:00`);
    times.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return (
    <div>
      <Label className="text-lg">{title}</Label>
      <div className="relative ">
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
        <Select value={time} onValueChange={setTime}>
          <SelectTrigger className="w-full h-12! pl-10 pr-3 text-lg">
            <SelectValue placeholder="เลือกเวลา" />
          </SelectTrigger>
          <SelectContent className="max-h-64 overflow-y-auto text-lg">
            {times.map((t) => (
              <SelectItem key={t} value={t} className="text-lg py-3">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
