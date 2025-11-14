"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { RentSpot } from "@/types/booking";
import Link from "next/link";

interface ParkingCardProps {
  spot: RentSpot;
  onClick: () => void;
  isActive?: boolean;
}

const PRICE_LABELS: Array<{
  key: keyof NonNullable<RentSpot["price"]>;
  label: string;
}> = [
  { key: "price_per_hour", label: "รายชั่วโมง" },
  { key: "price_per_day", label: "รายวัน" },
  { key: "price_per_month", label: "รายเดือน" },
];

const FALLBACK_IMAGE = "/image.jpg";

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
}: ParkingCardProps) {
  const coverImage = spot.images[0]?.image_url ?? FALLBACK_IMAGE;
  const availablePriceTags = PRICE_LABELS.filter(({ key }) => {
    const value = spot.price ? spot.price[key] : null;
    return value !== null && value !== undefined;
  });
  const displayPrice =
    spot.price?.price_per_month ??
    spot.price?.price_per_day ??
    spot.price?.price_per_hour ??
    null;
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

  return (
    <Card
      className={`mt-4 cursor-pointer transition-shadow ${
        isActive ? "shadow-lg ring-2 ring-blue-500" : "hover:shadow-lg"
      }`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex">
          <Image
            src={coverImage}
            alt={spot.name ?? "รูปที่จอดรถ"}
            width={145}
            height={120}
            className="rounded-xl mr-3 h-[120px] object-cover"
          />
          <div className="flex-1">
            <CardTitle className="text-xl line-clamp-1">
              {spot.name ?? "-"}
            </CardTitle>
            <CardDescription className="mt-2">
              <div className="flex flex-wrap gap-2">
                {availablePriceTags.length > 0 ? (
                  availablePriceTags.map(({ key, label }) => (
                    <span
                      key={key}
                      className="text-xs md:text-sm bg-blue-600 px-2 py-1 text-white rounded-sm"
                    >
                      {label}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">ไม่พบข้อมูลราคา</span>
                )}
              </div>
            </CardDescription>
          </div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <p className="text-base font-medium">
            {displayPrice !== null
              ? `${formatCurrency(displayPrice)}${
                  priceUnit ? `/${priceUnit}` : ""
                }`
              : "ไม่ระบุราคา"}
          </p>
          <Link href={`/order/${spot.id}`}>
            <Button className="ml-2">จองทันที</Button>
          </Link>
        </div>
      </CardHeader>
    </Card>
  );
}
