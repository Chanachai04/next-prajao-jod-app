"use client";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { DateProps } from "@/types/dateForm";

export default function DateForm({
  title,
  date,
  setDate,
  id,
  className,
  onClick,
  onChange,
  value,
}: DateProps) {
  const [open, setOpen] = useState(false); // สถานะควบคุมการเปิด/ปิด Popover

  // ฟังก์ชันจัดการเมื่อเลือกวันที่ใน Calendar
  const handleSelect = (selectedDate: Date) => {
    setDate!(selectedDate); // อัปเดตวันที่ผ่าน Prop function
    setOpen(false); // ปิด Popover
  };

  return (
    <div>
      {/* Label สำหรับช่องวันที่ */}
      <Label htmlFor={id} className="text-sm sm:text-base lg:text-lg">
        {title}
      </Label>

      {/* Popover (สำหรับแสดง Calendar) */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {/* ปุ่มแสดงวันที่ที่ถูกเลือก (ทำหน้าที่เป็นช่อง Input) */}
          <Button
            variant="outline"
            className={`w-full h-9 sm:h-10 justify-start text-left font-normal ${className} mt-1 sm:mt-2 bg-white text-sm sm:text-base lg:text-lg`}
            onClick={onClick}
            onChange={onChange}
            value={value}
          >
            <CalendarIcon className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />

            {/* แสดงวันที่ในรูปแบบ dd/MM/yyyy */}
            {format(date ?? new Date(), "dd/MM/yyyy")}
          </Button>
        </PopoverTrigger>

        {/* เนื้อหา Popover (Calendar) */}
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single" // โหมดเลือกวันที่เดียว
            selected={date} // วันที่ที่ถูกเลือกปัจจุบัน
            onSelect={handleSelect} // ฟังก์ชันเรียกเมื่อมีการเลือกวันที่
            required
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
