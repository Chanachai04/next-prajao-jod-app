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

const EMPTY_MESSAGE = "ไม่พบที่จอดรบริเวณนี้";

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
  const [searchKeyword, setSearchKeyword] = useState<string | null>(null);
  const [nearbyCoords, setNearbyCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isInitialised, setIsInitialised] = useState(false);
  const firstFetchRef = useRef(true);

  // initialize from URL params once
  useEffect(() => {
    if (!searchParams) return;
    const mode = searchParams.get("mode") || undefined;
    const location = searchParams.get("location") || "";
    const searchTermParam = searchParams.get("search") || "";
    const nearMe = searchParams.get("nearMe") === "1";
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const dateInStr = searchParams.get("dateIn");
    const dateOutStr = searchParams.get("dateOut");
    const timeInStr = searchParams.get("timeIn");
    const timeOutStr = searchParams.get("timeOut");
    const provinceIdParam = searchParams.get("provinceId");

    if (mode === "monthly") {
      setSelectedOption("monthly");
      setSelectedOptionDetail("monthly");
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
    if (trimmedInitialSearch && !nearMe) {
      computedSearch = trimmedInitialSearch;
      setSearchText(trimmedInitialSearch);
    }

    if (!computedProvince && !computedSearch && location) {
      const province = provinces.find((p) => p.name_th === location);
      if (province) {
        computedProvince = province.name_th;
      }
    }

    let computedCoords: { lat: number; lon: number } | null = null;
    if (latParam && lonParam) {
      const latNum = Number(latParam);
      const lonNum = Number(lonParam);
      if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
        const ll: LatLng = [latNum, lonNum];
        setMapCenter(ll);
        setMarkerAt(ll);
        computedCoords = { lat: latNum, lon: lonNum };
      }
      if (nearMe) setSearchText("สถานที่ใกล้ฉัน");
      else if (location) setSearchText(location);
    } else if (nearMe) {
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
      void geocodeAndCenterRef(location);
    }

    firstFetchRef.current = Boolean(trimmedInitialSearch);
    setSelectedProvince(computedProvince);
    setSearchKeyword(computedSearch);
    setNearbyCoords(computedCoords);
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
  }, [searchText]);

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

  const fetchParkingSpots = useCallback(
    async (override?: {
      province?: string | null;
      search?: string | null;
      coords?: { lat: number; lon: number } | null;
      displayEmptyMessage?: boolean;
    }) => {
      const provinceName =
        override?.province !== undefined ? override.province : selectedProvince;
      const searchValue =
        override?.search !== undefined ? override.search : searchKeyword;
      const coordsValue =
        override?.coords !== undefined ? override.coords : nearbyCoords;
      const displayEmpty =
        override?.displayEmptyMessage !== undefined
          ? override.displayEmptyMessage
          : true;
      const trimmedSearch =
        typeof searchValue === "string" ? searchValue.trim() : "";
      const hasCoords =
        !!coordsValue &&
        Number.isFinite(coordsValue.lat) &&
        Number.isFinite(coordsValue.lon);
      const hasProvince = Boolean(provinceName);
      const hasSearch = Boolean(trimmedSearch);

      if (!hasCoords && !hasProvince && !hasSearch) {
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
        if (trimmedSearch) {
          params.set("search", trimmedSearch);
        }
        if (hasCoords && coordsValue) {
          params.set("lat", String(coordsValue.lat));
          params.set("lon", String(coordsValue.lon));
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
    [selectedProvince, searchKeyword, nearbyCoords]
  );

  useEffect(() => {
    if (!isInitialised) return;
    void fetchParkingSpots({
      displayEmptyMessage: !firstFetchRef.current,
    });
    if (firstFetchRef.current) {
      firstFetchRef.current = false;
    }
  }, [fetchParkingSpots, isInitialised]);

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
    if (
      spot.latitude !== null &&
      spot.longitude !== null &&
      Number.isFinite(spot.latitude) &&
      Number.isFinite(spot.longitude)
    ) {
      const ll: LatLng = [spot.latitude, spot.longitude];
      setMapCenter(ll);
      setMarkerAt(ll);
    }
  };

  const handleLocationChange = (payload: LocationChangePayload) => {
    setSelectedProvince(payload.provinceName);
    const key =
      payload.subdistrictName ??
      payload.districtName ??
      payload.provinceName ??
      payload.displayText;
    const trimmed = key?.trim();
    setSearchKeyword(trimmed ? trimmed : null);
    setNearbyCoords(null);
    setMarkerAt(null);
  };

  const handleSearch = async () => {
    const trimmed = searchText.trim();
    const normalizedSearch = trimmed ? trimmed : null;
    setSearchKeyword(normalizedSearch);
    if (normalizedSearch) {
      setNearbyCoords(null);
    }
    await geocodeAndCenter();
    await fetchParkingSpots({
      search: normalizedSearch,
      coords: normalizedSearch ? null : nearbyCoords,
      displayEmptyMessage: true,
    });
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
            spots={spots}
            onSelectSpot={handleSelectSpot}
            activeSpotId={selectedSpot?.id ?? null}
            isLoading={isLoadingSpots}
            errorMessage={fetchError}
            emptyMessage={emptyMessage}
            onLocationChange={handleLocationChange}
          />
        </>
      )}
    </div>
  );
}
