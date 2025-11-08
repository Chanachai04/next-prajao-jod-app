import { MapPin, Minimize2 } from "lucide-react";
import DateForm from "../form/DateForm";
import LabelAndInputForm from "../form/LabelAndInputForm";
import SelectForm from "../form/SelectForm";
import TimeForm from "../form/TimeForm";
import { Button } from "../ui/button";
import ParkingCard from "./ParkingCard";

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
}: SearchPanelProps) {
  const isHourly = selectedOption === "hourly";

  return (
    <div className="w-[420px] bg-[#EBEBEB] p-4">
      <form>
        <h1 className="text-4xl my-2">กรุงเทพมหานคร</h1>
        <LabelAndInputForm
          title="ค้นหาที่จอดรถในบริเวณ"
          placeholder="ค้นหา..."
          leadingIcon={<MapPin />}
          textLabelSize="text-xl"
          className="bg-white"
        />

        {isHourly ? (
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
        ) : (
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
          <Button type="button" className="text-lg cursor-pointer">
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
