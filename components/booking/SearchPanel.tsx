"use client";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Minimize2 } from "lucide-react";
import DateForm from "../form/DateForm";
import SelectForm from "../form/SelectForm";
import TimeForm from "../form/TimeForm";
import { Button } from "../ui/button";
import ParkingCard from "./ParkingCard";
import ProvinceSearch from "../form/ProvinceSearch";
import { districts, provinces, subDistricts } from "@/lib/thaiData";
import { SearchPanelProps } from "@/types/booking";
import Loading from "@/app/booking/loading";

export default function SearchPanel({
  dateIn,
  setDateIn,
  dateOut,
  setDateOut,
  timeIn,
  setTimeIn,
  timeOut,
  setTimeOut,
  selectedOption,
  setSelectedOption,
  timeOptions,
  searchText,
  setSearchText,
  onSearch,
  spots,
  onSelectSpot,
  activeSpotId,
  isLoading,
  errorMessage,
  emptyMessage,
  onLocationChange,
  monthDurationKey,
  onMonthDurationChange,
  error,
  loading,
}: SearchPanelProps) {
  const searchParams = useSearchParams();
  const isHourly = selectedOption === "hourly"; // ตรวจสอบโหมดหลัก: รายวัน/ชม. หรือ รายเดือน

  // Effect สำหรับการตั้งค่าเริ่มต้นจาก URL parameters
  useEffect(() => {
    const mode = searchParams.get("mode");
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const dateInParam = searchParams.get("dateIn");
    const dateOutParam = searchParams.get("dateOut");
    const timeInParam = searchParams.get("timeIn");
    const timeOutParam = searchParams.get("timeOut");

    // ตั้งค่าโหมดหลักตาม URL
    if (mode === "monthly") setSelectedOption("monthly");
    else if (mode === "daily" || mode === "hourly") setSelectedOption("hourly");

    // ใช้ search ก่อน ถ้าไม่มีค่อยใช้ location ในการตั้งค่า searchText
    const searchValue = search || location;
    if (searchValue) setSearchText(searchValue);

    // ตั้งค่าเวลา
    if (timeInParam) setTimeIn(timeInParam);
    if (timeOutParam) setTimeOut(timeOutParam);

    // ตั้งค่าวันที่
    if (dateInParam) {
      const d = new Date(dateInParam);
      if (!isNaN(d.getTime())) setDateIn(d);
    }
    if (dateOutParam) {
      const d = new Date(dateOutParam);
      if (!isNaN(d.getTime())) setDateOut(d);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // แยกที่จอดรถตามประเภทราคาที่สามารถจองได้
  const { hourlyDailySpots, monthlySpots } = useMemo(() => {
    if (!spots.length) return { hourlyDailySpots: [], monthlySpots: [] };

    // กรอง Spot ที่มีราคาต่อชั่วโมงหรือรายวัน (Hourly/Daily)
    const hourlyDaily = spots.filter((spot) => {
      const price = spot.price;
      if (!price) return false;
      return (
        price.price_per_hour !== null ||
        price.price_per_day !== null ||
        price.price_per_hour === 0 ||
        price.price_per_day === 0
      );
    });

    // กรอง Spot ที่มีราคาต่อเดือน (Monthly)
    const monthly = spots.filter((spot) => {
      const price = spot.price;
      if (!price) return false;
      return price.price_per_month !== null || price.price_per_month === 0;
    });

    return { hourlyDailySpots: hourlyDaily, monthlySpots: monthly };
  }, [spots]);

  // เลือก spots ที่จะแสดงผลตาม selectedOption (โหมดหลักที่ผู้ใช้เลือก)
  const filteredSpots = useMemo(() => {
    return selectedOption === "hourly" ? hourlyDailySpots : monthlySpots;
  }, [selectedOption, hourlyDailySpots, monthlySpots]);

  // คำนวณ mode ที่แท้จริง (hourly, daily, monthly) เพื่อใช้ในการสร้าง URL Link
  const actualMode = useMemo(() => {
    if (selectedOption === "monthly") {
      return "monthly";
    }

    // ถ้าเลือก hourly แต่ไม่มีการระบุเวลา (หรือเป็น 00:00 ทั้งคู่) ให้ถือเป็น daily
    if (!timeIn || !timeOut || (timeIn === "00:00" && timeOut === "00:00")) {
      return "daily";
    }

    // ถ้ามีการระบุเวลา ให้ถือเป็น hourly
    return "hourly";
  }, [selectedOption, timeIn, timeOut]);

  // ฟังก์ชันแสดงสถานะการโหลด/ข้อผิดพลาด/ไม่พบผลลัพธ์
  const renderStatus = () => {
    if (isLoading) {
      return <Loading />;
    }
    if (errorMessage) {
      return (
        <p className="text-xl text-center text-red-500 mt-4 overflow-hidden">
          {errorMessage}
        </p>
      );
    }
    if (!filteredSpots.length) {
      if (!emptyMessage) {
        return null;
      }
      return (
        <p className="text-xl text-center text-gray-500 mt-4 overflow-hidden ">
          {emptyMessage}
        </p>
      );
    }
    return null;
  };

  return (
    <div className="w-full min-h-screen lg:w-lg bg-[#EBEBEB] p-3 sm:p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(); // เรียกฟังก์ชันค้นหาเมื่อกดปุ่ม Submit
        }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl my-2">
          {/* แสดงชื่อสถานที่ที่ค้นหา */}
          {searchText || "สถานที่"}
        </h1>

        {/* Province Search (รวมช่องพิมพ์และ dropdown จังหวัด/เขต/แขวง) */}
        <ProvinceSearch
          initialQuery={searchText}
          onQueryChange={(newQuery) => {
            // อัปเดต searchText เมื่อผู้ใช้พิมพ์
            setSearchText(newQuery);
          }}
          onChange={(pId, dId, sId) => {
            // จัดการเมื่อมีการเลือก Location จาก Dropdown
            if (pId || dId || sId) {
              let displayText = "";
              const matchedSubdistrict = sId
                ? subDistricts.find((s) => s.id === sId)
                : undefined;
              const matchedDistrict = dId
                ? districts.find((d) => d.id === dId)
                : undefined;
              const matchedProvince = pId
                ? provinces.find((p) => p.id === pId)
                : undefined;

              // กำหนดข้อความที่จะแสดงในช่องค้นหาตามระดับที่เลือก
              if (matchedSubdistrict) {
                displayText = matchedSubdistrict.name_th;
              } else if (matchedDistrict) {
                displayText = matchedDistrict.name_th;
              } else if (matchedProvince) {
                displayText = matchedProvince.name_th;
              }

              setSearchText(displayText);
              // แจ้งคอมโพเนนต์แม่ถึงการเปลี่ยนแปลง Location ที่เลือก
              onLocationChange({
                provinceName: matchedProvince?.name_th ?? null,
                districtName: matchedDistrict?.name_th ?? null,
                subdistrictName: matchedSubdistrict?.name_th ?? null,
                displayText,
              });
            } else {
              // ถ้า clear ให้ clear location ด้วย
              onLocationChange({
                provinceName: null,
                districtName: null,
                subdistrictName: null,
                displayText: "",
              });
            }
          }}
        />

        {/* Form Section: รายวัน/ชั่วโมง หรือ รายเดือน */}
        {isHourly ? (
          // โหมด รายวัน/ชั่วโมง: แสดงวันที่เข้า/ออก และเวลาเข้า/ออก
          <>
            <div className="grid grid-cols-2 gap-2 my-3 sm:my-4">
              <DateForm // วันที่เข้า
                id="dateIn"
                date={dateIn}
                setDate={setDateIn}
                className="bg-white"
              />
              <TimeForm // เวลาเข้า
                key={`timeIn-${timeIn}`}
                time={timeIn}
                setTime={setTimeIn}
                className="bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 my-3 sm:my-4">
              <DateForm // วันที่ออก
                id="dateOut"
                date={dateOut}
                setDate={setDateOut}
                className="bg-white"
              />
              <TimeForm // เวลาออก
                key={`timeOut-${timeOut}`}
                time={timeOut}
                setTime={setTimeOut}
                className="bg-white"
              />
            </div>
          </>
        ) : (
          // โหมด รายเดือน: แสดงวันที่เข้า และระยะเวลาจอง
          <>
            <div className="grid grid-cols-2 gap-2 my-3 sm:my-4">
              <DateForm // วันที่เข้า
                id="dateIn"
                date={dateIn}
                setDate={setDateIn}
                className="bg-white"
              />
              <SelectForm // ระยะเวลาจอง (3 เดือน, 6 เดือน, 1 ปี)
                itemList={timeOptions}
                className="bg-white"
                leadingIcon={<Minimize2 />}
                value={monthDurationKey}
                onValueChange={onMonthDurationChange}
              />
            </div>
          </>
        )}
        {/* แสดงข้อผิดพลาดของฟอร์ม (ถ้ามี) */}
        {error && (
          <div className="text-red-600 my-2 text-xs sm:text-sm">{error}</div>
        )}

        {/* ปุ่มสลับโหมดและปุ่มค้นหา */}
        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
          <div className="flex gap-2">
            {/* ปุ่มสลับไป รายวัน/ชม. */}
            <Button
              type="button"
              onClick={() => setSelectedOption("hourly")}
              className={`text-sm sm:text-base lg:text-lg rounded-md flex-1 sm:flex-none cursor-pointer ${
                isHourly ? "" : "bg-white text-black"
              }`}
            >
              รายวัน/ชม.
            </Button>
            {/* ปุ่มสลับไป รายเดือน */}
            <Button
              type="button"
              onClick={() => setSelectedOption("monthly")}
              className={`text-sm sm:text-base lg:text-lg rounded-md flex-1 sm:flex-none cursor-pointer ${
                !isHourly ? "" : "bg-white text-black"
              }`}
            >
              รายเดือน
            </Button>
          </div>

          {/* ปุ่มค้นหาหลัก */}
          <Button
            type="submit"
            onClick={onSearch}
            className="text-sm sm:text-base lg:text-lg cursor-pointer w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? "กำลังค้นหา..." : "ค้นหา"}
          </Button>
        </div>

        {/* Parking List - รายการผลการค้นหา */}
        <div className="mt-2 flex-1 overflow-y-auto pr-1 sm:pr-2 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px]">
          {filteredSpots.map((spot) => (
            <ParkingCard
              key={spot.id}
              spot={spot}
              isActive={spot.id === activeSpotId}
              onClick={() => onSelectSpot(spot)} // ฟังก์ชันสำหรับเปิด Detail Panel
              currentSearchParams={{
                // ส่ง parameters ปัจจุบันไปยัง ParkingCard เพื่อใช้สร้าง Link จอง
                dateIn: dateIn?.toISOString(),
                dateOut: dateOut?.toISOString(),
                timeIn,
                timeOut,
                mode: actualMode, // ใช้ mode ที่คำนวณแล้ว
                monthDurationKey,
              }}
            />
          ))}
          {renderStatus()} {/* แสดงสถานะการโหลด/ข้อผิดพลาด/ไม่พบผลลัพธ์ */}
        </div>
      </form>
    </div>
  );
}
