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
  const [totalPrice, setTotalPrice] = useState<number | null>(null);

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

  // คำนวณราคารวม
  useEffect(() => {
    if (!displayPrice) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTotalPrice(null);
      return;
    }

    if (isShow === "hour") {
      // คำนวณชั่วโมง
      if (!dateIn || !dateOut || !timeIn || !timeOut) {
        setTotalPrice(displayPrice);
        return;
      }

      const startDateTime = new Date(dateIn);
      const [startHour, startMinute] = timeIn.split(":").map(Number);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(dateOut);
      const [endHour, endMinute] = timeOut.split(":").map(Number);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      const diffMs = endDateTime.getTime() - startDateTime.getTime();
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

      if (diffHours > 0) {
        setTotalPrice(displayPrice * diffHours);
      } else {
        setTotalPrice(displayPrice);
      }
    } else if (isShow === "day") {
      // คำนวณวัน
      if (!dateIn || !dateOut) {
        setTotalPrice(displayPrice);
        return;
      }

      const start = new Date(dateIn);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateOut);
      end.setHours(0, 0, 0, 0);

      const diffMs = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        setTotalPrice(displayPrice * diffDays);
      } else {
        setTotalPrice(displayPrice);
      }
    } else if (isShow === "month") {
      // คำนวณเดือน
      setTotalPrice(displayPrice * selectedMonthDuration);
    } else {
      setTotalPrice(displayPrice);
    }
  }, [
    displayPrice,
    isShow,
    dateIn,
    dateOut,
    timeIn,
    timeOut,
    selectedMonthDuration,
  ]);

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
    <div
      key={`${group.open}-${group.close}`}
      className="flex flex-col sm:flex-row sm:items-center"
    >
      <div className="flex items-start sm:items-center">
        <Clock size={16} className="mr-2 mt-0.5 sm:mt-0 shrink-0" />
        <span className="text-sm sm:text-base lg:text-lg">
          เปิด {formatDays(group.days)}: {formatTime(group.open, group.close)}
        </span>
      </div>
      {group.button && (
        <span className={`${showAll ? "mt-1 ml-6 sm:ml-2" : "ml-6 sm:ml-2"}`}>
          {group.button}
        </span>
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
        {/* Main Content */}
        <div className="w-full lg:w-2/3">
          <div className="relative w-full">
            <Image
              src={imageUrls[currentIndex] ?? FALLBACK_IMAGE}
              alt={rentDetail?.name ?? "รูปที่จอดรถ"}
              width={800}
              height={250}
              className="w-full h-[250px] sm:h-[350px] lg:h-[450px] object-cover cursor-pointer rounded-2xl"
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
          {/* Thumbnails - แสดงเฉพาะเมื่อมีรูปมากกว่า 1 รูป */}
          {imageUrls.length > 1 && (
            <div className="h-[60px] sm:h-[80px] lg:h-[100px] w-full flex justify-start items-center space-x-2 overflow-x-auto px-1 sm:px-2 mt-3 sm:mt-4 scrollbar-hide">
              {imageUrls.map((img, idx) => (
                <Image
                  key={`${img}-${idx}`}
                  src={img}
                  width={80}
                  height={100}
                  alt=""
                  className={`h-14 w-20 sm:h-16 sm:w-24 lg:h-20 lg:w-28 object-cover border-2 rounded-lg cursor-pointer shrink-0 transition-all ${
                    idx === currentIndex
                      ? "border-blue-500 scale-105"
                      : "border-transparent"
                  }`}
                  onClick={() => onSelectImage(idx)}
                />
              ))}
            </div>
          )}
          {/* Detail */}
          <div className="mt-4 sm:mt-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3 font-semibold">
                {rentDetail?.name}
              </h1>
              <div className="flex items-start sm:items-center text-sm sm:text-base">
                <MapPin
                  size={16}
                  className="mr-2 mt-1 sm:mt-0 shrink-0 sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5"
                />
                <span className="wrap-break-word text-sm sm:text-base lg:text-lg">
                  เขต{rentDetail?.district} แขวง{rentDetail?.subdistrict}{" "}
                  {rentDetail?.province}
                </span>
              </div>

              {/* Schedule */}
              <div
                className={`mb-4 sm:mb-6 mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg ${
                  showAll
                    ? "flex flex-col space-y-2"
                    : "flex flex-col sm:flex-row sm:items-center"
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
                            className="text-blue-500 underline ml-0 sm:ml-2 mt-1 sm:mt-0 text-sm sm:text-base inline-block"
                          >
                            {showAll ? "ย่อ" : "เพิ่มเติม"}
                          </button>
                        ) : undefined,
                      });
                    })
                    .filter((_, i) => showAll || i === 0)}
              </div>
            </div>

            <div className="mb-4 sm:mb-6 lg:mb-8">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold mb-2">
                เกี่ยวกับลานจอด
              </h1>
              <p className="text-sm sm:text-base lg:text-lg wrap-break-word leading-relaxed">
                {rentDetail?.description}
              </p>
            </div>

            <div className="mb-4 sm:mb-6 lg:mb-8">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold mb-2">
                จุดสังเกตุ
              </h1>
              <p className="text-sm sm:text-base lg:text-lg wrap-break-word leading-relaxed">
                {rentDetail?.landmark}
              </p>
            </div>

            <div className="mb-4 sm:mb-6 lg:mb-8 pb-4">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold mb-3">
                สิ่งอำนวยความสะดวก
              </h1>
              <div className="flex flex-wrap gap-2">
                {facilities && facilities.length > 0 ? (
                  facilities.map((f) => (
                    <span
                      key={f.id}
                      className="text-sm sm:text-base lg:text-lg"
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
        </div>

        {/* Price Box */}
        <div className="sticky top-4 mb-4 lg:mb-0 bg-white h-fit w-full lg:w-1/3 p-4 sm:p-5 lg:p-6 rounded-2xl border border-gray-300 shadow-lg">
          {/* Dynamic Price */}
          <p className="text-2xl sm:text-3xl lg:text-2xl font-bold mb-4 sm:mb-5">
            {displayPrice !== null ? `฿ ${displayPrice} ${priceSuffix}` : "-"}
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-5">
            {price?.price_per_hour && (
              <Button
                variant={isShow === "hour" ? "default" : "outline"}
                onClick={() => {
                  setIsShow("hour");
                  setDisplayPrice(price.price_per_hour);
                  setPriceSuffix("/ ชั่วโมง");
                }}
                className="flex-1 cursor-pointer text-xs sm:text-sm lg:text-base h-9 sm:h-10"
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
                className="flex-1 cursor-pointer text-xs sm:text-sm lg:text-base h-9 sm:h-10"
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
                className="flex-1 cursor-pointer text-xs sm:text-sm lg:text-base h-9 sm:h-10"
              >
                รายเดือน
              </Button>
            )}
          </div>

          {/* Form Content */}
          {isShow === "day" && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
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
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
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
            <div className="space-y-3 sm:space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
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

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
            </div>
          )}
          <div className="flex justify-between items-center text-base sm:text-lg lg:text-xl my-3 sm:my-4 font-semibold pt-3 border-t">
            <p>ราคารวม</p>
            <p>
              {totalPrice !== null ? `฿ ${totalPrice.toLocaleString()} ` : "-"}
            </p>
          </div>
          <div>
            <Link href={buildPaymentUrl}>
              <Button className="w-full cursor-pointer h-11 sm:h-12 text-base sm:text-lg font-medium">
                จองที่จอดนี้
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
