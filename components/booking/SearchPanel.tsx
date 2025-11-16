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
import { RentSpot } from "@/types/booking";

interface LocationChangePayload {
  provinceName: string | null;
  districtName: string | null;
  subdistrictName: string | null;
  displayText: string;
}

interface SearchPanelProps {
  dateIn: Date | undefined;
  setDateIn: React.Dispatch<React.SetStateAction<Date | undefined>>;
  dateOut: Date | undefined;
  setDateOut: React.Dispatch<React.SetStateAction<Date | undefined>>;
  timeIn: string;
  setTimeIn: React.Dispatch<React.SetStateAction<string>>;
  timeOut: string;
  setTimeOut: React.Dispatch<React.SetStateAction<string>>;
  selectedOption: "hourly" | "monthly";
  setSelectedOption: React.Dispatch<React.SetStateAction<"hourly" | "monthly">>;
  timeOptions: Record<string, string>;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  onSearch: () => void;
  spots: RentSpot[];
  onSelectSpot: (spot: RentSpot) => void;
  activeSpotId: string | null;
  isLoading: boolean;
  errorMessage?: string | null;
  emptyMessage?: string | null;
  onLocationChange: (payload: LocationChangePayload) => void;
  // --- v v v เพิ่ม Props สำหรับจัดการ Duration รายเดือน v v v ---
  monthDurationKey: string;
  onMonthDurationChange: (value: string) => void;
  // --- ^ ^ ^ ------------------------------------------- ^ ^ ^ ---
}

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
  // --- v v v รับ Props v v v ---
  monthDurationKey,
  onMonthDurationChange,
}: // --- ^ ^ ^ ----------- ^ ^ ^ ---
SearchPanelProps) {
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

  const renderStatus = () => {
    if (isLoading) {
      return <p className="text-sm text-gray-500 mt-4">กำลังโหลดข้อมูล...</p>;
    }
    if (errorMessage) {
      return <p className="text-sm text-red-500 mt-4">{errorMessage}</p>;
    }
    if (!filteredSpots.length) {
      if (!emptyMessage) {
        return null;
      }
      return <p className="text-sm text-gray-500 mt-4">{emptyMessage}</p>;
    }
    return null;
  };

  return (
    <div className="w-lg bg-[#EBEBEB] p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <h1 className="text-4xl my-2">{searchText || "สถานที่"}</h1>

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
            <div className="grid grid-cols-2 gap-2 my-4">
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
            <div className="grid grid-cols-2 gap-2 my-4">
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
            <div className="grid grid-cols-2 gap-2 my-4">
              <DateForm
                id="dateIn"
                date={dateIn}
                setDate={setDateIn}
                className="bg-white"
              />
              {/* --- v v v ส่ง value และ onValueChange ให้ SelectForm v v v --- */}
              <SelectForm
                itemList={timeOptions}
                className="bg-white"
                leadingIcon={<Minimize2 />}
                value={monthDurationKey}
                onValueChange={onMonthDurationChange}
              />
              {/* --- ^ ^ ^ ------------------------------------------ ^ ^ ^ --- */}
            </div>
          </>
        )}

        <div className="flex justify-between">
          <div>
            <Button
              type="button"
              onClick={() => setSelectedOption("hourly")}
              className={`text-lg rounded-full mr-2 cursor-pointer ${
                isHourly ? "" : "bg-white text-black"
              }`}
            >
              รายวัน/ชม.
            </Button>
            <Button
              type="button"
              onClick={() => setSelectedOption("monthly")}
              className={`text-lg rounded-full cursor-pointer ${
                !isHourly ? "" : "bg-white text-black"
              }`}
            >
              รายเดือน
            </Button>
          </div>
          <Button
            type="submit"
            onClick={onSearch}
            className="text-lg cursor-pointer"
          >
            ค้นหา
          </Button>
        </div>

        {/* Parking List */}
        <div className="mt-2 flex-1 overflow-y-auto pr-2 max-h-[600px]">
          {filteredSpots.map((spot) => (
            <ParkingCard
              key={spot.id}
              spot={spot}
              isActive={spot.id === activeSpotId}
              onClick={() => onSelectSpot(spot)}
            />
          ))}
          {renderStatus()}
        </div>
      </form>
    </div>
  );
}
