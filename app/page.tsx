"use client";
import { Button } from "@/components/ui/button";

import { MapPlus, Minimize2, MousePointerClick } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import DateForm from "@/components/form/DateForm";
import TimeForm from "@/components/form/TimeForm";
import SelectForm from "@/components/form/SelectForm";
import { useRouter } from "next/navigation";
import useGeolocation from "@/hook/useGeolocation";
import ProvinceSearch from "@/components/form/ProvinceSearch";
import { districts, provinces, subDistricts } from "@/lib/thaiData";

export default function Home() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState("hourly");
  const [dateIn, setDateIn] = useState<Date>(new Date());
  const [dateOut, setDateOut] = useState<Date>(new Date());
  const [timeIn, setTimeIn] = useState<string>("00:00");
  const [timeOut, setTimeOut] = useState<string>("01:00");
  const [location, setLocation] = useState("");
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [subDistrictId, setSubDistrictId] = useState<number | null>(null);
  const timeOption = {
    threeMonths: "3 เดือน",
    sixMonths: "6 เดือน",
    oneYears: "1 ปี",
  };
  const options = [
    { key: "hourly", label: "รายชั่วโมง" },
    { key: "daily", label: "รายวัน" },
    { key: "monthly", label: "รายเดือน" },
  ];

  useGeolocation();

  const buildAndGoToBooking = async (nearMe = false) => {
    const params = new URLSearchParams();
    params.set("mode", selectedOption);
    if (location) params.set("location", location);
    if (provinceId) params.set("provinceId", String(provinceId));
    if (districtId) params.set("districtId", String(districtId));
    if (subDistrictId) params.set("subDistrictId", String(subDistrictId));
    if (nearMe) params.set("nearMe", "1");

    // Dates/times
    if (dateIn) params.set("dateIn", dateIn.toISOString());
    if (dateOut) params.set("dateOut", dateOut.toISOString());
    if (timeIn) params.set("timeIn", timeIn);
    if (timeOut) params.set("timeOut", timeOut);

    // If near me: get precise location and pass lat/lon
    if (nearMe && "geolocation" in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            });
          }
        );
        params.set("lat", String(pos.coords.latitude));
        params.set("lon", String(pos.coords.longitude));
      } catch {
        // ignore, fallback without lat/lon
      }
      router.push(`/booking?${params.toString()}`);
      return;
    }

    // If has text location: geocode first so booking centers instantly
    const q = location.trim();
    if (!nearMe && q) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q + " Thailand"
        )}&countrycodes=th&limit=1&addressdetails=1`;
        const res = await fetch(url, {
          headers: { "Accept-Language": "th,en;q=0.8" },
        });
        if (res.ok) {
          const data: Array<{ lat: string; lon: string }> = await res.json();
          if (data && data.length > 0) {
            params.set("lat", data[0].lat);
            params.set("lon", data[0].lon);
          }
        }
      } catch {
        // ignore
      }
    }

    router.push(`/booking?${params.toString()}`);
  };

  return (
    <div className="min-h-screen ">
      {/* -- ค้นหาและเลือกช่วงเวลา -- */}
      <div className="flex flex-col xl:flex-row justify-between container mx-auto">
        <div className="mb-6 xl:mb-0">
          <Image
            src="/park.png"
            alt="Park Image"
            width={410}
            height={500}
            className="mt-10 hidden xl:block w-full max-w-sm xl:max-w-md"
          />
        </div>
        <div className="flex flex-col mt-10 sm:mt-10 justify-center w-full xl:w-2/3">
          <div className="flex flex-wrap gap-2 md:gap-4">
            {options.map(({ key, label }) => (
              <Button
                key={key}
                onClick={() => setSelectedOption(key)}
                variant={selectedOption === key ? "default" : "link"}
                className={`text-sm md:text-lg cursor-pointer ${
                  selectedOption === key ? "text-white" : "text-black"
                }`}
              >
                {label}
              </Button>
            ))}
          </div>
          <form action="" className="w-full  mt-4 space-y-4">
            {selectedOption === "hourly" ? (
              <>
                <ProvinceSearch
                  onChange={(pId, dId, sId) => {
                    setProvinceId(pId);
                    setDistrictId(dId);
                    setSubDistrictId(sId);

                    // set location เป็นชื่อ
                    if (sId) {
                      const sub = subDistricts.find((s) => s.id === sId);
                      setLocation(sub?.name_th || "");
                    } else if (dId) {
                      const district = districts.find((d) => d.id === dId);
                      setLocation(district?.name_th || "");
                    } else if (pId) {
                      const province = provinces.find((p) => p.id === pId);
                      setLocation(province?.name_th || "");
                    } else {
                      setLocation("");
                    }
                  }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <DateForm
                    title="วันที่เข้าจอด"
                    date={dateIn}
                    setDate={setDateIn}
                    placeholder="เลือกวันที่เข้าจอด"
                    id="dateIn"
                  />
                  <TimeForm
                    title="เวลาเข้าจอด"
                    time={timeIn}
                    setTime={setTimeIn}
                  />
                  <DateForm
                    title="วันที่นำรถออก"
                    date={dateOut}
                    setDate={setDateOut}
                    placeholder="เลือกวันที่นำรถออก"
                    id="dateOut"
                  />
                  <TimeForm
                    title="เวลานำรถออก"
                    time={timeOut}
                    setTime={setTimeOut}
                  />
                </div>
              </>
            ) : selectedOption === "daily" ? (
              <>
                <ProvinceSearch
                  onChange={(pId, dId, sId) => {
                    setProvinceId(pId);
                    setDistrictId(dId);
                    setSubDistrictId(sId);

                    // set location เป็นชื่อ
                    if (sId) {
                      const sub = subDistricts.find((s) => s.id === sId);
                      setLocation(sub?.name_th || "");
                    } else if (dId) {
                      const district = districts.find((d) => d.id === dId);
                      setLocation(district?.name_th || "");
                    } else if (pId) {
                      const province = provinces.find((p) => p.id === pId);
                      setLocation(province?.name_th || "");
                    } else {
                      setLocation("");
                    }
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <DateForm
                    title="วันที่เข้าจอด"
                    date={dateIn}
                    setDate={setDateIn}
                    placeholder="เลือกวันที่เข้าจอด"
                    id="dateIn"
                  />
                  <DateForm
                    title="วันที่นำรถออก"
                    date={dateOut}
                    setDate={setDateOut}
                    placeholder="เลือกวันที่นำรถออก"
                    id="dateOut"
                  />
                </div>
              </>
            ) : (
              <>
                <ProvinceSearch
                  onChange={(pId, dId, sId) => {
                    setProvinceId(pId);
                    setDistrictId(dId);
                    setSubDistrictId(sId);

                    // set location เป็นชื่อ
                    if (sId) {
                      const sub = subDistricts.find((s) => s.id === sId);
                      setLocation(sub?.name_th || "");
                    } else if (dId) {
                      const district = districts.find((d) => d.id === dId);
                      setLocation(district?.name_th || "");
                    } else if (pId) {
                      const province = provinces.find((p) => p.id === pId);
                      setLocation(province?.name_th || "");
                    } else {
                      setLocation("");
                    }
                  }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <DateForm
                    title="วันที่เข้าจอด"
                    date={dateIn}
                    setDate={setDateIn}
                    placeholder="เลือกวันที่เข้าจอด"
                    id="dateIn"
                  />
                  <SelectForm
                    title="จํานวนวัน"
                    placeholder="เลือกจํานวนวัน"
                    itemList={timeOption}
                    leadingIcon={<Minimize2 />}
                  />
                </div>
              </>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                type="button"
                onClick={() => buildAndGoToBooking(false)}
                className="mt-6 w-full text-lg py-6 cursor-pointer"
              >
                ค้นหาที่จอดรถ
              </Button>
              <Button
                type="button"
                onClick={() => buildAndGoToBooking(true)}
                className="mt-6 w-full text-lg py-6 cursor-pointer"
              >
                ค้นหาที่จอดรถใกล้ฉัน
              </Button>
            </div>
          </form>
        </div>
      </div>
      {/* --------------------------------------- */}
      {/* -- รายละเอียดเกี่ยวกับเว็บ -- */}
      <div className="bg-white">
        <div className="container mx-auto py-20">
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start">
            <div className="mb-8 lg:mb-0">
              <p className="text-3xl md:text-4xl font-bold text-center lg:text-left flex flex-col">
                ค้นหาที่จอดรถที่ดีที่สุดได้ที่ <br />
                PRAJAO JOD
              </p>
              <div className="mt-4">
                <div className="flex items-center">
                  <MapPlus size={34} />
                  <p className="text-lg pl-2 pb-2">ค้นหาที่จอดรถ</p>
                </div>
                <p>ค้นหาที่จอดรถของคุณได้ง่าย สะดวกและสบายได้ที่ PRAJAO JOD</p>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <MousePointerClick size={34} />
                  <p className="text-lg pl-2 pb-2">จองที่จอดรถ</p>
                </div>
                <p>
                  จองที่จอดรถได้ทันที ชำระค่าบริการออนไลน์ ใช้สะดวก รวดเร็ว
                  ปลอดภัย
                </p>
              </div>
            </div>
            <div>
              <Image src={"/park2.png"} alt="Park2" width={232} height={271} />
            </div>
          </div>
        </div>
      </div>
      {/* --------------------------------------- */}
      {/* -- พาร์ทเนอร์และผู้สนับสนุน -- */}
      <div className="container mx-auto py-20">
        <p className="text-3xl md:text-4xl font-bold text-center">
          พาร์ทเนอร์และผู้สนับสนุน
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 items-center justify-items-center gap-4 mt-10">
          <Image src="/sau.png" alt="sau" width={150} height={55} />
          <Image src="/nvidia.png" alt="nvidia" width={114} height={114} />
          <Image src="/microsoft.png" alt="microsoft" width={273} height={58} />
          <Image src="/google.png" alt="google" width={234} height={79} />
          <Image src="/tesla.png" alt="tesla" width={115} height={115} />
          <Image src="/honda.png" alt="honda" width={172} height={110} />
        </div>
      </div>
      {/* --------------------------------------- */}
    </div>
  );
}
