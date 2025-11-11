import { Minimize2 } from "lucide-react";
import DateForm from "../form/DateForm";
import SelectForm from "../form/SelectForm";
import TimeForm from "../form/TimeForm";
import { Button } from "../ui/button";
import ParkingCard from "./ParkingCard";
import ProvinceSearch from "../form/ProvinceSearch";
import { useState } from "react";
import { districts, provinces, subDistricts } from "@/lib/thaiData";

interface SearchPanelProps {
  dateIn: Date | undefined;
  setDateIn: React.Dispatch<React.SetStateAction<Date | undefined>>;
  timeIn: string;
  setTimeIn: React.Dispatch<React.SetStateAction<string>>;
  timeOut: string;
  setTimeOut: React.Dispatch<React.SetStateAction<string>>;
  selectedOption: string;
  setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
  timeOptions: Record<string, string>;
  onCardClick: () => void;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  onSearch: () => void;
}

export default function SearchPanel({
  dateIn,
  setDateIn,
  timeIn,
  setTimeIn,
  timeOut,
  setTimeOut,
  selectedOption,
  setSelectedOption,
  timeOptions,
  onCardClick,
  searchText, // consumed via ProvinceSearch -> setSearchText
  setSearchText,
  onSearch,
}: SearchPanelProps) {
  const isHourly = selectedOption === "hourly";
  const [, setLocation] = useState("");
  const [, setProvinceId] = useState<number | null>(null);
  const [, setDistrictId] = useState<number | null>(null);
  const [, setSubDistrictId] = useState<number | null>(null);
  return (
    <div className="w-[420px] bg-[#EBEBEB] p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <h1 className="text-4xl my-2">{searchText || "สถานที่"}</h1>
        <ProvinceSearch
          initialQuery={searchText}
          onChange={(pId, dId, sId) => {
            setProvinceId(pId);
            setDistrictId(dId);
            setSubDistrictId(sId);
            // set location เป็นชื่อ และ sync ไปยัง searchText
            if (sId) {
              const sub = subDistricts.find((s) => s.id === sId);
              const name = sub?.name_th || "";
              setLocation(name);
              setSearchText(name);
            } else if (dId) {
              const district = districts.find((d) => d.id === dId);
              const name = district?.name_th || "";
              setLocation(name);
              setSearchText(name);
            } else if (pId) {
              const province = provinces.find((p) => p.id === pId);
              const name = province?.name_th || "";
              setLocation(name);
              setSearchText(name);
            } else {
              setLocation("");
              setSearchText("");
            }
          }}
        />

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
                date={dateIn}
                setDate={setDateIn}
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
              <SelectForm
                itemList={timeOptions}
                className="bg-white"
                leadingIcon={<Minimize2 />}
              />
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
              onClick={() => setSelectedOption("daily")}
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

        <div className="mt-2 flex-1 overflow-y-auto pr-2 max-h-[600px]">
          <ParkingCard onClick={onCardClick} />
          <ParkingCard onClick={onCardClick} />
        </div>
      </form>
    </div>
  );
}
