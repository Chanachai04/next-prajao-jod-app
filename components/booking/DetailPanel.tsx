import { useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, MapPin, X } from "lucide-react";
import { RentSpot } from "@/types/booking";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type PriceKey = "hourly" | "daily" | "monthly";

interface DetailPanelProps {
  spot: RentSpot;
  currentIndex: number;
  selectedOptionDetail: PriceKey;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
  onSelectImage: (index: number) => void;
  onSelectOption: (option: PriceKey) => void;
  monthDurationKey?: string;
}

const PRICE_KEY_MAP: Record<
  PriceKey,
  {
    field: keyof NonNullable<RentSpot["price"]>;
    label: string;
  }
> = {
  hourly: { field: "price_per_hour", label: "รายชั่วโมง" },
  daily: { field: "price_per_day", label: "รายวัน" },
  monthly: { field: "price_per_month", label: "รายเดือน" },
};

const FALLBACK_IMAGE = "/image.jpg";

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function DetailPanel({
  spot,
  currentIndex,
  selectedOptionDetail,
  onClose,
  onNavigate,
  onSelectImage,
  onSelectOption,
  monthDurationKey,
}: DetailPanelProps) {
  const searchParams = useSearchParams();
  const images = spot.images.length > 0 ? spot.images : [];
  const imageUrls =
    images.length > 0 ? images.map((img) => img.image_url) : [FALLBACK_IMAGE];

  const availablePriceKeys = useMemo(() => {
    const entries: Array<{ key: PriceKey; label: string }> = [];
    if (!spot.price) {
      return entries;
    }
    (Object.keys(PRICE_KEY_MAP) as PriceKey[]).forEach((key) => {
      const { field, label } = PRICE_KEY_MAP[key];
      const value = spot.price ? spot.price[field] : null;
      if (value !== null && value !== undefined) {
        entries.push({ key, label });
      }
    });
    return entries;
  }, [spot.price]);

  useEffect(() => {
    if (!availablePriceKeys.length) return;
    const hasSelected = availablePriceKeys.some(
      (item) => item.key === selectedOptionDetail
    );
    if (!hasSelected) {
      onSelectOption(availablePriceKeys[0].key);
    }
  }, [availablePriceKeys, onSelectOption, selectedOptionDetail]);

  const activePrice = useMemo(() => {
    if (!spot.price) return null;
    const config = PRICE_KEY_MAP[selectedOptionDetail];
    if (!config) return null;
    return spot.price[config.field];
  }, [spot.price, selectedOptionDetail]);

  const fullAddress = [spot.address, spot.subdistrict, spot.district]
    .filter(Boolean)
    .join(" ");

  const landmarkText = spot.landmark ?? "-";
  const typeText = spot.type ?? "-";
  const facilitiesText =
    spot.facilities.length > 0
      ? spot.facilities.map((item) => item.name).join(", ")
      : "-";

  // สร้าง URL พร้อม params
  const orderUrl = useMemo(() => {
    const params = new URLSearchParams();

    // ดึงค่าจาก URL ที่เข้ามา (หน้า booking)
    const dateIn = searchParams.get("dateIn");

    // ใส่ Date In เสมอ
    if (dateIn) params.set("dateIn", dateIn);

    // ใช้ "selectedOptionDetail" (state ของ Panel นี้) เพื่อกำหนด mode ที่จะส่งไป
    if (selectedOptionDetail === "monthly") {
      params.set("mode", "monthly");
      // ถ้าเป็นรายเดือน ให้ใช้ "monthDurationKey" (ที่รับมาจาก prop)
      if (monthDurationKey) {
        params.set("monthDurationKey", monthDurationKey);
      }
    } else if (selectedOptionDetail === "daily") {
      params.set("mode", "daily");
      // ถ้าเป็นรายวัน ให้ดึง dateOut จาก searchParams
      const dateOut = searchParams.get("dateOut");
      if (dateOut) params.set("dateOut", dateOut);
    } else {
      // "hourly"
      params.set("mode", "hourly");
      // ถ้ารายชั่วโมง ให้ดึง timeIn/timeOut/dateOut จาก searchParams
      const dateOut = searchParams.get("dateOut");
      const timeIn = searchParams.get("timeIn");
      const timeOut = searchParams.get("timeOut");
      if (dateOut) params.set("dateOut", dateOut);
      if (timeIn) params.set("timeIn", timeIn);
      if (timeOut) params.set("timeOut", timeOut);
    }

    return `/order/${spot.id}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
  }, [spot.id, searchParams, selectedOptionDetail, monthDurationKey]);

  return (
    <div className="w-lg bg-white">
      {/* Image Gallery */}
      <div className="relative">
        <Image
          src={imageUrls[currentIndex] ?? FALLBACK_IMAGE}
          alt={spot.name ?? "รูปที่จอดรถ"}
          width={800}
          height={250}
          className="w-full h-[250px] object-cover"
        />
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-6 left-2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
        {imageUrls.length > 1 && (
          <>
            <button
              onClick={() => onNavigate("prev")}
              className="cursor-pointer absolute top-1/2 left-2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate("next")}
              className="cursor-pointer absolute top-1/2 right-2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      <div className="bg-[#F9F3F3] h-[100px] flex justify-center items-center space-x-2 overflow-x-auto px-4">
        {imageUrls.map((img, index) => (
          <Image
            key={`${img}-${index}`}
            src={img}
            alt={`thumbnail-${index}`}
            width={80}
            height={100}
            className={`h-16 w-20 object-cover cursor-pointer border-2 transition-all rounded-lg ${
              index === currentIndex
                ? "border-blue-500 scale-105"
                : "border-transparent hover:border-gray-300"
            }`}
            onClick={() => onSelectImage(index)}
          />
        ))}
      </div>

      {/* Details */}
      <div className="px-4 max-h-[500px] overflow-y-auto pb-8">
        <p className="text-xl mt-4 font-semibold">{spot.name ?? "-"}</p>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-600" />
          <p className="text-gray-700">
            {fullAddress || spot.province || "ไม่พบที่อยู่"}
          </p>
        </div>
        <hr className="border border-[#7C7C7C] my-4" />

        <div>
          <p className="text-xl mb-2 font-semibold">ข้อมูลราคา</p>
          <div className="flex flex-wrap gap-2 md:gap-4">
            {availablePriceKeys.length > 0 ? (
              availablePriceKeys.map(({ key, label }) => (
                <Button
                  key={key}
                  onClick={() => onSelectOption(key)}
                  variant={selectedOptionDetail === key ? "default" : "link"}
                  className={`${
                    selectedOptionDetail === key ? "text-white" : "text-black"
                  } text-sm md:text-lg transition-all h-8 cursor-pointer`}
                >
                  {label}
                </Button>
              ))
            ) : (
              <span className="text-sm text-gray-500">ไม่พบข้อมูลราคา</span>
            )}
          </div>
          <div className="text-center">
            <div className="flex justify-between my-4 text-lg">
              <p>ราคาค่าจอด</p>
              <p className="font-bold text-blue-600">
                {activePrice !== null && activePrice !== undefined
                  ? formatCurrency(activePrice as number)
                  : "-"}
              </p>
            </div>
            <Link href={orderUrl}>
              <Button
                type="button"
                className="w-full md:w-1/2 mt-10 cursor-pointer hover:scale-105 transition-transform"
              >
                จองทันที
              </Button>
            </Link>
          </div>

          <div>
            <hr className="border border-[#7C7C7C] my-4" />
            <p className="font-medium">จุดสังเกตุ</p>
            <p className="text-sm text-[#7C7C7C] mt-1">{landmarkText}</p>
          </div>

          <div>
            <hr className="border border-[#7C7C7C] my-4" />
            <p className="font-medium">ประเภทที่จอด</p>
            <p className="text-sm text-[#7C7C7C] mt-1">{typeText}</p>
          </div>

          <div>
            <hr className="border border-[#7C7C7C] my-4" />
            <p className="font-medium">สิ่งอำนวยความสะดวก</p>
            <p className="text-sm text-[#7C7C7C] mt-1">{facilitiesText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
