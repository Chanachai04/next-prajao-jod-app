"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Loading from "./loading";
import DetailPanel from "@/components/booking/DetailPanel";
import SearchPanel from "@/components/booking/SearchPanel";
import { useSearchParams } from "next/navigation";
import { RentSpot } from "@/types/booking";
import { provinces } from "@/lib/thaiData";

type LatLng = [number, number];

const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false,
});

const TIME_OPTIONS = {
  threeMonths: "3 เดือน",
  sixMonths: "6 เดือน",
  oneYears: "1 ปี",
};

const EMPTY_MESSAGE = "ไม่พบที่จอดรถบริเวณนี้";

type LocationChangePayload = {
  provinceName: string | null;
  districtName: string | null;
  subdistrictName: string | null;
  displayText: string;
};

export default function Booking() {
  const searchParams = useSearchParams();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [dateIn, setDateIn] = useState<Date>();
  const [dateOut, setDateOut] = useState<Date>();
  const [selectedOption, setSelectedOption] = useState<"hourly" | "monthly">(
    "hourly"
  );
  const [timeIn, setTimeIn] = useState("00:00");
  const [timeOut, setTimeOut] = useState("01:00");
  const [monthDurationKey, setMonthDurationKey] = useState("threeMonths");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionDetail, setSelectedOptionDetail] = useState<
    "hourly" | "daily" | "monthly"
  >("hourly");
  const [isShowing, setIsShowing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [mapCenter, setMapCenter] = useState<LatLng | undefined>(undefined);
  const [markerAt, setMarkerAt] = useState<LatLng | null>(null);
  const [spots, setSpots] = useState<RentSpot[]>([]);
  const [isLoadingSpots, setIsLoadingSpots] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<RentSpot | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string | null>(
    null
  );
  const [appliedProvince, setAppliedProvince] = useState<string | null>(null);
  const [appliedDistrict, setAppliedDistrict] = useState<string | null>(null);
  const [appliedSubdistrict, setAppliedSubdistrict] = useState<string | null>(
    null
  );
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState<
    string | null
  >(null);
  const [isInitialised, setIsInitialised] = useState(false);
  const firstFetchRef = useRef(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // initialize from URL params once
  useEffect(() => {
    if (!searchParams) return;
    const mode = searchParams.get("mode") || undefined;
    const location = searchParams.get("location") || "";
    const searchTermParam = searchParams.get("search") || "";
    const dateInStr = searchParams.get("dateIn");
    const dateOutStr = searchParams.get("dateOut");
    const timeInStr = searchParams.get("timeIn");
    const timeOutStr = searchParams.get("timeOut");
    const provinceIdParam = searchParams.get("provinceId");
    const monthDurationKeyParam = searchParams.get("monthDurationKey");

    if (mode === "monthly") {
      setSelectedOption("monthly");
      setSelectedOptionDetail("monthly");
      if (monthDurationKeyParam) {
        setMonthDurationKey(monthDurationKeyParam);
      }
    } else if (mode === "daily") {
      setSelectedOption("hourly");
      setSelectedOptionDetail("daily");
    } else if (mode === "hourly") {
      setSelectedOption("hourly");
      setSelectedOptionDetail("hourly");
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
        setDateOut(d);
      }
    }

    let computedProvince: string | null = null;
    if (provinceIdParam) {
      const idNum = Number(provinceIdParam);
      const province = provinces.find((p) => p.id === idNum);
      if (province) {
        computedProvince = province.name_th;
        setSearchText(province.name_th);
      }
    }

    const initialSearch = searchTermParam || location;
    const trimmedInitialSearch = initialSearch.trim();
    let computedSearch: string | null = null;
    if (trimmedInitialSearch) {
      computedSearch = trimmedInitialSearch;
      setSearchText(trimmedInitialSearch);
    }

    if (!computedProvince && !computedSearch && location) {
      const province = provinces.find((p) => p.name_th === location);
      if (province) {
        computedProvince = province.name_th;
      }
    }

    if (location) {
      void geocodeAndCenterRef(location);
    }

    firstFetchRef.current = Boolean(trimmedInitialSearch);
    setSelectedProvince(computedProvince);
    setAppliedProvince(computedProvince);
    setAppliedSearchKeyword(computedSearch);
    setIsInitialised(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const geocodeAndCenter = useCallback(async () => {
    const q = searchText.trim();
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
      if (!data || data.length === 0) {
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
      // ignore errors
    }
  }, [searchText]);

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

  const fetchParkingSpots = useCallback(
    async (override?: {
      province?: string | null;
      district?: string | null;
      subdistrict?: string | null;
      search?: string | null;
      displayEmptyMessage?: boolean;
    }) => {
      const provinceName =
        override?.province !== undefined ? override.province : appliedProvince;
      const districtName =
        override?.district !== undefined ? override.district : appliedDistrict;
      const subdistrictName =
        override?.subdistrict !== undefined
          ? override.subdistrict
          : appliedSubdistrict;
      const searchValue =
        override?.search !== undefined ? override.search : appliedSearchKeyword;
      const displayEmpty =
        override?.displayEmptyMessage !== undefined
          ? override.displayEmptyMessage
          : true;
      const trimmedSearch =
        typeof searchValue === "string" ? searchValue.trim() : "";

      const hasProvince = Boolean(provinceName);
      const hasDistrict = Boolean(districtName);
      const hasSubdistrict = Boolean(subdistrictName);
      const hasSearch = Boolean(trimmedSearch);

      if (!hasProvince && !hasDistrict && !hasSubdistrict && !hasSearch) {
        setSpots([]);
        setEmptyMessage(displayEmpty ? EMPTY_MESSAGE : null);
        setSelectedSpot(null);
        setIsShowing(false);
        setIsLoadingSpots(false);
        setFetchError(null);
        return;
      }

      setIsLoadingSpots(true);
      setFetchError(null);
      try {
        const params = new URLSearchParams();
        if (provinceName) {
          params.set("province", provinceName);
        }
        if (districtName) {
          params.set("district", districtName);
        }
        if (subdistrictName) {
          params.set("subdistrict", subdistrictName);
        }
        if (trimmedSearch) {
          params.set("search", trimmedSearch);
        }
        const queryString = params.toString();
        const res = await fetch(
          `/api/booking${queryString ? `?${queryString}` : ""}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );
        if (!res.ok) {
          throw new Error("failed");
        }
        const result = await res.json();
        const data = (result?.data ?? []) as RentSpot[];
        setSpots(data);
        if (!data.length) {
          setEmptyMessage(displayEmpty ? EMPTY_MESSAGE : null);
          setSelectedSpot(null);
          setIsShowing(false);
        } else {
          setEmptyMessage(null);
          setSelectedSpot((prev) => {
            if (!prev) return null;
            const found = data.find((item) => item.id === prev.id);
            return found ?? null;
          });
        }
      } catch {
        setFetchError("ไม่สามารถโหลดข้อมูลได้");
        setSpots([]);
        setSelectedSpot(null);
        setIsShowing(false);
        setEmptyMessage(null);
      } finally {
        setIsLoadingSpots(false);
      }
    },
    [appliedProvince, appliedDistrict, appliedSubdistrict, appliedSearchKeyword]
  );

  useEffect(() => {
    if (!isInitialised || !firstFetchRef.current) return;
    void fetchParkingSpots({
      displayEmptyMessage: false,
    });
    firstFetchRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialised]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedSpot?.id]);

  const navigateImage = (direction: "prev" | "next") => {
    const images = selectedSpot?.images ?? [];
    if (!images.length) return;
    setCurrentIndex((prev) => {
      if (direction === "prev") {
        return prev === 0 ? images.length - 1 : prev - 1;
      }
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  };

  const handleSelectSpot = (spot: RentSpot) => {
    setSelectedSpot(spot);
    setIsShowing(true);
    setCurrentIndex(0);
    setSelectedOptionDetail("hourly");
  };

  const handleLocationChange = (payload: LocationChangePayload) => {
    setSelectedProvince(payload.provinceName);
    setSelectedDistrict(payload.districtName);
    setSelectedSubdistrict(payload.subdistrictName);
    setMarkerAt(null);
  };

  const handleSearch = async () => {
    const trimmed = searchText.trim();
    if (trimmed === "") {
      setError("กรุณาเลือกจังหวัด เขต และแขวง หรือพิมพ์ชื่อสถานที่");
      return;
    }
    const normalizedSearch = trimmed ? trimmed : null;
    try {
      setError("");
      setLoading(true);
      setAppliedProvince(selectedProvince);
      setAppliedDistrict(selectedDistrict);
      setAppliedSubdistrict(selectedSubdistrict);
      setAppliedSearchKeyword(normalizedSearch);
      await geocodeAndCenter();
      await fetchParkingSpots({
        province: selectedProvince,
        district: selectedDistrict,
        subdistrict: selectedSubdistrict,
        search: normalizedSearch,
        displayEmptyMessage: true,
      });
    } catch (err) {
      console.log(err);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1  relative">
        <MapPicker
          zoom={13}
          height="100vh"
          center={mapCenter}
          markerAt={markerAt}
          onMapReady={() => setIsMapLoaded(true)}
          interactive={false}
        />
        {!isMapLoaded && <Loading />}
      </div>
      {isMapLoaded && (
        <>
          {isShowing && selectedSpot && (
            <DetailPanel
              spot={selectedSpot}
              currentIndex={currentIndex}
              selectedOptionDetail={selectedOptionDetail}
              onClose={() => setIsShowing(false)}
              onNavigate={navigateImage}
              onSelectImage={setCurrentIndex}
              onSelectOption={setSelectedOptionDetail}
              monthDurationKey={monthDurationKey}
            />
          )}

          <SearchPanel
            dateIn={dateIn}
            setDateIn={setDateIn}
            dateOut={dateOut}
            setDateOut={setDateOut}
            timeIn={timeIn}
            setTimeIn={setTimeIn}
            timeOut={timeOut}
            setTimeOut={setTimeOut}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            timeOptions={TIME_OPTIONS}
            searchText={searchText}
            setSearchText={setSearchText}
            onSearch={handleSearch}
            error={error}
            loading={loading}
            spots={spots}
            onSelectSpot={handleSelectSpot}
            activeSpotId={selectedSpot?.id ?? null}
            isLoading={isLoadingSpots}
            errorMessage={fetchError}
            emptyMessage={emptyMessage}
            onLocationChange={handleLocationChange}
            monthDurationKey={monthDurationKey}
            onMonthDurationChange={setMonthDurationKey}
          />
        </>
      )}
    </div>
  );
}
