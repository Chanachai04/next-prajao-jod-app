"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Loading from "./loading";
import DetailPanel from "@/components/booking/DetailPanel";
import SearchPanel from "@/components/booking/SearchPanel";

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
});

const IMAGES = ["/image.jpg", "/image.jpg", "/image.jpg"];
const TIME_OPTIONS = {
  threeMonths: "3 เดือน",
  sixMonths: "6 เดือน",
  oneYears: "1 ปี",
};

export default function Booking() {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [dateIn, setDateIn] = useState<Date>();
  const [selectedOption, setSelectedOption] = useState("hourly");
  const [timeIn, setTimeIn] = useState("00:00");
  const [timeOut, setTimeOut] = useState("01:00");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionDetail, setSelectedOptionDetail] = useState("hourly");
  const [isShowing, setIsShowing] = useState(false);

  const navigateImage = (direction: "prev" | "next") => {
    // แสดงรูปก่อนหน้า หรือถัดไป
    setCurrentIndex((prev) =>
      direction === "prev"
        ? prev === 0
          ? IMAGES.length - 1
          : prev - 1
        : prev === IMAGES.length - 1
        ? 0
        : prev + 1
    );
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 relative">
        <MapPicker
          zoom={20}
          height="100vh"
          onMapReady={() => setIsMapLoaded(true)}
        />
        {!isMapLoaded && <Loading />}
      </div>

      {isMapLoaded && (
        <>
          {isShowing && (
            <DetailPanel
              images={IMAGES}
              currentIndex={currentIndex}
              selectedOptionDetail={selectedOptionDetail}
              onClose={() => setIsShowing(false)}
              onNavigate={navigateImage}
              onSelectImage={setCurrentIndex}
              onSelectOption={setSelectedOptionDetail}
            />
          )}

          <SearchPanel
            dateIn={dateIn}
            setDateIn={setDateIn}
            timeIn={timeIn}
            setTimeIn={setTimeIn}
            timeOut={timeOut}
            setTimeOut={setTimeOut}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            timeOptions={TIME_OPTIONS}
            onCardClick={() => setIsShowing(true)}
          />
        </>
      )}
    </div>
  );
}
