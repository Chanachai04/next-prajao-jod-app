"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import DetailPanel from "@/components/booking/DetailPanel";
import SearchPanel from "@/components/booking/SearchPanel";
import { useSearchParams } from "next/navigation";
import { LocationChangePayload, RentSpot } from "@/types/booking";
import { provinces } from "@/lib/thaiData";
import Loading from "./loading";

type LatLng = [number, number];

// คอมโพเนนต์แผนที่ที่โหลดแบบ Dynamic (Client-side Only) พร้อม Loading fallback
const MapPicker = dynamic(() => import("@/components/map/MapPicker"), {
  ssr: false, // ป้องกันการเรนเดอร์บน Server Side (เพราะ MapPicker ใช้ window/DOM)
  loading: () => <Loading />,
});

// ตัวเลือกช่วงเวลาการจองรายเดือน
const TIME_OPTIONS = {
  threeMonths: "3 เดือน",
  sixMonths: "6 เดือน",
  oneYears: "1 ปี",
};

// ข้อความแสดงเมื่อไม่พบที่จอดรถ
const EMPTY_MESSAGE = "ไม่พบที่จอดรถบริเวณนี้";

export default function Booking() {
  const searchParams = useSearchParams();

  // <strong>สถานะสำหรับจัดการข้อมูลการจอง (Date/Time/Mode)</strong>
  const [dateIn, setDateIn] = useState<Date>();
  const [dateOut, setDateOut] = useState<Date>();
  const [selectedOption, setSelectedOption] = useState<"hourly" | "monthly">(
    "hourly"
  ); // โหมดหลักในการจอง (รายชั่วโมง/รายเดือน)
  const [timeIn, setTimeIn] = useState("00:00");
  const [timeOut, setTimeOut] = useState("01:00");
  const [monthDurationKey, setMonthDurationKey] = useState("threeMonths"); // ตัวเลือกระยะเวลารายเดือน

  // <strong>สถานะสำหรับจัดการ Detail Panel (รายละเอียดที่จอดรถที่เลือก)</strong>
  const [currentIndex, setCurrentIndex] = useState(0); // Index รูปภาพที่แสดง
  const [selectedOptionDetail, setSelectedOptionDetail] = useState<
    "hourly" | "daily" | "monthly"
  >("hourly"); // โหมดการจองที่เลือกใน Detail Panel
  const [isShowing, setIsShowing] = useState(false); // สถานะเปิด/ปิด Detail Panel
  const [selectedSpot, setSelectedSpot] = useState<RentSpot | null>(null); // ข้อมูลที่จอดรถที่ถูกเลือก

  // <strong>สถานะสำหรับจัดการการค้นหาและตำแหน่ง (Search/Location Input)</strong>
  const [searchText, setSearchText] = useState(""); // ข้อความในช่องค้นหา
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null); // จังหวัดที่เลือกใน Input
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null); // เขต/อำเภอที่เลือกใน Input
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string | null>(
    null
  ); // แขวง/ตำบลที่เลือกใน Input

  // <strong>สถานะสำหรับจัดการ Map และ Data Fetching (Applied Filters)</strong>
  const [mapCenter, setMapCenter] = useState<LatLng | undefined>(undefined); // จุดศูนย์กลางของแผนที่
  const [markerAt, setMarkerAt] = useState<LatLng | null>(null); // ตำแหน่ง Marker บนแผนที่
  const [spots, setSpots] = useState<RentSpot[]>([]); // รายการที่จอดรถที่ค้นพบ
  const [isLoadingSpots, setIsLoadingSpots] = useState(false); // สถานะโหลดผลการค้นหา
  const [fetchError, setFetchError] = useState<string | null>(null); // ข้อความผิดพลาดจากการ Fetch
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null); // ข้อความเมื่อไม่พบผลลัพธ์
  // สถานะ Location/Search ที่ถูก *นำไปใช้* ในการ fetch (ค่าที่ถูก commit)
  const [appliedProvince, setAppliedProvince] = useState<string | null>(null);
  const [appliedDistrict, setAppliedDistrict] = useState<string | null>(null);
  const [appliedSubdistrict, setAppliedSubdistrict] = useState<string | null>(
    null
  );
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState<
    string | null
  >(null);

  // <strong>สถานะควบคุมการทำงาน</strong>
  const [isInitialised, setIsInitialised] = useState(false); // แฟล็กตรวจสอบว่าโหลดค่าเริ่มต้นจาก URL เสร็จแล้วหรือไม่
  const firstFetchRef = useRef(true); // แฟล็กควบคุมการ Fetch ข้อมูลครั้งแรก
  const [error, setError] = useState<string | null>(null); // ข้อผิดพลาดของฟอร์มหลัก
  const [loading, setLoading] = useState(false); // สถานะโหลดรวมเมื่อกดปุ่มค้นหา

  // <strong>Effect สำหรับการตั้งค่าเริ่มต้นจาก URL parameters</strong>
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

    // ตั้งค่าโหมดการจอง
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

    // ตั้งค่าเวลาก่อนวันที่
    if (timeInStr) setTimeIn(timeInStr);
    if (timeOutStr) setTimeOut(timeOutStr);

    // ตั้งค่าวันที่
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

    // ประมวลผล Search Term / Location / Province
    const initialSearch = searchTermParam || location;
    const trimmedInitialSearch = initialSearch.trim();

    let computedProvince: string | null = null;
    let computedSearch: string | null = null;
    let finalSearchText = "";

    // ถ้ามี search/location ให้ใช้เป็น searchText
    if (trimmedInitialSearch) {
      computedSearch = trimmedInitialSearch;
      finalSearchText = trimmedInitialSearch;
    }

    // ถ้ามี provinceId ให้ใช้เป็น province และอาจใช้เป็น searchText
    if (provinceIdParam) {
      const idNum = Number(provinceIdParam);
      const province = provinces.find((p) => p.id === idNum);
      if (province) {
        computedProvince = province.name_th;
        if (!finalSearchText) {
          finalSearchText = province.name_th;
        }
      }
    }

    // ตั้งค่า searchText ครั้งเดียวและ Geocode เพื่อให้แผนที่แสดงผลตำแหน่งเริ่มต้น
    if (finalSearchText) {
      setSearchText(finalSearchText);
      void geocodeAndCenterWith(finalSearchText);
    }

    // ตั้งค่าสถานะที่ใช้ในการ fetch ครั้งแรก
    firstFetchRef.current = Boolean(trimmedInitialSearch);
    setSelectedProvince(computedProvince);
    setAppliedProvince(computedProvince);
    setAppliedSearchKeyword(computedSearch);
    setIsInitialised(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // <strong>ฟังก์ชัน Geocoding: แปลงข้อความค้นหาไปเป็นพิกัด (ใช้สำหรับ Map Picker)</strong>
  const geocodeAndCenter = useCallback(async () => {
    const q = searchText.trim();
    if (!q) return;
    try {
      // เรียก Nominatim API ของ OpenStreetMap
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
      // ตั้งค่าจุดศูนย์กลางของแผนที่และ Marker
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

  // ฟังก์ชัน Geocoding ที่รับค่าค้นหาโดยตรง
  const geocodeAndCenterWith = useCallback(async (text: string) => {
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
  }, []);

  // <strong>ฟังก์ชันสำหรับเรียก API เพื่อดึงข้อมูลที่จอดรถ (Data Fetching)</strong>
  const fetchParkingSpots = useCallback(
    async (override?: {
      province?: string | null;
      district?: string | null;
      subdistrict?: string | null;
      search?: string | null;
      displayEmptyMessage?: boolean;
    }) => {
      // ดึงค่า filter ที่จะใช้ โดยให้ความสำคัญกับค่า override ก่อน
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

      // ถ้าไม่มีเงื่อนไขการค้นหาเลย ให้ล้างข้อมูล
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
        // สร้าง Query Parameters สำหรับ API Call
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

        // เรียก API /api/booking
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

        // อัปเดตสถานะของ Spots ที่ค้นพบ
        setSpots(data);
        if (!data.length) {
          setEmptyMessage(displayEmpty ? EMPTY_MESSAGE : null);
          setSelectedSpot(null);
          setIsShowing(false);
        } else {
          setEmptyMessage(null);
          // อัปเดต selectedSpot หากข้อมูลถูก refresh แล้วยังมี Spot เดิมอยู่
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

  // Effect เพื่อเรียก fetchParkingSpots ครั้งแรกเมื่อ initialized
  useEffect(() => {
    // ต้องรอให้ initialized เสร็จ และเป็นครั้งแรกของการ fetch (มาจาก URL search)
    if (!isInitialised || !firstFetchRef.current) return;
    void fetchParkingSpots({
      displayEmptyMessage: false, // ไม่แสดงข้อความ "ไม่พบ" ในการโหลดครั้งแรก
    });
    firstFetchRef.current = false; // ปิดแฟล็กหลังจาก fetch ครั้งแรก
  }, [fetchParkingSpots, isInitialised]);

  // Effect เพื่อรีเซ็ต Index รูปภาพเมื่อเปลี่ยน Spot ที่เลือก
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedSpot?.id]);

  // ฟังก์ชันเลื่อนดูรูปภาพใน Detail Panel
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

  // ฟังก์ชันจัดการเมื่อผู้ใช้เลือกที่จอดรถจากรายการ
  const handleSelectSpot = (spot: RentSpot) => {
    setSelectedSpot(spot);
    setIsShowing(true); // เปิด Detail Panel
    setCurrentIndex(0); // รีเซ็ต index รูปภาพ
    setSelectedOptionDetail("hourly"); // ตั้งค่าโหมดเริ่มต้นใน Detail Panel
  };

  // ฟังก์ชันจัดการการเปลี่ยนแปลง Location ใน Search Panel
  const handleLocationChange = (payload: LocationChangePayload) => {
    setSelectedProvince(payload.provinceName);
    setSelectedDistrict(payload.districtName);
    setSelectedSubdistrict(payload.subdistrictName);
    // marker จะถูก update เมื่อกดค้นหา
  };

  // <strong>ฟังก์ชันหลักที่ทำงานเมื่อผู้ใช้กดปุ่มค้นหา</strong>
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

      // ตั้งค่า Applied Filters ใหม่
      setAppliedProvince(selectedProvince);
      setAppliedDistrict(selectedDistrict);
      setAppliedSubdistrict(selectedSubdistrict);
      setAppliedSearchKeyword(normalizedSearch);

      // 1. Geocode และตั้งค่า Marker บนแผนที่
      await geocodeAndCenter();

      // 2. Fetch ข้อมูลที่จอดรถ
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

  // <strong>โครงสร้าง UI (JSX)</strong>
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Map Section - ซ่อนบนมือถือและแท็บเล็ต, แสดงผลแบบ Flex-1 บนเดสก์ท็อป */}
      <div className="max-sm:hidden lg:flex-1 relative">
        <MapPicker
          zoom={13}
          height="100vh"
          center={mapCenter}
          markerAt={markerAt}
          onMapReady={() => {}}
          interactive={false} // แผนที่ไม่ให้โต้ตอบได้
        />
      </div>

      {/* Content Section - ประกอบด้วย Detail Panel และ Search Panel */}
      <div className="w-full lg:w-auto flex flex-col lg:flex-row">
        {/* Detail Panel - แสดงแบบ Fixed ครึ่งหน้าจอหรือเต็มหน้าจอบนมือถือ/แท็บเล็ต */}
        {isShowing && selectedSpot && (
          <div className="fixed  h-full lg:relative  inset-0 lg:inset-auto z-50 lg:z-auto bg-white overflow-y-auto">
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
          </div>
        )}

        {/* Search Panel - ส่วนควบคุมการค้นหาและแสดงรายการผลลัพธ์ */}
        <div
          // ซ่อน Search Panel เมื่อ Detail Panel ถูกเปิดอยู่บนจอขนาดใหญ่ (เพื่อประหยัดพื้นที่)
          className={`w-full lg:w-lg ${
            isShowing ? "hidden lg:block" : "block"
          }`}
        >
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
            onSearch={handleSearch} // ผูกฟังก์ชันค้นหา
            error={error}
            loading={loading}
            spots={spots}
            onSelectSpot={handleSelectSpot} // ผูกฟังก์ชันเลือก Spot
            activeSpotId={selectedSpot?.id ?? null}
            isLoading={isLoadingSpots}
            errorMessage={fetchError}
            emptyMessage={emptyMessage}
            onLocationChange={handleLocationChange}
            monthDurationKey={monthDurationKey}
            onMonthDurationChange={setMonthDurationKey}
          />
        </div>
      </div>
    </div>
  );
}
