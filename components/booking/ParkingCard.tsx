import Image from "next/image";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { RentSpot } from "@/types/booking";
import Link from "next/link";
import { useMemo } from "react";
import { ParkingCardProps } from "@/types/parking";

// Map สำหรับเชื่อมโยง Key ราคา กับ Label ที่ใช้แสดงผล
const PRICE_LABELS: Array<{
  key: keyof NonNullable<RentSpot["price"]>;
  label: string;
}> = [
  { key: "price_per_hour", label: "รายชั่วโมง" },
  { key: "price_per_day", label: "รายวัน" },
  { key: "price_per_month", label: "รายเดือน" },
];

const FALLBACK_IMAGE = "/image.jpg";

// ฟังก์ชันช่วยในการจัดรูปแบบตัวเลขให้เป็นสกุลเงินบาท (THB)
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ParkingCard({
  spot,
  onClick,
  isActive = false,
  currentSearchParams,
}: ParkingCardProps) {
  // ดึงรูปภาพหน้าปก หรือใช้รูปภาพสำรอง
  const coverImage = spot.images[0]?.image_url ?? FALLBACK_IMAGE;

  // กรอง Tag ราคาที่ใช้ได้จริง (มีค่าราคาที่ไม่เป็น null/undefined)
  const availablePriceTags = PRICE_LABELS.filter(({ key }) => {
    const value = spot.price ? spot.price[key] : null;
    return value !== null && value !== undefined;
  });

  // กำหนดราคาที่จะแสดงผล: ให้ความสำคัญกับรายเดือน > รายวัน > รายชั่วโมง
  const displayPrice =
    spot.price?.price_per_month ??
    spot.price?.price_per_day ??
    spot.price?.price_per_hour ??
    null;

  // กำหนดหน่วยราคาที่จะแสดงผลตามราคาที่ถูกเลือก (เดือน > วัน > ชั่วโมง)
  const priceUnit =
    spot.price?.price_per_month !== null &&
    spot.price?.price_per_month !== undefined
      ? "เดือน"
      : spot.price?.price_per_day !== null &&
        spot.price?.price_per_day !== undefined
      ? "วัน"
      : spot.price?.price_per_hour !== null &&
        spot.price?.price_per_hour !== undefined
      ? "ชั่วโมง"
      : null;

  // 1. สร้าง URL สำหรับหน้าสั่งจอง (Order Page) พร้อม Query Parameters
  const orderUrl = useMemo(() => {
    const params = new URLSearchParams();

    // หากมีการส่ง Search Params มา
    if (currentSearchParams) {
      const { dateIn, dateOut, timeIn, timeOut, mode, monthDurationKey } =
        currentSearchParams;

      // ใส่ dateIn เสมอ
      if (dateIn) params.set("dateIn", dateIn);

      // ใส่ mode เสมอ
      if (mode) params.set("mode", mode);

      // แยกการส่ง parameters ตาม mode
      if (mode === "monthly") {
        // รายเดือน: ส่ง monthDurationKey
        if (monthDurationKey) {
          params.set("monthDurationKey", monthDurationKey);
        }
      } else if (mode === "daily") {
        // รายวัน: ส่ง dateOut
        if (dateOut) params.set("dateOut", dateOut);
      } else if (mode === "hourly") {
        // รายชั่วโมง: ส่ง dateOut, timeIn, timeOut
        if (dateOut) params.set("dateOut", dateOut);
        if (timeIn) params.set("timeIn", timeIn);
        if (timeOut) params.set("timeOut", timeOut);
      }
    }

    // สร้าง URL ปลายทาง: /order/[spot.id]?params
    return `/order/${spot.id}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
  }, [spot.id, currentSearchParams]);

  return (
    // Card ที่ใช้แสดงผลรายการที่จอดรถ
    <Card
      className={`mt-3 sm:mt-4 cursor-pointer transition-shadow hover:shadow-lg
      `}
      onClick={onClick} // ฟังก์ชันเรียกเมื่อคลิกการ์ด (ใช้เปิด Detail Panel)
    >
      <CardHeader className="p-3 sm:p-4 lg:p-6">
        <div className="flex gap-2 sm:gap-3">
          {/* รูปภาพหน้าปก */}
          <Image
            src={coverImage}
            alt={spot.name ?? "รูปที่จอดรถ"}
            width={145}
            height={120}
            className="rounded-xl w-[100px] h-[90px] sm:w-[120px] sm:h-[100px] lg:w-[145px] lg:h-[120px] object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            {/* ชื่อสถานที่ */}
            <CardTitle className="text-base sm:text-lg lg:text-xl line-clamp-2">
              {spot.name ?? "-"}
            </CardTitle>
            <CardDescription className="mt-1 sm:mt-2">
              {/* Tags ราคาที่ใช้ได้ (รายชั่วโมง/วัน/เดือน) */}
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {availablePriceTags.length > 0 ? (
                  availablePriceTags.map(({ key, label }) => (
                    <span
                      key={key}
                      className="text-sm bg-blue-600 px-1.5 sm:px-2 py-0.5 sm:py-1 text-white rounded-sm"
                    >
                      {label}
                    </span>
                  ))
                ) : (
                  <span className="text-sm sm:text-base lg:text-lg text-gray-500">
                    ไม่พบข้อมูลราคา
                  </span>
                )}
              </div>
            </CardDescription>
          </div>
        </div>
        {/* ส่วนแสดงราคาและปุ่มจอง */}
        <div className="flex justify-between items-center mt-2 sm:mt-3">
          <p className="text-sm sm:text-base lg:text-lg font-medium truncate">
            {displayPrice !== null
              ? // แสดงราคาที่จัดรูปแบบแล้ว + หน่วยราคา
                `${formatCurrency(displayPrice)}${
                  priceUnit ? `/${priceUnit}` : ""
                }`
              : "ไม่ระบุราคา"}
          </p>
          {/* ปุ่มจองทันที - ลิงก์ไปยังหน้า Order */}
          <Link href={orderUrl}>
            <Button className="ml-2 cursor-pointer hover:scale-105 transition-transform text-sm sm:text-base lg:text-lg h-8 sm:h-9 px-3 sm:px-4">
              จองทันที
            </Button>
          </Link>
        </div>
      </CardHeader>
    </Card>
  );
}
