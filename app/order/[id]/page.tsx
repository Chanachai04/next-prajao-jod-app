"use client";

import Loading from "../loading";
import DateForm from "@/components/form/DateForm";
import SelectForm from "@/components/form/SelectForm";
import TimeForm from "@/components/form/TimeForm";
import { Button } from "@/components/ui/button";
import { Facility, Price, RentDetail, Schedule } from "@/types/order";
import { ArrowLeft, ArrowRight, Clock, MapPin, Minimize2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";

export default function Page() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [rentDetail, setRentDetail] = useState<RentDetail | null>(null);
  const [price, setPrice] = useState<Price | null>(null);
  const [facilities, setFacilities] = useState<Facility[] | null>(null);
  const [schedule, setSchedule] = useState<Schedule[] | null>(null);
  const [images, setImages] = useState<{ image_url: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [showAll, setShowAll] = useState(false);
  const [dateIn, setDateIn] = useState<Date>(new Date());
  const [dateOut, setDateOut] = useState<Date>(new Date());
  const [timeIn, setTimeIn] = useState<string>("00:00");
  const [timeOut, setTimeOut] = useState<string>("01:00");

  const [isShow, setIsShow] = useState<"day" | "month" | "hour" | "">("");
  const isLoading = !rentDetail || !price || !facilities || !schedule;
  const [displayPrice, setDisplayPrice] = useState<number | null>(null);
  const [priceSuffix, setPriceSuffix] = useState<string>("");

  const [selectedMonthKey, setSelectedMonthKey] =
    useState<string>("threeMonths");
  const [userId, setUserId] = useState<string>("");
  const FALLBACK_IMAGE = "/image.jpg";

  const daysInfo: Record<string, { index: number }> = {
    วันอาทิตย์: { index: 0 },
    วันจันทร์: { index: 1 },
    วันอังคาร: { index: 2 },
    วันพุธ: { index: 3 },
    วันพฤหัสบดี: { index: 4 },
    วันศุกร์: { index: 5 },
    วันเสาร์: { index: 6 },
  };

  const timeOption = {
    threeMonths: "3 เดือน",
    sixMonths: "6 เดือน",
    oneYears: "1 ปี",
  };

  const selectedMonthDuration = useMemo(() => {
    if (selectedMonthKey === "sixMonths") return 6;
    if (selectedMonthKey === "oneYears") return 12;
    return 3; // Default
  }, [selectedMonthKey]);

  // อ่านค่าจาก URL params
  useEffect(() => {
    if (!searchParams) return;

    const dateInParam = searchParams.get("dateIn");
    const dateOutParam = searchParams.get("dateOut");
    const timeInParam = searchParams.get("timeIn");
    const timeOutParam = searchParams.get("timeOut");
    const mode = searchParams.get("mode");
    // --- v v v อ่านค่า Key และ Number(เผื่อไว้) จาก URL v v v ---
    const monthDurationKeyParam = searchParams.get("monthDurationKey");
    const monthDurationParam = searchParams.get("monthDuration");

    if (dateInParam) {
      const d = new Date(dateInParam);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!isNaN(d.getTime())) setDateIn(d);
    }
    if (dateOutParam) {
      const d = new Date(dateOutParam);
      if (!isNaN(d.getTime())) setDateOut(d);
    }
    if (timeInParam) setTimeIn(timeInParam);
    if (timeOutParam) setTimeOut(timeOutParam);

    // ตั้งค่า mode จาก URL
    if (mode === "monthly") {
      setIsShow("month");
      if (monthDurationKeyParam) {
        setSelectedMonthKey(monthDurationKeyParam);
      } else if (monthDurationParam) {
        // ถ้าไม่มี Key ให้ใช้ Number (จาก link เก่า หรือจากหน้า payment)
        const duration = parseInt(monthDurationParam);
        if (duration === 6) setSelectedMonthKey("sixMonths");
        else if (duration === 12) setSelectedMonthKey("oneYears");
        else setSelectedMonthKey("threeMonths");
      }
    } else if (mode === "daily") {
      setIsShow("day");
    } else if (mode === "hourly") {
      setIsShow("hour");
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await fetch(`/api/order?id=${id}`, {
        method: "GET",
        cache: "no-store",
      });
      const data = await res.json();
      console.log(data);
      setUserId(data.userId);
      setRentDetail(data.rentDetail);
      setPrice(data.price);
      setFacilities(data.facilities);
      setSchedule(data.schedules);
      setImages(data.images ?? []);
    };
    fetchOrder();
  }, [id]);

  // ตั้งค่า default ราคาตอนโหลดข้อมูลเสร็จ
  useEffect(() => {
    if (!price) return;

    const timer = setTimeout(() => {
      // ถ้ามี mode จาก URL ให้ใช้ตาม mode
      if (isShow) {
        // ตรวจสอบว่า mode ที่เลือกมีราคาไหม
        if (isShow === "day" && price.price_per_day) {
          setDisplayPrice(price.price_per_day);
          setPriceSuffix("/ วัน");
        } else if (isShow === "month" && price.price_per_month) {
          setDisplayPrice(price.price_per_month);
          setPriceSuffix("/ เดือน");
        } else if (isShow === "hour" && price.price_per_hour) {
          setDisplayPrice(price.price_per_hour);
          setPriceSuffix("/ ชั่วโมง");
        } else {
          // ถ้า mode ที่เลือกไม่มีราคา ให้เลือกราคาที่มี
          if (price.price_per_day) {
            setIsShow("day");
            setDisplayPrice(price.price_per_day);
            setPriceSuffix("/ วัน");
          } else if (price.price_per_month) {
            setIsShow("month");
            setDisplayPrice(price.price_per_month);
            setPriceSuffix("/ เดือน");
          } else if (price.price_per_hour) {
            setIsShow("hour");
            setDisplayPrice(price.price_per_hour);
            setPriceSuffix("/ ชั่วโมง");
          }
        }
        return;
      }

      // ถ้าไม่มี isShow จาก URL ให้เลือกราคาที่มี
      if (price.price_per_day) {
        setIsShow("day");
        setDisplayPrice(price.price_per_day);
        setPriceSuffix("/ วัน");
      } else if (price.price_per_month) {
        setIsShow("month");
        setDisplayPrice(price.price_per_month);
        setPriceSuffix("/ เดือน");
      } else if (price.price_per_hour) {
        setIsShow("hour");
        setDisplayPrice(price.price_per_hour);
        setPriceSuffix("/ ชั่วโมง");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [price, isShow]);

  const imageUrls =
    images.length > 0 ? images.map((img) => img.image_url) : [FALLBACK_IMAGE];

  const onNavigate = (dir: "prev" | "next") =>
    setCurrentIndex((prev) =>
      dir === "prev"
        ? prev === 0
          ? images.length - 1
          : prev - 1
        : prev === images.length - 1
        ? 0
        : prev + 1
    );

  const onSelectImage = (index: number) => setCurrentIndex(index);

  const formatTime = (open?: string, close?: string) => {
    if (!open || !close) return "";
    if (open === "00:00:00" && close === "00:00:00") return "เปิด 24 ชม.";
    return `${open.slice(0, 5)} - ${close.slice(0, 5)}`;
  };

  const formatDays = (days: string[]) => {
    if (!days || days.length === 0) return "";
    const validDays = days.filter((d) => d in daysInfo);
    const indices = validDays
      .map((d) => daysInfo[d].index)
      .sort((a, b) => a - b);

    if (indices.length === 7) return "วันจันทร์ - วันอาทิตย์";
    if (indices.length === 1) return validDays[0];

    const firstDay = validDays.find((d) => daysInfo[d].index === indices[0]);
    const lastDay = validDays.find(
      (d) => daysInfo[d].index === indices[indices.length - 1]
    );
    return `${firstDay} - ${lastDay}`;
  };

  const groupedSchedules = () => {
    if (!schedule) return [];
    const groups: Record<string, string[]> = {};

    schedule.forEach((s) => {
      const key = `${s.open_time}-${s.close_time}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(...s.available_days);
    });

    return Object.entries(groups).map(([time, days]) => {
      const [open, close] = time.split("-");
      return { open, close, days };
    });
  };

  const renderScheduleGroup = (group: {
    open: string;
    close: string;
    days: string[];
    button?: ReactNode;
  }) => (
    <div key={`${group.open}-${group.close}`} className="flex items-center">
      <Clock size={16} className="mr-2" />
      <span>
        เปิด {formatDays(group.days)}: {formatTime(group.open, group.close)}
      </span>
      {group.button && (
        <span className={`${showAll ? "mt-1" : "ml-2"}`}>{group.button}</span>
      )}
    </div>
  );

  const allGroups = groupedSchedules();

  // สร้าง URL สำหรับไปหน้า payment
  const buildPaymentUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (dateIn) params.set("dateIn", dateIn.toISOString());
    if (dateOut) params.set("dateOut", dateOut.toISOString());
    if (timeIn) params.set("timeIn", timeIn);
    if (timeOut) params.set("timeOut", timeOut);

    if (isShow === "month") {
      params.set("mode", "monthly");
      // --- v v v ใช้ตัวแปร number ที่คำนวณจาก useMemo v v v ---
      params.set("monthDuration", String(selectedMonthDuration));
    } else if (isShow === "day") {
      params.set("mode", "daily");
    } else if (isShow === "hour") {
      params.set("mode", "hourly");
    }
    if (userId) {
      params.set("userId", userId);
    }

    return `/payment/${id}${params.toString() ? `?${params.toString()}` : ""}`;
  }, [
    id,
    userId,
    dateIn,
    dateOut,
    timeIn,
    timeOut,
    isShow,
    selectedMonthDuration,
  ]);

  if (isLoading) return <Loading />;

  return (
    <div className="container mx-auto min-h-screen px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center my-3 sm:my-4">
        <p className="text-sm sm:text-base truncate">
          <Link href="/" className="text-blue-500 hover:underline">
            หน้าหลัก
          </Link>{" "}
          &gt; {rentDetail?.province} &gt; {rentDetail?.name}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Main Image */}
        <div className="relative w-full lg:w-2/4">
          <Image
            src={imageUrls[currentIndex] ?? FALLBACK_IMAGE}
            alt={rentDetail?.name ?? "รูปที่จอดรถ"}
            width={800}
            height={250}
            className="w-full h-[250px] sm:h-[350px] lg:h-[400px] object-cover cursor-pointer rounded-2xl"
          />

          {imageUrls.length > 1 && (
            <>
              <button
                onClick={() => onNavigate("prev")}
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-white p-1.5 sm:p-2 rounded-full shadow cursor-pointer hover:bg-gray-100"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => onNavigate("next")}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-white p-1.5 sm:p-2 rounded-full shadow cursor-pointer hover:bg-gray-100"
              >
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </>
          )}
        </div>
        {/* Thumbnails */}
        <div className="h-[50px] sm:h-[100px] w-full lg:w-2/4 flex justify-start lg:justify-center items-center space-x-2 overflow-x-auto px-2 sm:px-4 mt-3 sm:mt-4">
          {imageUrls.map((img, idx) => (
            <Image
              key={`${img}-${idx}`}
              src={img}
              width={80}
              height={100}
              alt=""
              className={`h-12 w-16 sm:h-16 sm:w-20 object-cover border-2 rounded-lg cursor-pointer shrink-0 ${
                idx === currentIndex
                  ? "border-blue-500 scale-105"
                  : "border-transparent"
              }`}
              onClick={() => onSelectImage(idx)}
            />
          ))}
        </div>

        <div>
          <div className="mt-4 sm:mt-6">
            <h1 className="text-xl sm:text-2xl mb-2 font-semibold">
              {rentDetail?.name}
            </h1>
            <div className="flex items-center text-sm sm:text-base">
              <MapPin
                size={16}
                className="mr-2 shrink-0 sm:w-[18px] sm:h-[18px]"
              />
              <span className="wrap-break-word text-sm sm:text-base lg:text-lg">
                เขต{rentDetail?.district} แขวง{rentDetail?.subdistrict}{" "}
                {rentDetail?.province}
              </span>
            </div>

            {/* Schedule */}
            <div
              className={`mb-6 sm:mb-8 mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg ${
                showAll ? "flex flex-col" : "flex items-center"
              }`}
            >
              {allGroups.length > 0 &&
                allGroups
                  .map((g, index) => {
                    const showButton = index === 0 && allGroups.length > 1;

                    return renderScheduleGroup({
                      ...g,
                      button: showButton ? (
                        <button
                          onClick={() => setShowAll(!showAll)}
                          className="text-blue-500 underline ml-2 text-sm sm:text-base"
                        >
                          {showAll ? "ย่อ" : "เพิ่มเติม"}
                        </button>
                      ) : undefined,
                    });
                  })
                  .filter((_, i) => showAll || i === 0)}
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h1 className="text-base sm:text-lg font-semibold">
              เกี่ยวกับลานจอด
            </h1>
            <p className="my-2 text-sm sm:text-base lg:text-lg wrap-break-word">
              {rentDetail?.description}
            </p>
          </div>

          <div className="mb-6 sm:mb-8">
            <h1 className="text-base sm:text-lg font-semibold">จุดสังเกตุ</h1>
            <p className="my-2 text-sm sm:text-base lg:text-lg wrap-break-word">
              {rentDetail?.landmark}
            </p>
          </div>

          <div className="mb-6 sm:mb-8 pb-4">
            <h1 className="text-base sm:text-lg font-semibold">
              สิ่งอำนวยความสะดวก
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {facilities && facilities.length > 0 ? (
                facilities.map((f) => (
                  <span
                    key={f.id}
                    className="bg-gray-100 rounded-full  sm:px-3 py-1 text-sm sm:text-base lg:text-lg"
                  >
                    {f.name}
                  </span>
                ))
              ) : (
                <span className="text-sm sm:text-base lg:text-lg">
                  ไม่มีข้อมูลสิ่งอำนวยความสะดวก
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Price Box */}
        <div className="mb-4 bg-white h-full w-full lg:w-1/3 p-4 sm:p-6 rounded-2xl border border-gray-300 shadow-sm">
          {/* Dynamic Price */}
          <p className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
            {displayPrice !== null ? `฿ ${displayPrice} ${priceSuffix}` : "-"}
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-3 sm:mb-4">
            {price?.price_per_hour && (
              <Button
                variant={isShow === "hour" ? "default" : "outline"}
                onClick={() => {
                  setIsShow("hour");
                  setDisplayPrice(price.price_per_hour);
                  setPriceSuffix("/ ชั่วโมง");
                }}
                className="flex-1 cursor-pointer text-sm sm:text-base lg:text-lg"
              >
                รายชั่วโมง
              </Button>
            )}
            {price?.price_per_day && (
              <Button
                variant={isShow === "day" ? "default" : "outline"}
                onClick={() => {
                  setIsShow("day");
                  setDisplayPrice(price.price_per_day);
                  setPriceSuffix("/ วัน");
                }}
                className="flex-1 cursor-pointer text-sm sm:text-base lg:text-lg"
              >
                รายวัน
              </Button>
            )}

            {price?.price_per_month && (
              <Button
                variant={isShow === "month" ? "default" : "outline"}
                onClick={() => {
                  setIsShow("month");
                  setDisplayPrice(price.price_per_month);
                  setPriceSuffix("/ เดือน");
                }}
                className="flex-1 cursor-pointer text-sm sm:text-base lg:text-lg"
              >
                รายเดือน
              </Button>
            )}
          </div>

          {/* Form Content */}
          {isShow === "day" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <DateForm
                id="dateIn"
                title="วันที่เข้าจอด"
                date={dateIn}
                setDate={setDateIn}
                placeholder="เลือกวันที่เข้าจอด"
                className="cursor-pointer"
              />
              <DateForm
                id="dateOut"
                title="วันที่นำรถออก"
                date={dateOut}
                setDate={setDateOut}
                placeholder="เลือกวันที่นำรถออก"
                className="cursor-pointer"
              />
            </div>
          )}

          {isShow === "month" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <DateForm
                id="dateIn"
                title="วันที่เข้าจอด"
                date={dateIn}
                setDate={setDateIn}
                placeholder="เลือกวันที่เข้าจอด"
                className="cursor-pointer"
              />
              <SelectForm
                title="จำนวนวัน"
                placeholder="เลือกจำนวนวัน"
                itemList={timeOption}
                leadingIcon={<Minimize2 />}
                value={selectedMonthKey}
                onValueChange={setSelectedMonthKey}
              />
            </div>
          )}

          {isShow === "hour" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <DateForm
                  id="dateIn"
                  title="วันที่เข้าจอด"
                  date={dateIn}
                  setDate={setDateIn}
                  placeholder="เลือกวันที่เข้าจอด"
                  className="cursor-pointer"
                />
                <TimeForm
                  title="เวลาเข้าจอด"
                  time={timeIn}
                  setTime={setTimeIn}
                  className="cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <DateForm
                  id="dateOut"
                  title="วันที่นำรถออก"
                  date={dateOut}
                  setDate={setDateOut}
                  placeholder="เลือกวันที่นำรถออก"
                  className="cursor-pointer"
                />
                <TimeForm
                  title="เวลานำรถออก"
                  time={timeOut}
                  setTime={setTimeOut}
                  className="cursor-pointer"
                />
              </div>
            </>
          )}
          <div className="flex justify-between items-center text-base sm:text-lg my-2 sm:my-3 font-semibold">
            <p>ราคารวม</p>
            <p>{displayPrice !== null ? `฿ ${displayPrice} ` : "-"}</p>
          </div>
          <div>
            <Link href={buildPaymentUrl}>
              <Button className="w-full cursor-pointer h-9 sm:h-10 text-sm sm:text-base lg:text-lg">
                จองที่จอดนี้
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
