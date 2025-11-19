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
  const isHourly = selectedOption === "hourly";

  useEffect(() => {
    const mode = searchParams.get("mode");
    const location = searchParams.get("location");
    const dateInParam = searchParams.get("dateIn");
    const dateOutParam = searchParams.get("dateOut");
    const timeInParam = searchParams.get("timeIn");
    const timeOutParam = searchParams.get("timeOut");

    if (mode === "monthly") setSelectedOption("monthly");
    else if (mode === "daily" || mode === "hourly") setSelectedOption("hourly");
    if (location) setSearchText(location);
    if (dateInParam) setDateIn(new Date(dateInParam));
    if (dateOutParam) setDateOut(new Date(dateOutParam));
    if (timeInParam) setTimeIn(timeInParam);
    if (timeOutParam) setTimeOut(timeOutParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filteredSpots = useMemo(() => {
    if (!spots.length) return [];
    const byMode =
      selectedOption === "hourly"
        ? spots.filter((spot) => {
            const price = spot.price;
            if (!price) return false;
            return (
              price.price_per_hour !== null ||
              price.price_per_day !== null ||
              price.price_per_hour === 0 ||
              price.price_per_day === 0
            );
          })
        : spots.filter((spot) => {
            const price = spot.price;
            if (!price) return false;
            return (
              price.price_per_month !== null || price.price_per_month === 0
            );
          });
    return byMode.length > 0 ? byMode : spots;
  }, [spots, selectedOption]);

  // คำนวณ mode ที่แท้จริงตาม UI และเงื่อนไข
  const actualMode = useMemo(() => {
    if (selectedOption === "monthly") {
      return "monthly";
    }

    // ถ้าเลือก hourly แต่ไม่มีเวลา = daily
    if (!timeIn || !timeOut || (timeIn === "00:00" && timeOut === "00:00")) {
      return "daily";
    }

    // ถ้ามีเวลา = hourly
    return "hourly";
  }, [selectedOption, timeIn, timeOut]);

  const renderStatus = () => {
    if (isLoading) {
      return (
       <Loading/>
      );
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
    <div className="w-full lg:w-lg bg-[#EBEBEB] p-3 sm:p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl my-2">{searchText || "สถานที่"}</h1>

        {/* Province Search */}
        <ProvinceSearch
          initialQuery={searchText}
          onChange={(pId, dId, sId) => {
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

            if (matchedSubdistrict) {
              displayText = matchedSubdistrict.name_th;
            } else if (matchedDistrict) {
              displayText = matchedDistrict.name_th;
            } else if (matchedProvince) {
              displayText = matchedProvince.name_th;
            } else {
              displayText = "";
            }
            setSearchText(displayText);
            onLocationChange({
              provinceName: matchedProvince?.name_th ?? null,
              districtName: matchedDistrict?.name_th ?? null,
              subdistrictName: matchedSubdistrict?.name_th ?? null,
              displayText,
            });
          }}
        />

        {/* Form Section */}
        {isHourly ? (
          <>
            <div className="grid  grid-cols-2 gap-2 my-3 sm:my-4">
              <DateForm
                id="dateIn"
                date={dateIn}
                setDate={setDateIn}
                className="bg-white"
              />
              <TimeForm
                time={timeIn}
                setTime={setTimeIn}
                className="bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 my-3 sm:my-4">
              <DateForm
                id="dateOut"
                date={dateOut}
                setDate={setDateOut}
                className="bg-white"
              />
              <TimeForm
                time={timeOut}
                setTime={setTimeOut}
                className="bg-white"
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 my-3 sm:my-4">
              <DateForm
                id="dateIn"
                date={dateIn}
                setDate={setDateIn}
                className="bg-white"
              />
              <SelectForm
                itemList={timeOptions}
                className="bg-white"
                leadingIcon={<Minimize2 />}
                value={monthDurationKey}
                onValueChange={onMonthDurationChange}
              />
            </div>
          </>
        )}
        {error && <div className="text-red-600 my-2 text-xs sm:text-sm">{error}</div>}
        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setSelectedOption("hourly")}
              className={`text-sm sm:text-base lg:text-lg rounded-md flex-1 sm:flex-none cursor-pointer ${
                isHourly ? "" : "bg-white text-black"
              }`}
            >
              รายวัน/ชม.
            </Button>
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

          <Button
            type="submit"
            onClick={onSearch}
            className="text-sm sm:text-base lg:text-lg cursor-pointer w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? "กำลังค้นหา..." : "ค้นหา"}
          </Button>
        </div>

        {/* Parking List */}
        <div className="mt-2 flex-1 overflow-y-auto pr-1 sm:pr-2 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px]">
          {filteredSpots.map((spot) => (
            <ParkingCard
              key={spot.id}
              spot={spot}
              isActive={spot.id === activeSpotId}
              onClick={() => onSelectSpot(spot)}
              currentSearchParams={{
                dateIn: dateIn?.toISOString(),
                dateOut: dateOut?.toISOString(),
                timeIn,
                timeOut,
                mode: actualMode, // ✅ ใช้ mode ที่คำนวณแล้ว
                monthDurationKey,
              }}
            />
          ))}
          {renderStatus()}
        </div>
      </form>
    </div>
  );
}
