"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Loading from "./loading";
import DetailPanel from "@/components/booking/DetailPanel";
import SearchPanel from "@/components/booking/SearchPanel";
import { useSearchParams } from "next/navigation";

type LatLng = [number, number];

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
  const searchParams = useSearchParams();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [dateIn, setDateIn] = useState<Date>();
  const [selectedOption, setSelectedOption] = useState("hourly");
  const [timeIn, setTimeIn] = useState("00:00");
  const [timeOut, setTimeOut] = useState("01:00");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionDetail, setSelectedOptionDetail] = useState("hourly");
  const [isShowing, setIsShowing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [mapCenter, setMapCenter] = useState<LatLng | undefined>(undefined);
  const [markerAt, setMarkerAt] = useState<LatLng | null>(null);

  // initialize from URL params once
  useEffect(() => {
    if (!searchParams) return;
    const mode = searchParams.get("mode") || undefined;
    const location = searchParams.get("location") || "";
    const nearMe = searchParams.get("nearMe") === "1";
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const dateInStr = searchParams.get("dateIn");
    const dateOutStr = searchParams.get("dateOut");
    const timeInStr = searchParams.get("timeIn");
    const timeOutStr = searchParams.get("timeOut");

    if (mode) {
      setSelectedOption(mode);
      setSelectedOptionDetail(mode);
    }
    if (timeInStr) setTimeIn(timeInStr);
    if (timeOutStr) setTimeOut(timeOutStr);
    if (dateInStr) {
      const d = new Date(dateInStr);
      if (!isNaN(d.getTime())) setDateIn(d);
    }
    if (dateOutStr) {
      const d = new Date(dateOutStr);
      if (!isNaN(d.getTime())) {
        // For daily/monthly UI we reuse dateIn setter if needed later
      }
    }
    // If lat/lon provided, center immediately
    if (latParam && lonParam) {
      const latNum = Number(latParam);
      const lonNum = Number(lonParam);
      if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
        const ll: LatLng = [latNum, lonNum];
        setMapCenter(ll);
        setMarkerAt(ll);
      }
      if (nearMe) setSearchText("สถานที่ใกล้ฉัน");
      else if (location) setSearchText(location);
      return;
    }

    if (nearMe) {
      // center to current location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const ll: LatLng = [pos.coords.latitude, pos.coords.longitude];
            setMapCenter(ll);
            setMarkerAt(ll);
            setSearchText("สถานที่ใกล้ฉัน");
          },
          () => {
            // ignore failure
          }
        );
      }
    } else if (location) {
      setSearchText(location);
      // trigger geocode
      void geocodeAndCenterRef(location);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const geocodeAndCenter = async () => {
    const q = searchText.trim();
    if (!q) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q + " Thailand"
      )}&countrycodes=th&limit=1&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          // Rely on browser Referer; set Accept-Language to Thai for better matches
          "Accept-Language": "th,en;q=0.8",
        },
      });
      if (!res.ok) return;
      const data: Array<{ lat: string; lon: string }> = await res.json();
      if (!data || data.length === 0) {
        // not found: do nothing, keep current map
        return;
      }
      const { lat, lon } = data[0];
      const latNum = Number(lat);
      const lonNum = Number(lon);
      if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
        const ll: LatLng = [latNum, lonNum];
        setMapCenter(ll);
        setMarkerAt(ll);
      }
    } catch {
      // ignore errors, no UI change on failure
    }
  };

  // overload for initial call with provided text
  const geocodeAndCenterWith = async (text: string) => {
    const q = text.trim();
    if (!q) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q + " Thailand"
      )}&countrycodes=th&limit=1&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          "Accept-Language": "th,en;q=0.8",
        },
      });
      if (!res.ok) return;
      const data: Array<{ lat: string; lon: string }> = await res.json();
      if (!data || data.length === 0) return;
      const { lat, lon } = data[0];
      const latNum = Number(lat);
      const lonNum = Number(lon);
      if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
        const ll: LatLng = [latNum, lonNum];
        setMapCenter(ll);
        setMarkerAt(ll);
      }
    } catch {
      // ignore
    }
  };
  const geocodeAndCenterRef = useMemo(() => geocodeAndCenterWith, []);

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
          zoom={13}
          height="100vh"
          center={mapCenter}
          markerAt={markerAt}
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
            searchText={searchText}
            setSearchText={setSearchText}
            onSearch={geocodeAndCenter}
          />
        </>
      )}
    </div>
  );
}
