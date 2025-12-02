import { Clock } from "lucide-react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TimeProps } from "@/types/timeForm";

export default function TimeForm({
  title,
  time,
  setTime,
  className,
}: TimeProps) {
  // สร้าง Array ของเวลาตั้งแต่ 00:00 ถึง 23:30 (ช่วงละ 30 นาที)
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    // เพิ่มชั่วโมงเต็ม เช่น 08:00
    times.push(`${hour.toString().padStart(2, "0")}:00`);
    // เพิ่มครึ่งชั่วโมง เช่น 08:30
    times.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return (
    <div>
      {/* Label */}
      <Label className="text-sm sm:text-base lg:text-lg">{title}</Label>

      {/* Select Container */}
      <div className="relative mt-1 sm:mt-2">
        {/* Icon นาฬิกา (แสดงเป็น Icon นำหน้า) */}
        <Clock className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 z-10" />

        {/* Select Component */}
        <Select value={time} onValueChange={setTime}>
          {/* Select Trigger (ปุ่มที่แสดงผลก่อนเปิด Dropdown) */}
          <SelectTrigger
            className={`w-full h-9 sm:h-10! pl-8 sm:pl-10 pr-3 text-sm sm:text-base lg:text-lg ${className} bg-white`}
          >
            {/* แสดงค่าที่ถูกเลือก หรือ Placeholder */}
            <SelectValue placeholder="เลือกเวลา" />
          </SelectTrigger>

          {/* Select Content (รายการ Dropdown) */}
          <SelectContent className="max-h-48 sm:max-h-64 overflow-y-auto">
            {/* Loop สร้างรายการเวลาทั้งหมด */}
            {times.map((t) => (
              <SelectItem
                key={t}
                value={t} // ค่าที่ส่งออกเมื่อเลือก
                className="text-sm sm:text-base lg:text-lg py-2 sm:py-3"
              >
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
